from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class Tenant(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    timezone = Column(String(50), default="America/Argentina/Buenos_Aires")
    config_cancellation_hours = Column(Integer, default=24)
    config_guest_checkout = Column(Boolean, default=True)
