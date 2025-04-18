import os
import sys
import numpy as np
import pandas as pd
from src.utils import load_object
from src.exception import CustomException

class Predictor:
    def __init__(self, dataset_name='milk'):
        self.dataset_name = dataset_name.lower()
        if self.dataset_name == 'milk':
            self.model_path = os.path.join('artifact', 'milk_model.pkl')
            self.preprocessor_path = os.path.join('artifact', 'milk_preprocessor.pkl')
            self.quality_mapping = {0: 'bad', 1: 'medium', 2: 'good'}
        elif self.dataset_name == 'wine':
            self.model_path = os.path.join('artifact', 'wine_model.pkl')
            self.preprocessor_path = os.path.join('artifact', 'wine_preprocessor.pkl')
            self.quality_mapping = {0: 'bad', 1: 'medium', 2: 'good'}
        elif self.dataset_name == 'water':
            self.model_path = os.path.join('artifact', 'water_model.pkl')
            self.preprocessor_path = os.path.join('artifact', 'water_preprocessor.pkl')
            self.quality_mapping = {0: 'bad', 1: 'good'}  # Assuming water quality is binary
        else:
            raise CustomException(f"Unsupported dataset: {self.dataset_name}", sys)

        self.model = load_object(self.model_path)
        self.preprocessor = load_object(self.preprocessor_path)

    def predict(self, input_data: dict):
        """
        input_data: dict of feature_name: value
        Returns predicted quality label (good, medium, bad)
        """
        try:
            # Convert input_data dict to DataFrame
            input_df = pd.DataFrame([input_data])

            # Preprocess input features
            input_processed = self.preprocessor.transform(input_df)

            # Predict
            prediction = self.model.predict(input_processed)

            # Map prediction to quality label
            quality_label = self.quality_mapping.get(prediction[0], "Unknown")

            return quality_label

        except Exception as e:
            raise CustomException(e, sys)
