"""
Excel export: generate and download attendance reports.
"""
from datetime import date
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.excel_export import generate_daily_report, generate_range_report

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/daily")
async def export_daily(
    day: Optional[date] = Query(None),
    session: AsyncSession = Depends(get_db),
):
    """Generate Excel for one day; return file for download."""
    day = day or date.today()
    path = await generate_daily_report(session, day)
    return FileResponse(
        path,
        filename=path.name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.get("/range")
async def export_range(
    from_date: date = Query(...),
    to_date: date = Query(...),
    session: AsyncSession = Depends(get_db),
):
    """Generate Excel for date range; return file for download."""
    path = await generate_range_report(session, from_date, to_date, student_ids=None)
    return FileResponse(
        path,
        filename=path.name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
