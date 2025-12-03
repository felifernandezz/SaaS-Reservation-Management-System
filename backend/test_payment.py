import sys
import os

# Add app to path
sys.path.append(os.getcwd())

try:
    import mercadopago
    print("Mercado Pago SDK installed successfully.")
    
    from app.core.config import settings
    sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    
    preference_data = {
        "items": [
            {"title": "Test Service", "quantity": 1, "unit_price": 10.0, "currency_id": "ARS"}
        ]
    }
    
    response = sdk.preference().create(preference_data)
    print(f"Full Response: {response}")
    print(f"Preference created: {response['response']['init_point']}")
    
except ImportError:
    print("Error: mercadopago module not found.")
except Exception as e:
    print(f"Error creating preference: {e}")
