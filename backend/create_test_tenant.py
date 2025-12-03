from app.db.session import SessionLocal
from app.models.tenant import Tenant

def create_test_tenant():
    db = SessionLocal()
    try:
        print("--- CREANDO TENANT DE PRUEBA (Gimnasio Iron) ---")
        
        # Check if already exists
        existing = db.query(Tenant).filter(Tenant.slug == "gimnasio-iron").first()
        if existing:
            print("⚠️ El tenant 'gimnasio-iron' ya existe.")
            return

        new_tenant = Tenant(
            name="Gimnasio Iron",
            slug="gimnasio-iron",
            domain="iron.localhost", # Simulated domain
            primary_color="#dc3545", # Bootstrap Danger (Red)
            secondary_color="#212529", # Dark
            logo_url="https://via.placeholder.com/150/dc3545/FFFFFF?text=IRON",
            website_title="Gimnasio Iron | Panel",
            timezone="America/Argentina/Buenos_Aires",
            config_cancellation_hours=12,
            config_guest_checkout=True
        )
        
        db.add(new_tenant)
        db.commit()
        print(f"✅ Tenant creado: {new_tenant.name} (ID: {new_tenant.id})")
        print(f"🎨 Color Primario: {new_tenant.primary_color}")
        print(f"🔗 Slug: {new_tenant.slug}")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_tenant()
