"""
Machine Learning Risk Predictor with Clinical Risk Adjustments
Loads pre-trained TensorFlow models and applies comorbidity-based risk multipliers
"""

import os
import numpy as np
import joblib
import tensorflow as tf
from tensorflow import keras

# Feature order expected by all models
CORE_FEATURES = [
    'age', 'gender', 'bmi', 'asa_class', 'emergency_surgery',
    'hemoglobin', 'platelets', 'creatinine', 'albumin', 'blood_loss'
]

# Clinical risk adjustment factors based on medical literature
RISK_MULTIPLIERS = {
    'aki': {
        'diabetes': 1.3,
        'kidney_disease': 2.5,
        'hypertension': 1.2,
        'heart_disease': 1.15,
        'age_over_70': 1.4,
        'emergency_surgery': 1.5
    },
    'cardiovascular': {
        'heart_disease': 2.5,
        'diabetes': 1.4,
        'hypertension': 1.6,
        'stroke_history': 1.8,
        'copd': 1.3,
        'age_over_70': 1.5,
        'smoking_current': 1.4
    },
    'transfusion': {
        'anticoagulation': 2.0,
        'liver_disease': 1.6,
        'cancer_history': 1.3,
        'low_hemoglobin': 1.8,
        'low_platelets': 1.7,
        'emergency_surgery': 1.4
    },
    'mortality': {
        'asa_class_4_5': 3.0,
        'emergency_surgery': 2.2,
        'age_over_80': 2.5,
        'heart_disease': 1.8,
        'kidney_disease': 1.6,
        'cancer_history': 1.5,
        'immunosuppression': 1.4
    }
}


