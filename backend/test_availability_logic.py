from app.db.session import SessionLocal
from app.services.availability import get_availability
from datetime import date

def test():
    db = SessionLocal()
    try:
        tenant_id = 1
        service_id = 3
        query_date = date(2025, 12, 3) # Wednesday
        
        print(f"Testing Availability for Service {service_id} on {query_date}...")
        slots = get_availability(db, tenant_id, service_id, query_date)
        print(f"Result: {slots}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test()
