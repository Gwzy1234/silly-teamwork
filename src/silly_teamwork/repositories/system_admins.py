from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from silly_teamwork.models.system_admin import SystemAdmin


async def get_by_user_id(session: AsyncSession, user_id: UUID) -> SystemAdmin | None:
    result = await session.execute(select(SystemAdmin).where(SystemAdmin.user_id == user_id))
    return result.scalar_one_or_none()


def add(session: AsyncSession, system_admin: SystemAdmin) -> None:
    session.add(system_admin)
