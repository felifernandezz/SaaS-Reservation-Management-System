import requests
import json
import sys

# Use localhost:8000 because we are running from the host machine and the port is mapped
url = "http://localhost:8000/api/v1/appointments/"
data = {
  "service_id": 1,
  "start_time": "2025-12-04T10:00:00",
  "guest_data": {
    "full_name": "Curl Test",
    "email": "curl@test.com",
    "phone": "123456"
  }
}
headers = {'Content-Type': 'application/json'}

try:
    # 1. Get Services
    services_url = "http://localhost:8000/api/v1/services/"
    services_res = requests.get(services_url)
    services = services_res.json()
    
    if not services:
        print("No services found.")
        sys.exit(1)
        
    service_id = services[0]['id']
    print(f"Using Service ID: {service_id}")

    # 2. Create Appointment
    data["service_id"] = service_id
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
