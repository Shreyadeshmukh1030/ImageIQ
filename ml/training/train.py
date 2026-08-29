import os
import argparse
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T
import torchvision.models as models
from PIL import Image, ImageEnhance, ImageFilter
import random
import time
import copy

class ImageQualityDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None, is_train=False, apply_synthetic=False):
        self.data = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.transform = transform
        self.is_train = is_train
        self.apply_synthetic = apply_synthetic
        
        self.koniq_defects = ['artifacts', 'blur', 'contrast', 'colors', 'other']
        # Synthetic targets: synth_blur, synth_underexposure, synth_overexposure, synth_noise
        
    def __len__(self):
        return len(self.data)
        
    def __getitem__(self, idx):
        row = self.data.iloc[idx]
        # image_path could be just filename if they are in root
        img_name = row['filename']
        # We find the file in the directory. We precomputed image_path in prepare_dataset.py
        if 'image_path' in row:
            img_path = os.path.join(os.path.dirname(os.path.dirname(self.img_dir)), row['image_path'])
        else:
            img_path = os.path.join(self.img_dir, img_name)
            
        try:
            image = Image.open(img_path).convert('RGB')
            image = image.resize((224, 224))
        except Exception as e:
            # Fallback to a blank image if corrupted
            image = Image.new('RGB', (224, 224), (0, 0, 0))
            
        quality_score = float(row['quality_score_normalized'])
        koniq_labels = [float(row[c]) for c in self.koniq_defects]
        
        synth_labels = [0.0, 0.0, 0.0, 0.0] # blur, under, over, noise
        
        # Apply synthetic degradations ONLY during training and if enabled
        if self.is_train and self.apply_synthetic and random.random() < 0.5:
            deg_type = random.choice(['blur', 'under', 'over', 'noise'])
            if deg_type == 'blur':
                image = image.filter(ImageFilter.GaussianBlur(radius=random.uniform(1.5, 3.0)))
                synth_labels[0] = 1.0
                quality_score = quality_score * 0.5 # drastically reduce quality
            elif deg_type == 'under':
                enhancer = ImageEnhance.Brightness(image)
                image = enhancer.enhance(random.uniform(0.1, 0.4))
                synth_labels[1] = 1.0
                quality_score = quality_score * 0.5
            elif deg_type == 'over':
                enhancer = ImageEnhance.Brightness(image)
                image = enhancer.enhance(random.uniform(2.0, 4.0))
                synth_labels[2] = 1.0
                quality_score = quality_score * 0.5
            elif deg_type == 'noise':
                img_array = np.array(image)
                noise = np.random.normal(0, random.uniform(15, 35), img_array.shape)
                img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
                image = Image.fromarray(img_array)
                synth_labels[3] = 1.0
                quality_score = quality_score * 0.5
                
        defect_labels = koniq_labels + synth_labels
            
        if self.transform:
            image = self.transform(image)
            
        return image, torch.tensor([quality_score], dtype=torch.float32), torch.tensor(defect_labels, dtype=torch.float32)

class MultiTaskModel(nn.Module):
    def __init__(self, num_defect_classes=9):
        super(MultiTaskModel, self).__init__()
        # Load pretrained EfficientNet-B0
        # Use weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1 in PyTorch 0.13+, or pretrained=True
        try:
            self.backbone = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
        except Exception:
            self.backbone = models.efficientnet_b0(pretrained=True)
            
        in_features = self.backbone.classifier[1].in_features
        
        # Remove original classifier
        self.backbone.classifier = nn.Identity()
        
        # Quality regression head (1 output)
        self.quality_head = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features, 1),
            nn.Sigmoid() # to bound it between 0-1
        )
        
        # Defect classification head (9 outputs: 5 koniq + 4 synth)
        self.defect_head = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features, num_defect_classes)
        )
        
    def forward(self, x):
        features = self.backbone(x)
        quality = self.quality_head(features)
        defects = self.defect_head(features)
        return quality, defects

