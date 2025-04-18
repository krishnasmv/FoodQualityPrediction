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
            self.preprocessor_path = os.path.join('artifact', 'preprocessor.pkl')
        elif self.dataset_name == 'wine':
            self.model_path = os.path.join('artifact', 'wine_model.pkl')
            self.preprocessor_path = os.path.join('artifact', 'preprocessor.pkl')
        else:
            raise CustomException(f"Unsupported dataset: {self.dataset_name}", sys)

        self.model = load_object(self.model_path)
        self.preprocessor = load_object(self.preprocessor_path)

    def predict(self, input_data: dict):
        """
        input_data: dict of feature_name: value
        Returns predicted quality/class
        """
        try:
            # Convert input_data dict to DataFrame
            input_df = pd.DataFrame([input_data])

            # Preprocess input features
            input_processed = self.preprocessor.transform(input_df)

            # Predict
            prediction = self.model.predict(input_processed)

            return prediction[0]

        except Exception as e:
            raise CustomException(e, sys)
