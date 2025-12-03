from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin_user():
    db = SessionLocal()
    try:
        email = "admin@example.com"
        password = "admin"
        tenant_id = 1
        
        # Check if exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists. Updating password...")
            user.hashed_password = get_password_hash(password)
            user.is_superuser = True
            user.is_active = True
        else:
            print(f"Creating user {email}...")
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                full_name="Admin User",
                tenant_id=tenant_id,
                is_superuser=True,
                is_active=True
            )
            db.add(user)
        
        db.commit()
        print(f"✅ Admin user created/updated: {email} / {password}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
