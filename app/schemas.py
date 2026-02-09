"""
Pydantic schemas for API request/response validation.
"""
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


# ----- Auth -----
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "faculty"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# ----- Student -----
class StudentCreate(BaseModel):
    student_id: str
    name: str


class StudentResponse(BaseModel):
    id: int
    student_id: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Attendance -----
class AttendanceMark(BaseModel):
    student_id: str  # our student_id string e.g. STU001
    name: str
    status: str = "Present"
    confidence: Optional[float] = None


class AttendanceRecordResponse(BaseModel):
    id: int
    student_id: str
    student_name: str
    date: date
    status: str
    marked_at: datetime

    class Config:
        from_attributes = True


class AttendanceSummary(BaseModel):
    date: date
    total_students: int
    present_count: int
    absent_count: int
    present_percent: float


# ----- Reports -----
class ReportRequest(BaseModel):
    from_date: date
    to_date: date
    student_ids: Optional[List[str]] = None  # filter by student_id list
