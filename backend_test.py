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

# Get the backend URL from the frontend .env file or use the production URL
def get_backend_url():
    # Use the production URL from the review request
    return "https://ea6e54f3-f0c2-42cd-8caf-0865322008e2.preview.emergentagent.com"

# Main API URL
BASE_URL = get_backend_url()
if not BASE_URL:
    print("Error: Could not find backend URL")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"Using API URL: {API_URL}")

# Admin credentials
ADMIN_PASSWORD = "Sk4t3_b0Ar5"  # From server.py line 52
admin_session = requests.Session()  # Use a session to maintain cookies

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
    return data.get("status") == "healthy" and "database" in data

def test_get_stage1_data():
    """Test retrieving stage1 data"""
    response = requests.get(f"{API_URL}/stages/stage1")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:500]}...")  # Show truncated response
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    # Verify that the data contains the expected fields
    return (data.get("stage_type") == "stage1" and 
            "company" in data and 
            "missions" in data and 
            isinstance(data["missions"], list))

def test_get_stage2_data():
    """Test retrieving stage2 data"""
    response = requests.get(f"{API_URL}/stages/stage2")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:500]}...")  # Show truncated response
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    # Verify that the data contains the expected fields
    return (data.get("stage_type") == "stage2" and 
            "company" in data)

def test_admin_login():
    """Test admin login with correct password"""
    login_data = {
        "password": ADMIN_PASSWORD
    }
    
    response = admin_session.post(f"{API_URL}/admin/login", json=login_data)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    print(f"Cookies: {admin_session.cookies.get_dict()}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    # Check if the admin_session cookie was set
    has_session_cookie = 'admin_session' in admin_session.cookies.get_dict()
    
    return data.get("success") == True and "message" in data and has_session_cookie

def test_admin_verify_session():
    """Test verifying admin session"""
    response = admin_session.get(f"{API_URL}/admin/verify")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return data.get("authenticated") == True

def test_admin_get_all_content():
    """Test getting all content for admin dashboard"""
    response = admin_session.get(f"{API_URL}/admin/content")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:500]}...")  # Truncated for brevity
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return ("personal_info" in data and 
            "stages" in data and 
            "content" in data)

def test_admin_update_personal_info():
    """Test updating personal information"""
    # First get the current personal info
    response = admin_session.get(f"{API_URL}/personal-info")
    if response.status_code != 200:
        print("Failed to get current personal info")
        return False
    
    current_info = response.json()
    
    # Update with the same data to avoid changing the actual content
    personal_data = current_info
    
    response = admin_session.post(f"{API_URL}/admin/personal-info", json=personal_data)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return data.get("success") == True and "message" in data

def test_admin_update_stage_info():
    """Test updating stage information"""
    # First get the current stage1 data
    response = admin_session.get(f"{API_URL}/stages/stage1")
    if response.status_code != 200:
        print("Failed to get current stage1 data")
        return False
    
    stage_data = response.json()
    
    # Create the payload in the format expected by the API
    payload = {"stage1": stage_data}
    
    response = admin_session.post(f"{API_URL}/admin/stages", json=payload)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return data.get("success") == True and "message" in data

def test_admin_logout():
    """Test admin logout"""
    response = admin_session.post(f"{API_URL}/admin/logout")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    
    # Verify logout by checking if the admin_session cookie was deleted
    has_session_cookie = 'admin_session' in admin_session.cookies.get_dict()
    
    # Also verify by trying to access a protected endpoint
    verify_response = admin_session.get(f"{API_URL}/admin/verify")
    verify_data = verify_response.json()
    
    return (data.get("success") == True and 
            "message" in data and 
            not has_session_cookie and 
            verify_data.get("authenticated") == False)

def run_critical_tests():
    """Run the critical tests identified in the review request"""
    print(f"\n{'='*80}\nStarting Critical Backend API Tests\n{'='*80}")
    print(f"Testing API at: {API_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Test basic health check
    run_test("Health Check", test_health_check)
    
    # Test stage data retrieval (critical routes)
    run_test("Get Stage1 Data", test_get_stage1_data)
    run_test("Get Stage2 Data", test_get_stage2_data)
    
    # Test admin authentication flow
    admin_success = run_test("Admin Login", test_admin_login)
    
    if admin_success:
        run_test("Admin Verify Session", test_admin_verify_session)
        run_test("Admin Get All Content", test_admin_get_all_content)
        run_test("Admin Update Personal Info", test_admin_update_personal_info)
        run_test("Admin Update Stage Info", test_admin_update_stage_info)
        run_test("Admin Logout", test_admin_logout)
    else:
        print("⚠️ Skipping admin tests because login failed")
    
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
    run_critical_tests()