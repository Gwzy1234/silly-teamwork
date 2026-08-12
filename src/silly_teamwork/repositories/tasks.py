from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from silly_teamwork.models.task import Task


def add(session: AsyncSession, task: Task) -> None:
    session.add(task)


async def get_by_id(session: AsyncSession, task_id: UUID) -> Task | None:
    return await session.get(Task, task_id)


async def get_by_id_for_update(session: AsyncSession, task_id: UUID) -> Task | None:
    result = await session.execute(select(Task).where(Task.id == task_id).with_for_update())
    return result.scalar_one_or_none()


async def list_for_project(session: AsyncSession, project_id: UUID) -> list[Task]:
    result = await session.execute(
        select(Task)
        .where(Task.project_id == project_id)
        .order_by(Task.created_at.desc(), Task.title)
    )
    return list(result.scalars().all())
