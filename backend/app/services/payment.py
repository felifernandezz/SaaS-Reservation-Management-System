import mercadopago
from app.core.config import settings
from app.models import Appointment, Service

# Initialize SDK
sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

def create_preference(appointment_id: int, service_price: float, service_name: str, customer_name: str, customer_email: str):
    # MOCK IMPLEMENTATION
    # Instead of calling Mercado Pago, we return a local URL to a mock payment page.
    # In a real scenario, we would use the SDK here.
    
    mock_payment_url = f"http://localhost:3000/pay-mock/{appointment_id}"
    
    return {
        "init_point": mock_payment_url,
        "id": "mock_preference_id"
    }
