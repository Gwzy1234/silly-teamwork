from datetime import datetime
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from silly_teamwork.models.notification import Notification


def add(session: AsyncSession, notification: Notification) -> None:
    session.add(notification)


async def get_for_user(
    session: AsyncSession, notification_id: UUID, user_id: UUID
) -> Notification | None:
    result = await session.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def list_for_user(session: AsyncSession, user_id: UUID) -> list[Notification]:
    result = await session.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
    )
    return list(result.scalars().all())


async def mark_all_as_read(
    session: AsyncSession, user_id: UUID, *, read_at: datetime
) -> int:
    result = await session.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read.is_(False))
        .values(is_read=True, read_at=read_at)
    )
    return int(result.rowcount or 0)  # type: ignore[attr-defined]
