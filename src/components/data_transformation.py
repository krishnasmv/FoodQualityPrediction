from dataclasses import dataclass
import sys
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder, PolynomialFeatures

from src.exception import CustomException
from src.logger import logging
import os
from src.utils import save_object

@dataclass
class DataTransformationConfig:
    milk_preprocessor_ob_file_path = os.path.join('artifact', 'milk_preprocessor.pkl')
    milk_label_encoder_path = os.path.join('artifact', 'milk_label_encoder.pkl')
    wine_preprocessor_ob_file_path = os.path.join('artifact', 'wine_preprocessor.pkl')
    wine_label_encoder_path = os.path.join('artifact', 'wine_label_encoder.pkl')
    water_preprocessor_ob_file_path = os.path.join('artifact', 'water_preprocessor.pkl')
    water_label_encoder_path = os.path.join('artifact', 'water_label_encoder.pkl')

class DataTransformation:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def get_data_transformer_object(self):
        ''' This function returns a data transformer object for milk dataset'''
        try:
            numerical_columns = ['pH', 'Temprature', 'Colour', 'Taste', 'Odor', 'Fat', 'Turbidity']
            num_pipeline = Pipeline(
                steps=[
                    ('imputer', SimpleImputer(strategy="median")),
                    ('poly_features', PolynomialFeatures(degree=2, include_bias=False, interaction_only=False)),
                    ('scaler', StandardScaler())
                ])
            logging.info(f"Numerical columns for milk dataset: {numerical_columns}")
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

            train_df.columns = train_df.columns.str.strip()
            test_df.columns = test_df.columns.str.strip()

            logging.info(f"Train dataframe columns: {train_df.columns.tolist()}")
            logging.info(f"Test dataframe columns: {test_df.columns.tolist()}")

            preprocessor = self.get_data_transformer_object()
            target_column = "Grade"

            input_feature_train_df = train_df.drop(columns=[target_column], axis=1)
            target_feature_train_df = train_df[target_column]

            input_feature_test_df = test_df.drop(columns=[target_column], axis=1)
            target_feature_test_df = test_df[target_column]

            label_encoder = LabelEncoder()
            target_feature_train_df = label_encoder.fit_transform(target_feature_train_df)
            target_feature_test_df = label_encoder.transform(target_feature_test_df)

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
                file_path=self.data_transformation_config.milk_preprocessor_ob_file_path,
                obj=preprocessor
            )
            save_object(
                file_path=self.data_transformation_config.milk_label_encoder_path,
                obj=label_encoder
            )

            return (train_arr, test_arr, self.data_transformation_config.milk_preprocessor_ob_file_path)

        except Exception as e:
            raise CustomException(e, sys)

class DataTransformationWine:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def get_data_transformer_object(self):
        ''' This function returns a data transformer object for wine dataset'''
        try:
            numerical_columns = ['fixed acidity', 'volatile acidity', 'citric acid', 'residual sugar', 'chlorides',
                                 'free sulfur dioxide', 'total sulfur dioxide', 'density', 'pH', 'sulphates', 'alcohol']
            num_pipeline = Pipeline(
                steps=[
                    ('imputer', SimpleImputer(strategy="median")),
                    ('scaler', StandardScaler())
                ])
            logging.info(f"Numerical columns for wine dataset: {numerical_columns}")
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

            train_df.columns = train_df.columns.str.strip()
            test_df.columns = test_df.columns.str.strip()

            logging.info(f"Train dataframe columns: {train_df.columns.tolist()}")
            logging.info(f"Test dataframe columns: {test_df.columns.tolist()}")

            preprocessor = self.get_data_transformer_object()
            target_column = "quality"

            input_feature_train_df = train_df.drop(columns=[target_column], axis=1)
            target_feature_train_df = train_df[target_column]

            input_feature_test_df = test_df.drop(columns=[target_column], axis=1)
            target_feature_test_df = test_df[target_column]

            label_encoder = LabelEncoder()
            target_feature_train_df = label_encoder.fit_transform(target_feature_train_df)
            target_feature_test_df = label_encoder.transform(target_feature_test_df)

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
                file_path=self.data_transformation_config.wine_preprocessor_ob_file_path,
                obj=preprocessor
            )
            save_object(
                file_path=self.data_transformation_config.wine_label_encoder_path,
                obj=label_encoder
            )

            return (train_arr, test_arr, self.data_transformation_config.wine_preprocessor_ob_file_path)

        except Exception as e:
            raise CustomException(e, sys)

class DataTransformationWater:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def get_data_transformer_object(self):
        ''' This function returns a data transformer object for water dataset'''
        try:
            numerical_columns = ['ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate', 'Conductivity',
                                 'Organic_carbon', 'Trihalomethanes', 'Turbidity']
            num_pipeline = Pipeline(
                steps=[
                    ('imputer', SimpleImputer(strategy="median")),
                    ('scaler', StandardScaler())
                ])
            logging.info(f"Numerical columns for water dataset: {numerical_columns}")
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

            train_df.columns = train_df.columns.str.strip()
            test_df.columns = test_df.columns.str.strip()

            logging.info(f"Train dataframe columns: {train_df.columns.tolist()}")
            logging.info(f"Test dataframe columns: {test_df.columns.tolist()}")

            preprocessor = self.get_data_transformer_object()
            target_column = "Potability"

            input_feature_train_df = train_df.drop(columns=[target_column], axis=1)
            target_feature_train_df = train_df[target_column]

            input_feature_test_df = test_df.drop(columns=[target_column], axis=1)
            target_feature_test_df = test_df[target_column]

            label_encoder = LabelEncoder()
            target_feature_train_df = label_encoder.fit_transform(target_feature_train_df)
            target_feature_test_df = label_encoder.transform(target_feature_test_df)

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
                file_path=self.data_transformation_config.water_preprocessor_ob_file_path,
                obj=preprocessor
            )
            save_object(
                file_path=self.data_transformation_config.water_label_encoder_path,
                obj=label_encoder
            )

            return (train_arr, test_arr, self.data_transformation_config.water_preprocessor_ob_file_path)

        except Exception as e:
            raise CustomException(e, sys)
