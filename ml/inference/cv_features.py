import cv2
import numpy as np
import os

def extract_cv_features(image_path):
    """
    Extracts computer vision features from an image using OpenCV.
    Returns a dictionary of features.
    """
    try:
        if not os.path.exists(image_path):
            return {'corrupted': True, 'error': 'File not found'}
            
        # Check corruption/readability
        img = cv2.imread(image_path)
        if img is None:
            return {'corrupted': True, 'error': 'Cannot decode image'}
            
        h, w, c = img.shape
        
        # Convert to various color spaces
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # 1. Brightness
        brightness = np.mean(gray)
        
        # 2. Sharpness (Laplacian variance)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        sharpness = np.var(laplacian)
        
        # 3. Contrast (RMS contrast)
        contrast = np.std(gray)
        
        # 4. Noise estimate (Mean absolute difference from median filtered image)
        median = cv2.medianBlur(gray, 3)
        noise_diff = cv2.absdiff(gray, median)
        noise_estimate = np.mean(noise_diff)
        
        # 5. Saturation
        saturation = np.mean(hsv[:,:,1])
        
        # 6. Color statistics
        mean_b = np.mean(img[:,:,0])
        mean_g = np.mean(img[:,:,1])
        mean_r = np.mean(img[:,:,2])
        
        return {
            'corrupted': False,
            'dimensions': [w, h],
            'brightness': float(brightness),
            'sharpness': float(sharpness),
            'contrast': float(contrast),
            'noise': float(noise_estimate),
            'saturation': float(saturation),
            'mean_r': float(mean_r),
            'mean_g': float(mean_g),
            'mean_b': float(mean_b)
        }
    except Exception as e:
        return {'corrupted': True, 'error': str(e)}

if __name__ == "__main__":
    # Test script
    import sys
    if len(sys.argv) > 1:
        print(extract_cv_features(sys.argv[1]))
    else:
        print("Please provide an image path.")
