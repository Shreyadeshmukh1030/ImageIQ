from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import os
import shutil
import uuid
import json

from app.schemas.schemas import AnalysisResultResponse
from app.models.database import get_db, DBAnalysisResult
from app.services.inference_service import analyze_image_file

router = APIRouter()
UPLOAD_DIR = "/tmp/imageiq_uploads" if os.name != 'nt' else os.path.join(os.environ.get('TEMP', 'C:\\temp'), 'imageiq_uploads')

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "ImageIQ API is running."}

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate extension
    allowed_extensions = {".jpg", ".jpeg", ".png"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG and PNG are allowed.")
        
    # Save file temporarily
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run inference
        result_dict = analyze_image_file(temp_path)
        
        # Save to DB
        db_result = DBAnalysisResult(
            filename=file.filename,
            quality_score=result_dict['quality_score'],
            quality_label=result_dict['quality_label'],
            issues_json=json.dumps(result_dict['issues']),
            statistics_json=json.dumps(result_dict['statistics']),
            model_version="1.0"
        )
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        
        # Cleanup
        os.remove(temp_path)
        
        response = {
            "id": db_result.id,
            "filename": db_result.filename,
            "quality_score": db_result.quality_score,
            "quality_label": db_result.quality_label,
            "issues": result_dict['issues'],
            "statistics": result_dict['statistics'],
            "model_version": db_result.model_version,
            "created_at": db_result.created_at.isoformat()
        }
        return response
        
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/history")
def get_history(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    results = db.query(DBAnalysisResult).order_by(DBAnalysisResult.created_at.desc()).offset(skip).limit(limit).all()
    formatted = []
    for r in results:
        formatted.append({
            "id": r.id,
            "filename": r.filename,
            "quality_score": r.quality_score,
            "quality_label": r.quality_label,
            "issues": json.loads(r.issues_json),
            "statistics": json.loads(r.statistics_json),
            "model_version": r.model_version,
            "created_at": r.created_at.isoformat()
        })
    return formatted

@router.get("/history/{item_id}")
def get_history_item(item_id: int, db: Session = Depends(get_db)):
    r = db.query(DBAnalysisResult).filter(DBAnalysisResult.id == item_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Item not found")
        
    return {
        "id": r.id,
        "filename": r.filename,
        "quality_score": r.quality_score,
        "quality_label": r.quality_label,
        "issues": json.loads(r.issues_json),
        "statistics": json.loads(r.statistics_json),
        "model_version": r.model_version,
        "created_at": r.created_at.isoformat()
    }
