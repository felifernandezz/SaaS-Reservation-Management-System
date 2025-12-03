from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class Tenant(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    timezone = Column(String(50), default="America/Argentina/Buenos_Aires")
    config_cancellation_hours = Column(Integer, default=24)
    config_guest_checkout = Column(Boolean, default=True)

    # Identificación White-Label
    domain = Column(String(255), unique=True, nullable=True) # Ej: reservas.gimnasio.com
    slug = Column(String(100), unique=True, index=True, nullable=True) # Ej: gimnasio-iron
    
    # Branding
    primary_color = Column(String(7), default="#0d6efd") # Hex Color (Bootstrap Primary Default)
    secondary_color = Column(String(7), default="#6c757d")
    logo_url = Column(String(500), nullable=True) # URL pública del logo
    website_title = Column(String(100), default="Sistema de Reservas") # Lo que sale en la pestaña del navegador
