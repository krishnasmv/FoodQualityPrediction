import os
import sys
import numpy as np
import pandas as pd
import dill
from sklearn.metrics import r2_score
from sklearn.model_selection import GridSearchCV

from src.exception import CustomException

def save_object(file_path, obj):
    try:
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)

        with open(file_path, 'wb') as f:
            dill.dump(obj, f)
    except Exception as e:
        raise CustomException(e, sys)

from sklearn.metrics import r2_score, accuracy_score

def evaluate_models(X_train,y_train,X_test,y_test,models,param, scoring='r2'):
    try:
       
       report = {}
       for i in range(len(list(models))):
            model = list(models.values())[i]
            parameters = param[list(models.keys())[i]]

            gridsearch = GridSearchCV(model,parameters, cv=3)
            gridsearch.fit(X_train,y_train)

            model.set_params(**gridsearch.best_params_)

            model.fit(X_train, y_train)
            y_train_pred = model.predict(X_train)
            y_test_pred = model.predict(X_test)
            if scoring == 'r2':
                train_model_score = r2_score(y_train, y_train_pred)
                test_model_score = r2_score(y_test, y_test_pred)
            elif scoring == 'accuracy':
                train_model_score = accuracy_score(y_train, y_train_pred)
                test_model_score = accuracy_score(y_test, y_test_pred)
            else:
                raise ValueError(f"Unsupported scoring method: {scoring}")
            report[list(models.keys())[i]] = test_model_score
       return report
    except Exception as e:
        raise CustomException(e, sys)
    
def load_object(file_path):
    try:
        with open(file_path, 'rb') as f:
            return dill.load(f)
    except Exception as e:
        raise CustomException(e, sys)