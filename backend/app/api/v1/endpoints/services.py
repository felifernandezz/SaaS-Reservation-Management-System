from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.service import Service as ServiceModel, ServiceStep as ServiceStepModel
from app.schemas.service import ServiceCreate, Service, ServiceUpdate

router = APIRouter()

@router.post("/", response_model=Service)
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    # Create Service
    db_service = ServiceModel(
        tenant_id=service.tenant_id,
        name=service.name,
        price=service.price,
        duration_minutes=service.duration_minutes,
        buffer_after=service.buffer_after,
        requires_resource_type=service.requires_resource_type
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)

    # Create Steps if any
    if service.steps:
        for step in service.steps:
            db_step = ServiceStepModel(
                service_id=db_service.id,
                step_order=step.step_order,
                name=step.name,
                duration=step.duration,
                is_staff_active=step.is_staff_active,
                requires_resource_type=step.requires_resource_type
            )
            db.add(db_step)
        db.commit()
        db.refresh(db_service)
    
    return db_service

@router.get("/", response_model=List[Service])
def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    services = db.query(ServiceModel).offset(skip).limit(limit).all()
    return services

@router.get("/{service_id}", response_model=Service)
def read_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return service
