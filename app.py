from src.pipeline.predict_pipeline import Predictor

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

def main():
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

if __name__ == "__main__":
    main()
