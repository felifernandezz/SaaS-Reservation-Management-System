from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Plan(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=False)
    
    name = Column(String(100), nullable=False) # e.g., "Pase Libre", "Pack 8 Clases"
    credits = Column(Integer, nullable=False) # -1 for unlimited
    price = Column(Float, nullable=False)
    validity_days = Column(Integer, default=30)
    
    tenant = relationship("Tenant")
