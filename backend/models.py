"""
Database models for Family Tree application
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, JSON, Enum, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
import uuid

Base = declarative_base()

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"

class PersonStatus(enum.Enum):
    ALIVE = "alive"
    DECEASED = "deceased"

class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    family_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    family_members = relationship("FamilyMember", back_populates="owner")
    change_logs = relationship("ChangeLog", back_populates="user")
    shared_access = relationship("SharedAccess", back_populates="user", foreign_keys="SharedAccess.user_id")

class FamilyMember(Base):
    """Family member model"""
    __tablename__ = "family_members"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    gender = Column(Enum(Gender), nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    birth_year = Column(Integer, nullable=True)
    birth_place = Column(String, nullable=True)
    date_of_death = Column(DateTime, nullable=True)
    death_year = Column(Integer, nullable=True)
    status = Column(Enum(PersonStatus), default=PersonStatus.ALIVE, nullable=False)
    photo_url = Column(String, nullable=True)
    biography = Column(Text, nullable=True)
    
    # Family relationships
    father_id = Column(String, ForeignKey("family_members.id"), nullable=True)
    mother_id = Column(String, ForeignKey("family_members.id"), nullable=True)
    spouse_id = Column(String, ForeignKey("family_members.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="family_members")
    children = relationship(
        "FamilyMember",
        foreign_keys=[father_id, mother_id],
        remote_side=[id],
        backref="parents"
    )
    father = relationship("FamilyMember", remote_side=[father_id], foreign_keys=[father_id])
    mother = relationship("FamilyMember", remote_side=[mother_id], foreign_keys=[mother_id])
    spouse = relationship("FamilyMember", remote_side=[spouse_id], foreign_keys=[spouse_id])
    change_logs = relationship("ChangeLog", back_populates="family_member")

class SharedAccess(Base):
    """Model for sharing family tree with other users"""
    __tablename__ = "shared_access"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    shared_with_email = Column(String, nullable=False)
    permission = Column(String, default="view")  # 'view', 'edit', 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="shared_access", foreign_keys=[user_id])

class ChangeLog(Base):
    """Track all changes made to family members"""
    __tablename__ = "change_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    family_member_id = Column(String, ForeignKey("family_members.id"), nullable=False, index=True)
    action = Column(String, nullable=False)  # 'create', 'update', 'delete'
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="change_logs")
    family_member = relationship("FamilyMember", back_populates="change_logs")

class Location(Base):
    """Indian cities and villages"""
    __tablename__ = "locations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_type = Column(String, nullable=True)  # 'city', 'village', 'town'
    created_at = Column(DateTime, default=datetime.utcnow)
