from fastapi import APIRouter
from app.api.v1.endpoints import services, login, users, resources, availability, appointments

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(availability.router, prefix="/availability", tags=["availability"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
