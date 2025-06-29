#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime
import sys
import os
import base64
from io import BytesIO
from PIL import Image

# Get the backend URL from the frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.strip().split('=')[1].strip('"\'')
    except Exception as e:
        print(f"Error reading .env file: {e}")
        return None

# Main API URL
BASE_URL = get_backend_url()
if not BASE_URL:
    print("Error: Could not find REACT_APP_BACKEND_URL in frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"Using API URL: {API_URL}")

# Admin credentials
ADMIN_PASSWORD = "Sk4t3_b0Ar5"  # From server.py line 33
admin_token = None

# Test results tracking
test_results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "errors": []
}

def run_test(test_name, test_func):
    """Run a test and track results"""
    test_results["total"] += 1
    print(f"\n{'='*80}\nRunning test: {test_name}\n{'='*80}")
    
    try:
        result = test_func()
        if result:
            test_results["passed"] += 1
            print(f"✅ PASSED: {test_name}")
            return True
        else:
            test_results["failed"] += 1
            test_results["errors"].append(f"❌ FAILED: {test_name}")
            print(f"❌ FAILED: {test_name}")
            return False
    except Exception as e:
        test_results["failed"] += 1
        error_msg = f"❌ ERROR in {test_name}: {str(e)}"
        test_results["errors"].append(error_msg)
        print(error_msg)
        return False

def test_health_check():
    """Test the health check endpoint"""
    response = requests.get(f"{API_URL}/health")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return data.get("status") == "healthy" and "message" in data

def test_contact_form_submission():
    """Test submitting a contact form"""
    contact_data = {
        "name": "Test User",
        "email": "test@example.com",
        "subject": "API Test",
        "message": "This is a test message from the API test suite."
    }
    
    response = requests.post(f"{API_URL}/contact", json=contact_data)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return "message" in data and "id" in data

def test_get_contacts():
    """Test retrieving contact submissions"""
    response = requests.get(f"{API_URL}/contacts")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:200]}...")  # Show truncated response for brevity
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return "contacts" in data and isinstance(data["contacts"], list)

