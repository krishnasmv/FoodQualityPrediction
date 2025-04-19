from flask import Flask, render_template, request, jsonify
from src.predictor import MilkQualityPredictor, WaterQualityPredictor, WineQualityPredictor
import os

app = Flask(__name__)

# Initialize predictors
milk_predictor = MilkQualityPredictor()
water_predictor = WaterQualityPredictor()
wine_predictor = WineQualityPredictor()

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
            'Temperature': float(data['temperature']),
            'Taste': int(data['taste']),
            'Odor': int(data['odor']),
            'Fat': int(data['fat']),
            'Turbidity': int(data['turbidity']),
            'Colour': float(data['colour'])
        }

        prediction, confidence = milk_predictor.predict(features)

        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'confidence': confidence
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

        prediction, confidence = water_predictor.predict(features)

        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'confidence': confidence
        })
    except Exception as e:
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

        prediction, confidence = wine_predictor.predict(features)

        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'confidence': confidence
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

if __name__ == '__main__':
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get('PORT', 5000))

    # Set debug mode based on environment
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'

    app.run(host='0.0.0.0', port=port, debug=debug)