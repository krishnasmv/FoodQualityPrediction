import os
import sys
import pandas as pd
from src.utils import load_object
from src.exception import CustomException
from src.logger import logging

class WinePredictor:
    def __init__(self):
        try:
            self.model_path = os.path.join('artifact', 'wine_model.pkl')
            self.preprocessor_path = os.path.join('artifact', 'wine_preprocessor.pkl')
            self.label_encoder_path = os.path.join('artifact', 'wine_label_encoder.pkl')

            self.model = load_object(self.model_path)
            self.preprocessor = load_object(self.preprocessor_path)
            self.label_encoder = load_object(self.label_encoder_path)
        except Exception as e:
            logging.error(f"Error loading model, preprocessor or label encoder: {e}")
            raise CustomException(e, sys)
    def predict(self, input_data: dict):
        """
        input_data: dict of feature_name: value
        Returns predicted quality label (good, medium, bad)
        """
        try:
            input_df = pd.DataFrame([input_data])
            logging.info(f"Input data for prediction: {input_df}")
            input_processed = self.preprocessor.transform(input_df)
            logging.info(f"Processed input data: {input_processed}")
            prediction = self.model.predict(input_processed)
            logging.info(f"Raw prediction output: {prediction}")
            # Convert prediction to int type before inverse_transform
            prediction_int = prediction.astype(int)
            quality_label = self.label_encoder.inverse_transform(prediction_int)[0]
            logging.info(f"Decoded quality label: {quality_label}")

            # Map quality to categories: >7 good, <5 bad, 5-7 average
            try:
                quality_value = float(quality_label)
                if quality_value > 7:
                    mapped_label = 'good'
                elif quality_value < 5:
                    mapped_label = 'bad'
                else:
                    mapped_label = 'average'
            except ValueError:
                mapped_label = quality_label  # fallback to original label if conversion fails

            logging.info(f"Mapped quality category: {mapped_label}")
            return mapped_label
        except Exception as e:
            logging.error(f"Error during prediction: {e}")
            raise CustomException(e, sys)
            raise CustomException(e, sys)
