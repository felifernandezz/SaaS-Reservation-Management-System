from app.db.session import SessionLocal
from app.models.service import Service
from app.models.schedule import Schedule
from app.models.resource import Resource
from app.models.user import User
from datetime import date

def debug():
    db = SessionLocal()
    try:
        print("--- DEBUG AVAILABILITY ---")
        
        # 1. Check Services
        services = db.query(Service).all()
        print(f"Found {len(services)} services:")
        for s in services:
            print(f"ID: {s.id}, Name: {s.name}, Tenant: {s.tenant_id}")
            
        service_id = 1
        service = db.query(Service).filter(Service.id == service_id).first()
            
        # 2. Check Schedules for Wednesday (Day 2)
        print("\n--- SCHEDULES (Day 2 - Wednesday) ---")
        schedules = db.query(Schedule).filter(Schedule.day_of_week == 2).all()
        if schedules:
            for s in schedules:
                staff_name = s.staff.email if s.staff else "None"
                resource_name = s.resource.name if s.resource else "None"
                print(f"ID: {s.id}, Staff: {staff_name}, Resource: {resource_name}, Time: {s.start_time}-{s.end_time}")
        else:
            print("No schedules found for Day 2.")

        # 3. Check Resources
        print("\n--- RESOURCES ---")
        resources = db.query(Resource).all()
        for r in resources:
            print(f"ID: {r.id}, Name: {r.name}, Type: {r.type}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug()
