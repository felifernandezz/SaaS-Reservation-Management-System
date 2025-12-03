from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.api import deps
from app.models import Appointment, Customer, Service, AppointmentStatus
from app.schemas import appointment as appointment_schemas
from app.services.availability import get_availability

router = APIRouter()

from typing import Any

@router.post("/", response_model=Any)
def create_appointment(
    appointment_in: appointment_schemas.AppointmentCreate,
    db: Session = Depends(deps.get_db),
    # current_user: models.User = Depends(deps.get_current_active_user) # Public endpoint for now?
    # If public, we need to handle tenant_id. For now, let's assume tenant_id=1 (Default) or pass it in header/body.
    # Ideally, the widget has a public token or we infer from domain.
    # For simplicity, we'll hardcode tenant_id=1 for the guest widget.
):
    tenant_id = 1 # Default Tenant
    
    # 1. Get Service
    service = db.query(Service).filter(Service.id == appointment_in.service_id, Service.tenant_id == tenant_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # 2. Calculate End Time
    end_time = appointment_in.start_time + timedelta(minutes=service.duration_minutes)

    # 3. Check Availability (Re-use logic or simple check)
    # Ideally we lock the row or use a transaction with Serializable isolation.
    # For now, we'll do a simple check.
    # TODO: Use get_availability logic to ensure staff/resource is free.
    # This is a simplified check for overlapping appointments for the same service/resource?
    # Actually, we need to assign a staff member if not provided.
    # For MVP, we'll just check if there are ANY overlapping appointments for the *assigned* staff.
    # But we haven't assigned staff yet!
    # The availability engine *finds* available staff. We should probably re-run it or pick one.
    
    # Simplified: Just save it for now. The Availability Engine is for *finding* slots.
    # In a real app, we'd pick the specific staff member here.
    # Let's assume we pick the first available staff or just save it as "Any Staff" (staff_id=None) if allowed?
    # Our model allows staff_id=True (nullable).
    # Let's try to find a staff member.
    
    # For this MVP step, let's just create the customer and appointment.
    
    # 4. Get or Create Customer
    customer = db.query(Customer).filter(Customer.email == appointment_in.guest_data.email, Customer.tenant_id == tenant_id).first()
    if not customer:
        customer = Customer(
            tenant_id=tenant_id,
            full_name=appointment_in.guest_data.full_name,
            email=appointment_in.guest_data.email,
            phone=appointment_in.guest_data.phone
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    
    # 5. Create Appointment
    appointment = Appointment(
        tenant_id=tenant_id,
        service_id=service.id,
        customer_id=customer.id,
        start_time=appointment_in.start_time,
        end_time=end_time,
        status=AppointmentStatus.PENDING_PAYMENT
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # 6. Generate Payment Preference
    from app.services.payment import create_preference
    preference = create_preference(appointment, service)
    
    # We can return the preference URL directly or wrap it
    # For now, let's return the appointment with the init_point as a custom field or similar?
    # Or better, change the response model to include payment_url.
    # But for quick iteration, let's just return a dict or modify the schema.
    
    return {
        **appointment.__dict__,
        "payment_url": preference["init_point"]
    }
