# AI-Powered Image Quality & Defect Detection

This project is a complete, production-ready full-stack AI application for evaluating visual image quality and detecting common image-quality problems.

## Architecture

The system is built on a multi-modal approach combining a deep learning model with traditional Computer Vision (OpenCV) techniques.

1. **Frontend**: A modern React SPA built with Vite and vanilla CSS.
2. **Backend**: A FastAPI REST API to handle uploads, inference, and history.
3. **Database**: SQLite (via SQLAlchemy) to persist analysis history.
4. **Machine Learning**: 
    - **Backbone**: EfficientNet-B0 (pretrained on ImageNet).
    - **Multi-task Head**: 
        - Regression head for overall quality score (qmos).
        - Multi-label classification head for KonIQ++ defects (blur, artifacts, contrast, colors, other) and synthetic degradations.
5. **Computer Vision**: OpenCV module to extract brightness, sharpness (Laplacian variance), contrast (RMS), noise, and saturation.
6. **Decision Engine**: Combines NN predictions and CV stats to produce a final 0-100 quality score, a label (ACCEPTABLE, DEGRADED, DEFECTIVE), and detailed issues with severity and confidence.

## Dataset and Preprocessing

- **Source**: KonIQ-10k dataset + KonIQ++ annotations.
- **KonIQ++ Structure**: Annotations include `qmos` (Quality Mean Opinion Score) and proportions of users voting for defects like `blur`, `artifacts`, `contrast`, `colors`.
- **Preparation**: 
  - `qmos` is normalized to a 0-1 range.
  - Defect annotations are clamped to 0-1.
- **Split**: A deterministic stratified split (Train: 7058, Val: 1000, Test: 2015) is enforced using a fixed random seed (42).
- **Synthetic Degradation**: During training, we apply controlled synthetic degradations (blur, under/overexposure, noise) *only* to training images via PyTorch transforms on-the-fly. This prevents data leakage into the validation/test sets while teaching the model to identify these specific defects.

## Model Details

- **Why EfficientNet-B0?**: It strikes an optimal balance between feature extraction capability and inference speed. It is lightweight enough to be trained on consumer hardware while matching or exceeding ResNet-50 performance.
- **Loss Functions**: 
    - Quality: `SmoothL1Loss` (robust to outliers).
    - Defects: `BCEWithLogitsLoss` (for independent multi-label probabilities).
- **Training**: AdamW optimizer, mixed precision (AMP), Cosine/Plateau LR scheduler, early stopping based on validation loss.

## Evaluation

Evaluation metrics are computed on the held-out test set (2015 images).
- **Quality Regression**: MAE, RMSE, PLCC (Pearson), SRCC (Spearman).
- **Defect Classification**: Precision, Recall, F1, ROC-AUC for each defect category.
*See `ml/evaluation/` for detailed metrics and scatter plots.*

## Limitations and Explainability

- **Limitations**: The model may struggle with highly abstract art or heavily edited photos where "quality" is subjective. 
- **Explainability**: The system currently provides interpretability via independent OpenCV statistics and confidence scores for each defect. Grad-CAM can be integrated in future iterations.

## Setup and Deployment

### Option 1: Docker (Recommended)

1. Ensure Docker and Docker Compose are installed.
2. Run the application:
   ```bash
   docker-compose up --build
   ```
3. Access the frontend at `http://localhost:80` and the API at `http://localhost:8000/api`.

### Option 2: Local Setup

1. **Python Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r backend/requirements.txt
   ```
2. **Run Backend**:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
3. **Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Endpoints

- `GET /api/health`: Health check status.
- `POST /api/analyze`: Upload a `multipart/form-data` image to receive quality analysis.
- `GET /api/history`: Retrieve past analysis results.

### Sample API Response

```json
{
  "id": 1,
  "filename": "image.jpg",
  "quality_score": 78.4,
  "quality_label": "DEGRADED",
  "issues": [
    {
      "type": "BLUR",
      "severity": "medium",
      "confidence": 0.85
    }
  ],
  "statistics": {
    "brightness": 120.5,
    "sharpness": 45.2,
    "contrast": 60.1,
    "noise": 5.4,
    "saturation": 110.3,
    "dimensions": [1024, 768]
  }
}
```