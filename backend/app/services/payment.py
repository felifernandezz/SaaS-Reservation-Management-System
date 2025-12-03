import mercadopago
from app.core.config import settings
from app.models import Appointment, Service

# Initialize SDK
sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

def create_preference(appointment: Appointment, service: Service):
    preference_data = {
        "items": [
            {
                "title": service.name,
                "quantity": 1,
                "unit_price": float(service.price),
                "currency_id": "ARS"
            }
        ],
        "payer": {
            "name": appointment.customer.full_name,
            "email": appointment.customer.email
        },
        "back_urls": {
            "success": "http://localhost:3000/book/success",
            "failure": "http://localhost:3000/book/failure",
            "pending": "http://localhost:3000/book/pending"
        },
        "auto_return": "approved",
        "external_reference": str(appointment.id)
    }

    preference_response = sdk.preference().create(preference_data)
    return preference_response["response"]
