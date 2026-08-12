"""Pydantic request and response data-transfer objects."""

from silly_teamwork.schemas.admin import (
    AdminActionResponse,
    AdminGlobalInviteResponse,
    AdminTeamResponse,
    AdminUserResponse,
)
from silly_teamwork.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from silly_teamwork.schemas.file import FileMetadataUpdate, FileResponse
from silly_teamwork.schemas.project import (
    ProjectCreate,
    ProjectMemberAdd,
    ProjectMemberResponse,
    ProjectOwnerTransfer,
    ProjectResponse,
    ProjectStatusUpdate,
    ProjectUpdate,
)
from silly_teamwork.schemas.task import (
    TaskCreate,
    TaskMemberAdd,
    TaskMemberResponse,
    TaskOwnerTransfer,
    TaskResponse,
    TaskStatusUpdate,
    TaskUpdate,
)
from silly_teamwork.schemas.team import (
    InvitationCodeResponse,
    InvitationCreateRequest,
    InvitationRole,
    TeamCreateRequest,
    TeamDetailResponse,
    TeamJoinRequest,
    TeamMemberResponse,
    TeamResponse,
    TeamRoleResponse,
)
from silly_teamwork.schemas.user import UserResponse

__all__ = [
    "AdminActionResponse",
    "AdminGlobalInviteResponse",
    "AdminTeamResponse",
    "AdminUserResponse",
    "FileMetadataUpdate",
    "FileResponse",
    "InvitationCodeResponse",
    "InvitationCreateRequest",
    "InvitationRole",
    "LoginRequest",
    "ProjectCreate",
    "ProjectMemberAdd",
    "ProjectMemberResponse",
    "ProjectOwnerTransfer",
    "ProjectResponse",
    "ProjectStatusUpdate",
    "ProjectUpdate",
    "RegisterRequest",
    "TeamCreateRequest",
    "TeamDetailResponse",
    "TeamJoinRequest",
    "TeamMemberResponse",
    "TeamResponse",
    "TeamRoleResponse",
    "TaskCreate",
    "TaskMemberAdd",
    "TaskMemberResponse",
    "TaskOwnerTransfer",
    "TaskResponse",
    "TaskStatusUpdate",
    "TaskUpdate",
    "TokenResponse",
    "UserResponse",
]
