import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

def prepare_dataset():
    # Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_path = os.path.join(base_dir, 'koniq++database_distributions.csv')
    image_dir = os.path.join(base_dir, 'data', 'images')
    output_dir = os.path.join(base_dir, 'ml', 'data')
    
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Reading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Initial dataset size: {len(df)}")
    
    # 2. Verify all filenames exist
    print(f"Verifying images in {image_dir}...")
    
    image_files = []
    for root, dirs, files in os.walk(image_dir):
        for file in files:
            if file.endswith('.jpg') or file.endswith('.png'):
                image_files.append(file)
    
    image_files_set = set(image_files)
    
    df['exists'] = df['filename'].apply(lambda x: x in image_files_set)
    missing = df[~df['exists']]
    
    print(f"Missing images: {len(missing)}")
    if len(missing) > 0:
        print(f"First 5 missing: {missing['filename'].head().tolist()}")
        
    df = df[df['exists']].copy()
    print(f"Dataset size after filtering existing images: {len(df)}")
    
    filename_to_path = {}
    for root, dirs, files in os.walk(image_dir):
        for file in files:
            if file.endswith('.jpg') or file.endswith('.png'):
                filename_to_path[file] = os.path.relpath(os.path.join(root, file), base_dir)
                
    df['image_path'] = df['filename'].map(filename_to_path)
    
    # 4. Normalize qmos (Assuming 1-5 scale, normalize to 0-1)
    df['quality_score_normalized'] = (df['qmos'] - 1) / 4.0
    # Ensure it's bounded
    df['quality_score_normalized'] = df['quality_score_normalized'].clip(0, 1)
    
    # 5. Normalize defect annotations
    defect_cols = ['artifacts', 'blur', 'contrast', 'colors', 'other']
    for col in defect_cols:
        df[col] = df[col].clip(0, 1)
        
    def categorize_quality(score):
        score_100 = score * 100
        if score_100 >= 80: return 'ACCEPTABLE'
        elif score_100 >= 50: return 'DEGRADED'
        else: return 'DEFECTIVE'
        
    df['quality_label'] = df['quality_score_normalized'].apply(categorize_quality)
    
    # 6. Create train/validation/test metadata
    print("Splitting dataset...")
    
    if len(df) < 10000:
        print("Warning: Dataset is smaller than expected 10,073.")
    
    # Adjust test_size if dataset is smaller
    test_size = 2015 if len(df) >= 10000 else int(len(df) * 0.2)
    val_size = 1000 if len(df) >= 10000 else int(len(df) * 0.1)
    
    train_val_df, test_df = train_test_split(df, test_size=test_size, random_state=42)
    train_df, val_df = train_test_split(train_val_df, test_size=val_size, random_state=42)
    
    print(f"Train size: {len(train_df)}")
    print(f"Val size: {len(val_df)}")
    print(f"Test size: {len(test_df)}")
    
    # 7. Save processed CSV files
    train_df.to_csv(os.path.join(output_dir, 'train.csv'), index=False)
    val_df.to_csv(os.path.join(output_dir, 'val.csv'), index=False)
    test_df.to_csv(os.path.join(output_dir, 'test.csv'), index=False)
    
    # 8. Print dataset statistics
    print("\n--- Dataset Statistics ---")
    print("Quality Label Distribution:")
    print(df['quality_label'].value_counts(normalize=True))
    
    print("\nDefect Metrics (Mean across dataset):")
    print(df[defect_cols].mean())
    
    print("\nDataset preparation completed successfully.")

if __name__ == '__main__':
    prepare_dataset()
