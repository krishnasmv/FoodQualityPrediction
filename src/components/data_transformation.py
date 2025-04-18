import sys
from dataclasses import dataclass
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder

from src.exception import CustomException
from src.logger import logging
import os
from src.utils import save_object

@dataclass
class DataTransformationConfig:
    preprocessor_ob_file_path = os.path.join('artifact', 'preprocessor.pkl')
    label_encoder_path = os.path.join('artifact', 'label_encoder.pkl')

class DataTransformation:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def get_data_transformer_object(self):
        ''' This function returns a data transformer object'''
        try:
            numerical_columns = ['pH', 'Temprature', 'Colour', 'Taste', 'Odor', 'Fat', 'Turbidity']
            categorical_columns = []

            num_pipeline = Pipeline(
                steps=[
                    ('imputer', SimpleImputer(strategy="median")),
                    ('scaler', StandardScaler())
                ])
            logging.info(f"Numerical columns: {numerical_columns}")
            logging.info(f"Categorical columns: {categorical_columns}")

            preprocessor = ColumnTransformer(
                [
                    ("num_pipeline", num_pipeline, numerical_columns)
                ])
            return preprocessor
            
        except Exception as e:
            raise CustomException(e, sys)
        
    def initiate_data_transformation(self, train_path, test_path):
        try:
            train_df = pd.read_csv(train_path)
            test_df = pd.read_csv(test_path)

            # Strip whitespace from column names
            train_df.columns = train_df.columns.str.strip()
            test_df.columns = test_df.columns.str.strip()

            logging.info(f"Train dataframe columns: {[repr(col) for col in train_df.columns.tolist()]}")
            logging.info(f"Test dataframe columns: {[repr(col) for col in test_df.columns.tolist()]}")
            
            print("Train dataframe columns:", train_df.columns.tolist())
            print("Test dataframe columns:", test_df.columns.tolist())

            logging.info("read train and test data completed")
            logging.info("Obtaining preprocessing object")
            preprocessor = self.get_data_transformer_object()
            logging.info("Preprocessing object obtained")
            target_column = "Grade"

            input_feature_train_df = train_df.drop(columns=[target_column], axis=1)
            target_feature_train_df = train_df[target_column]

            input_feature_test_df = test_df.drop(columns=[target_column], axis=1)
            target_feature_test_df = test_df[target_column]

            # Encode target labels
            label_encoder = LabelEncoder()
            target_feature_train_df = label_encoder.fit_transform(target_feature_train_df)
            target_feature_test_df = label_encoder.transform(target_feature_test_df)

            logging.info(f"Applying Preprocessing object on training dataframe and test dataframe")
            input_feature_train_arr = preprocessor.fit_transform(input_feature_train_df)
            input_feature_test_arr = preprocessor.transform(input_feature_test_df)

            train_arr = np.c_[
                input_feature_train_arr, np.array(target_feature_train_df)
            ]
            test_arr = np.c_[
                input_feature_test_arr, np.array(target_feature_test_df)
            ]
            logging.info(f"Preprocessing completed")

            save_object(
                file_path=self.data_transformation_config.preprocessor_ob_file_path,
                obj=preprocessor
            )
            save_object(
                file_path=self.data_transformation_config.label_encoder_path,
                obj=label_encoder
            )


            return (train_arr, test_arr, self.data_transformation_config.preprocessor_ob_file_path)

        except Exception as e:
            raise CustomException(e, sys)

