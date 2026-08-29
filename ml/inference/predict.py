import os
import torch
import torchvision.transforms as T
from PIL import Image
import numpy as np

# Adjust path for imports
import sys
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(base_dir)

from ml.training.train import MultiTaskModel
from ml.inference.cv_features import extract_cv_features

class ImagePredictor:
    def __init__(self, model_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load Model
        self.model = MultiTaskModel(num_defect_classes=9).to(self.device)
        
        if model_path is None:
            model_path = os.path.join(base_dir, 'models', 'best_model.pth')
            if not os.path.exists(model_path):
                model_path = os.path.join(base_dir, 'models', 'tiny_model.pth')
                
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.eval()
        else:
            print(f"Warning: Model weights not found at {model_path}. Inference will be random.")
            
        self.transform = T.Compose([
            T.Resize((224, 224)),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
        self.koniq_defects = ['artifacts', 'blur', 'contrast', 'colors', 'other']
        # Synthetic: blur, under, over, noise
        
    def analyze_image(self, image_path):
        # 1. OpenCV Analysis
        cv_stats = extract_cv_features(image_path)
        
        if cv_stats.get('corrupted', False):
            return {
                'quality_score': 0.0,
                'quality_label': 'DEFECTIVE',
                'issues': [{'type': 'CORRUPTED_IMAGE', 'severity': 'high', 'confidence': 1.0}],
                'statistics': cv_stats
            }
            
        # 2. Neural Network Analysis
        try:
            image = Image.open(image_path).convert('RGB')
        except Exception as e:
             return {
                'quality_score': 0.0,
                'quality_label': 'DEFECTIVE',
                'issues': [{'type': 'CORRUPTED_IMAGE', 'severity': 'high', 'confidence': 1.0}],
                'statistics': cv_stats
            }
            
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            q_preds, d_preds = self.model(input_tensor)
            quality_normalized = q_preds.item()
            defect_probs = torch.sigmoid(d_preds).cpu().numpy().flatten()
            
        quality_score = quality_normalized * 100
        
        # Determine Quality Label
        if quality_score >= 80:
            quality_label = 'ACCEPTABLE'
        elif quality_score >= 50:
            quality_label = 'DEGRADED'
        else:
            quality_label = 'DEFECTIVE'
            
        issues = []
        
        # Helper to add issue
        def add_issue(issue_type, confidence, severity='medium'):
            issues.append({
                'type': issue_type,
                'severity': severity,
                'confidence': round(float(confidence), 2)
            })
            
        # Map NN defects
        if defect_probs[0] > 0.5: add_issue('ARTIFACTS', defect_probs[0], 'high')
        if defect_probs[1] > 0.5: add_issue('BLUR', defect_probs[1], 'medium')
        if defect_probs[2] > 0.5: add_issue('CONTRAST', defect_probs[2], 'medium')
        if defect_probs[3] > 0.5: add_issue('COLOR', defect_probs[3], 'low')
        if defect_probs[4] > 0.5: add_issue('OTHER', defect_probs[4], 'low')
        
        # Synthetic NN targets (indices 5-8)
        if defect_probs[5] > 0.5 and not any(i['type'] == 'BLUR' for i in issues): 
            add_issue('BLUR', defect_probs[5], 'high')
        if defect_probs[6] > 0.5: add_issue('UNDEREXPOSURE', defect_probs[6], 'high')
        if defect_probs[7] > 0.5: add_issue('OVEREXPOSURE', defect_probs[7], 'high')
        if defect_probs[8] > 0.5: add_issue('NOISE', defect_probs[8], 'high')
            
        # 3. Decision Engine: Incorporate CV stats as sanity checks or fallback
        if cv_stats['brightness'] < 40 and not any(i['type'] == 'UNDEREXPOSURE' for i in issues):
            add_issue('UNDEREXPOSURE', 0.8, 'high')
        elif cv_stats['brightness'] > 220 and not any(i['type'] == 'OVEREXPOSURE' for i in issues):
            add_issue('OVEREXPOSURE', 0.8, 'high')
            
        if cv_stats['sharpness'] < 50 and not any(i['type'] == 'BLUR' for i in issues):
            add_issue('BLUR', 0.7, 'high')
            
        if cv_stats['noise'] > 12 and not any(i['type'] == 'NOISE' for i in issues):
            add_issue('NOISE', 0.7, 'medium')
            
        # Clean up stats for response
        clean_stats = {k: round(v, 2) if isinstance(v, float) else v for k, v in cv_stats.items() if k != 'corrupted'}
            
        return {
            'quality_score': round(quality_score, 1),
            'quality_label': quality_label,
            'issues': issues,
            'statistics': clean_stats
        }

if __name__ == '__main__':
    import sys
    predictor = ImagePredictor()
    if len(sys.argv) > 1:
        res = predictor.analyze_image(sys.argv[1])
        print(res)
    else:
        print("Provide image path to test.")
