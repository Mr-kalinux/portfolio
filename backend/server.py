from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime
import uvicorn

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

# Pydantic models for data validation
class ContactForm(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    created_at: Optional[datetime] = None

class PortfolioContent(BaseModel):
    section: str  # 'about', 'stage1', 'stage2', 'conclusion'
    title: str
    content: str
    images: Optional[List[str]] = []
    updated_at: Optional[datetime] = None

class StageInfo(BaseModel):
    stage_type: str  # 'stage1' or 'stage2'
    company: str
    position: str
    period: str
    sector: str
    missions: List[str]
    skills: List[str]
    achievements: Optional[List[str]] = []
    images: Optional[List[str]] = []

# API Routes

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Portfolio API is running"}

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

@app.post("/api/portfolio/{section}")
async def update_portfolio_section(section: str, content: PortfolioContent):
    """Update portfolio content for a specific section"""
    try:
        content.updated_at = datetime.now()
        result = db.portfolio_content.update_one(
            {"section": section},
            {"$set": content.dict()},
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
    """Create or update stage information"""
    try:
        result = db.stages.update_one(
            {"stage_type": stage_data.stage_type},
            {"$set": stage_data.dict()},
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
        
        return {
            "total_contacts": total_contacts,
            "total_sections": total_sections,
            "total_stages": total_stages,
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
        
        print("Database indexes created successfully")
        
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)