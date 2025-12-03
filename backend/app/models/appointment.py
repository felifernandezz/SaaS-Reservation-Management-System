from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class AppointmentStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class Appointment(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=False)
    
    service_id = Column(Integer, ForeignKey("service.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customer.id"), nullable=False) # The client
    staff_id = Column(Integer, ForeignKey("user.id"), nullable=True) # The provider
    resource_id = Column(Integer, ForeignKey("resource.id"), nullable=True) # Optional machine/room
    
    start_time = Column(DateTime(timezone=True), nullable=False) # UTC
    end_time = Column(DateTime(timezone=True), nullable=False) # UTC
    
    status = Column(String(50), default=AppointmentStatus.PENDING_PAYMENT)
    
    # Payment Info
    payment_id = Column(String(100), nullable=True)
    payment_status = Column(String(50), default="PENDING")
    
    tenant = relationship("Tenant")
    service = relationship("Service")
    customer = relationship("Customer")
    staff = relationship("User", foreign_keys=[staff_id])
    resource = relationship("Resource")
