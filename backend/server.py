from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64

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

# Create the main app
app = FastAPI(title="JobLink API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

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
    resume_type: Optional[str] = None  # 'upload' or 'link'
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
    portfolio_links: List[PortfolioLink] = []
    created_at: str
    updated_at: str

class PublicProfileResponse(BaseModel):
    name: str
    title: Optional[str] = None
    bio: Optional[str] = None
    whatsapp: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_links: List[PortfolioLink] = []

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
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "username": None,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    # Create empty profile
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
        "portfolio_links": [],
        "created_at": now,
        "updated_at": now
    }
    
    await db.profiles.insert_one(profile_doc)
    
    # Generate token
    token = create_token(user_id, user_data.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            username=None,
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
        created_at=current_user["created_at"]
    )

# ============== PROFILE ROUTES ==============

@api_router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(**profile)

@api_router.put("/profile", response_model=ProfileResponse)
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    # Check username uniqueness if being updated
    if profile_data.username:
        # Validate username format (alphanumeric, lowercase, hyphens allowed)
        import re
        if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$', profile_data.username):
            raise HTTPException(status_code=400, detail="Username must be lowercase alphanumeric with optional hyphens")
        
        existing = await db.profiles.find_one(
            {"username": profile_data.username, "user_id": {"$ne": current_user["id"]}},
            {"_id": 0}
        )
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Build update dict
    update_dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        if value is not None:
            if field == "portfolio_links":
                update_dict[field] = [link.model_dump() if hasattr(link, 'model_dump') else link for link in value]
            else:
                update_dict[field] = value
    
    # Update profile
    await db.profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": update_dict}
    )
    
    # Update username in users collection too
    if profile_data.username:
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"username": profile_data.username}}
        )
    
    # Also update name in users if changed
    if profile_data.name:
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"name": profile_data.name}}
        )
    
    # Return updated profile
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
        portfolio_links=profile.get("portfolio_links", [])
    )

@api_router.post("/profile/resume")
async def upload_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read file and convert to base64 for storage
    content = await file.read()
    
    # Check file size (max 5MB)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    # Store as base64 data URL
    base64_content = base64.b64encode(content).decode('utf-8')
    resume_data_url = f"data:application/pdf;base64,{base64_content}"
    
    # Update profile
    await db.profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": {
            "resume_url": resume_data_url,
            "resume_type": "upload",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Resume uploaded successfully", "resume_url": resume_data_url}

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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
