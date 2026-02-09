"""
Mark attendance from image (camera frame or upload), get daily summary, list records.
"""
from datetime import date, timedelta
from typing import List, Optional

import numpy as np
import cv2
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Student, Attendance
from app.schemas import AttendanceMark, AttendanceRecordResponse, AttendanceSummary
from app.services.face_engine import recognize_from_image
from app.services.attendance_service import mark_recognized_and_fill_absent

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.post("/mark-from-image")
async def mark_attendance_from_image(
    file: UploadFile = File(...),
    attendance_date: Optional[date] = Query(None),
    session: AsyncSession = Depends(get_db),
):
    """Upload an image (classroom photo); recognize faces and mark present for the day. No duplicate per student per day."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file")
    data = await file.read()
    npy = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(npy, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image")
    day = attendance_date or date.today()
    recognized = await recognize_from_image(session, img)
    marked = await mark_recognized_and_fill_absent(session, recognized, day, source="image_upload")
    return {
        "date": str(day),
        "recognized": [{"student_id": s[0], "name": s[1], "confidence": s[2]} for s in recognized],
        "marked_present": marked,
    }


@router.get("/records", response_model=List[AttendanceRecordResponse])
async def get_attendance_records(
    day: Optional[date] = Query(None),
    session: AsyncSession = Depends(get_db),
):
    """Get attendance records for a day (default today). Each student has one row: Present or Absent."""
    day = day or date.today()
    result = await session.execute(
        select(Attendance, Student)
        .join(Student, Attendance.student_id == Student.id)
        .where(Attendance.date == day)
    )
    rows = []
    for att, stu in result.all():
        rows.append(AttendanceRecordResponse(
            id=att.id,
            student_id=stu.student_id,
            student_name=stu.name,
            date=att.date,
            status=att.status,
            marked_at=att.marked_at,
        ))
    return rows


@router.get("/summary", response_model=AttendanceSummary)
async def get_daily_summary(
    day: Optional[date] = Query(None),
    session: AsyncSession = Depends(get_db),
):
    day = day or date.today()
    result = await session.execute(select(Attendance).where(Attendance.date == day))
    records = result.scalars().all()
    total = len(records)
    present = sum(1 for r in records if r.status == "Present")
    absent = total - present
    pct = (present / total * 100) if total else 0.0
    return AttendanceSummary(
        date=day,
        total_students=total,
        present_count=present,
        absent_count=absent,
        present_percent=round(pct, 2),
    )


@router.get("/summary-range")
async def get_summary_range(
    from_date: date = Query(...),
    to_date: date = Query(...),
    session: AsyncSession = Depends(get_db),
):
    """Daily summaries for each day in range."""
    result = await session.execute(select(Student))
    students = result.scalars().all()
    total_students = len(students)
    if total_students == 0:
        return []
    result = await session.execute(
        select(Attendance.date, Attendance.status)
        .where(Attendance.date >= from_date, Attendance.date <= to_date)
    )
    by_date = {}
    for d, status in result.all():
        if d not in by_date:
            by_date[d] = {"present": 0, "absent": 0}
        if status == "Present":
            by_date[d]["present"] += 1
        else:
            by_date[d]["absent"] += 1
    out = []
    current = from_date
    while current <= to_date:
        data = by_date.get(current, {"present": 0, "absent": 0})
        present = data["present"]
        absent = data["absent"]
        missing = total_students - present - absent
        absent += missing
        pct = (present / total_students * 100) if total_students else 0
        out.append({
            "date": str(current),
            "total_students": total_students,
            "present_count": present,
            "absent_count": absent,
            "present_percent": round(pct, 2),
        })
        current += timedelta(days=1)
    return out
