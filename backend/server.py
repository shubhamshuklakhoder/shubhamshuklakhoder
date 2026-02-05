from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64
import secrets
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'joblink-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Resend Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://career-link-7.preview.emergentagent.com')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Create the main app
app = FastAPI(title="JobLink API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    username: Optional[str] = None
    is_verified: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PortfolioLink(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    url: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    username: Optional[str] = None
    whatsapp: Optional[str] = None
    resume_url: Optional[str] = None
    resume_type: Optional[str] = None
    portfolio_links: Optional[List[PortfolioLink]] = None

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    name: str
    title: Optional[str] = None
    bio: Optional[str] = None
    username: Optional[str] = None
    whatsapp: Optional[str] = None
    resume_url: Optional[str] = None
    resume_type: Optional[str] = None
    avatar_url: Optional[str] = None
    portfolio_links: List[PortfolioLink] = []
    created_at: str
    updated_at: str

class PublicProfileResponse(BaseModel):
    name: str
    title: Optional[str] = None
    bio: Optional[str] = None
    whatsapp: Optional[str] = None
    resume_url: Optional[str] = None
    avatar_url: Optional[str] = None
    portfolio_links: List[PortfolioLink] = []

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

# ============== EMAIL HELPERS ==============

async def send_email(to_email: str, subject: str, html_content: str):
    if not RESEND_API_KEY:
        logger.warning(f"RESEND_API_KEY not set. Would send email to {to_email}: {subject}")
        return None
    
    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to_email}: {subject}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return None

def get_verification_email_html(name: str, verify_url: str):
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563EB; margin-bottom: 24px;">Welcome to JobLink!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi {name},</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thanks for signing up! Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{verify_url}" 
               style="background-color: #2563EB; color: white; padding: 12px 32px; 
                      text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Verify Email
            </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">
            Or copy this link: <a href="{verify_url}" style="color: #2563EB;">{verify_url}</a>
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
            This link expires in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
        <p style="color: #9CA3AF; font-size: 12px;">© JobLink - Your Professional Bio in One Link</p>
    </div>
    """

def get_password_reset_email_html(name: str, reset_url: str):
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563EB; margin-bottom: 24px;">Reset Your Password</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi {name},</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{reset_url}" 
               style="background-color: #2563EB; color: white; padding: 12px 32px; 
                      text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Reset Password
            </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">
            Or copy this link: <a href="{reset_url}" style="color: #2563EB;">{reset_url}</a>
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
            This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
        <p style="color: #9CA3AF; font-size: 12px;">© JobLink - Your Professional Bio in One Link</p>
    </div>
    """

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_token() -> str:
    return secrets.token_urlsafe(32)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    verification_token = generate_token()
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "username": None,
        "is_verified": False,
        "verification_token": verification_token,
        "verification_expires": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    profile_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": user_data.name,
        "title": None,
        "bio": None,
        "username": None,
        "whatsapp": None,
        "resume_url": None,
        "resume_type": None,
        "avatar_url": None,
        "portfolio_links": [],
        "created_at": now,
        "updated_at": now
    }
    
    await db.profiles.insert_one(profile_doc)
    
    # Send verification email
    verify_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    await send_email(
        user_data.email,
        "Verify your JobLink account",
        get_verification_email_html(user_data.name, verify_url)
    )
    
    token = create_token(user_id, user_data.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            username=None,
            is_verified=False,
            created_at=now
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"], user["email"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            username=user.get("username"),
            is_verified=user.get("is_verified", False),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        username=current_user.get("username"),
        is_verified=current_user.get("is_verified", False),
        created_at=current_user["created_at"]
    )

@api_router.post("/auth/verify-email")
async def verify_email(token: str):
    user = await db.users.find_one({"verification_token": token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")
    
    expires = datetime.fromisoformat(user.get("verification_expires", ""))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Verification link has expired")
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"is_verified": True}, "$unset": {"verification_token": "", "verification_expires": ""}}
    )
    
    return {"message": "Email verified successfully"}

