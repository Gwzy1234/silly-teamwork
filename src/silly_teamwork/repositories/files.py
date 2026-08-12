from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from silly_teamwork.models.file import File


def create_file(session: AsyncSession, file: File) -> None:
    session.add(file)


async def get_file(session: AsyncSession, file_id: UUID) -> File | None:
    return await session.get(File, file_id)


async def get_by_id(session: AsyncSession, file_id: UUID) -> File | None:
    """Compatibility alias used by the collaboration access service."""

    return await get_file(session, file_id)


async def list_project_files(session: AsyncSession, project_id: UUID) -> list[File]:
    result = await session.execute(
        select(File)
        .where(File.project_id == project_id)
        .order_by(File.created_at.desc(), File.original_name)
    )
    return list(result.scalars().all())


async def list_task_files(session: AsyncSession, task_id: UUID) -> list[File]:
    result = await session.execute(
        select(File)
        .where(File.task_id == task_id)
        .order_by(File.created_at.desc(), File.original_name)
    )
    return list(result.scalars().all())


async def delete_file(session: AsyncSession, file: File) -> None:
    await session.delete(file)


def update_file_metadata(file: File, *, original_name: str) -> File:
    file.original_name = original_name
    return file
