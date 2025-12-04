from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.tenant import Tenant
from app.models.user import User
from app.models.service import Service
from app.models.schedule import Schedule
from app.models.plan import Plan
from app.core.security import get_password_hash
from datetime import time

def reset_database():
    print("⚠️  INICIANDO RESET TOTAL DE BASE DE DATOS...")
    
    # 1. Borrar y Recrear Tablas
    Base.metadata.drop_all(bind=engine)
    print("🗑️  Tablas eliminadas.")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas recreadas.")
    
    db = SessionLocal()
    try:
        # 2. Crear Tenant "Gimnasio Iron"
        print("🏗️  Creando Tenant: Gimnasio Iron...")
        tenant = Tenant(
            name="Gimnasio Iron",
            slug="gimnasio-iron",
            domain="localhost", 
            primary_color="#dc3545", # Rojo
            website_title="Gimnasio Iron",
            config_guest_checkout=False # MODO GIMNASIO (Solo socios)
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        
        # 3. Crear Admin
        print("👤 Creando Admin: admin@iron.com / admin")
        admin = User(
            email="admin@iron.com",
            hashed_password=get_password_hash("admin"),
            full_name="Dueño Iron",
            tenant_id=tenant.id,
            is_superuser=True,
            is_active=True
        )
        db.add(admin)
        
        # 4. Crear Staff (Lautaro y Benjamin)
        lautaro = User(email="lautaro@iron.com", hashed_password=get_password_hash("123"), full_name="Prof. Lautaro", tenant_id=tenant.id, is_active=True)
        benjamin = User(email="benja@iron.com", hashed_password=get_password_hash("123"), full_name="Prof. Benjamín", tenant_id=tenant.id, is_active=True)
        db.add_all([lautaro, benjamin])
        db.commit()
        db.refresh(lautaro)
        db.refresh(benjamin)
        
        # 5. Configurar Horarios Complejos (La matriz de turnos)
        # Lautaro: Lun-Sab 7-10 y Lun-Mie-Vie 18-21
        schedules = []
        for day in range(6): # 0-5
            # Mañana Lautaro
            schedules.append(Schedule(tenant_id=tenant.id, staff_id=lautaro.id, day_of_week=day, start_time=time(7,0), end_time=time(10,0), is_active=True))
            # Tarde Lautaro (Solo Lun/Mie/Vie)
            if day in [0, 2, 4]:
                schedules.append(Schedule(tenant_id=tenant.id, staff_id=lautaro.id, day_of_week=day, start_time=time(18,0), end_time=time(21,0), is_active=True))
            # Mediodia Benjamin
            schedules.append(Schedule(tenant_id=tenant.id, staff_id=benjamin.id, day_of_week=day, start_time=time(10,0), end_time=time(14,0), is_active=True))
            
        db.add_all(schedules)
        
        # 6. Servicios
        cf = Service(tenant_id=tenant.id, name="Crossfit", price=0, duration_minutes=60)
        func = Service(tenant_id=tenant.id, name="Funcional", price=0, duration_minutes=60)
        db.add_all([cf, func])
        
        # 7. Planes
        p8 = Plan(tenant_id=tenant.id, name="Pack 8 Clases", credits=8, price=25000)
        db.add(p8)
        
        db.commit()
        print("✨ ¡RESET EXITOSO! Todo limpio.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
