from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import base64
import uuid
from datetime import datetime, timedelta
import uvicorn
import json

# Initialize FastAPI app
app = FastAPI(title="Portfolio API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.portfolio_db

# Admin credentials
ADMIN_PASSWORD = "Sk4t3_b0Ar5"
active_sessions = {}  # In production, use Redis or database

# Security
security = HTTPBearer()

# Pydantic models for data validation
class ContactForm(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    created_at: Optional[datetime] = None

class AdminLogin(BaseModel):
    password: str

class AdminSession(BaseModel):
    token: str
    created_at: datetime
    expires_at: datetime

class ContentSection(BaseModel):
    section_id: str
    title: str
    content: str
    images: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}

class StageInfo(BaseModel):
    stage_type: str  # 'stage1' or 'stage2'
    company: str
    position: str
    period: str
    sector: str
    description: Optional[str] = ""
    missions: List[Dict[str, Any]]  # Mission with title, description, images, etc.
    skills: List[str]
    achievements: Optional[List[str]] = []
    images: Optional[List[str]] = []

class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: str
    linkedin: str
    description: str
    skills: List[str]
    profile_image: Optional[str] = ""

# Admin Authentication
def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    session = active_sessions[token]
    if datetime.now() > session["expires_at"]:
        del active_sessions[token]
        raise HTTPException(status_code=401, detail="Token expired")
    
    return token

# Utility functions
def generate_session_token():
    return str(uuid.uuid4())

def save_image_base64(image_data: str, filename: str = None) -> str:
    """Save base64 image and return filename"""
    if not filename:
        filename = f"image_{uuid.uuid4().hex[:8]}.jpg"
    
    # In a real application, you would save to a file storage service
    # For now, we'll store in database
    image_doc = {
        "filename": filename,
        "data": image_data,
        "created_at": datetime.now()
    }
    db.images.insert_one(image_doc)
    return filename

# API Routes

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Portfolio API is running"}

# Admin Authentication Routes
@app.post("/api/admin/login")
async def admin_login(login_data: AdminLogin):
    """Admin login endpoint"""
    if login_data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    token = generate_session_token()
    expires_at = datetime.now() + timedelta(hours=24)  # 24 hour session
    
    active_sessions[token] = {
        "created_at": datetime.now(),
        "expires_at": expires_at
    }
    
    return {
        "token": token,
        "expires_at": expires_at.isoformat(),
        "message": "Login successful"
    }

@app.post("/api/admin/logout")
async def admin_logout(token: str = Depends(verify_admin_token)):
    """Admin logout endpoint"""
    if token in active_sessions:
        del active_sessions[token]
    return {"message": "Logout successful"}

@app.get("/api/admin/verify")
async def verify_admin_session(token: str = Depends(verify_admin_token)):
    """Verify admin session"""
    return {"valid": True, "message": "Token is valid"}

# Content Management Routes (Admin Only)
@app.get("/api/admin/content")
async def get_all_content(token: str = Depends(verify_admin_token)):
    """Get all content for admin dashboard"""
    try:
        # Get personal info
        personal_info = db.personal_info.find_one()
        if personal_info:
            personal_info["_id"] = str(personal_info["_id"])
        else:
            personal_info = {}
        
        # Get all portfolio sections
        sections = {}
        for section in db.portfolio_content.find():
            section["_id"] = str(section["_id"])
            sections[section["section"]] = section
        
        # Get all stages
        stages = {}
        for stage in db.stages.find():
            stage["_id"] = str(stage["_id"])
            stages[stage["stage_type"]] = stage
        
        return {
            "personal_info": personal_info,
            "sections": sections,
            "stages": stages
        }
    except Exception as e:
        print(f"Error in get_all_content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve content: {str(e)}")

@app.post("/api/admin/personal-info")
async def update_personal_info(personal_data: PersonalInfo, token: str = Depends(verify_admin_token)):
    """Update personal information"""
    try:
        personal_data_dict = personal_data.dict()
        personal_data_dict["updated_at"] = datetime.now()
        
        result = db.personal_info.update_one(
            {},
            {"$set": personal_data_dict},
            upsert=True
        )
        return {"message": "Personal info updated successfully"}
    except Exception as e:
        print(f"Error in update_personal_info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update personal info: {str(e)}")

@app.post("/api/admin/content/{section}")
async def update_content_section(section: str, content: ContentSection, token: str = Depends(verify_admin_token)):
    """Update content section"""
    try:
        content_dict = content.dict()
        content_dict["updated_at"] = datetime.now()
        
        result = db.portfolio_content.update_one(
            {"section": section},
            {"$set": content_dict},
            upsert=True
        )
        return {"message": f"Section {section} updated successfully"}
    except Exception as e:
        print(f"Error in update_content_section: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update section: {str(e)}")

@app.post("/api/admin/stages")
async def update_stage_info(stage_data: StageInfo, token: str = Depends(verify_admin_token)):
    """Update stage information"""
    try:
        stage_dict = stage_data.dict()
        stage_dict["updated_at"] = datetime.now()
        
        result = db.stages.update_one(
            {"stage_type": stage_data.stage_type},
            {"$set": stage_dict},
            upsert=True
        )
        return {"message": f"Stage {stage_data.stage_type} updated successfully"}
    except Exception as e:
        print(f"Error in update_stage_info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update stage: {str(e)}")

@app.post("/api/admin/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    token: str = Depends(verify_admin_token)
):
    """Upload image and return base64 data"""
    try:
        # Read file content
        file_content = await file.read()
        
        # Convert to base64
        base64_data = base64.b64encode(file_content).decode('utf-8')
        image_data = f"data:{file.content_type};base64,{base64_data}"
        
        # Save to database
        filename = save_image_base64(image_data, file.filename)
        
        return {
            "filename": filename,
            "data": image_data,
            "message": "Image uploaded successfully"
        }
    except Exception as e:
        print(f"Error in upload_image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@app.get("/api/admin/images")
async def get_all_images(token: str = Depends(verify_admin_token)):
    """Get all uploaded images"""
    try:
        images = []
        for img in db.images.find().sort("created_at", -1):
            img["_id"] = str(img["_id"])
            images.append(img)
        return {"images": images}
    except Exception as e:
        print(f"Error in get_all_images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve images: {str(e)}")

@app.delete("/api/admin/images/{filename}")
async def delete_image(filename: str, token: str = Depends(verify_admin_token)):
    """Delete an image"""
    try:
        result = db.images.delete_one({"filename": filename})
        if result.deleted_count:
            return {"message": "Image deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        print(f"Error in delete_image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

# Public API Routes (existing routes)
@app.post("/api/contact")
async def submit_contact_form(contact_data: ContactForm):
    """Submit contact form"""
    try:
        contact_data.created_at = datetime.now()
        result = db.contacts.insert_one(contact_data.dict())
        return {"message": "Message sent successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save contact form: {str(e)}")

@app.get("/api/contacts")
async def get_contacts():
    """Get all contact form submissions (admin only in production)"""
    try:
        contacts = []
        for contact in db.contacts.find().sort("created_at", -1):
            contact["_id"] = str(contact["_id"])
            contacts.append(contact)
        return {"contacts": contacts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve contacts: {str(e)}")

@app.get("/api/personal-info")
async def get_personal_info():
    """Get personal information (public)"""
    try:
        personal_info = db.personal_info.find_one()
        if personal_info:
            personal_info["_id"] = str(personal_info["_id"])
            return personal_info
        else:
            return {
                "name": "Votre Nom",
                "email": "votre.email@exemple.com",
                "phone": "+33 X XX XX XX XX",
                "linkedin": "/votre-profil",
                "description": "Description par défaut",
                "skills": ["Compétence 1", "Compétence 2"],
                "profile_image": ""
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve personal info: {str(e)}")

@app.post("/api/portfolio/{section}")
async def update_portfolio_section(section: str, content: ContentSection):
    """Update portfolio content for a specific section (public for now)"""
    try:
        content_dict = content.dict()
        content_dict["updated_at"] = datetime.now()
        result = db.portfolio_content.update_one(
            {"section": section},
            {"$set": content_dict},
            upsert=True
        )
        return {"message": f"Section {section} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update section: {str(e)}")

@app.get("/api/portfolio/{section}")
async def get_portfolio_section(section: str):
    """Get portfolio content for a specific section"""
    try:
        content = db.portfolio_content.find_one({"section": section})
        if content:
            content["_id"] = str(content["_id"])
            return content
        else:
            return {"section": section, "title": "", "content": "", "images": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve section: {str(e)}")

@app.post("/api/stages")
async def create_or_update_stage(stage_data: StageInfo):
    """Create or update stage information (public for now)"""
    try:
        stage_dict = stage_data.dict()
        stage_dict["updated_at"] = datetime.now()
        result = db.stages.update_one(
            {"stage_type": stage_data.stage_type},
            {"$set": stage_dict},
            upsert=True
        )
        return {"message": f"Stage {stage_data.stage_type} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update stage: {str(e)}")

@app.get("/api/stages/{stage_type}")
async def get_stage_info(stage_type: str):
    """Get stage information"""
    try:
        stage = db.stages.find_one({"stage_type": stage_type})
        if stage:
            stage["_id"] = str(stage["_id"])
            return stage
        else:
            return {
                "stage_type": stage_type,
                "company": "",
                "position": "",
                "period": "",
                "sector": "",
                "description": "",
                "missions": [],
                "skills": [],
                "achievements": [],
                "images": []
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve stage info: {str(e)}")

@app.get("/api/stages")
async def get_all_stages():
    """Get all stage information"""
    try:
        stages = []
        for stage in db.stages.find():
            stage["_id"] = str(stage["_id"])
            stages.append(stage)
        return {"stages": stages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve stages: {str(e)}")

@app.delete("/api/contact/{contact_id}")
async def delete_contact(contact_id: str):
    """Delete a contact form submission"""
    try:
        from bson import ObjectId
        result = db.contacts.delete_one({"_id": ObjectId(contact_id)})
        if result.deleted_count:
            return {"message": "Contact deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Contact not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete contact: {str(e)}")

# Analytics endpoint (optional)
@app.get("/api/analytics")
async def get_analytics():
    """Get basic analytics about the portfolio"""
    try:
        total_contacts = db.contacts.count_documents({})
        total_sections = db.portfolio_content.count_documents({})
        total_stages = db.stages.count_documents({})
        total_images = db.images.count_documents({})
        
        return {
            "total_contacts": total_contacts,
            "total_sections": total_sections,
            "total_stages": total_stages,
            "total_images": total_images,
            "last_updated": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

# Test database connection on startup
@app.on_event("startup")
async def startup_event():
    try:
        # Test database connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB")
        
        # Create indexes for better performance
        db.contacts.create_index("created_at")
        db.portfolio_content.create_index("section")
        db.stages.create_index("stage_type")
        db.images.create_index("filename")
        db.images.create_index("created_at")
        
        print("Database indexes created successfully")
        
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)