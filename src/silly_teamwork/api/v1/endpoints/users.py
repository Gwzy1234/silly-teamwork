"""User profile endpoints."""

from fastapi import APIRouter

from silly_teamwork.api.dependencies import CurrentUser
from silly_teamwork.schemas.user import UserResponse

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current authenticated user",
    responses={401: {"description": "Missing, invalid, or expired access token"}},
)
async def get_me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)
