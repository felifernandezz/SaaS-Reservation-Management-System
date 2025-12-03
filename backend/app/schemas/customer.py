from typing import Optional, List
from pydantic import BaseModel, EmailStr

# Shared properties
class CustomerBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

# Properties to receive via API on creation
class CustomerCreate(CustomerBase):
    password: str
    tenant_id: int

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str
    tenant_id: int

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class CustomerInDBBase(CustomerBase):
    id: int
    tenant_id: int
    is_active: bool

    class Config:
        from_attributes = True

# Additional properties to return via API
class Customer(CustomerInDBBase):
    pass

class CustomerWithSubscription(Customer):
    active_subscription: Optional[dict] = None # Simplified for now
