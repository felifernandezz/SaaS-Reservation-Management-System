from typing import Any
from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.customer import Customer
from app.models.subscription import Subscription
from app.schemas import customer as customer_schemas
from app.schemas.user import Token

router = APIRouter()

@router.post("/register", response_model=customer_schemas.Customer)
def register_customer(
    customer_in: customer_schemas.CustomerCreate,
    db: Session = Depends(deps.get_db)
) -> Any:
    # Check if user exists in this tenant
    user = db.query(Customer).filter(
        Customer.email == customer_in.email,
        Customer.tenant_id == customer_in.tenant_id
    ).first()
    
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
        
    user = Customer(
        email=customer_in.email,
        full_name=customer_in.full_name,
        phone=customer_in.phone,
        tenant_id=customer_in.tenant_id,
        hashed_password=security.get_password_hash(customer_in.password),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login_customer(
    login_data: customer_schemas.CustomerLogin,
    db: Session = Depends(deps.get_db)
) -> Any:
    user = db.query(Customer).filter(
        Customer.email == login_data.email,
        Customer.tenant_id == login_data.tenant_id
    ).first()
    
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires, sub_type="customer"
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=customer_schemas.CustomerWithSubscription)
def read_users_me(
    current_user: Customer = Depends(deps.get_current_customer),
    db: Session = Depends(deps.get_db)
) -> Any:
    # Fetch active subscription
    subscription = db.query(Subscription).filter(
        Subscription.customer_id == current_user.id,
        Subscription.is_active == True
    ).first()
    
    user_data = customer_schemas.Customer.from_orm(current_user)
    response = customer_schemas.CustomerWithSubscription(**user_data.dict())
    
    if subscription:
        response.active_subscription = {
            "plan_name": subscription.plan.name,
            "remaining_credits": subscription.remaining_credits,
            "expires_at": subscription.expires_at
        }
        
    return response

from pydantic import BaseModel
class SubscriptionCreate(BaseModel):
    plan_id: int

@router.post("/subscribe", response_model=Any)
def subscribe_customer(
    sub_in: SubscriptionCreate,
    current_user: Customer = Depends(deps.get_current_customer),
    db: Session = Depends(deps.get_db)
) -> Any:
    # 1. Fetch Plan (Mocking plan data if not in DB, but we should have it)
    # For MVP, let's assume plans exist or we create them on the fly if missing
    from app.models.plan import Plan
    
    plan = db.query(Plan).filter(Plan.id == sub_in.plan_id).first()
    if not plan:
        # Auto-create mock plans for demo if they don't exist
        if sub_in.plan_id == 1:
            plan = Plan(tenant_id=current_user.tenant_id, name="Pase Libre (8 Clases)", credits=8, price=50.0, validity_days=30)
        elif sub_in.plan_id == 2:
            plan = Plan(tenant_id=current_user.tenant_id, name="Clase Suelta", credits=1, price=10.0, validity_days=7)
        elif sub_in.plan_id == 3:
            plan = Plan(tenant_id=current_user.tenant_id, name="Pack Trimestral", credits=24, price=120.0, validity_days=90)
        else:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        db.add(plan)
        db.commit()
        db.refresh(plan)

    # 2. Deactivate old active subscriptions
    old_subs = db.query(Subscription).filter(
        Subscription.customer_id == current_user.id,
        Subscription.is_active == True
    ).all()
    for sub in old_subs:
        sub.is_active = False
    
    # 3. Create new subscription
    new_sub = Subscription(
        customer_id=current_user.id,
        plan_id=plan.id,
        remaining_credits=plan.credits,
        expires_at=datetime.utcnow() + timedelta(days=plan.validity_days),
        is_active=True
    )
    
    db.add(new_sub)
    db.commit()
    
    return {"status": "success", "message": f"Subscribed to {plan.name}"}
