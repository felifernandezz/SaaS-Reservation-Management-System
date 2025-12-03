from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import timedelta

from app.api import deps
from app.models import Appointment, Customer, Service, AppointmentStatus, Tenant
from app.schemas import appointment as appointment_schemas
from app.services.availability import get_availability

router = APIRouter()

@router.post("/", response_model=Any)
def create_appointment(
    appointment_in: appointment_schemas.AppointmentCreate,
    # CAMBIO: Sin autenticación obligatoria. Tenant ID explícito.
    tenant_id: int = Query(..., description="ID del negocio"),
    db: Session = Depends(deps.get_db)
):
    """
    Create new appointment. Public access allowed (Guest Checkout).
    """
    
    # 1. Validar Tenant
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # 2. Lógica Guest Checkout: Buscar o Crear Cliente basado en Email
    customer_email = appointment_in.guest_data.email
    
    customer = db.query(Customer).filter(
        Customer.email == customer_email, 
        Customer.tenant_id == tenant_id
    ).first()
    
    if not customer:
        # Si no existe, creamos el "Shadow Account" para el invitado
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

    # 4. SAFETY CHECK: Re-verificar disponibilidad (Anti-Race Condition)
    # Esto evita que dos personas reserven el mismo slot milisegundos aparte
    query_date = appointment_in.start_time.date()
    query_time_str = appointment_in.start_time.strftime("%H:%M")
    
    # Llamamos a la lógica de disponibilidad
    available_slots = get_availability(db, tenant_id, service.id, query_date)
    
    # Si el horario ya no está en la lista de disponibles, rechazamos
    if query_time_str not in available_slots:
        raise HTTPException(
            status_code=409, 
            detail="Lo sentimos, este turno acaba de ser ocupado por otra persona."
        )

    # 5. Calcular Hora Fin
    end_time = appointment_in.start_time + timedelta(minutes=service.duration_minutes)

    # 6. Crear la Reserva
    appointment = Appointment(
        tenant_id=tenant_id,
        service_id=service.id,
        customer_id=customer.id, # Usamos el ID del cliente encontrado/creado
        start_time=appointment_in.start_time,
        end_time=end_time,
        status=AppointmentStatus.PENDING_PAYMENT,
        staff_id=None # Por ahora asignación automática o null
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # 7. Retornar URL de pago (Mock o Real)
    return {
        "id": appointment.id,
        "status": appointment.status,
        "payment_url": f"/pay-mock/{appointment.id}" 
    }

# --- Mantener endpoints de pago existentes abajo ---
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
    return {"status": "success", "message": "Payment confirmed"}
