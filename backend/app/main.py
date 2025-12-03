from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

from app.db.mongo import connect_to_mongo, close_mongo_connection

from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.db.session import engine
from app.db.base import Base
# Import models to ensure they are registered with Base
from app.models import Tenant

@app.on_event("startup")
async def startup_event():
    import time
    from sqlalchemy.exc import OperationalError
    
    # Retry logic for MySQL
    max_retries = 30
    retry_interval = 2
    
    for i in range(max_retries):
        try:
            print(f"Attempting to connect to database (Attempt {i+1}/{max_retries})...")
            Base.metadata.create_all(bind=engine)
            print("Database connection successful.")
            break
        except OperationalError as e:
            print(f"Database connection failed: {e}")
            if i == max_retries - 1:
                raise e
            print(f"Retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)

    # Retry logic for MongoDB
    for i in range(max_retries):
        try:
            print(f"Attempting to connect to MongoDB (Attempt {i+1}/{max_retries})...")
            await connect_to_mongo()
            print("MongoDB connection successful.")
            break
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            if i == max_retries - 1:
                raise e
            print(f"Retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


@app.get("/")
def root():
    return {"message": "Welcome to SaaS Reservation Management System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