def train_model(args):
    # Setup Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    train_csv = os.path.join(base_dir, 'ml', 'data', 'train.csv')
    val_csv = os.path.join(base_dir, 'ml', 'data', 'val.csv')
    img_dir = os.path.join(base_dir, 'data', 'images')
    
    # Transforms
    train_transform = T.Compose([
        T.RandomHorizontalFlip(),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    val_transform = T.Compose([
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    # Datasets
    train_dataset = ImageQualityDataset(train_csv, img_dir, transform=train_transform, is_train=True, apply_synthetic=True)
    val_dataset = ImageQualityDataset(val_csv, img_dir, transform=val_transform, is_train=False, apply_synthetic=False)
    
    if args.tiny:
        print("Running in TINY mode (50 train, 10 val).")
        train_dataset.data = train_dataset.data.head(50)
        val_dataset.data = val_dataset.data.head(10)
        args.epochs = min(args.epochs, 3)
        
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)
    
    model = MultiTaskModel(num_defect_classes=9).to(device)
    
    # Freeze backbone initially
    for param in model.backbone.parameters():
        param.requires_grad = False
        
    quality_criterion = nn.SmoothL1Loss()
    defect_criterion = nn.BCEWithLogitsLoss()
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3)
    
    # Mixed precision setup
    scaler = torch.cuda.amp.GradScaler(enabled=torch.cuda.is_available())
    
    best_val_loss = float('inf')
    best_model_wts = copy.deepcopy(model.state_dict())
    
    # Training Loop
    start_time = time.time()
    for epoch in range(args.epochs):
        print(f"Epoch {epoch+1}/{args.epochs}")
        print("-" * 10)
        
        # Unfreeze backbone after 2 epochs
        if epoch == 2:
            print("Unfreezing backbone...")
            for param in model.backbone.parameters():
                param.requires_grad = True
                
        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
                dataloader = train_loader
            else:
                model.eval()
                dataloader = val_loader
                
            running_loss = 0.0
            running_q_loss = 0.0
            running_d_loss = 0.0
            
            for inputs, q_targets, d_targets in dataloader:
                inputs = inputs.to(device)
                q_targets = q_targets.to(device)
                d_targets = d_targets.to(device)
                
                optimizer.zero_grad()
                
                with torch.set_grad_enabled(phase == 'train'):
                    with torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                        q_preds, d_preds = model(inputs)
                        q_loss = quality_criterion(q_preds, q_targets)
                        d_loss = defect_criterion(d_preds, d_targets)
                        # weight defects more since there are multiple
                        loss = q_loss + (args.defect_weight * d_loss)
                        
                    if phase == 'train':
                        scaler.scale(loss).backward()
                        scaler.step(optimizer)
                        scaler.update()
                        
                running_loss += loss.item() * inputs.size(0)
                running_q_loss += q_loss.item() * inputs.size(0)
                running_d_loss += d_loss.item() * inputs.size(0)
                
            epoch_loss = running_loss / len(dataloader.dataset)
            epoch_q_loss = running_q_loss / len(dataloader.dataset)
            epoch_d_loss = running_d_loss / len(dataloader.dataset)
            
            print(f"{phase} Loss: {epoch_loss:.4f} (Q: {epoch_q_loss:.4f} D: {epoch_d_loss:.4f})")
            
            if phase == 'val':
                scheduler.step(epoch_loss)
                if epoch_loss < best_val_loss:
                    best_val_loss = epoch_loss
                    best_model_wts = copy.deepcopy(model.state_dict())
                    
    time_elapsed = time.time() - start_time
    print(f"Training complete in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best val loss: {best_val_loss:.4f}")
    
    # Save model
    model.load_state_dict(best_model_wts)
    os.makedirs(os.path.join(base_dir, 'models'), exist_ok=True)
    model_path = os.path.join(base_dir, 'models', 'best_model.pth')
    if args.tiny:
        model_path = os.path.join(base_dir, 'models', 'tiny_model.pth')
    torch.save(model.state_dict(), model_path)
    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--tiny', action='store_true', help='Run on a tiny subset for sanity check')
    parser.add_argument('--batch_size', type=int, default=32)
    parser.add_argument('--epochs', type=int, default=15)
    parser.add_argument('--lr', type=float, default=1e-4)
    parser.add_argument('--weight_decay', type=float, default=1e-4)
    parser.add_argument('--defect_weight', type=float, default=2.0)
    args = parser.parse_args()
    
    # Set seeds for reproducibility
    torch.manual_seed(42)
    np.random.seed(42)
    random.seed(42)
    
    train_model(args)
