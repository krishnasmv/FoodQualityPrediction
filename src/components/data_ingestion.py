import os
import sys
import time
from src.logger import logging
from src.exception import CustomException

import pandas as pd
from sklearn.model_selection import train_test_split
from dataclasses import dataclass

from src.components.data_transformation import DataTransformation, DataTransformationWine, DataTransformationWater
from src.components.model_trainer import ModelTrainer

@dataclass
class DataIngestionConfig:
    """This class contains configuration related to data ingestion"""
    milk_train_data_path: str = os.path.join('src', 'milk', 'train_data.csv')
    milk_test_data_path: str = os.path.join('src', 'milk', 'test_data.csv')
    milk_raw_data_path: str = os.path.join('src', 'milk', 'raw_data.csv')

    wine_train_data_path: str = os.path.join('src', 'wine', 'train_data.csv')
    wine_test_data_path: str = os.path.join('src', 'wine', 'test_data.csv')
    wine_raw_data_path: str = os.path.join('src', 'wine', 'raw_data.csv')

    water_train_data_path: str = os.path.join('src', 'water', 'train_data.csv')
    water_test_data_path: str = os.path.join('src', 'water', 'test_data.csv')
    water_raw_data_path: str = os.path.join('src', 'water', 'raw_data.csv')

class DataIngestion:
    def __init__(self, dataset_name='milk'):
        self.data_ingestion_config = DataIngestionConfig()
        self.dataset_name = dataset_name.lower()
    
    def initiate_data_ingestion(self):
        """This function initiates data ingestion process"""
        logging.info("Entered the data ingestion method or component")
        try:
            # Determine dataset file path and output paths based on dataset_name
            if self.dataset_name == 'milk':
                dataset_path = 'Dataset/milk/milk.csv'
                train_path = self.data_ingestion_config.milk_train_data_path
                test_path = self.data_ingestion_config.milk_test_data_path
                raw_path = self.data_ingestion_config.milk_raw_data_path
            elif self.dataset_name == 'wine':
                dataset_path = 'Dataset/wine/wine.csv'
                train_path = self.data_ingestion_config.wine_train_data_path
                test_path = self.data_ingestion_config.wine_test_data_path
                raw_path = self.data_ingestion_config.wine_raw_data_path
            elif self.dataset_name == 'water':
                dataset_path = 'Dataset/water/water.csv'
                train_path = self.data_ingestion_config.water_train_data_path
                test_path = self.data_ingestion_config.water_test_data_path
                raw_path = self.data_ingestion_config.water_raw_data_path
            else:
                raise CustomException(f"Unsupported dataset: {self.dataset_name}", sys)

            # Check if train and test data files already exist
            if os.path.exists(train_path) and os.path.exists(test_path):
                logging.info("Train and test data files already exist. Skipping data split.")
                return train_path, test_path, 0.0

            start_time = time.time()
            df = pd.read_csv(dataset_path)
            logging.info(f"Dataset {self.dataset_name} loaded as dataframe")

            os.makedirs(os.path.dirname(train_path), exist_ok=True)

            # Save raw data in dataset-specific folder
            df.to_csv(raw_path, index=False, header=True)
            logging.info(f"Raw data saved at {raw_path}")

            # Split train test
            train_set, test_set = train_test_split(df, test_size=0.2, random_state=42)

            # Save train and test sets in dataset-specific folder
            train_set.to_csv(train_path, index=False, header=True)
            test_set.to_csv(test_path, index=False, header=True)

            logging.info(f"Train data saved at {train_path}")
            logging.info(f"Test data saved at {test_path}")

            end_time = time.time()
            elapsed_time = end_time - start_time
            logging.info(f"Data ingestion completed in {elapsed_time:.2f} seconds")

            return train_path, test_path, elapsed_time

        except Exception as e:
            raise CustomException(e, sys)

if __name__ == "__main__":
    print("Select dataset to run prediction:")
    print("1. Milk")
    print("2. Wine")
    print("3. Water")
    choice = input("Enter choice (1, 2 or 3): ").strip()

    if choice == '1':
        dataset_name = 'milk'
    elif choice == '2':
        dataset_name = 'wine'
    elif choice == '3':
        dataset_name = 'water'
    else:
        print("Invalid choice. Defaulting to milk dataset.")
        dataset_name = 'milk'

    obj = DataIngestion(dataset_name=dataset_name)
    train_data, test_data, elapsed_time = obj.initiate_data_ingestion()
    print(f"Data ingestion completed successfully for {dataset_name} dataset.")
    print(f"Train data path: {train_data}")
    print(f"Test data path: {test_data}")
    print(f"Elapsed time: {elapsed_time:.2f} seconds")

    # Run data transformation based on dataset
    if dataset_name == 'milk':
        data_transformation = DataTransformation()
    elif dataset_name == 'wine':
        data_transformation = DataTransformationWine()
    else:
        data_transformation = DataTransformationWater()

    train_arr, test_arr, _ = data_transformation.initiate_data_transformation(train_data, test_data)
    logging.info("Data transformation completed")

    # Run model training
    model_trainer = ModelTrainer(dataset_name=dataset_name)
    metrics = model_trainer.initiate_model_trainer(train_arr, test_arr)
    logging.info(f"Model training completed with accuracy: {metrics['test_accuracy']:.4f}")
    print(f"Best model: {metrics['model_name']}")
    print(f"Test accuracy: {metrics['test_accuracy']:.4f}")
    print(f"F1 score: {metrics['f1_score']:.4f}")
    print("Classification report:")
    print(metrics['classification_report'])
