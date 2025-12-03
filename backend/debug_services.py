from app.db.session import SessionLocal
from app.models.service import Service

def debug():
    db = SessionLocal()
    try:
        print("--- DEBUG SERVICES ---")
        services = db.query(Service).all()
        print(f"Found {len(services)} services:")
        for s in services:
            print(f"ID: {s.id}, Name: {s.name}, Tenant: {s.tenant_id}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug()
