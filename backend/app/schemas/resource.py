from pydantic import BaseModel
from typing import Optional
from app.models.resource import ResourceType

class ResourceBase(BaseModel):
    name: str
    type: ResourceType
    user_id: Optional[int] = None

class ResourceCreate(ResourceBase):
    tenant_id: int

class ResourceUpdate(ResourceBase):
    name: Optional[str] = None
    type: Optional[ResourceType] = None

class Resource(ResourceBase):
    id: int
    tenant_id: int

    class Config:
        from_attributes = True
