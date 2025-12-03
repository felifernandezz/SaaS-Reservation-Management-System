from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Service(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=False)
    name = Column(String(255), index=True, nullable=False)
    price = Column(Float, default=0.0)
    duration_minutes = Column(Integer, nullable=False) # Total duration
    buffer_after = Column(Integer, default=0) # Cleanup time in minutes
    requires_resource_type = Column(String(50), nullable=True) # e.g., 'LASER_MACHINE'
    
    # Relationships
    tenant = relationship("Tenant")
    steps = relationship("ServiceStep", back_populates="service", cascade="all, delete-orphan")

class ServiceStep(Base):
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("service.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False) # e.g., "Application", "Processing", "Wash"
    duration = Column(Integer, nullable=False)
    is_staff_active = Column(Boolean, default=True) # If False, resource is FREE (e.g., processing time)
    requires_resource_type = Column(String(50), nullable=True)

    service = relationship("Service", back_populates="steps")
