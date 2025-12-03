from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.tenant import Tenant
from app.db.base import Base

def seed_data():
    db = SessionLocal()
    try:
        # Check if tenant exists
        tenant = db.query(Tenant).filter(Tenant.name == "Demo Tenant").first()
        if not tenant:
            print("Creating default tenant...")
            tenant = Tenant(name="Demo Tenant", timezone="America/Argentina/Buenos_Aires")
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
            print(f"Tenant created: ID={tenant.id}, Name={tenant.name}")
        else:
            print(f"Tenant already exists: ID={tenant.id}")
            
        # Check if admin user exists
        from app.models.user import User
        from app.core.security import get_password_hash
        
        user = db.query(User).filter(User.email == "admin@example.com").first()
        if not user:
            print("Creating default admin user...")
            user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                tenant_id=tenant.id,
                is_superuser=True
            )
            db.add(user)
            db.commit()
            print(f"Admin user created: {user.email}")
        else:
            print(f"Admin user already exists: {user.email}")

        # Create Default Resources
        from app.models.resource import Resource, ResourceType
        
        resource_room = db.query(Resource).filter(Resource.name == "Sala 1").first()
        if not resource_room:
            resource_room = Resource(
                tenant_id=tenant.id,
                name="Sala 1",
                type=ResourceType.ROOM
            )
            db.add(resource_room)
            print("Resource 'Sala 1' created.")

        resource_machine = db.query(Resource).filter(Resource.name == "Láser Diodo").first()
        if not resource_machine:
            resource_machine = Resource(
                tenant_id=tenant.id,
                name="Láser Diodo",
                type=ResourceType.MACHINE
            )
            db.add(resource_machine)
            print("Resource 'Láser Diodo' created.")
            
        db.commit()
        
        # Create Default Schedules (Working Hours: Mon-Fri 09:00-18:00)
        from app.models.schedule import Schedule
        from datetime import time
        
        # Check if admin has schedule
        admin_schedule = db.query(Schedule).filter(Schedule.staff_id == user.id).first()
        if not admin_schedule:
            print("Creating default schedules for Admin...")
            for day in range(5): # Mon(0) to Fri(4)
                sched = Schedule(
                    tenant_id=tenant.id,
                    staff_id=user.id,
                    day_of_week=day,
                    start_time=time(9, 0),
                    end_time=time(18, 0),
                    is_active=True
                )
                db.add(sched)
            db.commit()
            print("Admin schedules created.")

        # Check if resources have schedule
        if resource_room:
            room_schedule = db.query(Schedule).filter(Schedule.resource_id == resource_room.id).first()
            if not room_schedule:
                print("Creating default schedules for Sala 1...")
                for day in range(5):
                    sched = Schedule(
                        tenant_id=tenant.id,
                        resource_id=resource_room.id,
                        day_of_week=day,
                        start_time=time(9, 0),
                        end_time=time(18, 0),
                        is_active=True
                    )
                    db.add(sched)
                db.commit()
                print("Sala 1 schedules created.")

        # Create Default Service
        from app.models.service import Service
        service = db.query(Service).filter(Service.name == "Corte de Pelo").first()
        if not service:
            service = Service(
                tenant_id=tenant.id,
                name="Corte de Pelo",
                price=1500.0,
                duration_minutes=30,
                buffer_after=0,
                requires_resource_type=None # Simple service
            )
            db.add(service)
            db.commit()
            print("Service 'Corte de Pelo' created.")

    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Seeding database...")
    Base.metadata.create_all(bind=engine)
    seed_data()
    print("Seeding complete.")
