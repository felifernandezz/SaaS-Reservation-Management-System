from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.base import Base

# Tabla intermedia para relación Many-to-Many
service_staff = Table(
    'service_staff',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('user.id'), primary_key=True),
    Column('service_id', Integer, ForeignKey('service.id'), primary_key=True)
)
