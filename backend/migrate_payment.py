import os
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

# Add backend to path
sys.path.append(os.getcwd())

def migrate_db():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE appointment ADD COLUMN payment_id VARCHAR(100) NULL;"))
            conn.execute(text("ALTER TABLE appointment ADD COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING';"))
            conn.commit()
            print("Migration successful: Added payment columns.")
        except Exception as e:
            print(f"Migration failed (maybe columns exist?): {e}")

if __name__ == "__main__":
    migrate_db()