class DataTransformationWine:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def get_data_transformer_object(self):
        ''' This function returns a data transformer object for wine dataset'''
        try:
            # Use all numerical features except 'Id' and target 'quality'
            numerical_columns = ['fixed acidity', 'volatile acidity', 'citric acid', 'residual sugar', 'chlorides',
                                 'free sulfur dioxide', 'total sulfur dioxide', 'density', 'pH', 'sulphates', 'alcohol']
            categorical_columns = []

            num_pipeline = Pipeline(
                steps=[
                    ('imputer', SimpleImputer(strategy="median")),
                    ('scaler', StandardScaler())
                ])
            logging.info(f"Wine numerical columns: {numerical_columns}")
            logging.info(f"Wine categorical columns: {categorical_columns}")

            preprocessor = ColumnTransformer(
                [
                    ("num_pipeline", num_pipeline, numerical_columns)
                ])
            return preprocessor
            
        except Exception as e:
            raise CustomException(e, sys)
        
    def initiate_data_transformation(self, train_path, test_path):
        try:
            train_df = pd.read_csv(train_path)
            test_df = pd.read_csv(test_path)

            # Strip whitespace from column names
            train_df.columns = train_df.columns.str.strip()
            test_df.columns = test_df.columns.str.strip()

            logging.info(f"Wine train dataframe columns: {[repr(col) for col in train_df.columns.tolist()]}")
            logging.info(f"Wine test dataframe columns: {[repr(col) for col in test_df.columns.tolist()]}")
            
            print("Wine train dataframe columns:", train_df.columns.tolist())
            print("Wine test dataframe columns:", test_df.columns.tolist())

            logging.info("read wine train and test data completed")
            logging.info("Obtaining wine preprocessing object")
            preprocessor = self.get_data_transformer_object()
            logging.info("Wine preprocessing object obtained")
            target_column = "quality"

            input_feature_train_df = train_df.drop(columns=[target_column, 'Id'], axis=1)
            target_feature_train_df = train_df[target_column]

            input_feature_test_df = test_df.drop(columns=[target_column, 'Id'], axis=1)
            target_feature_test_df = test_df[target_column]

            # Encode target labels
            label_encoder = LabelEncoder()
            target_feature_train_df = label_encoder.fit_transform(target_feature_train_df)
            target_feature_test_df = label_encoder.transform(target_feature_test_df)

            logging.info(f"Applying Wine Preprocessing object on training dataframe and test dataframe")
            input_feature_train_arr = preprocessor.fit_transform(input_feature_train_df)
            input_feature_test_arr = preprocessor.transform(input_feature_test_df)

            train_arr = np.c_[
                input_feature_train_arr, np.array(target_feature_train_df)
            ]
            test_arr = np.c_[
                input_feature_test_arr, np.array(target_feature_test_df)
            ]
            logging.info(f"Wine preprocessing completed")

            save_object(
                file_path=self.data_transformation_config.preprocessor_ob_file_path,
                obj=preprocessor
            )
            save_object(
                file_path=self.data_transformation_config.label_encoder_path,
                obj=label_encoder
            )


            return (train_arr, test_arr, self.data_transformation_config.preprocessor_ob_file_path)

        except Exception as e:
            raise CustomException(e, sys)

class DataTransformationWater:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()

    def get_data_transformer_object(self):
        ''' This function returns a data transformer object for water dataset'''
        try:
            # Assuming water dataset has these numerical features; adjust as per actual dataset
            numerical_columns = ['ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate', 'Conductivity', 'Organic_carbon', 'Trihalomethanes', 'Turbidity']
            categorical_columns = []

            num_pipeline = Pipeline(
                steps=[
                    ('imputer', SimpleImputer(strategy="median")),
                    ('scaler', StandardScaler())
                ])
            logging.info(f"Water numerical columns: {numerical_columns}")
            logging.info(f"Water categorical columns: {categorical_columns}")

            preprocessor = ColumnTransformer(
                [
                    ("num_pipeline", num_pipeline, numerical_columns)
                ])
            return preprocessor

        except Exception as e:
            raise CustomException(e, sys)

    def initiate_data_transformation(self, train_path, test_path):
        try:
            train_df = pd.read_csv(train_path)
            test_df = pd.read_csv(test_path)

            # Strip whitespace from column names
            train_df.columns = train_df.columns.str.strip()
            test_df.columns = test_df.columns.str.strip()

            logging.info(f"Water train dataframe columns: {[repr(col) for col in train_df.columns.tolist()]}")
            logging.info(f"Water test dataframe columns: {[repr(col) for col in test_df.columns.tolist()]}")

            print("Water train dataframe columns:", train_df.columns.tolist())
            print("Water test dataframe columns:", test_df.columns.tolist())

            logging.info("read water train and test data completed")
            logging.info("Obtaining water preprocessing object")
            preprocessor = self.get_data_transformer_object()
            logging.info("Water preprocessing object obtained")
            target_column = "Potability"

            input_feature_train_df = train_df.drop(columns=[target_column], axis=1)
            target_feature_train_df = train_df[target_column]

            input_feature_test_df = test_df.drop(columns=[target_column], axis=1)
            target_feature_test_df = test_df[target_column]

            # Encode target labels
            label_encoder = LabelEncoder()
            target_feature_train_df = label_encoder.fit_transform(target_feature_train_df)
            target_feature_test_df = label_encoder.transform(target_feature_test_df)

            logging.info(f"Applying Water Preprocessing object on training dataframe and test dataframe")
            input_feature_train_arr = preprocessor.fit_transform(input_feature_train_df)
            input_feature_test_arr = preprocessor.transform(input_feature_test_df)

            train_arr = np.c_[
                input_feature_train_arr, np.array(target_feature_train_df)
            ]
            test_arr = np.c_[
                input_feature_test_arr, np.array(target_feature_test_df)
            ]
            logging.info(f"Water preprocessing completed")

            save_object(
                file_path=self.data_transformation_config.preprocessor_ob_file_path,
                obj=preprocessor
            )
            save_object(
                file_path=self.data_transformation_config.label_encoder_path,
                obj=label_encoder
            )

            return (train_arr, test_arr, self.data_transformation_config.preprocessor_ob_file_path)

        except Exception as e:
            raise CustomException(e, sys)
