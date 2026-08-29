from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Issue(BaseModel):
    type: str
    severity: str
    confidence: float

class AnalysisResultBase(BaseModel):
    quality_score: float
    quality_label: str
    issues: List[Issue]
    statistics: Dict[str, Any]

class AnalysisResultCreate(AnalysisResultBase):
    filename: str
    model_version: str

class AnalysisResultResponse(AnalysisResultBase):
    id: int
    filename: str
    model_version: str
    created_at: datetime
    
    class Config:
        orm_mode = True
