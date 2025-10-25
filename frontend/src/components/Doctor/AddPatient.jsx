import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BloodReportUploader from '../BloodReportUploader'

function AddPatient({ onSuccess }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    // User info
    email: '',
    password: '',
    full_name: '',
    
    // Surgery info
    surgery_type: '',
    surgery_date: '',
    
    // Core features
    age: '',
    gender: '1',
    bmi: '',
    asa_class: '2',
    emergency_surgery: '0',
    hemoglobin: '',
    platelets: '',
    creatinine: '',
    albumin: '',
    blood_loss: '300',
    
    // Medical history
    diabetes: 0,
    hypertension: 0,
    heart_disease: 0,
    copd: 0,
    kidney_disease: 0,
    liver_disease: 0,
    stroke_history: 0,
    cancer_history: 0,
    immunosuppression: 0,
    smoking_status: '0',
    alcohol_use: '0',
    anticoagulation: 0,
    steroid_use: 0,
    previous_surgeries: '0'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    })
  }

  const handleBloodValuesExtracted = (extractedValues) => {
    // Auto-fill blood vitals from uploaded report
    setFormData(prev => ({
      ...prev,
      hemoglobin: extractedValues.hemoglobin || prev.hemoglobin,
      platelets: extractedValues.platelets || prev.platelets,
      creatinine: extractedValues.creatinine || prev.creatinine,
      albumin: extractedValues.albumin || prev.albumin
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post('/api/doctor/add-patient', formData)
      onSuccess()
      navigate('/doctor')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => navigate('/doctor')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Patients
      </button>

      <div className="card max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Patient</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="label">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input-field"
                  required
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </select>
              </div>
              <div>
                <label className="label">BMI *</label>
                <input
                  type="number"
                  step="0.1"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  className="input-field"
                  required
                  min="10"
                  max="60"
                />
              </div>
            </div>
          </div>

          {/* Surgery Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Surgery Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Surgery Type *</label>
                <input
                  type="text"
                  name="surgery_type"
                  value={formData.surgery_type}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="e.g., Laparoscopic Cholecystectomy"
                />
              </div>
              <div>
                <label className="label">Surgery Date *</label>
                <input
                  type="date"
                  name="surgery_date"
                  value={formData.surgery_date}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">ASA Class *</label>
                <select
                  name="asa_class"
                  value={formData.asa_class}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="1">ASA 1 - Healthy</option>
                  <option value="2">ASA 2 - Mild systemic disease</option>
                  <option value="3">ASA 3 - Severe systemic disease</option>
                  <option value="4">ASA 4 - Life-threatening disease</option>
                  <option value="5">ASA 5 - Moribund</option>
                </select>
              </div>
              <div>
                <label className="label">Emergency Surgery</label>
                <select
                  name="emergency_surgery"
                  value={formData.emergency_surgery}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blood Report Upload - Auto-fill Lab Values */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Fill: Upload Blood Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a PDF or image of the blood report to automatically extract and fill hemoglobin, platelets, creatinine, and albumin values.
            </p>
            <BloodReportUploader onValuesExtracted={handleBloodValuesExtracted} />
          </div>

          {/* Lab Values */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laboratory Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Hemoglobin (g/dL) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="hemoglobin"
                  value={formData.hemoglobin}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Normal: 12-16"
                />
              </div>
              <div>
                <label className="label">Platelets (×10³/μL) *</label>
                <input
                  type="number"
                  step="1"
                  name="platelets"
                  value={formData.platelets}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Normal: 150-400"
                />
              </div>
              <div>
                <label className="label">Creatinine (mg/dL) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="creatinine"
                  value={formData.creatinine}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Normal: 0.6-1.2"
                />
              </div>
              <div>
                <label className="label">Albumin (g/dL) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="albumin"
                  value={formData.albumin}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Normal: 3.5-5.5"
                />
              </div>
              <div>
                <label className="label">Estimated Blood Loss (mL) *</label>
                <input
                  type="number"
                  step="50"
                  name="blood_loss"
                  value={formData.blood_loss}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Estimated"
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="diabetes"
                  checked={formData.diabetes === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Diabetes</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hypertension"
                  checked={formData.hypertension === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Hypertension</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="heart_disease"
                  checked={formData.heart_disease === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Heart Disease</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="copd"
                  checked={formData.copd === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">COPD</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="kidney_disease"
                  checked={formData.kidney_disease === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Kidney Disease</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="liver_disease"
                  checked={formData.liver_disease === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Liver Disease</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="stroke_history"
                  checked={formData.stroke_history === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Stroke History</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="cancer_history"
                  checked={formData.cancer_history === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Cancer History</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="immunosuppression"
                  checked={formData.immunosuppression === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Immunosuppression</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="anticoagulation"
                  checked={formData.anticoagulation === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Anticoagulation</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="steroid_use"
                  checked={formData.steroid_use === 1}
                  onChange={handleChange}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm">Steroid Use</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="label">Smoking Status</label>
                <select
                  name="smoking_status"
                  value={formData.smoking_status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="0">Never</option>
                  <option value="1">Former</option>
                  <option value="2">Current</option>
                </select>
              </div>
              <div>
                <label className="label">Alcohol Use</label>
                <select
                  name="alcohol_use"
                  value={formData.alcohol_use}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="0">None</option>
                  <option value="1">Moderate</option>
                  <option value="2">Heavy</option>
                </select>
              </div>
              <div>
                <label className="label">Previous Surgeries</label>
                <input
                  type="number"
                  name="previous_surgeries"
                  value={formData.previous_surgeries}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Patient...' : 'Add Patient'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/doctor')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPatient
