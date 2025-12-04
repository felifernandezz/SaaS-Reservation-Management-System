from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.db.session import get_db
from app.models.customer import Customer
from app.schemas import customer as customer_schemas
from app.models.user import User as UserModel

router = APIRouter()

@router.get("/", response_model=List[customer_schemas.Customer])
def read_customers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """
    Retrieve customers.
    """
    customers = db.query(Customer).filter(
        Customer.tenant_id == current_user.tenant_id
    ).offset(skip).limit(limit).all()
    return customers

@router.post("/", response_model=customer_schemas.Customer)
def create_customer(
    *,
    db: Session = Depends(get_db),
    customer_in: customer_schemas.CustomerCreate,
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """
    Create new customer.
    """
    customer = db.query(Customer).filter(
        Customer.email == customer_in.email,
        Customer.tenant_id == current_user.tenant_id
    ).first()
    if customer:
        raise HTTPException(status_code=400, detail="The customer with this email already exists in the system")
    
    customer = Customer(
        email=customer_in.email,
        full_name=customer_in.full_name,
        phone=customer_in.phone,
        tenant_id=current_user.tenant_id,
        hashed_password=security.get_password_hash(customer_in.password),
        is_active=True
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer
