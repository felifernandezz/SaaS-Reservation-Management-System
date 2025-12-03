from abc import ABC, abstractmethod
import logging

# Configure logging
logger = logging.getLogger(__name__)

class NotificationProvider(ABC):
    @abstractmethod
    def send_confirmation(self, to: str, customer_name: str, service_name: str, date_time: str):
        pass

class ConsoleNotificationProvider(NotificationProvider):
    def send_confirmation(self, to: str, customer_name: str, service_name: str, date_time: str):
        message = (
            f"--- NOTIFICATION ---\n"
            f"To: {to}\n"
            f"Subject: Reserva Confirmada\n"
            f"Body: Hola {customer_name}, tu reserva para {service_name} el {date_time} ha sido confirmada.\n"
            f"--------------------"
        )
        print(message)
        logger.info(f"Notification sent to {to}: {message}")

class TwilioNotificationProvider(NotificationProvider):
    def send_confirmation(self, to: str, customer_name: str, service_name: str, date_time: str):
        # Placeholder for Twilio implementation
        logger.warning("Twilio provider not implemented yet. Using Console fallback.")
        print(f"[Twilio Mock] Sending SMS to {to}")

def get_notification_provider() -> NotificationProvider:
    # Logic to switch providers based on config
    # For MVP, return ConsoleProvider
    return ConsoleNotificationProvider()
