from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
from io import BytesIO
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Image to PDF conversion endpoint
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
MAX_FILES = 20

@api_router.post("/convert-to-pdf")
async def convert_to_pdf(files: List[UploadFile] = File(...)):
    """Convert uploaded images to a single PDF document."""
    
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_FILES} files allowed")
    
    # Validate file types
    for file in files:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Invalid file")
        ext = file.filename.rsplit('.', 1)[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
    
    # Create PDF in memory
    pdf_buffer = BytesIO()
    pdf = canvas.Canvas(pdf_buffer, pagesize=A4)
    page_width, page_height = A4
    
    for file in files:
        # Read image
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))
        
        # Convert RGBA to RGB if necessary (for PNG with transparency)
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Calculate dimensions to fit image within A4 page with margins
        margin = 36  # 0.5 inch margin
        max_width = page_width - (2 * margin)
        max_height = page_height - (2 * margin)
        
        img_width, img_height = image.size
        
        # Scale image to fit page while maintaining aspect ratio
        width_ratio = max_width / img_width
        height_ratio = max_height / img_height
        scale = min(width_ratio, height_ratio)
        
        new_width = img_width * scale
        new_height = img_height * scale
        
        # Center image on page
        x = (page_width - new_width) / 2
        y = (page_height - new_height) / 2
        
        # Save image to temporary buffer for reportlab
        img_buffer = BytesIO()
        image.save(img_buffer, format='JPEG', quality=95)
        img_buffer.seek(0)
        
        # Draw image on PDF
        from reportlab.lib.utils import ImageReader
        pdf.drawImage(ImageReader(img_buffer), x, y, width=new_width, height=new_height)
        pdf.showPage()
    
    pdf.save()
    pdf_buffer.seek(0)
    
    # Generate filename with timestamp
    filename = f"converted_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

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
