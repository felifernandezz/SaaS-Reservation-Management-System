from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import timedelta
from app.api import deps
from app.models import Appointment, Customer, Service, AppointmentStatus
from app.schemas import appointment as appointment_schemas
from app.services.availability import get_availability

router = APIRouter()

    response_data["payment_url"] = preference["init_point"]
    
    return response_data

@router.post("/{appointment_id}/confirm-payment", response_model=Any)
def confirm_payment(
    appointment_id: int,
    db: Session = Depends(deps.get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = AppointmentStatus.CONFIRMED
    appointment.payment_status = "APPROVED"
    appointment.payment_id = "mock_payment_123"
    
    db.commit()
    db.refresh(appointment)
    
    return {"status": "success", "message": "Payment confirmed"}
