from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.models.schedule import Schedule
from app.schemas.availability import ScheduleCreate, Schedule as ScheduleSchema 
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ScheduleSchema])
def read_schedules(
    staff_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    query = db.query(Schedule).filter(Schedule.tenant_id == current_user.tenant_id)
    if staff_id:
        query = query.filter(Schedule.staff_id == staff_id)
    return query.all()

@router.post("/", response_model=ScheduleSchema)
def create_schedule(
    schedule_in: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    # Validar
    if schedule_in.staff_id:
        staff = db.query(User).filter(User.id == schedule_in.staff_id, User.tenant_id == current_user.tenant_id).first()
        if not staff:
            raise HTTPException(404, "Staff not found")

    # Override tenant_id with current_user's tenant_id to be safe
    sched_data = schedule_in.dict()
    sched_data['tenant_id'] = current_user.tenant_id
    
    sched = Schedule(**sched_data)
    db.add(sched)
    db.commit()
    db.refresh(sched)
    return sched

@router.delete("/{schedule_id}", response_model=Any)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    sched = db.query(Schedule).filter(Schedule.id == schedule_id, Schedule.tenant_id == current_user.tenant_id).first()
    if not sched:
        raise HTTPException(404, "Schedule not found")
    db.delete(sched)
    db.commit()
    return {"status": "deleted"}
