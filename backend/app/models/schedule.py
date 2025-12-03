from sqlalchemy import Column, Integer, String, ForeignKey, Time, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

class Schedule(Base):
    """
    Defines working hours for Staff or Resources.
    """
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=False)
    
    staff_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resource.id"), nullable=True)
    
    day_of_week = Column(Integer, nullable=False) # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    is_active = Column(Boolean, default=True)
    
    tenant = relationship("Tenant")
    staff = relationship("User")
    resource = relationship("Resource")
