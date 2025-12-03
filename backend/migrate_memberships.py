from app.db.session import SessionLocal, engine
from app.models.plan import Plan
from app.models.subscription import Subscription
from sqlalchemy import text

def migrate_memberships():
    db = SessionLocal()
    try:
        print("--- MIGRANDO MEMBRESIAS (Plans & Subscriptions) ---")
        
        with engine.connect() as connection:
            # 1. Update Customer Table
            try:
                connection.execute(text("ALTER TABLE customer ADD COLUMN hashed_password VARCHAR(255)"))
                print("✅ Added hashed_password to customer")
            except Exception as e:
                print(f"⚠️ hashed_password column might already exist: {e}")

            try:
                connection.execute(text("ALTER TABLE customer ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
                print("✅ Added is_active to customer")
            except Exception as e:
                print(f"⚠️ is_active column might already exist: {e}")

            # 2. Create Plan Table
            try:
                connection.execute(text("""
                    CREATE TABLE IF NOT EXISTS plan (
                        id INTEGER PRIMARY KEY AUTO_INCREMENT,
                        tenant_id INTEGER NOT NULL,
                        name VARCHAR(100) NOT NULL,
                        credits INTEGER NOT NULL,
                        price FLOAT NOT NULL,
                        validity_days INTEGER DEFAULT 30,
                        FOREIGN KEY (tenant_id) REFERENCES tenant(id)
                    )
                """))
                print("✅ Created plan table")
            except Exception as e:
                print(f"❌ Error creating plan table: {e}")

            # 3. Create Subscription Table
            try:
                connection.execute(text("""
                    CREATE TABLE IF NOT EXISTS subscription (
                        id INTEGER PRIMARY KEY AUTO_INCREMENT,
                        customer_id INTEGER NOT NULL,
                        plan_id INTEGER NOT NULL,
                        remaining_credits INTEGER NOT NULL,
                        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                        expires_at DATETIME NOT NULL,
                        is_active BOOLEAN DEFAULT TRUE,
                        FOREIGN KEY (customer_id) REFERENCES customer(id),
                        FOREIGN KEY (plan_id) REFERENCES plan(id)
                    )
                """))
                print("✅ Created subscription table")
            except Exception as e:
                print(f"❌ Error creating subscription table: {e}")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_memberships()
