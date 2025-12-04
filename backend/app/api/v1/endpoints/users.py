from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.db.session import get_db
from app.models.user import User as UserModel
from app.models.service import Service
from app.schemas.user import User, UserCreate, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    # Solo mostrar usuarios de MI tenant
    users = db.query(UserModel).filter(
        UserModel.tenant_id == current_user.tenant_id
    ).offset(skip).limit(limit).all()
    return users

@router.get("/public", response_model=List[User])
def read_users_public(
    tenant_id: int,
    service_id: int = Query(None), # Nuevo filtro opcional
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Public endpoint for booking widget to fetch staff.
    """
    query = db.query(UserModel).filter(
        UserModel.tenant_id == tenant_id,
        UserModel.is_active == True
    )
    
    if service_id:
        # Filtrar usuarios que tengan el servicio asignado
        query = query.filter(UserModel.services.any(id=service_id))
        
    return query.offset(skip).limit(limit).all()

@router.post("/{user_id}/services", response_model=Any)
def update_user_services(
    user_id: int,
    service_ids: List[int] = Body(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """Assign services to a staff member (Skills)"""
    user = db.query(UserModel).filter(UserModel.id == user_id, UserModel.tenant_id == current_user.tenant_id).first()
    if not user:
        raise HTTPException(404, "User not found")
        
    # Buscar los servicios
    services = db.query(Service).filter(Service.id.in_(service_ids), Service.tenant_id == current_user.tenant_id).all()
    
    user.services = services
    db.commit()
    return {"status": "success", "assigned_count": len(services)}

@router.post("/", response_model=User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    # Verificar email duplicado global o por tenant? Global es mas seguro.
    user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="El email ya existe.")
    
    db_user = UserModel(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        tenant_id=current_user.tenant_id, # Forzar tenant actual
        is_active=True,
        is_superuser=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    user = db.query(UserModel).filter(
        UserModel.id == user_id, 
        UserModel.tenant_id == current_user.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        hashed_password = security.get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password
        
    for field, value in update_data.items():
        setattr(user, field, value)
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=User)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes borrarte a ti mismo.")

    user = db.query(UserModel).filter(
        UserModel.id == user_id,
        UserModel.tenant_id == current_user.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    db.delete(user)
    db.commit()
    return user
