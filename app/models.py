"""
SQLAlchemy models: User (role-based), Student, Attendance.
Student stores ID, name; face embeddings stored in files keyed by student_id.
"""
from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """User for login (Admin / Faculty)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="faculty")  # admin | faculty
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Student(Base):
    """Registered student: ID, name; photos and embeddings stored on disk."""
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. "STU001"
    name = Column(String(255), nullable=False)
    # Path to folder: uploads/<student_id>/ and embeddings/<student_id>.npy
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    attendances = relationship("Attendance", back_populates="student")


class Attendance(Base):
    """One record per student per day: prevents duplicate marking."""
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), default="Present")  # Present | Absent
    marked_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String(50), nullable=True)  # "camera" | "image_upload"

    student = relationship("Student", back_populates="attendances")

    __table_args__ = (UniqueConstraint("student_id", "date", name="uq_student_date"),)
