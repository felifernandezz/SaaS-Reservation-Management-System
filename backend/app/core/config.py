from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SaaS Reservation System"
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SaaS Reservation System"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str
    MONGODB_URL: str
    
    SECRET_KEY: str = "supersecretkey" # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Mercado Pago
    MERCADOPAGO_ACCESS_TOKEN: str = "TEST-7641976622791898-120315-f55963753381e1910543509315532577-186962423" # Placeholder Test Token
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
