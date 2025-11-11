from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint , func
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    media = relationship("Media", back_populates="owner", cascade="all, delete-orphan")

class Media(Base):
    __tablename__ = "media"

  

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    mimetype = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    uv_hash = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=func.now())  # ✅ created_at 이름 통일

    owner = relationship("User", back_populates="media")

    __table_args__ = (
        UniqueConstraint("owner_id", "uv_hash", name="uq_owner_hash"),  # 같은 유저가 같은 해시 중복 저장 방지
    )
