from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# Project model for individual project entries
class Project(BaseModel):
    name: str = ""
    description: str = ""
    tech_stack: str = ""
    live_url: str = ""

# Profile model for validating incoming profile data
class Profile(BaseModel):
    full_name: str
    email: EmailStr
    phone: str = ""
    location: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    portfolio_url: str = ""
    
    degree: str = ""
    institution: str = ""
    # Graduation year between 2000 and 2030, allowing None/empty by using Optional/default
    graduation_year: Optional[int] = Field(default=None, ge=2000, le=2030, description="Year between 2000 and 2030")
    # CGPA between 0 and 10
    cgpa: Optional[float] = Field(default=None, ge=0.0, le=10.0, description="CGPA between 0.0 and 10.0")
    
    # Validation for specific levels can be done via Enum, but keeping simple str here
    experience_level: str = "" 
    
    skills_languages: List[str] = []
    skills_frameworks: List[str] = []
    skills_ai_ml: List[str] = []
    
    projects: List[Project] = []
    certifications: List[str] = []
    
    summary: str = ""
    
    # Optional per-application properties passed during generation/merge checks
    recipient_name: Optional[str] = None
    availability_window: Optional[str] = None
    additional_info: Optional[str] = None

