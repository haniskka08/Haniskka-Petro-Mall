import requests
import json

url = "http://127.0.0.1:8001/api/v1/auth/register"
payload = {
    "full_name": "Test User",
    "email": "testuser@example.com",
    "phone": "1234567890",
    "company_name": "Test Co",
    "password": "password123",
    "confirm_password": "password123"
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
