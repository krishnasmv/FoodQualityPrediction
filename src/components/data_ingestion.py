import os
import sys
import time
from src.logger import logging
from src.exception import CustomException

import pandas as pd
from sklearn.model_selection import train_test_split
from dataclasses import dataclass

from src.components.data_transformation import DataTransformation
from src.components.model_trainer import ModelTrainer

@dataclass
class DataIngestionConfig:
    """This class contains configuration related to data ingestion"""
    train_data_path: str = os.path.join('src', 'train_data.csv')
    test_data_path: str = os.path.join('src', 'test_data.csv')
    raw_data_path: str = os.path.join('src', 'raw_data.csv')

class DataIngestion:
    def __init__(self):
        self.data_ingestion_config = DataIngestionConfig()
    
    def initiate_data_ingestion(self):
        """This function initiates data ingestion process"""
        logging.info("Entered the data ingestion method or component")
        try:
            # Check if train and test data files already exist
            if os.path.exists(self.data_ingestion_config.train_data_path) and os.path.exists(self.data_ingestion_config.test_data_path):
                logging.info("Train and test data files already exist. Skipping data split.")
                return self.data_ingestion_config.train_data_path, self.data_ingestion_config.test_data_path, 0.0

            start_time = time.time()
            df = pd.read_csv('Dataset/milk.csv')
            logging.info("Dataset loaded as dataframe")

            os.makedirs(os.path.dirname(self.data_ingestion_config.train_data_path), exist_ok=True)

            # Save raw data in src/ folder
            df.to_csv(self.data_ingestion_config.raw_data_path, index=False, header=True)
            logging.info(f"Raw data saved at {self.data_ingestion_config.raw_data_path}")

            # Split train test
            train_set, test_set = train_test_split(df, test_size=0.2, random_state=42)

            # Save train and test sets in src/ folder
            train_set.to_csv(self.data_ingestion_config.train_data_path, index=False, header=True)
            test_set.to_csv(self.data_ingestion_config.test_data_path, index=False, header=True)

            logging.info(f"Train data saved at {self.data_ingestion_config.train_data_path}")
            logging.info(f"Test data saved at {self.data_ingestion_config.test_data_path}")

            end_time = time.time()
            elapsed_time = end_time - start_time
            logging.info(f"Data ingestion completed in {elapsed_time:.2f} seconds")

            return self.data_ingestion_config.train_data_path, self.data_ingestion_config.test_data_path, elapsed_time

        except Exception as e:
            raise CustomException(e, sys)

if __name__ == "__main__":
    obj = DataIngestion()
    train_data, test_data, elapsed_time = obj.initiate_data_ingestion()
    print(f"Data ingestion completed successfully.")
    print(f"Train data path: {train_data}")
    print(f"Test data path: {test_data}")
    print(f"Elapsed time: {elapsed_time:.2f} seconds")

    # Run data transformation
    data_transformation = DataTransformation()
    train_arr, test_arr, _ = data_transformation.initiate_data_transformation(train_data, test_data)
    logging.info("Data transformation completed")

    # Run model training
    model_trainer = ModelTrainer()
    metrics = model_trainer.initiate_model_trainer(train_arr, test_arr)
    logging.info(f"Model training completed with accuracy: {metrics['test_accuracy']:.4f}")
    print(f"Best model: {metrics['model_name']}")
    print(f"Test accuracy: {metrics['test_accuracy']:.4f}")
    print(f"F1 score: {metrics['f1_score']:.4f}")
    print("Classification report:")
    print(metrics['classification_report'])
