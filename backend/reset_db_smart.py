from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.tenant import Tenant
from app.models.user import User
from app.models.service import Service
from app.models.schedule import Schedule
from app.core.security import get_password_hash
from datetime import time

def reset_smart():
    print("🧠 RESETEANDO A MODELO SMART (Skills & Schedules)...")
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Tenant
        tenant = Tenant(name="Estética Smart", slug="smart", domain="localhost", primary_color="#6610f2", website_title="Smart Booking")
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        
        # Admin
        admin = User(email="admin@smart.com", hashed_password=get_password_hash("admin"), full_name="Admin", tenant_id=tenant.id, is_active=True, is_superuser=True)
        db.add(admin)
        
        # Servicios
        s_unas = Service(tenant_id=tenant.id, name="Uñas Esculpidas", price=2500, duration_minutes=60)
        s_masaje = Service(tenant_id=tenant.id, name="Masaje Relax", price=4000, duration_minutes=60)
        db.add_all([s_unas, s_masaje])
        db.commit()
        db.refresh(s_unas)
        db.refresh(s_masaje)
        
        # Staff con Skills
        ana = User(email="ana@smart.com", hashed_password=get_password_hash("123"), full_name="Ana (Solo Uñas)", tenant_id=tenant.id, is_active=True)
        beto = User(email="beto@smart.com", hashed_password=get_password_hash("123"), full_name="Beto (Solo Masaje)", tenant_id=tenant.id, is_active=True)
        carla = User(email="carla@smart.com", hashed_password=get_password_hash("123"), full_name="Carla (Todo)", tenant_id=tenant.id, is_active=True)
        
        # Asignar Skills (Relación Many-to-Many)
        ana.services = [s_unas]
        beto.services = [s_masaje]
        carla.services = [s_unas, s_masaje]
        
        db.add_all([ana, beto, carla])
        db.commit()
        
        # Horarios
        # Ana (Uñas): Lunes 9-18
        db.add(Schedule(tenant_id=tenant.id, staff_id=ana.id, day_of_week=0, start_time=time(9,0), end_time=time(18,0), is_active=True))
        # Beto (Masaje): Lunes 9-13 (Solo mañana)
        db.add(Schedule(tenant_id=tenant.id, staff_id=beto.id, day_of_week=0, start_time=time(9,0), end_time=time(13,0), is_active=True))
        # Carla (Todo): Lunes 14-20 (Solo tarde)
        db.add(Schedule(tenant_id=tenant.id, staff_id=carla.id, day_of_week=0, start_time=time(14,0), end_time=time(20,0), is_active=True))
        
        db.commit()
        print("✅ LISTO. Prueba en Lunes:")
        print("- Servicio Uñas: Ana (Mañana) y Carla (Tarde).")
        print("- Servicio Masaje: Beto (Mañana) y Carla (Tarde).")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_smart()
