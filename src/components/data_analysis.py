import pandas as pd

def analyze_duplicates_and_leakage(file_path: str, target_column: str):
    df = pd.read_csv(file_path)
    analysis_report = {}

    # Check for duplicates
    duplicate_rows = df.duplicated()
    num_duplicates = duplicate_rows.sum()
    analysis_report['num_duplicates'] = num_duplicates

    # Check for near duplicates (rows with identical features but different target)
    feature_columns = [col for col in df.columns if col != target_column]
    duplicates_features = df.duplicated(subset=feature_columns, keep=False)
    near_duplicates = df[duplicates_features].groupby(feature_columns)[target_column].nunique()
    num_near_duplicates = (near_duplicates > 1).sum()
    analysis_report['num_near_duplicates'] = num_near_duplicates

    # Check for feature leakage: if any feature column is identical or highly correlated with target
    if pd.api.types.is_numeric_dtype(df[target_column]):
        correlations = df.corr(numeric_only=True)[target_column].drop(target_column)
        high_corr_features = correlations[correlations.abs() > 0.95].index.tolist()
        analysis_report['high_corr_features'] = high_corr_features
    else:
        analysis_report['high_corr_features'] = []
        analysis_report['note'] = "Target column is non-numeric; correlation check skipped."

    return analysis_report
