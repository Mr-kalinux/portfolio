from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any, Union
import os
import base64
import uuid
from datetime import datetime, timedelta
import uvicorn
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Portfolio API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection with error handling
try:
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
    client = MongoClient(MONGO_URL)
    db = client.portfolio_db
    
    # Test connection
    client.admin.command('ismaster')
    logger.info("Successfully connected to MongoDB")
    
    # Create indexes
    db.contacts.create_index("created_at")
    db.admin_sessions.create_index("expires_at", expireAfterSeconds=0)
    logger.info("Database indexes created successfully")
    
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Admin credentials and session management
ADMIN_PASSWORD = "Sk4t3_b0Ar5"
SESSION_DURATION = timedelta(hours=24)

# Collections
contacts_collection = db.contacts
personal_info_collection = db.personal_info
stages_collection = db.stages
content_collection = db.content
admin_sessions_collection = db.admin_sessions

# Pydantic models for data validation
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str
    created_at: Optional[datetime] = None

class AdminLogin(BaseModel):
    password: str

class PersonalInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    profile_image: Optional[str] = None

class Mission(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    points: Optional[List[str]] = None
    results: Optional[Dict[str, str]] = None
    achievements: Optional[List[str]] = None
    images: Optional[List[str]] = None

class StageData(BaseModel):
    stage_type: str
    company: Optional[str] = None
    position: Optional[str] = None
    period: Optional[str] = None
    sector: Optional[str] = None
    description: Optional[str] = None
    company_logo: Optional[str] = None
    workplace_image: Optional[str] = None
    tools: Optional[List[Dict[str, str]]] = None
    building_plans: Optional[List[str]] = None
    missions: Optional[List[Mission]] = None
    skills: Optional[List[str]] = None
    achievements: Optional[List[str]] = None
    images: Optional[List[str]] = None
    learnings: Optional[str] = None

class ContentData(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    goals: Optional[List[str]] = None

# Session management functions
def create_admin_session() -> str:
    session_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + SESSION_DURATION
    
    admin_sessions_collection.insert_one({
        "session_id": session_id,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    })
    
    return session_id

def verify_admin_session(request: Request) -> bool:
    session_id = request.cookies.get("admin_session")
    if not session_id:
        return False
    
    session = admin_sessions_collection.find_one({
        "session_id": session_id,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    return session is not None

def require_admin_session(request: Request):
    if not verify_admin_session(request):
        raise HTTPException(status_code=403, detail="Admin session required")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Portfolio API is running", "version": "1.0.0"}

# Health check
@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        client.admin.command('ismaster')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

# Contact form endpoints
@app.post("/api/contact")
async def submit_contact(contact: ContactForm):
    try:
        contact_data = contact.dict()
        contact_data['created_at'] = datetime.utcnow()
        contact_data['id'] = str(uuid.uuid4())
        
        result = contacts_collection.insert_one(contact_data)
        
        if result.inserted_id:
            logger.info(f"New contact form submitted: {contact.email}")
            return {"success": True, "message": "Message sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save contact form")
            
    except Exception as e:
        logger.error(f"Error submitting contact form: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/contacts")
async def get_contacts(request: Request):
    require_admin_session(request)
    
    try:
        contacts = list(contacts_collection.find({}, {"_id": 0}).sort("created_at", -1))
        return {"contacts": contacts}
    except Exception as e:
        logger.error(f"Error fetching contacts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch contacts")

@app.delete("/api/contacts/{contact_id}")
async def delete_contact(contact_id: str, request: Request):
    require_admin_session(request)
    
    try:
        result = contacts_collection.delete_one({"id": contact_id})
        if result.deleted_count > 0:
            return {"success": True, "message": "Contact deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Contact not found")
    except Exception as e:
        logger.error(f"Error deleting contact: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete contact")

# Admin authentication endpoints
@app.post("/api/admin/login")
async def admin_login(login_data: AdminLogin, response: Response):
    try:
        if login_data.password == ADMIN_PASSWORD:
            session_id = create_admin_session()
            response.set_cookie(
                key="admin_session",
                value=session_id,
                max_age=int(SESSION_DURATION.total_seconds()),
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite="lax"
            )
            logger.info("Admin login successful")
            return {"success": True, "message": "Login successful"}
        else:
            logger.warning("Failed admin login attempt")
            raise HTTPException(status_code=401, detail="Invalid password")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during admin login: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/api/admin/verify")
async def verify_admin(request: Request):
    try:
        is_authenticated = verify_admin_session(request)
        return {"authenticated": is_authenticated}
    except Exception as e:
        logger.error(f"Error verifying admin session: {e}")
        return {"authenticated": False}

@app.post("/api/admin/logout")
async def admin_logout(request: Request, response: Response):
    try:
        session_id = request.cookies.get("admin_session")
        if session_id:
            admin_sessions_collection.delete_one({"session_id": session_id})
        
        response.delete_cookie("admin_session")
        logger.info("Admin logout successful")
        return {"success": True, "message": "Logout successful"}
    except Exception as e:
        logger.error(f"Error during admin logout: {e}")
        return {"success": True, "message": "Logout completed"}

# Personal info endpoints
@app.get("/api/personal-info")
async def get_personal_info():
    try:
        personal_info = personal_info_collection.find_one({}, {"_id": 0})
        if not personal_info:
            # Return default structure
            personal_info = {
                "name": "[Votre nom]",
                "email": "[votre.email@exemple.com]",
                "phone": "[Votre téléphone]",
                "linkedin": "[Votre LinkedIn]",
                "description": "[Votre description]",
                "skills": ["Compétence 1", "Compétence 2", "Compétence 3"],
                "profile_image": ""
            }
        return personal_info
    except Exception as e:
        logger.error(f"Error fetching personal info: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch personal info")

@app.post("/api/admin/personal-info")
async def update_personal_info(personal_info: PersonalInfo, request: Request):
    require_admin_session(request)
    
    try:
        personal_data = personal_info.dict(exclude_unset=True)
        personal_data['updated_at'] = datetime.utcnow()
        
        result = personal_info_collection.replace_one(
            {},
            personal_data,
            upsert=True
        )
        
        logger.info("Personal info updated successfully")
        return {"success": True, "message": "Personal info updated successfully"}
    except Exception as e:
        logger.error(f"Error updating personal info: {e}")
        raise HTTPException(status_code=500, detail="Failed to update personal info")

# Stages endpoints
@app.get("/api/stages/{stage_type}")
async def get_stage_data(stage_type: str):
    try:
        stage_data = stages_collection.find_one({"stage_type": stage_type}, {"_id": 0})
        if not stage_data:
            # Return default structure based on stage type
            if stage_type == "stage1":
                stage_data = {
                    "stage_type": "stage1",
                    "company": "[Nom de l'entreprise]",
                    "position": "[Intitulé du poste]",
                    "period": "[Date de début - Date de fin]",
                    "sector": "[Secteur d'activité]",
                    "description": "[Description de l'entreprise]",
                    "company_logo": "",
                    "workplace_image": "",
                    "tools": [
                        {"name": "Outil 1", "image": ""},
                        {"name": "Outil 2", "image": ""},
                        {"name": "Outil 3", "image": ""},
                        {"name": "Outil 4", "image": ""},
                        {"name": "Outil 5", "image": ""},
                        {"name": "Outil 6", "image": ""}
                    ],
                    "building_plans": ["", "", "", ""],
                    "missions": [
                        {
                            "title": "[Titre de votre mission]",
                            "description": "[Description de la mission]",
                            "skills": ["Compétence 1", "Compétence 2", "Compétence 3"],
                            "images": []
                        },
                        {
                            "title": "[Titre de votre mission]",
                            "description": "[Description de la mission]",
                            "points": ["Point important 1", "Point important 2", "Point important 3"],
                            "images": []
                        },
                        {
                            "title": "[Titre de votre mission]",
                            "description": "[Description de la mission]",
                            "skills": ["Compétence avancée 1", "Compétence avancée 2", "Compétence avancée 3"],
                            "images": []
                        }
                    ],
                    "skills": ["Compétence technique 1", "Compétence technique 2", "Compétence technique 3"],
                    "learnings": "Ce stage m'a permis de découvrir le monde professionnel et de développer des compétences essentielles."
                }
            elif stage_type == "stage2":
                stage_data = {
                    "stage_type": "stage2",
                    "company": "[Nom de l'entreprise 2ème année]",
                    "position": "[Intitulé du poste 2ème année]",
                    "period": "[Date de début - Date de fin]",
                    "sector": "[Secteur d'activité]",
                    "description": "[Description de l'entreprise 2ème année]",
                    "missions": [],
                    "skills": [],
                    "learnings": "En cours de développement..."
                }
        return stage_data
    except Exception as e:
        logger.error(f"Error fetching stage data for {stage_type}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch {stage_type} data")

@app.post("/api/admin/stages")
async def update_stage_data(stage_data: Dict[str, Any], request: Request):
    require_admin_session(request)
    
    try:
        # The payload should contain the stage type as a key
        for stage_type, data in stage_data.items():
            if stage_type.startswith('stage'):
                # Validate the data structure
                validated_data = StageData(**data)
                stage_dict = validated_data.dict(exclude_unset=True)
                stage_dict['updated_at'] = datetime.utcnow()
                
                result = stages_collection.replace_one(
                    {"stage_type": stage_type},
                    stage_dict,
                    upsert=True
                )
                
                logger.info(f"Stage data updated successfully for {stage_type}")
                return {"success": True, "message": f"Stage {stage_type} updated successfully"}
        
        raise HTTPException(status_code=400, detail="No valid stage data provided")
    except Exception as e:
        logger.error(f"Error updating stage data: {e}")
        raise HTTPException(status_code=500, detail="Failed to update stage data")

# Content endpoints
@app.get("/api/content/{section}")
async def get_content(section: str):
    try:
        content = content_collection.find_one({"section": section}, {"_id": 0})
        if not content:
            # Return default structure based on section
            if section == "conclusion":
                content = {
                    "section": "conclusion",
                    "title": "Bilan et perspectives",
                    "content": "Mon parcours professionnel m'a permis d'acquérir de nombreuses compétences et expériences qui m'orientent vers un avenir prometteur.",
                    "goals": ["Objectif 1", "Objectif 2", "Objectif 3"]
                }
        return content
    except Exception as e:
        logger.error(f"Error fetching content for {section}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch {section} content")

@app.post("/api/admin/content/{section}")
async def update_content(section: str, content_data: ContentData, request: Request):
    require_admin_session(request)
    
    try:
        content_dict = content_data.dict(exclude_unset=True)
        content_dict['section'] = section
        content_dict['updated_at'] = datetime.utcnow()
        
        result = content_collection.replace_one(
            {"section": section},
            content_dict,
            upsert=True
        )
        
        logger.info(f"Content updated successfully for {section}")
        return {"success": True, "message": f"Content for {section} updated successfully"}
    except Exception as e:
        logger.error(f"Error updating content for {section}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update {section} content")

# Admin content management
@app.get("/api/admin/content")
async def get_admin_content(request: Request):
    require_admin_session(request)
    
    try:
        # Get all content for admin dashboard
        personal_info = personal_info_collection.find_one({}, {"_id": 0})
        stages = list(stages_collection.find({}, {"_id": 0}))
        content = list(content_collection.find({}, {"_id": 0}))
        
        return {
            "personal_info": personal_info or {},
            "stages": stages,
            "content": content
        }
    except Exception as e:
        logger.error(f"Error fetching admin content: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin content")

# Image upload endpoint
@app.post("/api/admin/upload-image")
async def upload_image(request: Request, file: UploadFile = File(...)):
    require_admin_session(request)
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        content = await file.read()
        
        # Convert to base64
        base64_image = base64.b64encode(content).decode('utf-8')
        image_url = f"data:{file.content_type};base64,{base64_image}"
        
        logger.info(f"Image uploaded successfully: {file.filename}")
        return {"success": True, "image_url": image_url}
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")

# Analytics endpoint (optional)
@app.get("/api/admin/analytics")
async def get_analytics(request: Request):
    require_admin_session(request)
    
    try:
        total_contacts = contacts_collection.count_documents({})
        recent_contacts = contacts_collection.count_documents({
            "created_at": {"$gte": datetime.utcnow() - timedelta(days=30)}
        })
        
        return {
            "total_contacts": total_contacts,
            "recent_contacts": recent_contacts,
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return {"detail": "Endpoint not found", "status_code": 404}

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    logger.error(f"Internal server error: {exc}")
    return {"detail": "Internal server error", "status_code": 500}

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Portfolio API starting up...")
    logger.info(f"MongoDB URL: {MONGO_URL}")
    logger.info("API is ready to serve requests")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Portfolio API shutting down...")
    client.close()

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)