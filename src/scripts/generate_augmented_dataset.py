import pandas as pd
import numpy as np

def generate_augmented_dataset(input_file: str, output_file: str, target_column: str, target_rows: int = 1000, noise_level: float = 0.1):
    df = pd.read_csv(input_file)

    # Extract unique rows
    unique_df = df.drop_duplicates()

    # Number of unique rows
    num_unique = unique_df.shape[0]

    if num_unique == 0:
        raise ValueError("No unique rows found in the dataset.")

    # Calculate how many times to replicate the unique rows
    reps = target_rows // num_unique
    remainder = target_rows % num_unique

    # Replicate unique rows
    replicated_df = pd.concat([unique_df] * reps, ignore_index=True) if reps > 0 else pd.DataFrame()

    # Add remainder rows
    if remainder > 0:
        if replicated_df.empty:
            replicated_df = unique_df.sample(n=remainder, random_state=42).reset_index(drop=True)
        else:
            replicated_df = pd.concat([replicated_df, unique_df.sample(n=remainder, random_state=42)], ignore_index=True)

    # Add small noise to numeric columns except target
    numeric_cols = replicated_df.select_dtypes(include=[np.number]).columns.tolist()
    if target_column in numeric_cols:
        numeric_cols.remove(target_column)

    for col in numeric_cols:
        noise = np.random.normal(0, noise_level * replicated_df[col].std(), size=replicated_df.shape[0])
        replicated_df[col] = replicated_df[col] + noise

    # Round numeric columns to reasonable decimals if needed (optional)
    replicated_df[numeric_cols] = replicated_df[numeric_cols].round(3)

    # Save augmented dataset
    replicated_df.to_csv(output_file, index=False)
    print(f"Augmented dataset saved to {output_file}")

if __name__ == "__main__":
    input_file = "Dataset/milk/milk.csv"
    output_file = "Dataset/milk/augmented_milk_dataset.csv"
    target_column = "Grade"
    generate_augmented_dataset(input_file, output_file, target_column)
