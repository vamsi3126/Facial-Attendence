"""
Attendance marking logic: prevent duplicate per student per day, mark present for recognized faces.
"""
from datetime import date
from typing import List, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Student, Attendance


async def get_student_by_student_id(session: AsyncSession, student_id: str) -> Student | None:
    result = await session.execute(select(Student).where(Student.student_id == student_id))
    return result.scalar_one_or_none()


async def mark_present(
    session: AsyncSession,
    student_id: str,
    day: date,
    source: str = "image_upload",
) -> bool:
    """
    Mark student as present for the given date if not already marked.
    Returns True if marked (new or existing), False if student not found.
    """
    student = await get_student_by_student_id(session, student_id)
    if not student:
        return False
    result = await session.execute(
        select(Attendance).where(
            Attendance.student_id == student.id,
            Attendance.date == day,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return True  # Already marked, no duplicate
    att = Attendance(student_id=student.id, date=day, status="Present", source=source)
    session.add(att)
    return True


async def ensure_all_students_have_attendance_record(session: AsyncSession, day: date) -> None:
    """
    For the given date, ensure every registered student has an attendance row.
    Missing students get status Absent.
    """
    result = await session.execute(select(Student))
    students = result.scalars().all()
    result = await session.execute(select(Attendance).where(Attendance.date == day))
    existing = {a.student_id for a in result.scalars().all()}
    for s in students:
        if s.id not in existing:
            session.add(Attendance(student_id=s.id, date=day, status="Absent", source="system"))


async def mark_recognized_and_fill_absent(
    session: AsyncSession,
    recognized: List[Tuple[str, str, float]],
    day: date,
    source: str = "image_upload",
) -> List[str]:
    """
    Mark all recognized students as present (no duplicate), then ensure
    all other students have an Absent record for the day.
    Returns list of student_ids that were marked present (newly).
    """
    marked = []
    for student_id, _name, _conf in recognized:
        ok = await mark_present(session, student_id, day, source=source)
        if ok:
            marked.append(student_id)
    await ensure_all_students_have_attendance_record(session, day)
    return marked
