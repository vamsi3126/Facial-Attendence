"""
Generate and update attendance Excel (.xlsx) with Student ID, Name, Date, Status.
"""
from datetime import date
from pathlib import Path
from typing import List, Optional

import pandas as pd
from openpyxl import load_workbook
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import EXPORTS_DIR
from app.models import Student, Attendance


async def get_attendance_for_date(session: AsyncSession, day: date) -> List[dict]:
    """Get attendance records for a single day; include all students with Present/Absent."""
    # All students
    result = await session.execute(select(Student))
    students = result.scalars().all()
    # Attendance for day
    result = await session.execute(
        select(Attendance).where(Attendance.date == day)
    )
    records = {a.student_id: a for a in result.scalars().all()}

    rows = []
    for s in students:
        att = records.get(s.id)
        status = att.status if att else "Absent"
        rows.append({
            "Student ID": s.student_id,
            "Student Name": s.name,
            "Date": day,
            "Attendance Status": status,
        })
    return rows


async def get_attendance_range(
    session: AsyncSession,
    from_date: date,
    to_date: date,
    student_ids: Optional[List[str]] = None,
) -> List[dict]:
    """Get all attendance in date range; optionally filter by student_id list."""
    result = await session.execute(select(Student))
    students = result.scalars().all()
    if student_ids is not None:
        students = [s for s in students if s.student_id in student_ids]
    if not students:
        return []

    result = await session.execute(
        select(Attendance).where(
            Attendance.date >= from_date,
            Attendance.date <= to_date,
        )
    )
    all_att = result.scalars().all()
    by_date_student = {(a.date, a.student_id): a for a in all_att}

    rows = []
    current = from_date
    while current <= to_date:
        for s in students:
            att = by_date_student.get((current, s.id))
            status = att.status if att else "Absent"
            rows.append({
                "Student ID": s.student_id,
                "Student Name": s.name,
                "Date": current,
                "Attendance Status": status,
            })
        # next day
        from datetime import timedelta
        current += timedelta(days=1)
    return rows


def write_excel(rows: List[dict], filepath: Path) -> Path:
    """Write list of dicts to Excel; columns: Student ID, Student Name, Date, Attendance Status."""
    df = pd.DataFrame(rows)
    df.to_excel(filepath, index=False, sheet_name="Attendance")
    return filepath


async def generate_daily_report(session: AsyncSession, day: date) -> Path:
    """Generate one Excel file for the given day; save to exports/."""
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    rows = await get_attendance_for_date(session, day)
    filename = f"attendance_{day.isoformat()}.xlsx"
    filepath = EXPORTS_DIR / filename
    write_excel(rows, filepath)
    return filepath


async def generate_range_report(
    session: AsyncSession,
    from_date: date,
    to_date: date,
    student_ids: Optional[List[str]] = None,
) -> Path:
    """Generate Excel for date range."""
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    rows = await get_attendance_range(session, from_date, to_date, student_ids)
    filename = f"attendance_{from_date.isoformat()}_to_{to_date.isoformat()}.xlsx"
    filepath = EXPORTS_DIR / filename
    write_excel(rows, filepath)
    return filepath
