from app.db.session import SessionLocal
from app.models.service import Service
from app.models.tenant import Tenant

def create():
    db = SessionLocal()
    try:
        print("--- MANUAL SERVICE CREATION ---")
        tenant = db.query(Tenant).first()
        if not tenant:
            print("No tenant found!")
            return

        service = db.query(Service).filter(Service.name == "Corte de Pelo").first()
        if service:
            print(f"Service already exists: ID={service.id}")
        else:
            print("Creating service...")
            service = Service(
                tenant_id=tenant.id,
                name="Corte de Pelo",
                price=1500.0,
                duration_minutes=30,
                buffer_after=0,
                requires_resource_type=None
            )
            db.add(service)
            db.commit()
            db.refresh(service)
            print(f"Service created: ID={service.id}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create()
