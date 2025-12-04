from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
from .service import Service

# Customer Schemas
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    tenant_id: int

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    service_id: int
    start_time: datetime
    # end_time is calculated

class AppointmentCreate(AppointmentBase):
    guest_data: Optional[CustomerCreate] = None
    customer_id: Optional[int] = None
    staff_id: Optional[int] = None

class Appointment(AppointmentBase):
    id: int
    tenant_id: int
    customer_id: int
    end_time: datetime
    status: str
    
    # Relationships
    service: Optional[Service] = None
    customer: Optional[Customer] = None

    class Config:
        from_attributes = True
