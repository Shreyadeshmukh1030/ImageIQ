import sys
import os

# Add root project path to import ML modules
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(base_dir)

from ml.inference.predict import ImagePredictor

_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        _predictor = ImagePredictor()
    return _predictor

def analyze_image_file(file_path: str):
    predictor = get_predictor()
    return predictor.analyze_image(file_path)
