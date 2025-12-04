from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.api import deps
from app.models.service import Service as ServiceModel, ServiceStep as ServiceStepModel
from app.schemas.service import ServiceCreate, Service, ServiceUpdate

router = APIRouter()

@router.get("/", response_model=List[Service])
def read_services(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_active_user) 
):
    services = db.query(ServiceModel).filter(
        ServiceModel.tenant_id == current_user.tenant_id
    ).offset(skip).limit(limit).all()
    return services

@router.get("/public", response_model=List[Service])
def read_services_public(
    tenant_id: int,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Public endpoint for booking widget.
    """
    services = db.query(ServiceModel).filter(
        ServiceModel.tenant_id == tenant_id
    ).offset(skip).limit(limit).all()
    return services

@router.post("/", response_model=Service)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_active_user)
):
    try:
        # Create Service linked to current user's tenant
        db_service = ServiceModel(
            tenant_id=current_user.tenant_id, # AUTO-ASSIGN TENANT
            name=service.name,
            price=service.price,
            duration_minutes=service.duration_minutes,
            buffer_after=service.buffer_after,
            requires_resource_type=service.requires_resource_type
        )
        db.add(db_service)
        db.commit()
        db.refresh(db_service)

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
    except Exception as e:
        db.rollback()
        print(f"Error creating service: {e}")
        raise HTTPException(status_code=500, detail="Error creating service")

@router.delete("/{service_id}", response_model=Service)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_active_user)
):
    service = db.query(ServiceModel).filter(
        ServiceModel.id == service_id,
        ServiceModel.tenant_id == current_user.tenant_id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(service)
    db.commit()
    return service

@router.put("/{service_id}", response_model=Service)
def update_service(
    service_id: int,
    service_in: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_active_user)
):
    service = db.query(ServiceModel).filter(
        ServiceModel.id == service_id,
        ServiceModel.tenant_id == current_user.tenant_id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    db.add(service)
    db.commit()
    db.refresh(service)
    return service
