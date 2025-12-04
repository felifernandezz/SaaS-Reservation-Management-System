from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.associations import service_staff

class Service(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=False)
    name = Column(String(255), index=True, nullable=False)
    price = Column(Float, default=0.0)
    duration_minutes = Column(Integer, nullable=False)
    buffer_after = Column(Integer, default=0)
    requires_resource_type = Column(String(50), nullable=True)
    
    tenant = relationship("Tenant")
    steps = relationship("ServiceStep", back_populates="service", cascade="all, delete-orphan")
    
    # NUEVO: Relación con Staff
    staff = relationship("User", secondary=service_staff, back_populates="services")

class ServiceStep(Base):
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("service.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    duration = Column(Integer, nullable=False)
    is_staff_active = Column(Boolean, default=True)
    requires_resource_type = Column(String(50), nullable=True)

    service = relationship("Service", back_populates="steps")
