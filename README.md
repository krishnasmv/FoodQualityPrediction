# 🧪 Food Quality Prediction

This project predicts the **quality of liquid food items** (Milk, Water, and Wine) using physical and chemical parameters. It is designed to assist **Food Science, Quality Assurance**, and **R&D teams** in quickly identifying low-quality products, both in **batch mode** and **real-time** using scalable machine learning pipelines.

---

## 📁 Datasets

All datasets were sourced from **Kaggle** and are in **CSV format**.

| Dataset       | Key Features | Target Variable |
|---------------|--------------|------------------|
| Milk Quality  | pH, Fat, Temperature, Odor, Color | Grade (High, Medium, Low) |
| Water Quality | pH, Solids, Hardness, Chlorine, Turbidity | Quality (Safe/Unsafe) |
| Wine Quality  | Alcohol, pH, Sugar, Acidity, Sulphates | Quality Score (0–10) |

---

## 📊 Features

- **Data Preprocessing & Cleaning**  
  Null handling, normalization, class balancing.

- **EDA (Exploratory Data Analysis)**  
  Feature correlation, distributions, and outlier analysis.

- **Model Training & Comparison**  
  Models used:
  - Logistic Regression
  - Random Forest
  - Extra Trees
  - Gradient Boosting
  - AdaBoost
  - SVM
  - CatBoost

- **Hyperparameter Tuning**  
  Grid search applied to optimize performance.

- **UI & Cloud Deployment**  
  Web-based interface for real-time predictions, hosted on **Render**.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/krishnasmv/FoodQualityPrediction.git
cd FoodQualityPrediction


## Deployment on Render.com

This project can be deployed on Render.com, a free hosting platform for web services.

### Steps to Deploy

1. Create a free account on [Render.com](https://render.com).

2. Connect your GitHub repository containing this project to Render.

3. Create a new Web Service on Render:
   - Select your repository.
   - Set the build command to:
     ```
     pip install -r requirements.txt
     ```
   - Set the start command to:
     ```
     python app.py # To run the Flask app (or)

     python app.py --cli # To run the command-line interface
     ```
   - Choose the environment as Python 3.

4. Render will automatically build and deploy your app.

5. Once deployed, Render will provide a public URL where your app is accessible.

### Notes

- The Flask app listens on the port provided by the environment variable `PORT`, which is compatible with Render's requirements.
- Ensure your model artifacts and other necessary files are included in the repository or accessible by the app.
- You can monitor logs and redeploy from the Render dashboard.

This setup allows you to host your FoodQualityPrediction Flask app for free on Render.com.
