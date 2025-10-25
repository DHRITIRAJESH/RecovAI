"""
Clinical Recommendations Engine
Evidence-based recommendations for surgical risk management
"""

import json


class ClinicalRecommendations:
    """Generate clinical recommendations based on risk assessments"""
    
    # Evidence-based recommendations by risk category and complication type
    RECOMMENDATIONS = {
        'aki': {
            'CRITICAL': [
                '🔴 URGENT: Pre-operative nephrology consultation required',
                '🏥 Reserve ICU bed for immediate post-operative monitoring',
                '💉 Monitor serum creatinine every 12 hours',
                '💧 Strict fluid balance monitoring (target euvolemia)',
                '🚫 Avoid nephrotoxic agents (NSAIDs, contrast, aminoglycosides)',
                '📊 Consider pre-operative renal replacement therapy readiness',
                '🩺 Daily nephrology rounds post-operatively'
            ],
            'HIGH': [
                '⚠️ Nephrology consultation recommended',
                '💧 Optimize fluid status pre-operatively',
                '📈 Monitor creatinine daily for 72 hours post-op',
                '🚫 Minimize nephrotoxic medication exposure',
                '💉 Consider N-acetylcysteine prophylaxis if contrast needed',
                '📊 Target mean arterial pressure >65 mmHg intra-operatively'
            ],
            'MODERATE': [
                '📊 Baseline and post-operative creatinine monitoring',
                '💧 Maintain adequate hydration',
                '🚫 Avoid unnecessary nephrotoxic medications',
                '📈 Monitor urine output closely'
            ],
            'LOW': [
                '✅ Standard renal function monitoring',
                '💧 Maintain normal hydration'
            ]
        },
        'cardiovascular': {
            'CRITICAL': [
                '🔴 URGENT: Cardiology consultation required',
                '🏥 Reserve ICU bed with telemetry capabilities',
                '💊 Optimize cardiac medications pre-operatively',
                '📊 Continuous cardiac monitoring for 72 hours minimum',
                '🩺 Consider hemodynamic monitoring (arterial line, CVP)',
                '⚡ Have advanced cardiac life support (ACLS) team on standby',
                '💉 Beta-blocker continuation if already on therapy',
                '🔬 Serial troponin measurements (0, 6, 12, 24 hours)'
            ],
            'HIGH': [
                '⚠️ Cardiology consultation strongly recommended',
                '📊 Telemetry monitoring for 48 hours post-operatively',
                '💊 Review and optimize cardiac medications',
                '🔬 Post-operative troponin and ECG',
                '🩺 Consider stress testing if not recent',
                '⚡ Ensure beta-blocker continuation'
            ],
            'MODERATE': [
                '📊 Routine ECG pre and post-operatively',
                '💊 Continue home cardiac medications',
                '🔬 Single post-operative troponin if symptoms develop',
                '📈 Monitor for chest pain, dyspnea, arrhythmias'
            ],
            'LOW': [
                '✅ Standard cardiac monitoring',
                '💊 Continue home medications'
            ]
        },
        'transfusion': {
            'CRITICAL': [
                '🔴 URGENT: Type and cross-match 4 units PRBCs immediately',
                '🏥 Reserve OR with cell saver capabilities',
                '🩸 Have massive transfusion protocol ready',
                '💉 Monitor hemoglobin every 6 hours post-operatively',
                '🔬 Serial coagulation panels (PT/PTT/INR)',
                '⚡ Hematology consultation for complex coagulopathy',
                '💊 Hold anticoagulation as per protocol',
                '🩺 Consider intra-operative hemostatic agents'
            ],
            'HIGH': [
                '⚠️ Type and cross-match 2 units PRBCs',
                '💉 Monitor hemoglobin every 12 hours for 48 hours',
                '🔬 Pre-operative coagulation panel',
                '💊 Review anticoagulation timing',
                '🩸 Have blood products readily available',
                '📊 Target hemoglobin >8 g/dL post-operatively'
            ],
            'MODERATE': [
                '🩸 Type and screen',
                '💉 Monitor hemoglobin daily',
                '💊 Hold anticoagulation appropriately',
                '📊 Be prepared for transfusion if needed'
            ],
            'LOW': [
                '✅ Type and screen only',
                '📊 Standard hemoglobin monitoring'
            ]
        },
        'mortality': {
            'CRITICAL': [
                '🔴 URGENT: Senior surgeon attendance mandatory',
                '🏥 ICU bed reservation required',
                '👨‍⚕️ Anesthesiology risk assessment',
                '📋 Detailed informed consent discussion',
                '👨‍👩‍👧 Family meeting to discuss risks and goals of care',
                '🩺 Consider less invasive alternatives if feasible',
                '⚡ Multi-disciplinary team meeting',
                '📊 Optimize all medical conditions pre-operatively'
            ],
            'HIGH': [
                '⚠️ Senior surgeon consultation',
                '🏥 Plan for ICU or step-down unit admission',
                '📋 Enhanced informed consent process',
                '👨‍⚕️ Anesthesiology pre-operative evaluation',
                '🩺 Optimize medical comorbidities',
                '📊 Consider surgical timing and patient optimization window'
            ],
            'MODERATE': [
                '📋 Standard informed consent with risk discussion',
                '🩺 Medical optimization',
                '👨‍⚕️ Anesthesiology evaluation',
                '📊 Post-operative monitoring plan'
            ],
            'LOW': [
                '✅ Standard perioperative care',
                '📋 Routine informed consent'
            ]
        }
    }
    
    # Procedural modifications based on risk
    PROCEDURAL_MODIFICATIONS = {
        'aki': {
            'CRITICAL': [
                'Use lowest possible contrast volume if imaging required',
                'Consider regional anesthesia to preserve renal perfusion',
                'Maintain intra-operative MAP >65 mmHg',
                'Minimize surgical time to reduce ischemic injury'
            ],
            'HIGH': [
                'Goal-directed fluid therapy',
                'Avoid intra-operative hypotension',
                'Consider minimally invasive approach'
            ]
        },
        'cardiovascular': {
            'CRITICAL': [
                'Consider regional vs. general anesthesia',
                'Arterial line for beat-to-beat blood pressure monitoring',
                'Maintain normothermia throughout',
                'Minimize surgical stress and duration'
            ],
            'HIGH': [
                'Hemodynamic monitoring',
                'Careful fluid management',
                'Avoid tachycardia and hypotension'
            ]
        },
        'transfusion': {
            'CRITICAL': [
                'Meticulous surgical hemostasis',
                'Use cell saver if available',
                'Consider anti-fibrinolytic agents (TXA)',
                'Minimize surgical dissection'
            ],
            'HIGH': [
                'Careful surgical technique',
                'Have topical hemostatic agents available',
                'Consider tranexamic acid'
            ]
        }
    }
    
    @staticmethod
    def generate_recommendations(risk_assessment):
        """
        Generate comprehensive clinical recommendations
        
        Args:
            risk_assessment: Dict with risk_categories and risks
            
        Returns:
            Dict with recommendations, procedural_modifications, summary
        """
        recommendations = {}
        procedural_mods = {}
        priority_actions = []
        
        # Generate recommendations for each complication
        for complication, category in risk_assessment['risk_categories'].items():
            if complication in ClinicalRecommendations.RECOMMENDATIONS:
                recommendations[complication] = \
                    ClinicalRecommendations.RECOMMENDATIONS[complication].get(category, [])
                
                # Get procedural modifications for HIGH/CRITICAL risks
                if category in ['HIGH', 'CRITICAL'] and \
                   complication in ClinicalRecommendations.PROCEDURAL_MODIFICATIONS:
                    procedural_mods[complication] = \
                        ClinicalRecommendations.PROCEDURAL_MODIFICATIONS[complication].get(category, [])
                
                # Collect priority actions (CRITICAL level)
                if category == 'CRITICAL':
                    priority_actions.extend([
                        f"{complication.upper()}: {rec}" 
                        for rec in recommendations[complication][:3]  # Top 3
                    ])
        
        # Generate executive summary
        overall_risk = risk_assessment['overall_risk']
        summary = ClinicalRecommendations._generate_summary(overall_risk, risk_assessment['risks'])
        
        return {
            'recommendations': recommendations,
            'procedural_modifications': procedural_mods,
            'priority_actions': priority_actions,
            'summary': summary
        }
    
    @staticmethod
    def _generate_summary(overall_risk, risks):
        """Generate executive summary of recommendations"""
        if overall_risk == 'CRITICAL':
            return (
                "⚠️ CRITICAL RISK SURGERY: This patient requires immediate multi-disciplinary "
                "consultation, ICU bed reservation, and senior surgical team involvement. "
                "Detailed informed consent and family discussion are mandatory. Consider "
                "optimization period or alternative management strategies."
            )
        elif overall_risk == 'HIGH':
            return (
                "⚠️ HIGH RISK SURGERY: This patient requires specialist consultations, "
                "enhanced monitoring, and careful perioperative optimization. Plan for "
                "ICU or step-down unit admission. Ensure all medical conditions are "
                "optimally managed before proceeding."
            )
        elif overall_risk == 'MODERATE':
            return (
                "📊 MODERATE RISK SURGERY: Standard perioperative care with attention to "
                "specific risk factors. Medical optimization and appropriate monitoring "
                "protocols should be implemented."
            )
        else:
            return (
                "✅ LOW RISK SURGERY: Routine perioperative management appropriate. "
                "Standard monitoring and care protocols."
            )
    
    @staticmethod
    def generate_patient_friendly_plan(risk_assessment, patient_data):
        """
        Generate patient-friendly care plan (no percentages, plain language)
        
        Args:
            risk_assessment: Risk assessment results
            patient_data: Patient information
            
        Returns:
            Dict with patient-friendly recommendations
        """
        plan = {
            'overview': '',
            'what_to_expect': [],
            'monitoring': [],
            'lifestyle': [],
            'warning_signs': []
        }
        
        # Overview based on risk
        risk_categories = risk_assessment['risk_categories']
        
        if 'CRITICAL' in risk_categories.values() or 'HIGH' in risk_categories.values():
            plan['overview'] = (
                "Your surgical team will be monitoring you very closely before, during, "
                "and after your surgery. We've identified some areas where extra care is needed "
                "to ensure the best possible outcome."
            )
        else:
            plan['overview'] = (
                "Your surgery is planned with standard safety protocols. Your care team "
                "will monitor you throughout your recovery."
            )
        
        # What to expect
        plan['what_to_expect'] = [
            "You'll meet with your surgical team before the procedure",
            "The anesthesia team will discuss pain management",
            "You'll be monitored closely after surgery",
            "Your care team will help manage your recovery"
        ]
        
        # Monitoring based on specific risks
        if risk_categories.get('aki') in ['CRITICAL', 'HIGH']:
            plan['monitoring'].append(
                "We'll be monitoring your kidney function closely with regular blood tests"
            )
        
        if risk_categories.get('cardiovascular') in ['CRITICAL', 'HIGH']:
            plan['monitoring'].append(
                "Your heart will be monitored continuously with special equipment"
            )
        
        if risk_categories.get('transfusion') in ['CRITICAL', 'HIGH']:
            plan['monitoring'].append(
                "We'll monitor your blood counts and have blood products ready if needed"
            )
        
        if not plan['monitoring']:
            plan['monitoring'].append("Standard post-operative monitoring will be provided")
        
        # Lifestyle recommendations
        plan['lifestyle'] = ClinicalRecommendations._generate_lifestyle_recommendations(patient_data)
        
        # Warning signs
        plan['warning_signs'] = [
            "Severe chest pain or difficulty breathing",
            "Severe abdominal pain that's getting worse",
            "Fever over 101°F (38.3°C)",
            "Excessive bleeding or drainage from surgical site",
            "Severe nausea/vomiting preventing fluid intake",
            "Inability to urinate for more than 8 hours",
            "Confusion or difficulty staying awake",
            "Signs of infection (redness, warmth, pus at incision)"
        ]
        
        return plan
    
    @staticmethod
    def _generate_lifestyle_recommendations(patient_data):
        """Generate personalized lifestyle recommendations"""
        recommendations = []
        
        # Smoking
        if patient_data.get('smoking_status') in [1, 2]:
            recommendations.append({
                'category': 'Smoking Cessation',
                'importance': 'CRITICAL',
                'details': (
                    "Stop smoking at least 4 weeks before surgery if possible. "
                    "Smoking significantly increases complications. We can provide "
                    "cessation resources and medications to help."
                )
            })
        
        # Diabetes
        if patient_data.get('diabetes') == 1:
            recommendations.append({
                'category': 'Blood Sugar Control',
                'importance': 'HIGH',
                'details': (
                    "Keep blood sugar well-controlled (target 80-180 mg/dL). "
                    "Check glucose levels regularly and take medications as prescribed. "
                    "Bring your glucose monitor to the hospital."
                )
            })
        
        # Nutrition
        recommendations.append({
            'category': 'Nutrition',
            'importance': 'MODERATE',
            'details': (
                "Eat a balanced diet rich in protein to support healing. "
                "Stay well-hydrated unless instructed otherwise. "
                "Follow fasting instructions carefully before surgery."
            )
        })
        
        # Physical activity
        if patient_data.get('bmi', 25) > 30:
            recommendations.append({
                'category': 'Physical Activity',
                'importance': 'MODERATE',
                'details': (
                    "Light physical activity like walking can improve surgical outcomes. "
                    "Aim for 15-30 minutes of walking daily if cleared by your doctor."
                )
            })
        
        # Medications
        recommendations.append({
            'category': 'Medications',
            'importance': 'HIGH',
            'details': (
                "Continue all prescribed medications unless specifically told to stop. "
                "Bring a complete list of medications and supplements to your pre-op visit. "
                "Ask about which medications to take on surgery day."
            )
        })
        
        return recommendations
    
    @staticmethod
    def generate_recovery_timeline(surgery_type, risk_level):
        """Generate day-by-day recovery timeline"""
        # Base timeline
        timeline = {
            'day_of_surgery': [
                "You'll go to the recovery room immediately after surgery",
                "Pain management will be started",
                "Vital signs monitored frequently",
                "Family will be updated by surgical team"
            ],
            'day_1': [
                "Continue monitoring and pain management",
                "Begin drinking clear liquids if tolerated",
                "Physical therapy may visit to help with movement",
                "Continue IV fluids and medications"
            ],
            'day_2_3': [
                "Transition to regular diet if tolerated",
                "Increase activity and walking",
                "Transition from IV to oral medications",
                "Wound care education"
            ],
            'week_1': [
                "Follow-up appointment scheduled",
                "Continue prescribed medications",
                "Gradually increase activity",
                "Monitor incision for signs of infection"
            ],
            'week_2_4': [
                "Sutures/staples removed (if applicable)",
                "Resume normal activities gradually",
                "Continue following all medical restrictions",
                "Report any concerns to surgical team"
            ]
        }
        
        # Adjust for high-risk patients
        if risk_level in ['CRITICAL', 'HIGH']:
            timeline['day_of_surgery'].insert(0, "You may go to ICU for closer monitoring")
            timeline['day_1'].insert(0, "Continued intensive monitoring")
            timeline['week_1'].insert(0, "May require additional lab work and monitoring")
        
        return timeline


if __name__ == '__main__':
    # Test recommendations
    sample_assessment = {
        'overall_risk': 'HIGH',
        'risks': {
            'aki': 55.3,
            'cardiovascular': 62.1,
            'transfusion': 28.4,
            'mortality': 18.2
        },
        'risk_categories': {
            'aki': 'HIGH',
            'cardiovascular': 'HIGH',
            'transfusion': 'MODERATE',
            'mortality': 'LOW'
        }
    }
    
    recs = ClinicalRecommendations.generate_recommendations(sample_assessment)
    print("📋 Clinical Recommendations Generated")
    print(f"Priority Actions: {len(recs['priority_actions'])}")
    print(f"Summary: {recs['summary'][:100]}...")
