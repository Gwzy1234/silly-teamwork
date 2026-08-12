from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    nickname: str | None = Field(validation_alias="display_name")
    email: EmailStr | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
