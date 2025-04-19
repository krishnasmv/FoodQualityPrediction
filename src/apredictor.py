import pickle
import os
import numpy as np
import pandas as pd
import dill  # Add this import

class BeverageQualityPredictor:
    def __init__(self, beverage_type='milk'):
        """
        Initialize the predictor for a specific beverage type

        Parameters:
        -----------
        beverage_type : str
            Type of beverage to predict ('milk', 'water', or 'wine')
        """
        self.beverage_type = beverage_type.lower()
        self.model = None
        self.preprocessor = None
        self.label_encoder = None

        # Load the appropriate model, preprocessor, and label encoder
        self._load_artifacts()

    def _load_artifacts(self):
        """Load the model, preprocessor, and label encoder for the specified beverage type"""
        artifact_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'artifact')

        if self.beverage_type == 'milk':
            model_path = os.path.join(artifact_dir, 'milk_model.pkl')
            preprocessor_path = os.path.join(artifact_dir, 'milk_preprocessor.pkl')
            label_encoder_path = os.path.join(artifact_dir, 'milk_label_encoder.pkl')
        elif self.beverage_type == 'water':
            model_path = os.path.join(artifact_dir, 'water_model.pkl')
            preprocessor_path = os.path.join(artifact_dir, 'water_preprocessor.pkl')
            label_encoder_path = os.path.join(artifact_dir, 'water_label_encoder.pkl')
        elif self.beverage_type == 'wine':
            model_path = os.path.join(artifact_dir, 'wine_model.pkl')
            preprocessor_path = os.path.join(artifact_dir, 'wine_preprocessor.pkl')
            label_encoder_path = os.path.join(artifact_dir, 'wine_label_encoder.pkl')
        else:
            raise ValueError(f"Unsupported beverage type: {self.beverage_type}")

        try:
            with open(model_path, 'rb') as f:
                # Use dill instead of pickle
                self.model = dill.load(f)

            with open(preprocessor_path, 'rb') as f:
                # Use dill instead of pickle
                self.preprocessor = dill.load(f)

            with open(label_encoder_path, 'rb') as f:
                # Use dill instead of pickle
                self.label_encoder = dill.load(f)

            print(f"Successfully loaded {self.beverage_type} quality prediction model")
        except Exception as e:
            print(f"Error loading model artifacts: {str(e)}")
            raise

    # Rest of the class remains the same
    def predict(self, features):
        """
        Predict the quality of the beverage based on input features

        Parameters:
        -----------
        features : dict
            Dictionary containing the feature values

        Returns:
        --------
        prediction : str or int
            Predicted quality class or score
        confidence : float
            Confidence score for the prediction (if available)
        """
        if self.model is None:
            raise ValueError("Model not loaded. Initialize the predictor first.")

        # Convert features to DataFrame
        features_df = pd.DataFrame([features])

        # Preprocess the features
        X_processed = self.preprocessor.transform(features_df)

        # Make prediction
        if hasattr(self.model, 'predict_proba'):
            # For classification models
            probabilities = self.model.predict_proba(X_processed)
            prediction_idx = np.argmax(probabilities, axis=1)[0]
            confidence = probabilities[0][prediction_idx]

            # Decode the prediction if it's a classification task
            if self.label_encoder is not None:
                prediction = self.label_encoder.inverse_transform([prediction_idx])[0]
            else:
                prediction = prediction_idx

            return prediction, confidence
        else:
            # For regression models (like wine quality)
            prediction = self.model.predict(X_processed)[0]

            # For wine, we might want to round to the nearest integer
            if self.beverage_type == 'wine':
                prediction = round(prediction)

            # For regression, we don't have a direct confidence measure
            # We could use a fixed value or calculate based on model metrics
            confidence = 0.85  # Default confidence

            return prediction, confidence

# For backward compatibility
class MilkQualityPredictor(BeverageQualityPredictor):
    def __init__(self):
        super().__init__(beverage_type='milk')

class WaterQualityPredictor(BeverageQualityPredictor):
    def __init__(self):
        super().__init__(beverage_type='water')

class WineQualityPredictor(BeverageQualityPredictor):
    def __init__(self):
        super().__init__(beverage_type='wine')