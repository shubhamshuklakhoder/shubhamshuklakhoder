import requests
import sys
import json
import uuid
from datetime import datetime

class JobLinkAPITester:
    def __init__(self, base_url="https://career-link-7.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "username": f"testuser{datetime.now().strftime('%H%M%S')}"
        }
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if files:
            headers.pop('Content-Type')  # Let requests set this for multipart

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_json = response.json()
                    result["response_data"] = response_json
                    return True, response_json
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                    result["error"] = error_data
                except:
                    print(f"   Error: {response.text}")
                    result["error"] = response.text

            self.test_results.append(result)
            return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        self.run_test("API Root", "GET", "/", 200)
        self.run_test("Health Check", "GET", "/health", 200)

    def test_user_registration(self):
        """Test user registration"""
        print("\n" + "="*50)
        print("TESTING USER REGISTRATION")
        print("="*50)
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/auth/register",
            200,
            data={
                "email": self.test_user_data["email"],
                "password": self.test_user_data["password"],
                "name": self.test_user_data["name"]
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token received: {self.token[:20]}...")
            print(f"   User ID: {self.user_id}")
            return True
        return False

    def test_user_login(self):
        """Test user login with new credentials"""
        print("\n" + "="*50)
        print("TESTING USER LOGIN")
        print("="*50)
        
        # Test with registered credentials
        success, response = self.run_test(
            "User Login",
            "POST",
            "/auth/login",
            200,
            data={
                "email": self.test_user_data["email"],
                "password": self.test_user_data["password"]
            }
        )
        
        if success and 'access_token' in response:
            print(f"   Login successful")
            return True
        return False

    def test_get_current_user(self):
        """Test get current user"""
        print("\n" + "="*50)
        print("TESTING GET CURRENT USER")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for auth test")
            return False
            
        success, response = self.run_test("Get Current User", "GET", "/auth/me", 200)
        return success

    def test_profile_operations(self):
        """Test profile CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PROFILE OPERATIONS")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for profile tests")
            return False

        # Get initial profile
        success, profile = self.run_test("Get Profile", "GET", "/profile", 200)
        if not success:
            return False

        # Update profile with all fields
        update_data = {
            "name": self.test_user_data["name"],
            "title": "Software Developer",
            "bio": "I am a passionate developer",
            "username": self.test_user_data["username"],
            "whatsapp": "+919876543210",
            "resume_url": "https://drive.google.com/file/d/123/view",
            "resume_type": "link",
            "portfolio_links": [
                {
                    "id": str(uuid.uuid4()),
                    "title": "GitHub",
                    "url": "https://github.com/testuser"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Portfolio",
                    "url": "https://portfolio.example.com"
                }
            ]
        }
        
        success, updated_profile = self.run_test(
            "Update Profile",
            "PUT",
            "/profile",
            200,
            data=update_data
        )
        
        if success:
            print(f"   Profile updated with username: {updated_profile.get('username')}")
        
        return success

    def test_public_profile(self):
        """Test public profile access"""
        print("\n" + "="*50)
        print("TESTING PUBLIC PROFILE")
        print("="*50)
        
        # Test accessing public profile
        success, public_profile = self.run_test(
            "Get Public Profile",
            "GET",
            f"/p/{self.test_user_data['username']}",
            200
        )
        
        if success:
            print(f"   Public profile accessible for username: {self.test_user_data['username']}")
            print(f"   Profile name: {public_profile.get('name')}")
            
        return success

    def test_username_check(self):
        """Test username availability check"""
        print("\n" + "="*50)
        print("TESTING USERNAME AVAILABILITY")
        print("="*50)
        
        # Test existing username
        success1, response1 = self.run_test(
            "Check Existing Username",
            "GET",
            f"/check-username/{self.test_user_data['username']}",
            200
        )
        
        # Test new username
        new_username = f"newuser{datetime.now().strftime('%H%M%S')}"
        success2, response2 = self.run_test(
            "Check Available Username",
            "GET",
            f"/check-username/{new_username}",
            200
        )
        
        if success1 and success2:
            print(f"   Existing username available: {response1.get('available')}")
            print(f"   New username available: {response2.get('available')}")
            
        return success1 and success2

    def test_resume_upload(self):
        """Test resume file upload (mock PDF)"""
        print("\n" + "="*50)
        print("TESTING RESUME UPLOAD")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for upload test")
            return False
            
        # Create a mock PDF content
        pdf_content = b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n178\n%%EOF'
        
        files = {
            'file': ('test_resume.pdf', pdf_content, 'application/pdf')
        }
        
        success, response = self.run_test(
            "Upload Resume",
            "POST",
            "/profile/resume",
            200,
            files=files
        )
        
        return success

    def test_avatar_upload(self):
        """Test avatar image upload (mock JPEG)"""
        print("\n" + "="*50)
        print("TESTING AVATAR UPLOAD")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for upload test")
            return False
            
        # Create a minimal mock JPEG (1x1 pixel)
        jpeg_content = bytes.fromhex('ffd8ffe000104a46494600010100000100010000ffc200110800010001010101110202020202ffc4001a0000000701010101000000000000000006070100020304050810ffda0008010100003f00ffd9')
        
        files = {
            'file': ('test_avatar.jpg', jpeg_content, 'image/jpeg')
        }
        
        success, response = self.run_test(
            "Upload Avatar",
            "POST",
            "/profile/avatar",
            200,
            files=files
        )
        
        return success

    def test_forgot_password(self):
        """Test forgot password flow"""
        print("\n" + "="*50)
        print("TESTING FORGOT PASSWORD")
        print("="*50)
        
        success, response = self.run_test(
            "Forgot Password Request",
            "POST",
            "/auth/forgot-password",
            200,
            data={"email": self.test_user_data["email"]}
        )
        
        if success:
            print("   Forgot password request processed (email would be sent)")
        
        return success

    def test_resend_verification(self):
        """Test resend verification email"""
        print("\n" + "="*50)
        print("TESTING RESEND VERIFICATION")
        print("="*50)
        
        success, response = self.run_test(
            "Resend Verification Email",
            "POST",
            "/auth/resend-verification",
            200,
            data={"email": self.test_user_data["email"]}
        )
        
        if success:
            print("   Verification email resend request processed")
        
        return success

    def test_email_verification_invalid_token(self):
        """Test email verification with invalid token"""
        print("\n" + "="*50)
        print("TESTING EMAIL VERIFICATION (INVALID TOKEN)")
        print("="*50)
        
        # Test with invalid token - should return 400
        success, response = self.run_test(
            "Email Verification Invalid Token",
            "POST",
            "/auth/verify-email?token=invalid_token_123",
            400
        )
        
        return success

    def test_reset_password_invalid_token(self):
        """Test password reset with invalid token"""
        print("\n" + "="*50)
        print("TESTING RESET PASSWORD (INVALID TOKEN)")
        print("="*50)
        
        # Test with invalid token - should return 400
        success, response = self.run_test(
            "Reset Password Invalid Token",
            "POST",
            "/auth/reset-password",
            400,
            data={"token": "invalid_token_123", "password": "NewPassword123!"}
        )
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting JobLink API Tests")
        print(f"🌐 Base URL: {self.base_url}")
        
        # Test health endpoints
        self.test_health_endpoints()
        
        # Test user registration and get token
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return self.generate_report()
        
        # Test login
        self.test_user_login()
        
        # Test auth endpoint
        self.test_get_current_user()
        
        # Test profile operations
        self.test_profile_operations()
        
        # Test username checking
        self.test_username_check()
        
        # Test public profile
        self.test_public_profile()
        
        # Test resume upload
        self.test_resume_upload()
        
        # Test avatar upload
        self.test_avatar_upload()
        
        # Test forgot password
        self.test_forgot_password()
        
        # Test resend verification
        self.test_resend_verification()
        
        # Test email verification with invalid token
        self.test_email_verification_invalid_token()
        
        # Test password reset with invalid token
        self.test_reset_password_invalid_token()
        
        return self.generate_report()

    def generate_report(self):
        """Generate final test report"""
        print("\n" + "="*60)
        print("📊 FINAL TEST REPORT")
        print("="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed != self.tests_run:
            print("\n❌ Failed tests:")
            for result in self.test_results:
                if not result.get("success", False):
                    print(f"  - {result['test_name']}: {result.get('error', 'Status code mismatch')}")
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    tester = JobLinkAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)