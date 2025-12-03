from app.db.session import SessionLocal, engine
from app.models.tenant import Tenant
from sqlalchemy import text

def migrate_tenant():
    db = SessionLocal()
    try:
        print("--- MIGRANDO TABLA TENANT (Branding) ---")
        
        # Check if columns exist before adding (simple check)
        with engine.connect() as connection:
            # MySQL specific check or just try/except
            try:
                connection.execute(text("ALTER TABLE tenant ADD COLUMN domain VARCHAR(255) UNIQUE"))
                print("✅ Added domain column")
            except Exception as e:
                print(f"⚠️ domain column might already exist: {e}")

            try:
                connection.execute(text("ALTER TABLE tenant ADD COLUMN slug VARCHAR(100) UNIQUE"))
                print("✅ Added slug column")
            except Exception as e:
                print(f"⚠️ slug column might already exist: {e}")

            try:
                connection.execute(text("ALTER TABLE tenant ADD COLUMN primary_color VARCHAR(7) DEFAULT '#0d6efd'"))
                print("✅ Added primary_color column")
            except Exception as e:
                print(f"⚠️ primary_color column might already exist: {e}")

            try:
                connection.execute(text("ALTER TABLE tenant ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#6c757d'"))
                print("✅ Added secondary_color column")
            except Exception as e:
                print(f"⚠️ secondary_color column might already exist: {e}")

            try:
                connection.execute(text("ALTER TABLE tenant ADD COLUMN logo_url VARCHAR(500)"))
                print("✅ Added logo_url column")
            except Exception as e:
                print(f"⚠️ logo_url column might already exist: {e}")

            try:
                connection.execute(text("ALTER TABLE tenant ADD COLUMN website_title VARCHAR(100) DEFAULT 'Sistema de Reservas'"))
                print("✅ Added website_title column")
            except Exception as e:
                print(f"⚠️ website_title column might already exist: {e}")
                
            # Update existing tenant (ID 1) with default values
            connection.execute(text("UPDATE tenant SET slug='demo', domain='localhost', website_title='Demo Reservas' WHERE id=1"))
            print("✅ Updated Tenant 1 with default branding")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_tenant()