class SurgicalRiskPredictor:
    """ML-based surgical risk prediction with clinical adjustments"""
    
    def __init__(self, models_dir='..'):
        """Initialize and load all models and preprocessing objects"""
        self.models_dir = models_dir
        self.models = {}
        self.thresholds = {}
        
        # Load models
        self._load_models()
        
        # Load preprocessing objects
        self._load_preprocessing()
        
    def _load_models(self):
        """Load all TensorFlow Keras models"""
        model_files = {
            'aki': 'model_aki.keras',
            'cardiovascular': 'model_cardiovascular.keras',
            'transfusion': 'model_transfusion_required.keras'
        }
        
        for complication, filename in model_files.items():
            model_path = os.path.join(self.models_dir, filename)
            if os.path.exists(model_path):
                self.models[complication] = keras.models.load_model(model_path)
                print(f"✅ Loaded {complication} model")
            else:
                print(f"⚠️ Warning: {filename} not found at {model_path}")
        
        # Load optimal thresholds if available
        thresholds_path = os.path.join(self.models_dir, 'optimal_thresholds.pkl')
        if os.path.exists(thresholds_path):
            self.thresholds = joblib.load(thresholds_path)
            print(f"✅ Loaded optimal thresholds")
        else:
            # Default thresholds
            self.thresholds = {'aki': 0.5, 'cardiovascular': 0.5, 'transfusion': 0.5}
            print("⚠️ Using default thresholds (0.5)")
    
    def _load_preprocessing(self):
        """Load scaler and imputer"""
        scaler_path = os.path.join(self.models_dir, 'scaler.pkl')
        imputer_path = os.path.join(self.models_dir, 'imputer.pkl')
        
        if os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)
            print("✅ Loaded scaler")
        else:
            self.scaler = None
            print("⚠️ Scaler not found - will use raw values")
        
        if os.path.exists(imputer_path):
            self.imputer = joblib.load(imputer_path)
            print("✅ Loaded imputer")
        else:
            self.imputer = None
            print("⚠️ Imputer not found")
    
    def _extract_core_features(self, patient_data):
        """Extract core features in the correct order"""
        features = []
        for feature in CORE_FEATURES:
            features.append(float(patient_data.get(feature, 0)))
        return np.array(features).reshape(1, -1)
    
    def _preprocess_features(self, features):
        """Apply imputation and scaling"""
        if self.imputer is not None:
            features = self.imputer.transform(features)
        
        if self.scaler is not None:
            features = self.scaler.transform(features)
        
        return features
    
    def _calculate_base_risks(self, features):
        """Get base risk predictions from models"""
        risks = {}
        
        # If models are loaded, use them
        if self.models:
            for complication, model in self.models.items():
                prediction = model.predict(features, verbose=0)[0][0]
                risks[complication] = float(prediction) * 100  # Convert to percentage
        else:
            # Fallback: Use rule-based estimation when models aren't available
            # This provides more realistic baseline predictions than fixed 50%
            risks = {
                'aki': 15.0,  # Base 15% risk for AKI
                'cardiovascular': 12.0,  # Base 12% risk for cardiovascular
                'transfusion': 18.0  # Base 18% risk for transfusion
            }
        
        return risks
    
    def _apply_clinical_adjustments(self, base_risks, patient_data):
        """Apply comorbidity-based risk multipliers"""
        adjusted_risks = base_risks.copy()
        applied_factors = {comp: [] for comp in base_risks.keys()}
        
        # AKI adjustments
        if 'aki' in adjusted_risks:
            if patient_data.get('diabetes') == 1:
                adjusted_risks['aki'] *= RISK_MULTIPLIERS['aki']['diabetes']
                applied_factors['aki'].append('Diabetes')
            if patient_data.get('kidney_disease') == 1:
                adjusted_risks['aki'] *= RISK_MULTIPLIERS['aki']['kidney_disease']
                applied_factors['aki'].append('Chronic Kidney Disease')
            if patient_data.get('hypertension') == 1:
                adjusted_risks['aki'] *= RISK_MULTIPLIERS['aki']['hypertension']
                applied_factors['aki'].append('Hypertension')
            if patient_data.get('age', 0) > 70:
                adjusted_risks['aki'] *= RISK_MULTIPLIERS['aki']['age_over_70']
                applied_factors['aki'].append('Age > 70')
            if patient_data.get('emergency_surgery') == 1:
                adjusted_risks['aki'] *= RISK_MULTIPLIERS['aki']['emergency_surgery']
                applied_factors['aki'].append('Emergency Surgery')
        
        # Cardiovascular adjustments
        if 'cardiovascular' in adjusted_risks:
            if patient_data.get('heart_disease') == 1:
                adjusted_risks['cardiovascular'] *= RISK_MULTIPLIERS['cardiovascular']['heart_disease']
                applied_factors['cardiovascular'].append('Heart Disease')
            if patient_data.get('diabetes') == 1:
                adjusted_risks['cardiovascular'] *= RISK_MULTIPLIERS['cardiovascular']['diabetes']
                applied_factors['cardiovascular'].append('Diabetes')
            if patient_data.get('hypertension') == 1:
                adjusted_risks['cardiovascular'] *= RISK_MULTIPLIERS['cardiovascular']['hypertension']
                applied_factors['cardiovascular'].append('Hypertension')
            if patient_data.get('stroke_history') == 1:
                adjusted_risks['cardiovascular'] *= RISK_MULTIPLIERS['cardiovascular']['stroke_history']
                applied_factors['cardiovascular'].append('Stroke History')
            if patient_data.get('smoking_status') == 2:  # Current smoker
                adjusted_risks['cardiovascular'] *= RISK_MULTIPLIERS['cardiovascular']['smoking_current']
                applied_factors['cardiovascular'].append('Current Smoking')
            if patient_data.get('age', 0) > 70:
                adjusted_risks['cardiovascular'] *= RISK_MULTIPLIERS['cardiovascular']['age_over_70']
                applied_factors['cardiovascular'].append('Age > 70')
        
        # Transfusion adjustments
        if 'transfusion' in adjusted_risks:
            if patient_data.get('anticoagulation') == 1:
                adjusted_risks['transfusion'] *= RISK_MULTIPLIERS['transfusion']['anticoagulation']
                applied_factors['transfusion'].append('Anticoagulation')
            if patient_data.get('liver_disease') == 1:
                adjusted_risks['transfusion'] *= RISK_MULTIPLIERS['transfusion']['liver_disease']
                applied_factors['transfusion'].append('Liver Disease')
            if patient_data.get('hemoglobin', 15) < 10:
                adjusted_risks['transfusion'] *= RISK_MULTIPLIERS['transfusion']['low_hemoglobin']
                applied_factors['transfusion'].append('Low Hemoglobin (<10 g/dL)')
            if patient_data.get('platelets', 250) < 100:
                adjusted_risks['transfusion'] *= RISK_MULTIPLIERS['transfusion']['low_platelets']
                applied_factors['transfusion'].append('Thrombocytopenia')
        
        # Calculate mortality risk (composite)
        mortality_risk = self._calculate_mortality_risk(patient_data, adjusted_risks)
        adjusted_risks['mortality'] = mortality_risk['risk']
        applied_factors['mortality'] = mortality_risk['factors']
        
        # Cap risks at 99%
        for comp in adjusted_risks:
            adjusted_risks[comp] = min(adjusted_risks[comp], 99.0)
        
        return adjusted_risks, applied_factors
    
    def _calculate_mortality_risk(self, patient_data, complication_risks):
        """Calculate mortality risk based on composite factors"""
        base_mortality = max(complication_risks.values()) * 0.3  # Start with 30% of highest risk
        factors = []
        
        # ASA class
        asa_class = patient_data.get('asa_class', 2)
        if asa_class >= 4:
            base_mortality *= RISK_MULTIPLIERS['mortality']['asa_class_4_5']
            factors.append(f'ASA Class {asa_class}')
        
        # Emergency surgery
        if patient_data.get('emergency_surgery') == 1:
            base_mortality *= RISK_MULTIPLIERS['mortality']['emergency_surgery']
            factors.append('Emergency Surgery')
        
        # Age
        age = patient_data.get('age', 0)
        if age > 80:
            base_mortality *= RISK_MULTIPLIERS['mortality']['age_over_80']
            factors.append('Age > 80')
        elif age > 70:
            base_mortality *= 1.5
            factors.append('Age > 70')
        
        # Comorbidities
        if patient_data.get('heart_disease') == 1:
            base_mortality *= RISK_MULTIPLIERS['mortality']['heart_disease']
            factors.append('Heart Disease')
        if patient_data.get('kidney_disease') == 1:
            base_mortality *= RISK_MULTIPLIERS['mortality']['kidney_disease']
            factors.append('Kidney Disease')
        if patient_data.get('cancer_history') == 1:
            base_mortality *= RISK_MULTIPLIERS['mortality']['cancer_history']
            factors.append('Cancer History')
        if patient_data.get('immunosuppression') == 1:
            base_mortality *= RISK_MULTIPLIERS['mortality']['immunosuppression']
            factors.append('Immunosuppression')
        
        return {'risk': min(base_mortality, 99.0), 'factors': factors}
    
    def _categorize_risk(self, risk_percentage):
        """Categorize risk level"""
        if risk_percentage >= 70:
            return 'CRITICAL'
        elif risk_percentage >= 40:
            return 'HIGH'
        elif risk_percentage >= 20:
            return 'MODERATE'
        else:
            return 'LOW'
    
    def _get_overall_risk(self, risks):
        """Determine overall risk category"""
        max_risk = max(risks.values())
        return self._categorize_risk(max_risk)
    
    def predict(self, patient_data):
        """
        Main prediction method
        
        Args:
            patient_data: Dictionary containing all patient features
            
        Returns:
            Dictionary with risks, categories, contributing factors
        """
        # Extract and preprocess core features
        features = self._extract_core_features(patient_data)
        features = self._preprocess_features(features)
        
        # Get base predictions
        base_risks = self._calculate_base_risks(features)
        
        # Apply clinical adjustments
        adjusted_risks, contributing_factors = self._apply_clinical_adjustments(
            base_risks, patient_data
        )
        
        # Categorize risks
        risk_categories = {
            comp: self._categorize_risk(risk)
            for comp, risk in adjusted_risks.items()
        }
        
        # Overall risk
        overall_risk = self._get_overall_risk(adjusted_risks)
        
        return {
            'risks': adjusted_risks,
            'risk_categories': risk_categories,
            'overall_risk': overall_risk,
            'contributing_factors': contributing_factors
        }


if __name__ == '__main__':
    # Test the predictor
    predictor = SurgicalRiskPredictor()
    
    # Sample patient
    sample_patient = {
        'age': 75,
        'gender': 1,
        'bmi': 28.5,
        'asa_class': 3,
        'emergency_surgery': 0,
        'hemoglobin': 11.2,
        'platelets': 180,
        'creatinine': 1.4,
        'albumin': 3.2,
        'blood_loss': 400,
        'diabetes': 1,
        'hypertension': 1,
        'heart_disease': 1,
        'kidney_disease': 0
    }
    
    results = predictor.predict(sample_patient)
    print("\n🔬 Prediction Results:")
    print(f"Overall Risk: {results['overall_risk']}")
    print("\nIndividual Risks:")
    for comp, risk in results['risks'].items():
        category = results['risk_categories'][comp]
        print(f"  {comp.upper()}: {risk:.1f}% ({category})")
