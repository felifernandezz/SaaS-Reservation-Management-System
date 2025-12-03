import requests
import json
import sys

# Use localhost:8000 because we are running from the host machine and the port is mapped
url = "http://localhost:8000/api/v1/appointments/"
data = {
  "service_id": 1,
  "start_time": "2025-12-04T11:00:00",
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
    # Add tenant_id param
    url_with_tenant = f"{url}?tenant_id=1"
    data["service_id"] = service_id
    response = requests.post(url_with_tenant, json=data)
    print(f"Create Status: {response.status_code}")
    print(f"Create Response: {response.text}")
    
    if response.status_code == 200:
        appt_data = response.json()
        appt_id = appt_data['id']
        print(f"Created Appointment ID: {appt_id}")
        
        # 3. Confirm Payment
        confirm_url = f"http://localhost:8000/api/v1/appointments/{appt_id}/confirm-payment"
        confirm_res = requests.post(confirm_url)
        print(f"Confirm Status: {confirm_res.status_code}")
        print(f"Confirm Response: {confirm_res.text}")
        
except Exception as e:
    print(f"Error: {e}")
