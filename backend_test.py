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
import uuid

# Get the backend URL from the frontend .env file or use the production URL
def get_backend_url():
    try:
        # Read from frontend/.env file
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.strip().split('=', 1)[1].strip('"\'')
    except Exception as e:
        print(f"Warning: Could not read from frontend/.env: {e}")
    
    # Fallback to the production URL from the review request
    return "https://2bcb231f-8789-4999-afe6-1c7625920005.preview.emergentagent.com"

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

# Test data for creating new content
test_contact = {
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from the backend test script."
}

test_stage_data = {
    "stage1": {
        "stage_type": "stage1",
        "company": "CyberXL",
        "position": "Développeur Web Junior",
        "period": "Mai 2023 - Août 2023",
        "sector": "Cybersécurité",
        "description": "CyberXL est une entreprise spécialisée dans la cybersécurité et le développement de solutions web sécurisées.",
        "company_logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "workplace_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "tools": [
            {"name": "React", "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="},
            {"name": "Python", "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="},
            {"name": "MongoDB", "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="},
            {"name": "FastAPI", "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="},
            {"name": "Docker", "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="},
            {"name": "Git", "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="}
        ],
        "building_plans": [
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        ],
        "missions": [
            {
                "title": "Développement d'une interface d'administration",
                "description": "Création d'une interface d'administration pour gérer les contenus du site web de l'entreprise.",
                "skills": ["React", "JavaScript", "CSS"],
                "images": [
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                ]
            },
            {
                "title": "Mise en place d'une API REST",
                "description": "Développement d'une API REST pour la gestion des données du site web.",
                "points": ["Conception de l'architecture", "Implémentation des endpoints", "Documentation de l'API"],
                "images": [
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                ]
            },
            {
                "title": "Intégration de la base de données",
                "description": "Mise en place d'une base de données MongoDB et intégration avec l'API.",
                "skills": ["MongoDB", "Mongoose", "NoSQL"],
                "images": [
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                ]
            }
        ],
        "skills": ["JavaScript", "React", "Python", "FastAPI", "MongoDB", "Git"],
        "learnings": "Ce stage m'a permis de développer mes compétences en développement web et de découvrir le monde professionnel de la cybersécurité."
    }
}

test_personal_info = {
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33 6 12 34 56 78",
    "linkedin": "https://linkedin.com/in/jeandupont",
    "description": "Développeur web passionné avec une expertise en React et Python.",
    "skills": ["JavaScript", "React", "Python", "FastAPI", "MongoDB", "Git"],
    "profile_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
}

test_content_data = {
    "title": "Bilan et perspectives",
    "content": "Mon parcours professionnel m'a permis d'acquérir de nombreuses compétences et expériences qui m'orientent vers un avenir prometteur dans le développement web.",
    "goals": ["Devenir expert en développement frontend", "Approfondir mes connaissances en cybersécurité", "Contribuer à des projets open source"]
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

def test_get_personal_info():
    """Test retrieving personal info"""
    response = requests.get(f"{API_URL}/personal-info")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:500]}...")  # Show truncated response
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    # Verify that the data contains the expected fields
    return ("name" in data and 
            "email" in data and 
            "skills" in data and 
            isinstance(data["skills"], list))

def test_get_content_conclusion():
    """Test retrieving conclusion content"""
    response = requests.get(f"{API_URL}/content/conclusion")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:500]}...")  # Show truncated response
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    # Verify that the data contains the expected fields
    return ("section" in data and 
            "title" in data and 
            "content" in data and 
            "goals" in data and 
            isinstance(data["goals"], list))

def test_submit_contact_form():
    """Test submitting a contact form"""
    # Generate a unique message to identify this test submission
    test_contact["message"] = f"Test message {uuid.uuid4()}"
    
    response = requests.post(f"{API_URL}/contact", json=test_contact)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return data.get("success") == True and "message" in data

def test_admin_login():
    """Test admin login with correct password"""
    # Clear any existing cookies
    admin_session.cookies.clear()
    
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

def test_admin_login_wrong_password():
    """Test admin login with incorrect password"""
    login_data = {
        "password": "wrong_password"
    }
    
    # Use a separate session to avoid affecting the main admin session
    temp_session = requests.Session()
    response = temp_session.post(f"{API_URL}/admin/login", json=login_data)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Should return 401 Unauthorized
    if response.status_code != 401:
        return False
    
    data = response.json()
    # Check that no admin_session cookie was set
    has_session_cookie = 'admin_session' in temp_session.cookies.get_dict()
    
    return "detail" in data and not has_session_cookie

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
    
    # Update with test data
    response = admin_session.post(f"{API_URL}/admin/personal-info", json=test_personal_info)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    success = data.get("success") == True and "message" in data
    
    # Verify the update by getting the personal info again
    verify_response = requests.get(f"{API_URL}/personal-info")
    if verify_response.status_code != 200:
        print("Failed to verify personal info update")
        return False
    
    verify_data = verify_response.json()
    data_match = (verify_data.get("name") == test_personal_info["name"] and
                 verify_data.get("email") == test_personal_info["email"])
    
    # Restore the original data
    restore_response = admin_session.post(f"{API_URL}/admin/personal-info", json=current_info)
    
    return success and data_match