@api_router.post("/auth/resend-verification")
async def resend_verification(request: ResendVerificationRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        return {"message": "If this email exists, a verification link has been sent"}
    
    if user.get("is_verified"):
        return {"message": "Email is already verified"}
    
    verification_token = generate_token()
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "verification_token": verification_token,
            "verification_expires": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        }}
    )
    
    verify_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    await send_email(
        request.email,
        "Verify your JobLink account",
        get_verification_email_html(user["name"], verify_url)
    )
    
    return {"message": "If this email exists, a verification link has been sent"}

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        return {"message": "If this email exists, a password reset link has been sent"}
    
    reset_token = generate_token()
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "reset_token": reset_token,
            "reset_expires": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        }}
    )
    
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    await send_email(
        request.email,
        "Reset your JobLink password",
        get_password_reset_email_html(user["name"], reset_url)
    )
    
    return {"message": "If this email exists, a password reset link has been sent"}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    user = await db.users.find_one({"reset_token": request.token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    
    expires = datetime.fromisoformat(user.get("reset_expires", ""))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Reset link has expired")
    
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"password": hash_password(request.password)}, "$unset": {"reset_token": "", "reset_expires": ""}}
    )
    
    return {"message": "Password reset successfully"}

# ============== PROFILE ROUTES ==============

@api_router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(**profile)

@api_router.put("/profile", response_model=ProfileResponse)
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    import re
    
    if profile_data.username:
        if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$', profile_data.username):
            raise HTTPException(status_code=400, detail="Username must be lowercase alphanumeric with optional hyphens")
        
        existing = await db.profiles.find_one(
            {"username": profile_data.username, "user_id": {"$ne": current_user["id"]}},
            {"_id": 0}
        )
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    update_dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        if value is not None:
            if field == "portfolio_links":
                update_dict[field] = [link.model_dump() if hasattr(link, 'model_dump') else link for link in value]
            else:
                update_dict[field] = value
    
    await db.profiles.update_one({"user_id": current_user["id"]}, {"$set": update_dict})
    
    if profile_data.username:
        await db.users.update_one({"id": current_user["id"]}, {"$set": {"username": profile_data.username}})
    
    if profile_data.name:
        await db.users.update_one({"id": current_user["id"]}, {"$set": {"name": profile_data.name}})
    
    profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    return ProfileResponse(**profile)

@api_router.get("/p/{username}", response_model=PublicProfileResponse)
async def get_public_profile(username: str):
    profile = await db.profiles.find_one({"username": username}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return PublicProfileResponse(
        name=profile["name"],
        title=profile.get("title"),
        bio=profile.get("bio"),
        whatsapp=profile.get("whatsapp"),
        resume_url=profile.get("resume_url"),
        avatar_url=profile.get("avatar_url"),
        portfolio_links=profile.get("portfolio_links", [])
    )

@api_router.post("/profile/resume")
async def upload_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    content = await file.read()
    
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    base64_content = base64.b64encode(content).decode('utf-8')
    resume_data_url = f"data:application/pdf;base64,{base64_content}"
    
    await db.profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"resume_url": resume_data_url, "resume_type": "upload", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Resume uploaded successfully", "resume_url": resume_data_url}

@api_router.post("/profile/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP and GIF images are allowed")
    
    content = await file.read()
    
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size must be less than 2MB")
    
    base64_content = base64.b64encode(content).decode('utf-8')
    avatar_data_url = f"data:{file.content_type};base64,{base64_content}"
    
    await db.profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"avatar_url": avatar_data_url, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Avatar uploaded successfully", "avatar_url": avatar_data_url}

@api_router.get("/check-username/{username}")
async def check_username(username: str):
    import re
    if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$', username):
        return {"available": False, "message": "Invalid format"}
    
    existing = await db.profiles.find_one({"username": username}, {"_id": 0})
    return {"available": existing is None}

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {"message": "JobLink API is running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
