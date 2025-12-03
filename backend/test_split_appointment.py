from app.db.session import SessionLocal
from app.models.service import Service, ServiceStep
from app.models.tenant import Tenant
from app.models.appointment import Appointment, AppointmentStatus
from app.services.availability import get_availability
from datetime import date, datetime, time

def test_split():
    db = SessionLocal()
    try:
        print("--- TEST SPLIT APPOINTMENTS ---")
        tenant = db.query(Tenant).first()
        
        # 1. Create Multi-Step Service "Coloración"
        # Step 1: Application (30m, Active)
        # Step 2: Processing (45m, Inactive)
        # Step 3: Wash (15m, Active)
        # Total Duration: 90m
        
        service_color = db.query(Service).filter(Service.name == "Coloración").first()
        if not service_color:
            print("Creating Service 'Coloración'...")
            service_color = Service(
                tenant_id=tenant.id,
                name="Coloración",
                duration_minutes=90,
                requires_resource_type=None
            )
            db.add(service_color)
            db.commit()
            db.refresh(service_color)
            
            steps = [
                ServiceStep(service_id=service_color.id, step_order=1, name="Application", duration=30, is_staff_active=True),
                ServiceStep(service_id=service_color.id, step_order=2, name="Processing", duration=45, is_staff_active=False),
                ServiceStep(service_id=service_color.id, step_order=3, name="Wash", duration=15, is_staff_active=True)
            ]
            db.add_all(steps)
            db.commit()
        else:
            print(f"Service 'Coloración' exists: ID={service_color.id}")

        # 2. Book "Coloración" at 09:00
        # Timeline:
        # 09:00 - 09:30: Staff BUSY
        # 09:30 - 10:15: Staff FREE (Processing)
        # 10:15 - 10:30: Staff BUSY
        
        # Check if appointment exists
        appt = db.query(Appointment).filter(Appointment.service_id == service_color.id).first()
        if not appt:
            print("Booking 'Coloración' at 09:00...")
            # Need a customer
            from app.models.user import User
            customer = db.query(User).filter(User.email == "admin@example.com").first() # Reuse admin as customer for test
            staff = db.query(User).filter(User.email == "admin@example.com").first()
            
            appt = Appointment(
                tenant_id=tenant.id,
                service_id=service_color.id,
                customer_id=customer.id,
                staff_id=staff.id,
                start_time=datetime(2025, 12, 4, 9, 0), # Thursday
                end_time=datetime(2025, 12, 4, 10, 30),
                status=AppointmentStatus.CONFIRMED
            )
            db.add(appt)
            db.commit()
        else:
            print("Appointment already exists.")

        # 3. Check Availability for "Corte de Pelo" (30m, Active)
        # It SHOULD be available at 09:30 (during processing)
        
        service_cut = db.query(Service).filter(Service.name == "Corte de Pelo").first()
        print(f"Checking availability for '{service_cut.name}' on 2025-12-04...")
        
        slots = get_availability(db, tenant.id, service_cut.id, date(2025, 12, 4))
        
        print(f"Available Slots: {slots}")
        
        if "09:30" in slots:
            print("SUCCESS: 09:30 is available! (Split logic working)")
        else:
            print("FAILURE: 09:30 is NOT available.")
            
        if "09:00" not in slots:
             print("SUCCESS: 09:00 is blocked (as expected)")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_split()
