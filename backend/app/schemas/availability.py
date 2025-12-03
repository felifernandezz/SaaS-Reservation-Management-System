from pydantic import BaseModel
from typing import Optional
from datetime import datetime, time
from app.models.appointment import AppointmentStatus

# --- Schedule Schemas ---
class ScheduleBase(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time
    is_active: bool = True
    staff_id: Optional[int] = None
    resource_id: Optional[int] = None

class ScheduleCreate(ScheduleBase):
    tenant_id: int

class Schedule(ScheduleBase):
    id: int
    tenant_id: int
    class Config:
        from_attributes = True

# --- Appointment Schemas ---
class AppointmentBase(BaseModel):
    service_id: int
    customer_id: int
    staff_id: Optional[int] = None
    resource_id: Optional[int] = None
    start_time: datetime
    end_time: datetime
    status: AppointmentStatus = AppointmentStatus.CONFIRMED

class AppointmentCreate(AppointmentBase):
    tenant_id: int

class Appointment(AppointmentBase):
    id: int
    tenant_id: int
    class Config:
        from_attributes = True
