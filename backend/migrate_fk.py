import os
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

# Add backend to path
sys.path.append(os.getcwd())

def migrate_fk():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            # 1. Drop the old foreign key constraint
            # Note: The constraint name 'appointment_ibfk_3' comes from the error log.
            conn.execute(text("ALTER TABLE appointment DROP FOREIGN KEY appointment_ibfk_3;"))
            print("Dropped old FK constraint.")
            
            # 2. Add the new foreign key constraint
            conn.execute(text("ALTER TABLE appointment ADD CONSTRAINT fk_appointment_customer FOREIGN KEY (customer_id) REFERENCES customer(id);"))
            print("Added new FK constraint referencing customer table.")
            
            conn.commit()
            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate_fk()
