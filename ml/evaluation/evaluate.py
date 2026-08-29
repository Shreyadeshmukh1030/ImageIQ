import os
import argparse
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import torchvision.transforms as T
from sklearn.metrics import mean_absolute_error, mean_squared_error, precision_recall_fscore_support, roc_auc_score, confusion_matrix
from scipy.stats import pearsonr, spearmanr
import matplotlib.pyplot as plt
import sys

# Add parent dir to path so we can import the Dataset and Model
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(base_dir)

from ml.training.train import ImageQualityDataset, MultiTaskModel

def evaluate_model(args):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Evaluating on device: {device}")
    
    test_csv = os.path.join(base_dir, 'ml', 'data', 'test.csv')
    img_dir = os.path.join(base_dir, 'data', 'images')
    output_dir = os.path.join(base_dir, 'ml', 'evaluation')
    os.makedirs(output_dir, exist_ok=True)
    
    model_path = os.path.join(base_dir, 'models', 'best_model.pth')
    if args.tiny:
        model_path = os.path.join(base_dir, 'models', 'tiny_model.pth')
        
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}")
        return
        
    val_transform = T.Compose([
        T.Resize((224, 224)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    test_dataset = ImageQualityDataset(test_csv, img_dir, transform=val_transform, is_train=False)
    if args.tiny:
        test_dataset.data = test_dataset.data.head(20)
        
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)
    
    model = MultiTaskModel(num_defect_classes=9).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    
    all_q_targets = []
    all_q_preds = []
    
    all_d_targets = []
    all_d_preds = []
    all_d_probs = []
    
    print("Running inference on test set...")
    with torch.no_grad():
        for inputs, q_targets, d_targets in test_loader:
            inputs = inputs.to(device)
            q_preds, d_preds = model(inputs)
            
            all_q_targets.extend(q_targets.cpu().numpy().flatten())
            all_q_preds.extend(q_preds.cpu().numpy().flatten())
            
            # For defect targets, we apply sigmoid to get probabilities
            d_probs = torch.sigmoid(d_preds).cpu().numpy()
            all_d_probs.extend(d_probs)
            all_d_preds.extend((d_probs >= 0.5).astype(int))
            all_d_targets.extend(d_targets.cpu().numpy())
            
    all_q_targets = np.array(all_q_targets)
    all_q_preds = np.array(all_q_preds)
    all_d_targets = np.array(all_d_targets)
    all_d_preds = np.array(all_d_preds)
    all_d_probs = np.array(all_d_probs)
    
    # Calculate Quality Metrics
    mae = mean_absolute_error(all_q_targets, all_q_preds)
    rmse = np.sqrt(mean_squared_error(all_q_targets, all_q_preds))
    plcc, _ = pearsonr(all_q_targets, all_q_preds)
    srcc, _ = spearmanr(all_q_targets, all_q_preds)
    
    print(f"\n--- Quality Regression Metrics ---")
    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"PLCC: {plcc:.4f}")
    print(f"SRCC: {srcc:.4f}")
    
    # Calculate Defect Metrics
    koniq_defects = ['artifacts', 'blur', 'contrast', 'colors', 'other']
    print(f"\n--- Defect Classification Metrics ---")
    
    metrics_list = []
    for i, defect in enumerate(koniq_defects):
        # targets are probabilities in koniq, we threshold them at 0.5 for binary classification metrics
        y_true = (all_d_targets[:, i] >= 0.5).astype(int)
        y_pred = all_d_preds[:, i]
        y_prob = all_d_probs[:, i]
        
        # If there are no positive examples, some metrics will be undefined
        if np.sum(y_true) == 0:
            print(f"Warning: No positive examples for {defect} in true labels.")
            prec, rec, f1 = 0.0, 0.0, 0.0
            auc = 0.0
        else:
            prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary', zero_division=0)
            try:
                auc = roc_auc_score(y_true, y_prob)
            except ValueError:
                auc = 0.0
                
        print(f"{defect.capitalize():<12}: Precision={prec:.4f} Recall={rec:.4f} F1={f1:.4f} AUC={auc:.4f}")
        metrics_list.append({
            'defect': defect,
            'precision': prec,
            'recall': rec,
            'f1': f1,
            'auc': auc
        })
        
    metrics_df = pd.DataFrame(metrics_list)
    metrics_df.to_csv(os.path.join(output_dir, 'defect_metrics.csv'), index=False)
    
    with open(os.path.join(output_dir, 'quality_metrics.txt'), 'w') as f:
        f.write(f"MAE: {mae:.4f}\nRMSE: {rmse:.4f}\nPLCC: {plcc:.4f}\nSRCC: {srcc:.4f}\n")
        
    # Generate scatter plot
    plt.figure(figsize=(8, 6))
    plt.scatter(all_q_targets, all_q_preds, alpha=0.5, s=10)
    plt.plot([0, 1], [0, 1], 'r--')
    plt.xlabel('True Quality (Normalized)')
    plt.ylabel('Predicted Quality (Normalized)')
    plt.title('Quality Prediction vs True')
    plt.xlim(0, 1)
    plt.ylim(0, 1)
    plt.grid(True, alpha=0.3)
    plt.savefig(os.path.join(output_dir, 'quality_scatter.png'))
    plt.close()
    
    print(f"\nEvaluation complete. Results saved to {output_dir}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--tiny', action='store_true', help='Evaluate tiny model')
    parser.add_argument('--batch_size', type=int, default=32)
    args = parser.parse_args()
    
    evaluate_model(args)
