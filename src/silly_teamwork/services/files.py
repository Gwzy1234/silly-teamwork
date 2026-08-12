from __future__ import annotations

import asyncio
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from typing import Protocol
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from silly_teamwork.core.config import get_settings
from silly_teamwork.core.file_storage import LocalFileStorage, sanitize_filename
from silly_teamwork.models.file import File
from silly_teamwork.models.user import User
from silly_teamwork.repositories import files, projects, tasks
from silly_teamwork.services.collaboration_access import CollaborationAccessService
from silly_teamwork.services.exceptions import (
    FileAccessDeniedError,
    FileNotFoundError,
    FileStorageError,
    FileTooLargeError,
    ProjectNotFoundError,
    TaskNotFoundError,
)

UPLOAD_CHUNK_SIZE = 1024 * 1024


class UploadedFile(Protocol):
    filename: str | None
    content_type: str | None

    async def read(self, size: int = -1) -> bytes: ...


@dataclass(frozen=True, slots=True)
class DownloadableFile:
    file: File
    path: Path


class FileService:
    def __init__(
        self,
        access_service: CollaborationAccessService | None = None,
        storage: LocalFileStorage | None = None,
        max_file_size: int | None = None,
    ) -> None:
        settings = get_settings()
        self.access = access_service or CollaborationAccessService()
        self.storage = storage or LocalFileStorage(settings.upload_dir)
        self.max_file_size = max_file_size or settings.max_file_size

    async def upload_project_file(
        self,
        session: AsyncSession,
        current_user: User,
        project_id: UUID,
        upload: UploadedFile,
    ) -> File:
        project = await projects.get_by_id(session, project_id)
        if project is None:
            raise ProjectNotFoundError("Project not found")
        if not await self.access.can_upload_project_file(session, current_user, project_id):
            raise ProjectNotFoundError("Project not found")
        original_name = sanitize_filename(upload.filename)
        target = self.storage.project_target(project.team_id, project_id, original_name)
        return await self._persist_upload(
            session,
            current_user,
            upload,
            target.absolute_path,
            target.storage_key,
            original_name,
            project_id=project_id,
        )

    async def upload_task_file(
        self,
        session: AsyncSession,
        current_user: User,
        task_id: UUID,
        upload: UploadedFile,
    ) -> File:
        task = await tasks.get_by_id(session, task_id)
        if task is None:
            raise TaskNotFoundError("Task not found")
        if not await self.access.can_upload_task_file(session, current_user, task_id):
            raise TaskNotFoundError("Task not found")
        project = await projects.get_by_id(session, task.project_id)
        if project is None:
            raise TaskNotFoundError("Task not found")
        original_name = sanitize_filename(upload.filename)
        target = self.storage.task_target(project.team_id, task_id, original_name)
        return await self._persist_upload(
            session,
            current_user,
            upload,
            target.absolute_path,
            target.storage_key,
            original_name,
            task_id=task_id,
        )

    async def list_project_files(
        self, session: AsyncSession, current_user: User, project_id: UUID
    ) -> list[File]:
        await self.access.require_project_access(session, current_user, project_id)
        return await files.list_project_files(session, project_id)

    async def list_task_files(
        self, session: AsyncSession, current_user: User, task_id: UUID
    ) -> list[File]:
        await self.access.require_task_access(session, current_user, task_id)
        return await files.list_task_files(session, task_id)

    async def get_download(
        self, session: AsyncSession, current_user: User, file_id: UUID
    ) -> DownloadableFile:
        file = await self._require_file(session, file_id)
        await self._require_file_access(session, current_user, file)
        path = self.storage.resolve(file.storage_key)
        if not path.is_file():
            raise FileStorageError("Stored file is missing")
        return DownloadableFile(file=file, path=path)

    async def update_file_metadata(
        self,
        session: AsyncSession,
        current_user: User,
        file_id: UUID,
        *,
        original_name: str,
    ) -> File:
        file = await self._require_file(session, file_id)
        if not await self.access.can_modify_file(session, current_user, file_id):
            raise FileAccessDeniedError("File modification permission required")
        safe_name = sanitize_filename(original_name)
        try:
            files.update_file_metadata(file, original_name=safe_name)
            await session.flush()
            await session.commit()
            await session.refresh(file)
        except Exception:
            await session.rollback()
            raise
        return file

    async def delete_file(
        self, session: AsyncSession, current_user: User, file_id: UUID
    ) -> None:
        file = await self._require_file(session, file_id)
        if not await self.access.can_delete_file(session, current_user, file_id):
            raise FileAccessDeniedError("File deletion permission required")
        staged = await asyncio.to_thread(self.storage.stage_delete, file.storage_key)
        try:
            await files.delete_file(session, file)
            await session.flush()
            await session.commit()
        except Exception:
            await session.rollback()
            await asyncio.to_thread(self.storage.restore_staged_delete, staged)
            raise
        await asyncio.to_thread(self.storage.finish_staged_delete, staged)

    async def _persist_upload(
        self,
        session: AsyncSession,
        current_user: User,
        upload: UploadedFile,
        absolute_path: Path,
        storage_key: str,
        original_name: str,
        *,
        project_id: UUID | None = None,
        task_id: UUID | None = None,
    ) -> File:
        size, checksum = await self._write_upload(upload, absolute_path)
        file = File(
            project_id=project_id,
            task_id=task_id,
            uploaded_by_id=current_user.id,
            original_name=original_name,
            storage_key=storage_key,
            content_type=(upload.content_type or "application/octet-stream")[:255],
            size_bytes=size,
            checksum_sha256=checksum,
        )
        try:
            files.create_file(session, file)
            await session.flush()
            await session.commit()
            await session.refresh(file)
        except Exception:
            await session.rollback()
            await asyncio.to_thread(absolute_path.unlink, missing_ok=True)
            raise
        return file

    async def _write_upload(self, upload: UploadedFile, destination: Path) -> tuple[int, str]:
        total = 0
        digest = sha256()
        try:
            with destination.open("xb") as output:
                while chunk := await upload.read(UPLOAD_CHUNK_SIZE):
                    total += len(chunk)
                    if total > self.max_file_size:
                        raise FileTooLargeError(
                            f"File exceeds the {self.max_file_size}-byte size limit"
                        )
                    digest.update(chunk)
                    await asyncio.to_thread(output.write, chunk)
        except Exception:
            await asyncio.to_thread(destination.unlink, missing_ok=True)
            raise
        return total, digest.hexdigest()

    @staticmethod
    async def _require_file(session: AsyncSession, file_id: UUID) -> File:
        file = await files.get_file(session, file_id)
        if file is None:
            raise FileNotFoundError("File not found")
        return file

    async def _require_file_access(
        self, session: AsyncSession, current_user: User, file: File
    ) -> None:
        if file.project_id is not None:
            await self.access.require_project_access(session, current_user, file.project_id)
            return
        if file.task_id is not None:
            await self.access.require_task_access(session, current_user, file.task_id)
            return
        raise FileNotFoundError("File not found")


def get_file_service() -> FileService:
    return FileService()
