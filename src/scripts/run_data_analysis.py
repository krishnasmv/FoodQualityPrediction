from src.components.data_analysis import analyze_duplicates_and_leakage

if __name__ == "__main__":
    file_path = "Dataset/milk/synthetic_milkoutput_unique.csv"
    target_column = "Grade"

    report = analyze_duplicates_and_leakage(file_path, target_column)

    print("Data Analysis Report:")
    print(f"Number of duplicate rows: {report['num_duplicates']}")
    print(f"Number of near-duplicate rows with different target values: {report['num_near_duplicates']}")
    print(f"Features highly correlated with target (>|0.95|): {report['high_corr_features']}")
