# FoodQualityPrediction

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
     python app.py
     ```
   - Choose the environment as Python 3.

4. Render will automatically build and deploy your app.

5. Once deployed, Render will provide a public URL where your app is accessible.

### Notes

- The Flask app listens on the port provided by the environment variable `PORT`, which is compatible with Render's requirements.
- Ensure your model artifacts and other necessary files are included in the repository or accessible by the app.
- You can monitor logs and redeploy from the Render dashboard.

This setup allows you to host your FoodQualityPrediction Flask app for free on Render.com.
