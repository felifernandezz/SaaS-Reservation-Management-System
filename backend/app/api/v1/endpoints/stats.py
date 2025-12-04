from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from app.api import deps
from app.db.session import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.models.service import Service
from app.models.user import User as UserModel

router = APIRouter()

@router.get("/dashboard", response_model=Any)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """
    Get statistics for the dashboard.
    """
    tenant_id = current_user.tenant_id
    today = date.today()
    
    # 1. Appointments Today
    # Filter by start_time being within today (00:00 to 23:59)
    # Since start_time is datetime, we cast to date or filter range
    total_appointments_today = db.query(Appointment).filter(
        Appointment.tenant_id == tenant_id,
        func.date(Appointment.start_time) == today,
        Appointment.status != AppointmentStatus.CANCELLED
    ).count()

    # 2. Revenue Today (Estimated)
    # Sum of service price for today's appointments
    # We join with Service to get the price
    revenue_query = db.query(func.sum(Service.price)).join(Appointment).filter(
        Appointment.tenant_id == tenant_id,
        func.date(Appointment.start_time) == today,
        Appointment.status != AppointmentStatus.CANCELLED
    ).scalar()
    
    total_revenue_today = revenue_query if revenue_query else 0

    # 3. Active Staff
    active_staff = db.query(User).filter(
        User.tenant_id == tenant_id,
        User.is_active == True
    ).count()

    # 4. Pending Confirmations
    # Appointments with status PENDING_PAYMENT
    pending_confirmations = db.query(Appointment).filter(
        Appointment.tenant_id == tenant_id,
        Appointment.status == AppointmentStatus.PENDING_PAYMENT
    ).count()

    return {
        "totalAppointmentsToday": total_appointments_today,
        "totalRevenueToday": total_revenue_today,
        "activeStaff": active_staff,
        "pendingConfirmations": pending_confirmations
    }