def test_admin_update_stage_info():
    """Test updating stage information"""
    # First get the current stage1 data
    response = admin_session.get(f"{API_URL}/stages/stage1")
    if response.status_code != 200:
        print("Failed to get current stage1 data")
        return False
    
    current_stage_data = response.json()
    
    # Update with test data
    response = admin_session.post(f"{API_URL}/admin/stages", json=test_stage_data)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    success = data.get("success") == True and "message" in data
    
    # Verify the update by getting the stage1 data again
    verify_response = requests.get(f"{API_URL}/stages/stage1")
    if verify_response.status_code != 200:
        print("Failed to verify stage1 data update")
        return False
    
    verify_data = verify_response.json()
    data_match = (verify_data.get("company") == test_stage_data["stage1"]["company"] and
                 verify_data.get("position") == test_stage_data["stage1"]["position"])
    
    # Restore the original data
    restore_data = {"stage1": current_stage_data}
    restore_response = admin_session.post(f"{API_URL}/admin/stages", json=restore_data)
    
    return success and data_match

def test_admin_update_content():
    """Test updating content section"""
    # First get the current conclusion content
    response = admin_session.get(f"{API_URL}/content/conclusion")
    if response.status_code != 200:
        print("Failed to get current conclusion content")
        return False
    
    current_content = response.json()
    
    # Update with test data
    response = admin_session.post(f"{API_URL}/admin/content/conclusion", json=test_content_data)
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    success = data.get("success") == True and "message" in data
    
    # Verify the update by getting the conclusion content again
    verify_response = requests.get(f"{API_URL}/content/conclusion")
    if verify_response.status_code != 200:
        print("Failed to verify conclusion content update")
        return False
    
    verify_data = verify_response.json()
    data_match = (verify_data.get("title") == test_content_data["title"] and
                 verify_data.get("content") == test_content_data["content"])
    
    # Restore the original data
    restore_response = admin_session.post(f"{API_URL}/admin/content/conclusion", json=current_content)
    
    return success and data_match

def test_admin_analytics():
    """Test getting analytics data"""
    response = admin_session.get(f"{API_URL}/admin/analytics")
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        return False
    
    data = response.json()
    return ("total_contacts" in data and 
            "recent_contacts" in data and 
            "last_updated" in data)

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

def test_session_persistence():
    """Test session persistence across multiple requests"""
    # Login again to get a fresh session
    admin_session.cookies.clear()
    login_data = {
        "password": ADMIN_PASSWORD
    }
    
    login_response = admin_session.post(f"{API_URL}/admin/login", json=login_data)
    if login_response.status_code != 200:
        print("Failed to login for session persistence test")
        return False
    
    print(f"Session cookie after login: {admin_session.cookies.get_dict()}")
    
    # Make multiple requests to verify session persists
    verify_responses = []
    for i in range(3):
        response = admin_session.get(f"{API_URL}/admin/verify")
        print(f"Verify response {i+1}: {response.text}")
        verify_responses.append(response.json().get("authenticated"))
        time.sleep(1)  # Small delay between requests
    
    # All responses should be True
    session_persisted = all(verify_responses)
    
    return session_persisted

def test_data_persistence():
    """Test data persistence in the database"""
    # Login to admin session
    login_data = {
        "password": ADMIN_PASSWORD
    }
    admin_session.post(f"{API_URL}/admin/login", json=login_data)
    
    # Create unique test data
    test_id = str(uuid.uuid4())[:8]
    test_data = {
        "stage1": {
            "stage_type": "stage1",
            "company": f"Test Company {test_id}",
            "position": "Test Position",
            "period": "Test Period",
            "sector": "Test Sector",
            "description": "Test Description",
            "missions": [
                {
                    "title": "Test Mission",
                    "description": "Test Mission Description",
                    "skills": ["Test Skill 1", "Test Skill 2"]
                }
            ]
        }
    }
    
    # Save the test data
    save_response = admin_session.post(f"{API_URL}/admin/stages", json=test_data)
    if save_response.status_code != 200:
        print("Failed to save test data")
        return False
    
    # Get the data back to verify persistence
    get_response = requests.get(f"{API_URL}/stages/stage1")
    if get_response.status_code != 200:
        print("Failed to retrieve test data")
        return False
    
    retrieved_data = get_response.json()
    data_persisted = (retrieved_data.get("company") == test_data["stage1"]["company"] and
                     retrieved_data.get("position") == test_data["stage1"]["position"])
    
    # Restore original data
    original_response = admin_session.get(f"{API_URL}/stages/stage1")
    if original_response.status_code == 200:
        original_data = {"stage1": original_response.json()}
        admin_session.post(f"{API_URL}/admin/stages", json=original_data)
    
    # Logout
    admin_session.post(f"{API_URL}/admin/logout")
    
    return data_persisted

def run_critical_tests():
    """Run the critical tests identified in the review request"""
    print(f"\n{'='*80}\nStarting Critical Backend API Tests\n{'='*80}")
    print(f"Testing API at: {API_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Test basic health check
    run_test("Health Check", test_health_check)
    
    # Test data retrieval endpoints
    run_test("Get Stage1 Data", test_get_stage1_data)
    run_test("Get Stage2 Data", test_get_stage2_data)
    run_test("Get Personal Info", test_get_personal_info)
    run_test("Get Content Conclusion", test_get_content_conclusion)
    
    # Test contact form submission
    run_test("Submit Contact Form", test_submit_contact_form)
    
    # Test admin authentication flow
    admin_login_success = run_test("Admin Login", test_admin_login)
    run_test("Admin Login (Wrong Password)", test_admin_login_wrong_password)
    
    if admin_login_success:
        # Test session management
        run_test("Admin Verify Session", test_admin_verify_session)
        run_test("Session Persistence", test_session_persistence)
        
        # Test content management
        run_test("Admin Get All Content", test_admin_get_all_content)
        run_test("Admin Update Personal Info", test_admin_update_personal_info)
        run_test("Admin Update Stage Info", test_admin_update_stage_info)
        run_test("Admin Update Content", test_admin_update_content)
        run_test("Admin Analytics", test_admin_analytics)
        
        # Test data persistence
        run_test("Data Persistence", test_data_persistence)
        
        # Test logout
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