from app.db.session import SessionLocal
from app.models.schedule import Schedule
from app.models.user import User
from datetime import time

def setup_split():
    db = SessionLocal()
    try:
        print("--- CONFIGURANDO HORARIO CORTADO (Admin) ---")
        user = db.query(User).filter(User.email == "admin@example.com").first()
        if not user:
            print("❌ Admin no encontrado. Ejecuta seed_data.py primero.")
            return

        # 1. Limpiar horarios existentes
        deleted = db.query(Schedule).filter(Schedule.staff_id == user.id).delete()
        print(f"🗑️ Horarios anteriores eliminados: {deleted}")
        
        # 2. Insertar Turno Mañana y Tarde (Lunes a Viernes)
        new_schedules = []
        for day in range(5): # 0=Lun, 4=Vie
            # Mañana: 09:00 - 13:00
            new_schedules.append(Schedule(
                tenant_id=user.tenant_id,
                staff_id=user.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(13, 0),
                is_active=True
            ))
            # Tarde: 17:00 - 21:00
            new_schedules.append(Schedule(
                tenant_id=user.tenant_id,
                staff_id=user.id,
                day_of_week=day,
                start_time=time(17, 0),
                end_time=time(21, 0),
                is_active=True
            ))
            
        db.add_all(new_schedules)
        db.commit()
        print("✅ Éxito: Admin ahora trabaja Lun-Vie [09-13] y [17-21].")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_split()
