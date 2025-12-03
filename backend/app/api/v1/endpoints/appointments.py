from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from datetime import timedelta

from app.api import deps
from app.models import Appointment as AppointmentModel # Alias vital
from app.models import Customer, Service, AppointmentStatus, Tenant
from app.schemas import appointment as appointment_schemas
from app.services.availability import get_availability

router = APIRouter()

# --- NUEVO: Endpoint para el Calendario ---
@router.get("/", response_model=List[appointment_schemas.Appointment])
def read_appointments(
    skip: int = 0,
    limit: int = 100,
    tenant_id: int = Query(..., description="ID del negocio"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
):
    query = db.query(AppointmentModel).options(
        joinedload(AppointmentModel.customer),
        joinedload(AppointmentModel.service)
    ).filter(AppointmentModel.tenant_id == tenant_id)
    
    if start_date:
        query = query.filter(AppointmentModel.start_time >= start_date)
    if end_date:
        query = query.filter(AppointmentModel.start_time <= end_date)
        
    return query.offset(skip).limit(limit).all()
# ------------------------------------------

@router.post("/", response_model=Any)
def create_appointment(
    appointment_in: appointment_schemas.AppointmentCreate,
    tenant_id: int = Query(..., description="ID del negocio"),
    db: Session = Depends(deps.get_db)
):
    # 1. Validar Tenant
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # 2. Lógica Guest Checkout
    customer_email = appointment_in.guest_data.email
    customer = db.query(Customer).filter(
        Customer.email == customer_email, 
        Customer.tenant_id == tenant_id
    ).first()
    
    if not customer:
        customer = Customer(
            tenant_id=tenant_id,
            full_name=appointment_in.guest_data.full_name,
            email=customer_email,
            phone=appointment_in.guest_data.phone
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # 3. Validar Servicio
    service = db.query(Service).filter(Service.id == appointment_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # 4. Safety Check (Disponibilidad)
    query_date = appointment_in.start_time.date()
    query_time_str = appointment_in.start_time.strftime("%H:%M")
    
    available_slots = get_availability(db, tenant_id, service.id, query_date)
    
    if query_time_str not in available_slots:
        raise HTTPException(
            status_code=409, 
            detail="Lo sentimos, este turno acaba de ser ocupado."
        )

    # 5. Calcular Fin
    end_time = appointment_in.start_time + timedelta(minutes=service.duration_minutes)

    # 6. Crear Reserva
    # Nota: Staff ID queda NULL por ahora (asignación manual o automática futura)
    appointment = AppointmentModel(
        tenant_id=tenant_id,
        service_id=service.id,
        customer_id=customer.id,
        start_time=appointment_in.start_time,
        end_time=end_time,
        status=AppointmentStatus.PENDING_PAYMENT,
        staff_id=None 
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return {
        "id": appointment.id,
        "status": appointment.status,
        "payment_url": f"/pay-mock/{appointment.id}" 
    }

@router.post("/{appointment_id}/confirm-payment", response_model=Any)
def confirm_payment(
    appointment_id: int,
    db: Session = Depends(deps.get_db)
):
    appointment = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = AppointmentStatus.CONFIRMED
    appointment.payment_status = "APPROVED"
    appointment.payment_id = "mock_payment_123"
    
    db.commit()
    return {"status": "success"}
