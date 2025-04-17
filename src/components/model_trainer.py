import os
import sys
from dataclasses import dataclass

from catboost import CatBoostClassifier
from sklearn.ensemble import (
    AdaBoostClassifier,
    GradientBoostingClassifier,
    RandomForestClassifier,
    ExtraTreesClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, f1_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score, GridSearchCV
import warnings
import numpy as np
import pandas as pd

from src.exception import CustomException
from src.logger import logging

from src.utils import save_object


@dataclass
class ModelTrainerConfig:
    trained_model_file_path = os.path.join("artifact","model.pkl")

class ModelTrainer:
    def __init__(self):
        self.model_trainer_config = ModelTrainerConfig()

    def initiate_model_trainer(self, train_array, test_array):
        try:
            logging.info("Split training and test input data")
            X_train, y_train, X_test, y_test = (
                train_array[:,:-1],
                train_array[:,-1],
                test_array[:,:-1],
                test_array[:,-1],
            )

            # Define models to evaluate (excluding MultinomialNB due to negative value issue)
            models = {
                "LogisticRegression": LogisticRegression(max_iter=1000),
                "DecisionTreeClassifier": DecisionTreeClassifier(),
                "RandomForestClassifier": RandomForestClassifier(),
                "ExtraTreesClassifier": ExtraTreesClassifier(),
                "SVC": SVC(),
                "KNeighborsClassifier": KNeighborsClassifier(),
                "GradientBoostingClassifier": GradientBoostingClassifier(),
                "AdaBoostClassifier": AdaBoostClassifier(),
                "CatBoostClassifier": CatBoostClassifier(verbose=0)
            }

            warnings.filterwarnings('ignore')

            best_model = None
            best_score = 0
            best_model_name = None

            # Hyperparameter grids for some models
            param_grids = {
                "LogisticRegression": {
                    'C': [0.01, 0.1, 1, 10],
                    'solver': ['lbfgs', 'liblinear']
                },
                "RandomForestClassifier": {
                    'n_estimators': [50, 100],
                    'max_depth': [None, 10, 20]
                },
                "CatBoostClassifier": {
                    'iterations': [100, 200],
                    'depth': [4, 6],
                    'learning_rate': [0.01, 0.1]
                }
            }

            for model_name, model in models.items():
                logging.info(f"Evaluating model: {model_name}")
                try:
                    if model_name in param_grids:
                        grid = GridSearchCV(model, param_grids[model_name], cv=3, scoring='accuracy', n_jobs=-1)
                        grid.fit(X_train, y_train)
                        mean_accuracy = grid.best_score_
                        best_estimator = grid.best_estimator_
                        logging.info(f"Best params for {model_name}: {grid.best_params_}")
                    else:
                        accuracies = cross_val_score(model, X_train, y_train, scoring='accuracy', cv=5)
                        mean_accuracy = accuracies.mean()
                        best_estimator = model
                        best_estimator.fit(X_train, y_train)

                    logging.info(f"Cross-validation accuracy for {model_name}: {mean_accuracy:.4f}")

                    if mean_accuracy > best_score:
                        best_score = mean_accuracy
                        best_model = best_estimator
                        best_model_name = model_name

                except Exception as e:
                    logging.error(f"Model {model_name} failed during evaluation: {e}")

            if best_model is None:
                raise CustomException("No best model found after evaluation", sys)

            logging.info(f"Best model selected: {best_model_name} with accuracy: {best_score:.4f}")

            # Predict on test data
            y_pred = best_model.predict(X_test)

            # Calculate evaluation metrics
            test_accuracy = accuracy_score(y_test, y_pred)
            conf_matrix = confusion_matrix(y_test, y_pred)
            class_report = classification_report(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='weighted')

            logging.info(f"Test accuracy of best model {best_model_name}: {test_accuracy:.4f}")
            logging.info(f"Confusion Matrix:\n{conf_matrix}")
            logging.info(f"Classification Report:\n{class_report}")
            logging.info(f"F1 Score: {f1:.4f}")

            # Save the trained model
            save_object(
                file_path=self.model_trainer_config.trained_model_file_path,
                obj=best_model
            )

            # Return a dictionary of evaluation metrics
            return {
                "model_name": best_model_name,
                "test_accuracy": test_accuracy,
                "confusion_matrix": conf_matrix,
                "classification_report": class_report,
                "f1_score": f1
            }

        except Exception as e:
            raise CustomException(e, sys)
