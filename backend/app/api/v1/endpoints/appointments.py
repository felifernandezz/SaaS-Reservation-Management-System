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
        joinedload(AppointmentModel.service),
        joinedload(AppointmentModel.staff)
    ).filter(
        AppointmentModel.tenant_id == tenant_id,
        AppointmentModel.status != AppointmentStatus.CANCELLED # Hide cancelled
    )
    
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
    from app.models.subscription import Subscription # Import here to avoid circular deps

    # 1. Validar Tenant
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # 2. Identificar Cliente (Guest vs Member)
    customer = None
    is_member = False
    
    if appointment_in.customer_id:
        # Flow Miembro Logueado
        customer = db.query(Customer).filter(Customer.id == appointment_in.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        is_member = True
    elif appointment_in.guest_data:
        # Flow Guest
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
    else:
        raise HTTPException(status_code=400, detail="Must provide guest_data or customer_id")

    # 3. Validar Servicio
    service = db.query(Service).filter(Service.id == appointment_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # 4. LÓGICA DE ASIGNACIÓN AUTOMÁTICA (AUTO-ASSIGN)
    final_staff_id = appointment_in.staff_id
    final_resource_id = appointment_in.resource_id # Future use for courts

    query_date = appointment_in.start_time.date()
    query_time_str = appointment_in.start_time.strftime("%H:%M")

    # Si NO se eligió staff y el servicio NO requiere un recurso físico específico (es decir, requiere humano)
    if not final_staff_id and not service.requires_resource_type:
        from app.models import User
        from sqlalchemy import or_
        
        # Buscar candidatos: Usuarios que tengan el servicio asignado (Skills) o sean generalistas
        candidates = db.query(User).filter(
            User.tenant_id == tenant_id,
            User.is_active == True,
            or_(
                User.services.any(id=service.id),
                ~User.services.any()
            )
        ).all()
        
        staff_assigned = False
        for staff in candidates:
            # Chequear disponibilidad específica para este staff
            slots = get_availability(db, tenant_id, service.id, query_date, staff_id=staff.id)
            if query_time_str in slots:
                final_staff_id = staff.id
                staff_assigned = True
                break # Encontramos uno! Asignar y salir.
        
        if not staff_assigned:
            raise HTTPException(status_code=409, detail="Lo sentimos, no hay profesionales disponibles para ese horario.")

    # 5. Validación Final de Disponibilidad (Con el Staff ya asignado)
    # Si el usuario eligió a mano, validamos su elección. Si fue automático, re-validamos por seguridad.
    available_slots = get_availability(db, tenant_id, service.id, query_date, staff_id=final_staff_id)
    
    if query_time_str not in available_slots:
         raise HTTPException(status_code=409, detail="El horario seleccionado ya no está disponible.")

    # 6. Calcular Fin
    end_time = appointment_in.start_time + timedelta(minutes=service.duration_minutes)

    # 7. Lógica de Créditos/Pagos
    initial_status = AppointmentStatus.PENDING_PAYMENT
    payment_url = f"/pay-mock/TEMP"
    
    if is_member:
        subscription = db.query(Subscription).filter(
            Subscription.customer_id == customer.id,
            Subscription.is_active == True,
            Subscription.remaining_credits > 0,
            Subscription.expires_at >= appointment_in.start_time
        ).first()
        
        if subscription:
            subscription.remaining_credits -= 1
            initial_status = AppointmentStatus.CONFIRMED
            payment_url = None

    # 8. Guardar Reserva (CON EL STAFF ID ASIGNADO)
    appointment = AppointmentModel(
        tenant_id=tenant_id,
        service_id=service.id,
        customer_id=customer.id,
        start_time=appointment_in.start_time,
        end_time=end_time,
        status=initial_status,
        staff_id=final_staff_id, # Aquí va el ID real, nunca NULL para servicios humanos
        resource_id=final_resource_id
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    if initial_status == AppointmentStatus.PENDING_PAYMENT:
        payment_url = f"/pay-mock/{appointment.id}"
    
    return {
        "id": appointment.id,
        "status": appointment.status,
        "payment_url": payment_url,
        "assigned_staff_id": final_staff_id # Devolvemos a quién se asignó
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

from datetime import datetime

@router.delete("/{appointment_id}", response_model=Any)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(deps.get_db),
    # Permitimos que Admin cancele (token requerido) o Cliente (token requerido)
    # Para MVP simplificado asumimos contexto Admin o Cliente logueado
    current_user = Depends(deps.get_current_user) 
):
    appointment = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Validar Permisos (Seguridad básica)
    # Si es un usuario Staff/Admin, puede borrar cualquier cita de su tenant
    is_admin = hasattr(current_user, 'tenant_id') and current_user.tenant_id == appointment.tenant_id
    
    # Si es cliente, solo sus propias citas
    is_owner = hasattr(current_user, 'email') and appointment.customer.email == current_user.email
    
    if not (is_admin or is_owner):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Regla de Cancelación (Solo aplica si NO es admin)
    if not is_admin:
        tenant = appointment.tenant
        limit_hours = tenant.config_cancellation_hours
        time_until_appt = appointment.start_time.replace(tzinfo=None) - datetime.utcnow()
        
        if time_until_appt < timedelta(hours=limit_hours):
            raise HTTPException(
                status_code=400, 
                detail=f"La cancelación solo se permite hasta {limit_hours} horas antes."
            )

    appointment.status = AppointmentStatus.CANCELLED
    db.commit()
    return {"status": "success", "message": "Appointment cancelled"}

from pydantic import BaseModel

# Reagendar (Simplificado: Solo cambio de hora)
class AppointmentUpdate(BaseModel):
    new_start_time: datetime

@router.put("/{appointment_id}/reschedule", response_model=Any)
def reschedule_appointment(
    appointment_id: int,
    update_data: AppointmentUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    appointment = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # 1. Verificar Disponibilidad Nueva
    # Nota: Usamos la lógica de availability existente
    query_date = update_data.new_start_time.date()
    query_time_str = update_data.new_start_time.strftime("%H:%M")
    
    available_slots = get_availability(db, appointment.tenant_id, appointment.service_id, query_date)
    
    if query_time_str not in available_slots:
        raise HTTPException(status_code=409, detail="El nuevo horario no está disponible.")
        
    # 2. Actualizar
    duration = appointment.end_time - appointment.start_time
    appointment.start_time = update_data.new_start_time
    appointment.end_time = update_data.new_start_time + duration
    
    db.commit()
    db.refresh(appointment)
    return {"status": "success", "new_time": appointment.start_time}

@router.get("/me", response_model=List[appointment_schemas.Appointment])
def read_my_appointments(
    db: Session = Depends(deps.get_db),
    current_user: Customer = Depends(deps.get_current_customer),
    skip: int = 0,
    limit: int = 100
):
    """
    Get appointments for the currently logged-in customer.
    """
    appointments = db.query(AppointmentModel).options(
        joinedload(AppointmentModel.service),
        joinedload(AppointmentModel.staff),
        joinedload(AppointmentModel.resource)
    ).filter(
        AppointmentModel.customer_id == current_user.id,
        AppointmentModel.status != AppointmentStatus.CANCELLED
    ).order_by(AppointmentModel.start_time.asc()).offset(skip).limit(limit).all()
    
    return appointments
