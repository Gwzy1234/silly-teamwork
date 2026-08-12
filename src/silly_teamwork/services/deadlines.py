from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from silly_teamwork.models.task import Task
from silly_teamwork.models.user import User
from silly_teamwork.repositories import tasks
from silly_teamwork.services.collaboration_access import CollaborationAccessService


class DeadlineService:
    def __init__(self, access_service: CollaborationAccessService | None = None) -> None:
        self.access = access_service or CollaborationAccessService()

    async def get_upcoming_tasks(
        self, session: AsyncSession, current_user: User, hours: int
    ) -> list[Task]:
        now = datetime.now(UTC)
        candidates = await tasks.list_due_between(session, now, now + timedelta(hours=hours))
        return await self._filter_accessible(session, current_user, candidates)

    async def get_overdue_tasks(
        self, session: AsyncSession, current_user: User
    ) -> list[Task]:
        candidates = await tasks.list_overdue(session, datetime.now(UTC))
        return await self._filter_accessible(session, current_user, candidates)

    async def _filter_accessible(
        self, session: AsyncSession, current_user: User, candidates: list[Task]
    ) -> list[Task]:
        accessible: list[Task] = []
        for task in candidates:
            if await self.access.can_access_task(session, current_user, task.id):
                accessible.append(task)
        return accessible


def get_deadline_service() -> DeadlineService:
    return DeadlineService()
