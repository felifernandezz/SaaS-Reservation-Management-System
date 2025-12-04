from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.tenant import Tenant
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class TenantConfig(BaseModel):
    id: int
    name: str
    primary_color: str
    logo_url: Optional[str]
    title: str
    working_hours_start: str
    working_hours_end: str

class TenantUpdate(BaseModel):
    primary_color: Optional[str] = None
    logo_url: Optional[str] = None
    title: Optional[str] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None

@router.get("/config", response_model=TenantConfig)
def get_tenant_config(
    domain: Optional[str] = Query(None),
    slug: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db)
):
    """
    Devuelve la configuración visual basada en el dominio o slug.
    """
    tenant = None
    if domain:
        tenant = db.query(Tenant).filter(Tenant.domain == domain).first()
    
    if not tenant and slug:
        tenant = db.query(Tenant).filter(Tenant.slug == slug).first()
        
    if not tenant:
        # Fallback al Tenant Demo si no se encuentra (para evitar pantalla blanca)
        tenant = db.query(Tenant).filter(Tenant.id == 1).first()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return {
        "id": tenant.id,
        "name": tenant.name,
        "primary_color": tenant.primary_color,
        "logo_url": tenant.logo_url,
        "title": tenant.website_title,
        "working_hours_start": tenant.working_hours_start,
        "working_hours_end": tenant.working_hours_end
    }

@router.put("/config", response_model=TenantConfig)
def update_tenant_config(
    config_in: TenantUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user) # Require Auth
):
    """
    Update tenant configuration.
    """
    # For MVP, assume user belongs to Tenant 1 or use current_user.tenant_id
    tenant_id = current_user.tenant_id
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    if config_in.primary_color:
        tenant.primary_color = config_in.primary_color
    if config_in.logo_url:
        tenant.logo_url = config_in.logo_url
    if config_in.title:
        tenant.website_title = config_in.title
    if config_in.working_hours_start:
        tenant.working_hours_start = config_in.working_hours_start
    if config_in.working_hours_end:
        tenant.working_hours_end = config_in.working_hours_end
        
    db.commit()
    db.refresh(tenant)
    
    return {
        "id": tenant.id,
        "name": tenant.name,
        "primary_color": tenant.primary_color,
        "logo_url": tenant.logo_url,
        "title": tenant.website_title,
        "working_hours_start": tenant.working_hours_start,
        "working_hours_end": tenant.working_hours_end
    }
