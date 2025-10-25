import sys
sys.path.insert(0, r'c:\Users\rajes\OneDrive\Desktop\RecovAI\backend')
from ml_predictor import SurgicalRiskPredictor

print("=" * 60)
print("TESTING ML PREDICTOR")
print("=" * 60)

predictor = SurgicalRiskPredictor(models_dir='..')

print("\nModels loaded:", list(predictor.models.keys()))
print("Scaler loaded:", predictor.scaler is not None)
print("Imputer loaded:", predictor.imputer is not None)
print("Thresholds:", predictor.thresholds)

# Test prediction
test_patient = {
    'age': 45, 'gender': 1, 'bmi': 27.5, 'asa_class': 2, 'emergency_surgery': 0,
    'hemoglobin': 13.5, 'platelets': 250, 'creatinine': 0.9, 'albumin': 4.2, 'blood_loss': 200,
    'diabetes': 0, 'hypertension': 0, 'heart_disease': 0, 'copd': 0, 'kidney_disease': 0,
    'liver_disease': 0, 'stroke_history': 0, 'cancer_history': 0, 'immunosuppression': 0,
    'smoking_status': 0, 'alcohol_use': 0, 'anticoagulation': 0, 'steroid_use': 0, 'previous_surgeries': 1
}

print("\n" + "=" * 60)
print("TESTING PREDICTION")
print("=" * 60)
result = predictor.predict(test_patient)
print("\nRisk Assessment Results:")
print(f"  Overall Risk: {result['overall_risk']}")
print(f"  AKI Risk: {result['risks']['aki']:.1f}%")
print(f"  Cardiovascular Risk: {result['risks']['cardiovascular']:.1f}%")
print(f"  Transfusion Risk: {result['risks']['transfusion']:.1f}%")
print(f"  Mortality Risk: {result['mortality_risk']:.1f}%")
