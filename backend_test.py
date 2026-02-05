import requests
import sys
import os
from datetime import datetime
from io import BytesIO
from PIL import Image

class ImageToPDFTester:
    def __init__(self, base_url="https://image-pdf-maker.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, files=None, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.headers.get('content-type') == 'application/pdf':
                    print(f"   PDF size: {len(response.content)} bytes")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        error_detail = response.json()
                        print(f"   Error: {error_detail}")
                    except:
                        print(f"   Response: {response.text[:200]}")

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def create_test_image(self, width=800, height=600, format='JPEG', filename='test.jpg'):
        """Create a test image in memory"""
        image = Image.new('RGB', (width, height), color='red')
        img_buffer = BytesIO()
        image.save(img_buffer, format=format)
        img_buffer.seek(0)
        return img_buffer, filename

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_convert_single_image(self):
        """Test converting a single image to PDF"""
        img_buffer, filename = self.create_test_image()
        files = {'files': (filename, img_buffer, 'image/jpeg')}
        
        success, response = self.run_test(
            "Convert single image",
            "POST",
            "convert-to-pdf",
            200,
            files=files
        )
        
        if success and response:
            # Verify it's a valid PDF
            content_type = response.headers.get('content-type')
            if content_type == 'application/pdf':
                print("   ✅ Valid PDF response")
                return True
            else:
                print(f"   ❌ Invalid content type: {content_type}")
                return False
        return success

    def test_convert_multiple_images(self):
        """Test converting multiple images to PDF"""
        files = []
        for i in range(3):
            img_buffer, filename = self.create_test_image(filename=f'test_{i}.jpg')
            files.append(('files', (filename, img_buffer, 'image/jpeg')))
        
        success, response = self.run_test(
            "Convert multiple images",
            "POST",
            "convert-to-pdf",
            200,
            files=files
        )
        return success

    def test_convert_different_formats(self):
        """Test converting different image formats"""
        formats = [
            ('JPEG', 'test.jpg', 'image/jpeg'),
            ('PNG', 'test.png', 'image/png'),
            ('WEBP', 'test.webp', 'image/webp')
        ]
        
        all_passed = True
        for format_name, filename, mime_type in formats:
            img_buffer, _ = self.create_test_image(format=format_name, filename=filename)
            files = {'files': (filename, img_buffer, mime_type)}
            
            success, response = self.run_test(
                f"Convert {format_name} format",
                "POST",
                "convert-to-pdf",
                200,
                files=files
            )
            if not success:
                all_passed = False
        
        return all_passed

    def test_no_files_error(self):
        """Test error when no files are uploaded"""
        success, response = self.run_test(
            "No files error",
            "POST",
            "convert-to-pdf",
            400,
            files={}
        )
        return success

    def test_invalid_file_type(self):
        """Test error with invalid file type"""
        # Create a text file instead of image
        text_content = BytesIO(b"This is not an image")
        files = {'files': ('test.txt', text_content, 'text/plain')}
        
        success, response = self.run_test(
            "Invalid file type",
            "POST",
            "convert-to-pdf",
            400,
            files=files
        )
        return success

    def test_too_many_files(self):
        """Test error when uploading too many files (>20)"""
        files = []
        for i in range(21):  # More than MAX_FILES (20)
            img_buffer, filename = self.create_test_image(filename=f'test_{i}.jpg')
            files.append(('files', (filename, img_buffer, 'image/jpeg')))
        
        success, response = self.run_test(
            "Too many files error",
            "POST",
            "convert-to-pdf",
            400,
            files=files
        )
        return success

def main():
    print("🚀 Starting Image to PDF Converter API Tests")
    print("=" * 50)
    
    tester = ImageToPDFTester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_convert_single_image,
        tester.test_convert_multiple_images,
        tester.test_convert_different_formats,
        tester.test_no_files_error,
        tester.test_invalid_file_type,
        tester.test_too_many_files
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())