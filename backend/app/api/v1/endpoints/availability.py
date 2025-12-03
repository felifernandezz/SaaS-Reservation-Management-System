from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api import deps
from app.services.availability import get_availability

router = APIRouter()

@router.get("/", response_model=List[str])
def check_availability(
    service_id: int,
    date: date,
    current_user = Depends(deps.get_current_active_user), # Optional: require auth
    db: Session = Depends(get_db)
):
    """
    Get available time slots for a service on a specific date.
    """
    # Use the tenant_id from the current user
    tenant_id = current_user.tenant_id
    
    slots = get_availability(
        db=db,
        tenant_id=tenant_id,
        service_id=service_id,
        query_date=date
    )
    return slots
