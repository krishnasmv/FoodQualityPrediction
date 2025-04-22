from flask import Flask, render_template, request, jsonify
import os
import sys
from src.pipeline.predict_pipeline import Predictor
from src.pipeline.water_predict_pipeline import WaterPredictor

app = Flask(__name__)

# Initialize predictors
milk_predictor = Predictor(dataset_name='milk')
water_predictor = WaterPredictor()
wine_predictor = Predictor(dataset_name='wine')

@app.route('/')
def index():
    """Render the landing page"""
    return render_template('index.html')

@app.route('/milk')
def milk():
    """Render the milk quality prediction page"""
    return render_template('milk.html')

@app.route('/water')
def water():
    """Render the water quality prediction page"""
    return render_template('water.html')

@app.route('/wine')
def wine():
    """Render the wine quality prediction page"""
    return render_template('wine.html')

@app.route('/api/predict', methods=['POST'])
def predict_milk():
    """API endpoint for milk quality prediction"""
    try:
        data = request.json
        features = {
            'pH': float(data['pH']),
            'Temprature': float(data['temperature']),
            'Taste': int(data['taste']),
            'Odor': int(data['odor']),
            'Fat': int(data['fat']),
            'Turbidity': int(data['turbidity']),
            'Colour': float(data['colour'])
        }

        prediction = milk_predictor.predict(features)

        return jsonify({
            'status': 'success',
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/predict_water', methods=['POST'])
def predict_water():
    """API endpoint for water quality prediction"""
    try:
        data = request.json
        print("Received data for water prediction:", data)
        features = {
            'ph': float(data['ph']),
            'Hardness': float(data['hardness']),
            'Solids': float(data['solids']),
            'Chloramines': float(data['chloramines']),
            'Sulfate': float(data['sulfate']),
            'Conductivity': float(data['conductivity']),
            'Organic_carbon': float(data['organic_carbon']),
            'Trihalomethanes': float(data['trihalomethanes']),
            'Turbidity': float(data['turbidity'])
        }
        print("Features prepared for prediction:", features)

        prediction = water_predictor.predict(features)
        print("Prediction result:", prediction)

        return jsonify({
            'status': 'success',
            'prediction': prediction
        })
    except Exception as e:
        print("Error during water prediction:", e)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/predict_wine', methods=['POST'])
def predict_wine():
    """API endpoint for wine quality prediction"""
    try:
        data = request.json
        features = {
            'fixed acidity': float(data['fixed_acidity']),
            'volatile acidity': float(data['volatile_acidity']),
            'citric acid': float(data['citric_acid']),
            'residual sugar': float(data['residual_sugar']),
            'chlorides': float(data['chlorides']),
            'free sulfur dioxide': float(data['free_sulfur_dioxide']),
            'total sulfur dioxide': float(data['total_sulfur_dioxide']),
            'density': float(data['density']),
            'pH': float(data['ph']),
            'sulphates': float(data['sulphates']),
            'alcohol': float(data['alcohol'])
        }

        prediction = wine_predictor.predict(features)

        return jsonify({
            'status': 'success',
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    return render_template('500.html'), 500

def get_user_input(features):
    input_data = {}
    print("Please enter the following features:")
    for feature in features:
        value = input(f"{feature}: ")
        try:
            value = float(value)
        except ValueError:
            pass
        input_data[feature] = value
    return input_data

def cli_main():
    print("Select the dataset to predict quality for:")
    print("1. Milk")
    print("2. Wine")
    print("3. Water")
    choice = input("Enter choice (1/2/3): ").strip()

    if choice == '1':
        dataset_name = 'milk'
        features = ['pH', 'Temprature', 'Colour', 'Taste', 'Odor', 'Fat', 'Turbidity']
    elif choice == '2':
        dataset_name = 'wine'
        features = ['fixed acidity', 'volatile acidity', 'citric acid', 'residual sugar', 'chlorides',
                    'free sulfur dioxide', 'total sulfur dioxide', 'density', 'pH', 'sulphates', 'alcohol']
    elif choice == '3':
        dataset_name = 'water'
        features = ['ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate', 'Conductivity',
                    'Organic_carbon', 'Trihalomethanes', 'Turbidity']
    else:
        print("Invalid choice. Exiting.")
        return

    input_data = get_user_input(features)

    predictor = Predictor(dataset_name=dataset_name)
    prediction = predictor.predict(input_data)

    print(f"Predicted quality for {dataset_name} dataset: {prediction}")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--cli':
        cli_main()
    else:
        # Get port from environment variable or use 5000 as default
        port = int(os.environ.get('PORT', 5005))

        # Set debug mode based on environment
        debug = os.environ.get('FLASK_ENV', 'development') == 'development'

        app.run(host='0.0.0.0', port=port, debug=debug)
