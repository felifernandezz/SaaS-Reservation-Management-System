from fastapi import APIRouter
from app.api.v1.endpoints import login, users, services, resources, availability, appointments, tenants, customer_auth, customers, stats, schedules

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(availability.router, prefix="/availability", tags=["availability"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(customer_auth.router, prefix="/auth/customer", tags=["customer_auth"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