def test_portfolio_content():
    """Test creating and retrieving portfolio content"""
    section = "test_section"
    content_data = {
        "section_id": section,
        "title": "Test Section Title",
        "content": "This is test content for the portfolio section.",
        "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
    }
    
    # Create/update content
    response = requests.post(f"{API_URL}/portfolio/{section}", json=content_data)
    print(f"Create response status: {response.status_code}")
    print(f"Create response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    # Retrieve content
    response = requests.get(f"{API_URL}/portfolio/{section}")
    print(f"Get response status: {response.status_code}")
    print(f"Get response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return (data.get("section") == section and 
            "title" in data and 
            "content" in data)

def test_stage_info():
    """Test creating and retrieving stage information"""
    stage_data = {
        "stage_type": "test_stage",
        "company": "Test Company",
        "position": "Test Position",
        "period": "Jan 2023 - Jun 2023",
        "sector": "Technology",
        "description": "Test description",
        "missions": [
            {"title": "Mission 1", "description": "Description for mission 1"},
            {"title": "Mission 2", "description": "Description for mission 2"}
        ],
        "skills": ["Skill 1", "Skill 2"],
        "achievements": ["Achievement 1"],
        "images": ["https://example.com/stage_image.jpg"]
    }
    
    # Create/update stage
    response = requests.post(f"{API_URL}/stages", json=stage_data)
    print(f"Create response status: {response.status_code}")
    print(f"Create response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    # Retrieve specific stage
    response = requests.get(f"{API_URL}/stages/{stage_data['stage_type']}")
    print(f"Get specific stage response status: {response.status_code}")
    print(f"Get specific stage response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    stage_match = (data.get("stage_type") == stage_data["stage_type"] and
                  data.get("company") == stage_data["company"] and
                  data.get("position") == stage_data["position"])
    
    # Retrieve all stages
    response = requests.get(f"{API_URL}/stages")
    print(f"Get all stages response status: {response.status_code}")
    print(f"Get all stages response body: {response.text[:200]}...")  # Show truncated response
    
    if response.status_code != 200:
        return False
    
    all_data = response.json()
    return stage_match and "stages" in all_data and isinstance(all_data["stages"], list)

def test_analytics():
    """Test the analytics endpoint"""
    response = requests.get(f"{API_URL}/analytics")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return ("total_contacts" in data and 
            "total_sections" in data and 
            "total_stages" in data and
            "last_updated" in data)

def test_error_handling():
    """Test error handling for invalid requests"""
    # Test invalid contact form
    invalid_contact = {
        "name": "Test User",
        # Missing required email field
        "subject": "API Test",
        "message": "This is a test message."
    }
    
    response = requests.post(f"{API_URL}/contact", json=invalid_contact)
    print(f"Invalid contact response status: {response.status_code}")
    print(f"Invalid contact response body: {response.text}")
    
    # Should return a 422 Unprocessable Entity for validation error
    validation_error = response.status_code == 422
    
    # Test non-existent endpoint
    response = requests.get(f"{API_URL}/nonexistent")
    print(f"Non-existent endpoint response status: {response.status_code}")
    print(f"Non-existent endpoint response body: {response.text}")
    
    # Should return a 404 Not Found
    not_found_error = response.status_code == 404
    
    return validation_error and not_found_error

def test_delete_contact():
    """Test deleting a contact submission"""
    # First create a contact to delete
    contact_data = {
        "name": "Delete Test User",
        "email": "delete_test@example.com",
        "subject": "Delete Test",
        "message": "This contact should be deleted."
    }
    
    response = requests.post(f"{API_URL}/contact", json=contact_data)
    if response.status_code != 200:
        print("Failed to create contact for deletion test")
        return False
    
    contact_id = response.json().get("id")
    if not contact_id:
        print("No contact ID returned for deletion test")
        return False
    
    # Now delete the contact
    response = requests.delete(f"{API_URL}/contact/{contact_id}")
    print(f"Delete response status: {response.status_code}")
    print(f"Delete response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    # Verify it's deleted by trying to get all contacts and checking
    response = requests.get(f"{API_URL}/contacts")
    if response.status_code != 200:
        return False
    
    contacts = response.json().get("contacts", [])
    for contact in contacts:
        if contact.get("_id") == contact_id:
            print(f"Contact with ID {contact_id} still exists after deletion")
            return False
    
    return True

# Admin API Tests
def test_admin_login():
    """Test admin login with correct password"""
    global admin_token
    
    login_data = {
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{API_URL}/admin/login", json=login_data)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    if "token" not in data or "expires_at" not in data:
        return False
    
    admin_token = data["token"]
    print(f"Admin token: {admin_token[:10]}...")
    return True

def test_admin_verify_session():
    """Test verifying admin session"""
    if not admin_token:
        print("No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{API_URL}/admin/verify", headers=headers)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return data.get("valid") == True

def test_admin_get_all_content():
    """Test getting all content for admin dashboard"""
    if not admin_token:
        print("No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{API_URL}/admin/content", headers=headers)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:200]}...")  # Truncated for brevity
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return ("personal_info" in data and 
            "sections" in data and 
            "stages" in data)

def test_admin_update_personal_info():
    """Test updating personal information"""
    if not admin_token:
        print("No admin token available")
        return False
    
    personal_data = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "+33 1 23 45 67 89",
        "linkedin": "https://linkedin.com/in/testuser",
        "description": "This is a test description for the personal info section.",
        "skills": ["Python", "FastAPI", "React", "MongoDB"]
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.post(f"{API_URL}/admin/personal-info", json=personal_data, headers=headers)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    # Verify the update by getting all content
    response = requests.get(f"{API_URL}/admin/content", headers=headers)
    if response.status_code != 200:
        return False
    
    data = response.json()
    if "personal_info" not in data:
        return False
    
    personal_info = data["personal_info"]
    return (personal_info.get("name") == personal_data["name"] and
            personal_info.get("email") == personal_data["email"] and
            personal_info.get("phone") == personal_data["phone"])

def test_admin_update_content_section():
    """Test updating a content section"""
    if not admin_token:
        print("No admin token available")
        return False
    
    section = "about"
    content_data = {
        "section_id": section,
        "title": "About Me",
        "content": "This is a test content for the About section.",
        "images": [],
        "metadata": {"last_updated": datetime.now().isoformat()}
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.post(f"{API_URL}/admin/content/{section}", json=content_data, headers=headers)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    # Verify the update by getting all content
    response = requests.get(f"{API_URL}/admin/content", headers=headers)
    if response.status_code != 200:
        return False
    
    data = response.json()
    if "sections" not in data or section not in data["sections"]:
        return False
    
    return True

def test_admin_update_stage_info():
    """Test updating stage information"""
    if not admin_token:
        print("No admin token available")
        return False
    
    stage_data = {
        "stage_type": "stage1",
        "company": "Test Company",
        "position": "Test Position",
        "period": "Jan 2023 - Jun 2023",
        "sector": "Technology",
        "description": "This is a test description for the stage.",
        "missions": [
            {"title": "Mission 1", "description": "Description for mission 1"},
            {"title": "Mission 2", "description": "Description for mission 2"}
        ],
        "skills": ["Python", "FastAPI", "MongoDB"],
        "achievements": ["Achievement 1", "Achievement 2"],
        "images": []
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.post(f"{API_URL}/admin/stages", json=stage_data, headers=headers)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    # Verify the update by getting all content
    response = requests.get(f"{API_URL}/admin/content", headers=headers)
    if response.status_code != 200:
        return False
    
    data = response.json()
    if "stages" not in data or stage_data["stage_type"] not in data["stages"]:
        return False
    
    return True

def test_admin_upload_image():
    """Test uploading an image"""
    if not admin_token:
        print("No admin token available")
        return False
    
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_io = BytesIO()
    img.save(img_io, 'JPEG')
    img_io.seek(0)
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    files = {'file': ('test_image.jpg', img_io, 'image/jpeg')}
    
    response = requests.post(f"{API_URL}/admin/upload-image", headers=headers, files=files)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:200]}...")  # Truncated for brevity
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return "image_url" in data and data["image_url"].startswith("data:image/jpeg;base64,")

def test_admin_logout():
    """Test admin logout"""
    if not admin_token:
        print("No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.post(f"{API_URL}/admin/logout", headers=headers)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    # Verify logout by trying to access a protected endpoint
    response = requests.get(f"{API_URL}/admin/content", headers=headers)
    return response.status_code == 401  # Should be unauthorized after logout

def run_all_tests():
    """Run all API tests"""
    print(f"\n{'='*80}\nStarting Portfolio Backend API Tests\n{'='*80}")
    print(f"Testing API at: {API_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Run all tests
    run_test("Health Check", test_health_check)
    run_test("Contact Form Submission", test_contact_form_submission)
    run_test("Get Contacts", test_get_contacts)
    run_test("Portfolio Content Management", test_portfolio_content)
    run_test("Stage Information", test_stage_info)
    run_test("Analytics", test_analytics)
    run_test("Error Handling", test_error_handling)
    run_test("Delete Contact", test_delete_contact)
    
    # Print summary
    print(f"\n{'='*80}\nTest Summary\n{'='*80}")
    print(f"Total tests: {test_results['total']}")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    
    if test_results["errors"]:
        print("\nErrors:")
        for error in test_results["errors"]:
            print(f"  - {error}")
    
    success_rate = (test_results["passed"] / test_results["total"]) * 100
    print(f"\nSuccess rate: {success_rate:.2f}%")
    
    return test_results["failed"] == 0

if __name__ == "__main__":
    # Run basic tests first
    run_all_tests()
    
    # Run admin tests separately
    print("\n\n================================================================================")
    print("Running Admin API Tests")
    print("================================================================================\n")
    
    # Admin login
    admin_success = run_test("Admin Login", test_admin_login)
    
    if admin_success and admin_token:
        run_test("Admin Verify Session", test_admin_verify_session)
        run_test("Admin Get All Content", test_admin_get_all_content)
        run_test("Admin Update Personal Info", test_admin_update_personal_info)
        run_test("Admin Update Content Section", test_admin_update_content_section)
        run_test("Admin Update Stage Info", test_admin_update_stage_info)
        run_test("Admin Upload Image", test_admin_upload_image)
        run_test("Admin Logout", test_admin_logout)
    else:
        print("⚠️ Skipping admin tests because login failed")
    
    # Print final summary
    print(f"\n{'='*80}\nFinal Test Summary\n{'='*80}")
    print(f"Total tests: {test_results['total']}")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    
    if test_results["errors"]:
        print("\nErrors:")
        for error in test_results["errors"]:
            print(f"  - {error}")
    
    success_rate = (test_results["passed"] / test_results["total"]) * 100
    print(f"\nSuccess rate: {success_rate:.2f}%")