from pydantic import BaseModel
from typing import List, Optional

# ServiceStep Schemas
class ServiceStepBase(BaseModel):
    step_order: int
    name: str
    duration: int
    is_staff_active: bool = True
    requires_resource_type: Optional[str] = None

class ServiceStepCreate(ServiceStepBase):
    pass

class ServiceStep(ServiceStepBase):
    id: int
    service_id: int

    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    name: str
    price: float = 0.0
    duration_minutes: int
    buffer_after: int = 0
    requires_resource_type: Optional[str] = None

class ServiceCreate(ServiceBase):
    tenant_id: int
    steps: List[ServiceStepCreate] = []

class ServiceUpdate(ServiceBase):
    name: Optional[str] = None
    duration_minutes: Optional[int] = None
    steps: Optional[List[ServiceStepCreate]] = None

class Service(ServiceBase):
    id: int
    tenant_id: int
    steps: List[ServiceStep] = []

    class Config:
        from_attributes = True
