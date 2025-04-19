import os
import sys
from dataclasses import dataclass
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier, AdaBoostClassifier, StackingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from catboost import CatBoostClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, f1_score
from src.exception import CustomException
from src.logger import logging
from src.utils import save_object

@dataclass
class ModelTrainerConfig:
    milk_trained_model_file_path = os.path.join("artifact","milk_model.pkl")
    wine_trained_model_file_path = os.path.join("artifact","wine_model.pkl")
    water_trained_model_file_path = os.path.join("artifact","water_model.pkl")

class ModelTrainer:
    def __init__(self, dataset_name='milk', max_iter=10, target_accuracy=0.85):
        self.dataset_name = dataset_name.lower()
        self.model_trainer_config = ModelTrainerConfig()
        self.max_iter = max_iter
        self.target_accuracy = target_accuracy

    def initiate_model_trainer(self, train_array, test_array):
        try:
            logging.info("Split training and test input data")
            X_train, y_train, X_test, y_test = (
                train_array[:,:-1],
                train_array[:,-1],
                test_array[:,:-1],
                test_array[:,-1],
            )

            if self.dataset_name == 'wine':
                base_estimators = [
                    ('rf', RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced')),
                    ('gb', GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, random_state=42)),
                    ('xgb', XGBClassifier(n_estimators=200, learning_rate=0.1, use_label_encoder=False, eval_metric='logloss', random_state=42)),
                    ('lr', LogisticRegression(max_iter=1000, class_weight='balanced')),
                    ('svc', SVC(probability=True, class_weight='balanced'))
                ]

                stacking_clf = StackingClassifier(
                    estimators=base_estimators,
                    final_estimator=LogisticRegression(),
                    cv=5,
                    n_jobs=-1
                )

                model = stacking_clf

                best_model = None
                best_score = 0
                best_model_name = "StackingClassifier"

                for i in range(self.max_iter):
                    logging.info(f"Training iteration {i+1}/{self.max_iter}")
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)
                    accuracy = accuracy_score(y_test, y_pred)
                    logging.info(f"Iteration {i+1} accuracy: {accuracy:.4f}")
                    if accuracy > best_score:
                        best_score = accuracy
                        best_model = model
                    if accuracy >= self.target_accuracy:
                        logging.info(f"Target accuracy {self.target_accuracy} reached at iteration {i+1}")
                        break

                if best_model is None:
                    raise CustomException("No best model found after training iterations", sys)

                y_pred = best_model.predict(X_test)
                test_accuracy = accuracy_score(y_test, y_pred)
                conf_matrix = confusion_matrix(y_test, y_pred)
                class_report = classification_report(y_test, y_pred)
                f1 = f1_score(y_test, y_pred, average='weighted')

                logging.info(f"Best model test accuracy: {test_accuracy:.4f}")
                logging.info(f"Confusion Matrix:\n{conf_matrix}")
                logging.info(f"Classification Report:\n{class_report}")
                logging.info(f"F1 Score: {f1:.4f}")

                model_path = self.model_trainer_config.wine_trained_model_file_path

                save_object(
                    file_path=model_path,
                    obj=best_model
                )

                return {
                    "model_name": best_model_name,
                    "test_accuracy": test_accuracy,
                    "confusion_matrix": conf_matrix,
                    "classification_report": class_report,
                    "f1_score": f1
                }

            elif self.dataset_name == 'water':
                # For water dataset, use similar approach as milk with hyperparameter tuning
                models = {
                    "LogisticRegression": LogisticRegression(max_iter=1000),
                    "DecisionTreeClassifier": DecisionTreeClassifier(),
                    "RandomForestClassifier": RandomForestClassifier(),
                    "ExtraTreesClassifier": ExtraTreesClassifier(),
                    "SVC": SVC(probability=True),
                    "KNeighborsClassifier": KNeighborsClassifier(),
                    "GradientBoostingClassifier": GradientBoostingClassifier(),
                    "AdaBoostClassifier": AdaBoostClassifier(),
                    "CatBoostClassifier": CatBoostClassifier(verbose=0)
                }

                param_grids = {
                    "LogisticRegression": {
                        'C': [0.01, 0.1, 1, 10],
                        'solver': ['lbfgs', 'liblinear']
                    },
                    "RandomForestClassifier": {
                        'n_estimators': [50, 100, 200],
                        'max_depth': [None, 10, 20, 30]
                    },
                    "ExtraTreesClassifier": {
                        'n_estimators': [50, 100, 200],
                        'max_depth': [None, 10, 20, 30]
                    },
                    "GradientBoostingClassifier": {
                        'n_estimators': [100, 200],
                        'learning_rate': [0.05, 0.1],
                        'max_depth': [3, 5]
                    },
                    "AdaBoostClassifier": {
                        'n_estimators': [50, 100, 200],
                        'learning_rate': [0.05, 0.1, 0.5]
                    },
                    "SVC": {
                        'C': [0.1, 1, 10],
                        'kernel': ['linear', 'rbf'],
                        'gamma': ['scale', 'auto']
                    },
                    "CatBoostClassifier": {
                        'iterations': [100, 200, 300],
                        'depth': [4, 6, 8],
                        'learning_rate': [0.01, 0.05, 0.1],
                        'l2_leaf_reg': [1, 3, 5]
                    }
                }

                best_model = None
                best_score = 0
                best_model_name = None

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

                model_path = self.model_trainer_config.water_trained_model_file_path

                save_object(
                    file_path=model_path,
                    obj=best_model
                )

                return {
                    "model_name": best_model_name,
                    "test_accuracy": test_accuracy,
                    "confusion_matrix": conf_matrix,
                    "classification_report": class_report,
                    "f1_score": f1
                }

            else:
                # For milk dataset, use previous approach with hyperparameter tuning
                models = {
                    "LogisticRegression": LogisticRegression(max_iter=1000),
                    "DecisionTreeClassifier": DecisionTreeClassifier(),
                    "RandomForestClassifier": RandomForestClassifier(),
                    "ExtraTreesClassifier": ExtraTreesClassifier(),
                    "SVC": SVC(probability=True),
                    "KNeighborsClassifier": KNeighborsClassifier(),
                    "GradientBoostingClassifier": GradientBoostingClassifier(),
                    "AdaBoostClassifier": AdaBoostClassifier(),
                    "CatBoostClassifier": CatBoostClassifier(verbose=0)
                }

                param_grids = {
                    "LogisticRegression": {
                        'C': [0.01, 0.1, 1, 10],
                        'solver': ['lbfgs', 'liblinear']
                    },
                    "RandomForestClassifier": {
                        'n_estimators': [50, 100, 200],
                        'max_depth': [None, 10, 20, 30]
                    },
                    "ExtraTreesClassifier": {
                        'n_estimators': [50, 100, 200],
                        'max_depth': [None, 10, 20, 30]
                    },
                    "GradientBoostingClassifier": {
                        'n_estimators': [100, 200],
                        'learning_rate': [0.05, 0.1],
                        'max_depth': [3, 5]
                    },
                    "AdaBoostClassifier": {
                        'n_estimators': [50, 100, 200],
                        'learning_rate': [0.05, 0.1, 0.5]
                    },
                    "SVC": {
                        'C': [0.1, 1, 10],
                        'kernel': ['linear', 'rbf'],
                        'gamma': ['scale', 'auto']
                    },
                    "CatBoostClassifier": {
                        'iterations': [100, 200, 300],
                        'depth': [4, 6, 8],
                        'learning_rate': [0.01, 0.05, 0.1],
                        'l2_leaf_reg': [1, 3, 5]
                    }
                }

                best_model = None
                best_score = 0
                best_model_name = None

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

                model_path = self.model_trainer_config.milk_trained_model_file_path

                save_object(
                    file_path=model_path,
                    obj=best_model
                )

                return {
                    "model_name": best_model_name,
                    "test_accuracy": test_accuracy,
                    "confusion_matrix": conf_matrix,
                    "classification_report": class_report,
                    "f1_score": f1
                }

        except Exception as e:
            raise CustomException(e, sys)
