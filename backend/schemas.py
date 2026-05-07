"""
Schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"

class StatusEnum(str, Enum):
    ALIVE = "alive"
    DECEASED = "deceased"

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    family_name: str
    
    @validator('password')
    def password_valid(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    family_name: str
    is_admin: bool
    created_at: datetime

# Family Member Schemas
class LocationResponse(BaseModel):
    id: str
    name: str
    state: str
    district: Optional[str]
    location_type: Optional[str]

class LocationCreate(BaseModel):
    name: str
    state: str
    district: Optional[str]
    location_type: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]

class FamilyMemberCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    gender: GenderEnum
    date_of_birth: Optional[datetime] = None
    birth_year: Optional[int] = None
    birth_place: Optional[str] = None
    status: StatusEnum = StatusEnum.ALIVE
    death_year: Optional[int] = None
    biography: Optional[str] = None
    father_id: Optional[str] = None
    mother_id: Optional[str] = None
    spouse_id: Optional[str] = None

class FamilyMemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[GenderEnum] = None
    date_of_birth: Optional[datetime] = None
    birth_year: Optional[int] = None
    birth_place: Optional[str] = None
    status: Optional[StatusEnum] = None
    death_year: Optional[int] = None
    biography: Optional[str] = None
    father_id: Optional[str] = None
    mother_id: Optional[str] = None
    spouse_id: Optional[str] = None

class FamilyMemberResponse(BaseModel):
    id: str
    owner_id: str
    first_name: str
    last_name: Optional[str] = None
    gender: str
    date_of_birth: Optional[datetime] = None
    birth_year: Optional[int] = None
    birth_place: Optional[str] = None
    status: str
    death_year: Optional[int] = None
    photo_url: Optional[str] = None
    biography: Optional[str] = None
    father_id: Optional[str] = None
    mother_id: Optional[str] = None
    spouse_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TreeNodeResponse(BaseModel):
    id: str
    name: str
    gender: str
    birth_year: Optional[int]
    death_year: Optional[int]
    photo_url: Optional[str]
    status: str
    children: Optional[List['TreeNodeResponse']]

# Change Log Schemas
class ChangeLogResponse(BaseModel):
    id: str
    user_id: str
    family_member_id: str
    action: str
    old_values: Optional[dict]
    new_values: Optional[dict]
    created_at: datetime

# Share Access Schemas
class SharedAccessCreate(BaseModel):
    shared_with_email: str
    permission: str = "view"  # 'view', 'edit', 'admin'

class SharedAccessResponse(BaseModel):
    id: str
    user_id: str
    shared_with_email: str
    permission: str
    created_at: datetime

# Update forward references
TreeNodeResponse.update_forward_refs()
