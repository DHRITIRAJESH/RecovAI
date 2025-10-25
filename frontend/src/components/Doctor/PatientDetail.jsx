import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import RiskAssessmentReport from './RiskAssessmentReport'

function PatientDetail({ onRefresh }) {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    fetchPatientDetails()
  }, [patientId])

  const fetchPatientDetails = async () => {
    try {
      console.log('Fetching patient details for ID:', patientId)
      const response = await axios.get(`/api/doctor/patient/${patientId}`)
      console.log('Patient details response:', response.data)
      setPatient(response.data.patient)
      setAssessment(response.data.latest_assessment)
      // Only show report if there's actually an assessment
      if (response.data.latest_assessment && response.data.latest_assessment.risks) {
        setShowReport(true)
      } else {
        setShowReport(false)
      }
    } catch (error) {
      console.error('Failed to fetch patient:', error)
      console.error('Error details:', error.response?.data)
      alert(`Error loading patient: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const generateRiskAssessment = async () => {
    setGenerating(true)
    try {
      console.log('Generating risk assessment for patient:', patientId)
      const response = await axios.post(`/api/doctor/assess-patient/${patientId}`, {}, {
        withCredentials: true
      })
      console.log('Risk assessment response:', response.data)
      setAssessment(response.data)
      setShowReport(true)
      onRefresh()
      alert('Risk assessment generated successfully!')
    } catch (error) {
      console.error('Failed to generate assessment:', error)
      console.error('Error response:', error.response?.data)
      alert(`Failed to generate risk assessment: ${error.response?.data?.error || error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="mt-4 text-gray-600">Loading patient details...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Patient not found</p>
      </div>
    )
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/doctor')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Patients
      </button>

      {/* Patient Header */}
      <div className="card mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{patient.patient_name || 'Patient'}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-semibold">{patient.gender === 0 ? 'Female' : 'Male'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">BMI</p>
                <p className="font-semibold">{patient.bmi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ASA Class</p>
                <p className="font-semibold">ASA {patient.asa_class}</p>
              </div>
            </div>
          </div>
          <button
            onClick={generateRiskAssessment}
            disabled={generating}
            className="btn-primary disabled:opacity-50"
          >
            {generating ? 'Generating...' : '🔬 Generate Risk Assessment'}
          </button>
        </div>
      </div>

      {/* Surgery Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Surgery Details</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium">{patient.surgery_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium">{new Date(patient.surgery_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Emergency</p>
              <p className="font-medium">{patient.emergency_surgery ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                patient.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                patient.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {patient.status}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Lab Values</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Hemoglobin:</span>
              <span className="font-medium">{patient.hemoglobin} g/dL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platelets:</span>
              <span className="font-medium">{patient.platelets} ×10³/μL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Creatinine:</span>
              <span className="font-medium">{patient.creatinine} mg/dL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Albumin:</span>
              <span className="font-medium">{patient.albumin} g/dL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Est. Blood Loss:</span>
              <span className="font-medium">{patient.blood_loss} mL</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Medical History</h3>
          <div className="space-y-1 text-sm">
            {patient.diabetes === 1 && <div className="flex items-center text-orange-700">✓ Diabetes</div>}
            {patient.hypertension === 1 && <div className="flex items-center text-orange-700">✓ Hypertension</div>}
            {patient.heart_disease === 1 && <div className="flex items-center text-red-700">✓ Heart Disease</div>}
            {patient.copd === 1 && <div className="flex items-center text-orange-700">✓ COPD</div>}
            {patient.kidney_disease === 1 && <div className="flex items-center text-red-700">✓ Kidney Disease</div>}
            {patient.liver_disease === 1 && <div className="flex items-center text-orange-700">✓ Liver Disease</div>}
            {patient.stroke_history === 1 && <div className="flex items-center text-red-700">✓ Stroke History</div>}
            {patient.cancer_history === 1 && <div className="flex items-center text-orange-700">✓ Cancer History</div>}
            {patient.immunosuppression === 1 && <div className="flex items-center text-red-700">✓ Immunosuppression</div>}
            {patient.anticoagulation === 1 && <div className="flex items-center text-orange-700">✓ Anticoagulation</div>}
            {patient.steroid_use === 1 && <div className="flex items-center text-orange-700">✓ Steroid Use</div>}
            {patient.smoking_status > 0 && (
              <div className="flex items-center text-orange-700">
                ✓ {patient.smoking_status === 1 ? 'Former Smoker' : 'Current Smoker'}
              </div>
            )}
            {patient.alcohol_use > 0 && (
              <div className="flex items-center text-orange-700">
                ✓ Alcohol Use: {patient.alcohol_use === 1 ? 'Moderate' : 'Heavy'}
              </div>
            )}
            {patient.previous_surgeries > 0 && (
              <div className="flex items-center text-gray-700">
                ✓ Previous Surgeries: {patient.previous_surgeries}
              </div>
            )}
            {!patient.diabetes && !patient.hypertension && !patient.heart_disease && 
             !patient.copd && !patient.kidney_disease && !patient.liver_disease && (
              <p className="text-gray-500 italic">No significant medical history</p>
            )}
          </div>
        </div>
      </div>

      {/* Risk Assessment Report */}
      {showReport && assessment && (
        <RiskAssessmentReport assessment={assessment} patient={patient} />
      )}
    </div>
  )
}

export default PatientDetail
