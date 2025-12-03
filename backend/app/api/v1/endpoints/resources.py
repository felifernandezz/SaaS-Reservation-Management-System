from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.resource import Resource as ResourceModel
from app.schemas.resource import Resource, ResourceCreate

router = APIRouter()

@router.post("/", response_model=Resource)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    db_resource = ResourceModel(
        tenant_id=resource.tenant_id,
        name=resource.name,
        type=resource.type.value,
        user_id=resource.user_id
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.get("/", response_model=List[Resource])
def read_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    resources = db.query(ResourceModel).offset(skip).limit(limit).all()
    return resources
