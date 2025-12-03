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
        # En producción esto podría ser un 404 o redirigir a una landing page genérica
        tenant = db.query(Tenant).filter(Tenant.id == 1).first()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return {
        "id": tenant.id,
        "name": tenant.name,
        "primary_color": tenant.primary_color,
        "logo_url": tenant.logo_url,
        "title": tenant.website_title
    }
