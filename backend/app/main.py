from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router
from backend.app.models.database import init_db

app = FastAPI(title="ImageIQ API", description="API for AI-Powered Image Quality & Defect Detection")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    # Pre-load model by getting the predictor once
    from backend.app.services.inference_service import get_predictor
    get_predictor()

app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
