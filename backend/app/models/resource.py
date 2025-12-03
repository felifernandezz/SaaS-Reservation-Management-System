from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class ResourceType(str, enum.Enum):
    HUMAN = "HUMAN" # Staff (linked to User)
    ROOM = "ROOM"
    MACHINE = "MACHINE"

class Resource(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False) # Store Enum as String
    
    # Optional: Link to a User if type is HUMAN
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    tenant = relationship("Tenant")
    user = relationship("User")
