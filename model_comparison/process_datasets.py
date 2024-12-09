import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# List of datasets to process
datasets = {
    #'Enron.csv': 'archive/Enron.csv',
    #'Ling.csv': 'archive/Ling.csv',
    'SpamAssasin.csv': 'archive/SpamAssasin.csv',
    'Nazario.csv': 'archive/Nazario.csv',
    'Nigerian_Fraud.csv': 'archive/Nigerian_Fraud.csv',
    'CEAS_08.csv': 'archive/CEAS_08.csv'
}

# Define required columns
REQUIRED_COLS = ['sender', 'subject', 'body', 'label']

# Store processed dataframes
processed_dfs = []

# Process each dataset
for name, path in datasets.items():
    print(f"\nProcessing {name}...")
    try:
        # Read the CSV file
        df = pd.read_csv(path)
        
        # Create new DataFrame with only required columns
        processed_df = pd.DataFrame(columns=REQUIRED_COLS)
        
        # Copy over the required columns if they exist
        for col in REQUIRED_COLS:
            if col in df.columns:
                processed_df[col] = df[col]
            else:
                print(f"Warning: Missing required column '{col}' in {name}")
                processed_df[col] = None  # Add empty column if missing
        
        # Debug: Print initial row count
        initial_count = len(processed_df)
        print(f"Initial row count: {initial_count}")
        
        # Debug: Print raw label values before any processing
        print(f"Raw label values before processing:")
        print(processed_df['label'].value_counts(dropna=False))
        
        # Check for non-numeric values in labels
        non_numeric_mask = pd.to_numeric(processed_df['label'], errors='coerce').isna()
        non_numeric_labels = processed_df.loc[non_numeric_mask, 'label']
        if len(non_numeric_labels) > 0:
            print(f"\nFound {len(non_numeric_labels)} non-numeric labels:")
            print(non_numeric_labels.value_counts())
        
        # Convert label column to numeric, replacing non-numeric values with NaN
        processed_df['label'] = pd.to_numeric(processed_df['label'], errors='coerce')
        
        # Debug: Print unique label values after numeric conversion
        print(f"\nUnique label values after numeric conversion:")
        print(processed_df['label'].value_counts(dropna=False))
        
        # Remove rows where label is not 0 or 1
        valid_labels_mask = processed_df['label'].isin([0, 1])
        invalid_labels_mask = ~valid_labels_mask
        
        # Print details about invalid labels
        if invalid_labels_mask.any():
            print(f"\nFound {invalid_labels_mask.sum()} invalid numeric labels:")
            invalid_labels = processed_df.loc[invalid_labels_mask, 'label']
            print(invalid_labels.value_counts(dropna=False))
        
        # Remove invalid rows
        processed_df = processed_df[valid_labels_mask]
        
        # Debug: Print how many rows were removed
        removed_count = initial_count - len(processed_df)
        print(f"\nRemoved {removed_count} rows with invalid labels")
        print(f"Final row count: {len(processed_df)}")
        print(f"Final label distribution:")
        print(processed_df['label'].value_counts())
        
        # Add source dataset column
        processed_df['source'] = name.replace('.csv', '')
        
        # Save processed version
        output_name = name.replace('.csv', '_processed.csv')
        output_path = f'archive/{output_name}'
        processed_df.to_csv(output_path, index=False)
        print(f"Saved processed version to {output_path}")
        
        # Store processed dataframe for combining later
        processed_dfs.append(processed_df)
        
    except Exception as e:
        print(f"Error processing {name}: {str(e)}")

# Combine all processed datasets
if processed_dfs:
    print("\nCombining all processed datasets...")
    combined_df = pd.concat(processed_dfs, ignore_index=True)
    
    # Print statistics about combined dataset
    print(f"\nCombined dataset statistics:")
    print(f"Total rows: {len(combined_df)}")
    print(f"Label distribution:")
    print(combined_df['label'].value_counts())
    print(f"\nRows per source dataset:")
    print(combined_df['source'].value_counts())
    
    # Save combined dataset
    combined_df.to_csv('combined_dataset.csv', index=False)
    print(f"\nSaved combined dataset to combined_dataset.csv")
    
    # Create balanced dataset
    print("\nCreating balanced dataset...")
    
    # Get counts for each label
    label_counts = combined_df['label'].value_counts()
    min_count = label_counts.min()
    
    # Sample equal number of rows for each label
    balanced_dfs = []
    for label in [0, 1]:
        label_df = combined_df[combined_df['label'] == label]
        if len(label_df) > min_count:
            label_df = label_df.sample(n=min_count, random_state=42)
        balanced_dfs.append(label_df)
    
    # Combine balanced samples
    balanced_df = pd.concat(balanced_dfs, ignore_index=True)
    
    # Print statistics about balanced dataset
    print(f"\nBalanced dataset statistics:")
    print(f"Total rows: {len(balanced_df)}")
    print(f"Label distribution:")
    print(balanced_df['label'].value_counts())
    print(f"\nRows per source dataset:")
    print(balanced_df['source'].value_counts())
    
    # Save balanced dataset
    balanced_df.to_csv('balanced_dataset.csv', index=False)
    print(f"\nSaved balanced dataset to balanced_dataset.csv")
    
    # Create train-test split
    print("\nCreating train-test split...")
    train_df, test_df = train_test_split(
        balanced_df, 
        test_size=0.2,  # 20% for testing
        random_state=42,  # For reproducibility
        stratify=balanced_df['label']  # Maintain label distribution
    )
    
    # Print statistics about train-test split
    print(f"\nTrain dataset statistics:")
    print(f"Total rows: {len(train_df)}")
    print(f"Label distribution:")
    print(train_df['label'].value_counts())
    
    print(f"\nTest dataset statistics:")
    print(f"Total rows: {len(test_df)}")
    print(f"Label distribution:")
    print(test_df['label'].value_counts())
    
    # Save train and test datasets
    train_df.to_csv('train_dataset.csv', index=False)
    test_df.to_csv('test_dataset.csv', index=False)
    print(f"\nSaved train dataset to train_dataset.csv")
    print(f"\nSaved test dataset to test_dataset.csv")
else:
    print("\nNo datasets were processed successfully to combine")

print("\nProcessing complete!")
