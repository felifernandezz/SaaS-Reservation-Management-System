from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.tenant import Tenant
from app.models.user import User
from app.models.service import Service
from app.models.schedule import Schedule
from app.core.security import get_password_hash
from datetime import time

def reset_to_general_model():
    print("🌍 RESETEANDO A MODELO GENERAL (MULTIPROPÓSITO)...")
    
    # 1. Limpieza Total
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 2. Tenant Genérico
        tenant = Tenant(
            name="Espacio Vital",
            slug="espacio-vital",
            domain="localhost", 
            primary_color="#20c997", # Teal
            website_title="Espacio Vital | Reservas",
            working_hours_start="08:00",
            working_hours_end="22:00",
            config_guest_checkout=True 
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        
        # 3. Admin Dueño
        admin = User(
            email="admin@vital.com",
            hashed_password=get_password_hash("admin"),
            full_name="Admin General",
            tenant_id=tenant.id,
            is_superuser=True,
            is_active=True
        )
        db.add(admin)
        
        # 4. STAFF - "Unidades de Capacidad"
        # Creamos 3 empleados
        juan = User(email="juan@vital.com", hashed_password=get_password_hash("123"), full_name="Juan (Turno Tarde)", tenant_id=tenant.id, is_active=True)
        ana = User(email="ana@vital.com", hashed_password=get_password_hash("123"), full_name="Ana (Turno Tarde)", tenant_id=tenant.id, is_active=True)
        profe = User(email="profe@vital.com", hashed_password=get_password_hash("123"), full_name="Profe Yoga (Mañana)", tenant_id=tenant.id, is_active=True)
        
        db.add_all([juan, ana, profe])
        db.commit()
        
        # 5. CONFIGURACIÓN DE HORARIOS (Schedules)
        # Aquí definimos la CAPACIDAD del negocio.
        
        schedules = []
        
        # CASO 1: CONCURRENCIA (Juan y Ana trabajan a la misma hora)
        # Esto significa que de 16:00 a 20:00 hay CAPACIDAD = 2 para masajes.
        for day in range(6): # Lun-Sab
            # Juan
            schedules.append(Schedule(tenant_id=tenant.id, staff_id=juan.id, day_of_week=day, start_time=time(16,0), end_time=time(20,0), is_active=True))
            # Ana (Mismo horario!)
            schedules.append(Schedule(tenant_id=tenant.id, staff_id=ana.id, day_of_week=day, start_time=time(16,0), end_time=time(20,0), is_active=True))
            
            # CASO 2: TURNO ÚNICO (Yoga solo a la mañana)
            schedules.append(Schedule(tenant_id=tenant.id, staff_id=profe.id, day_of_week=day, start_time=time(8,0), end_time=time(12,0), is_active=True))

        db.add_all(schedules)
        
        # 6. Servicios
        masaje = Service(tenant_id=tenant.id, name="Masaje Relajante", price=5000, duration_minutes=60)
        yoga = Service(tenant_id=tenant.id, name="Clase Yoga Individual", price=3000, duration_minutes=60)
        
        db.add_all([masaje, yoga])
        db.commit()
        
        print("✅ MODELO GENERAL CARGADO")
        print("------------------------------------------------")
        print("Acceso Admin: admin@vital.com / admin")
        print("------------------------------------------------")
        print("PRUEBA DE CONCURRENCIA:")
        print("1. Reserva Masaje a las 17:00 (Ocupa Juan).")
        print("2. Reserva Masaje a las 17:00 (Ocupa Ana).")
        print("3. Intenta 3er Masaje a las 17:00 (Debe fallar).")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_to_general_model()
