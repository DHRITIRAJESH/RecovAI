import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PatientList from './PatientList'
import PatientDetail from './PatientDetail'
import AddPatient from './AddPatient'

function DoctorDashboard({ onLogout }) {
  const [patients, setPatients] = useState([])
  const [riskSummary, setRiskSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPatients()
    fetchRiskSummary()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/doctor/patients')
      setPatients(response.data.patients)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRiskSummary = async () => {
    try {
      const response = await axios.get('/api/doctor/risk-summary')
      setRiskSummary(response.data)
    } catch (error) {
      console.error('Failed to fetch risk summary:', error)
    }
  }

  const handleLogout = async () => {
    await onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-500 text-white rounded-full p-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RecovAI</h1>
                <p className="text-sm text-gray-600">Doctor Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/doctor')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Patients
              </button>
              <button
                onClick={() => navigate('/doctor/add-patient')}
                className="btn-primary"
              >
                + Add Patient
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Risk Summary Cards - At the Top */}
      {riskSummary && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Risk Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Total Patients */}
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 font-medium">Total Patients</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{riskSummary.total_patients}</div>
            </div>
            
            {/* Critical Risk */}
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
              <div className="text-sm text-gray-600 font-medium">Critical Risk</div>
              <div className="text-3xl font-bold text-red-600 mt-2">{riskSummary.critical || 0}</div>
            </div>
            
            {/* High Risk */}
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <div className="text-sm text-gray-600 font-medium">High Risk</div>
              <div className="text-3xl font-bold text-orange-500 mt-2">{riskSummary.high || 0}</div>
            </div>
            
            {/* Moderate Risk */}
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="text-sm text-gray-600 font-medium">Moderate Risk</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">{riskSummary.moderate || 0}</div>
            </div>
            
            {/* Low Risk */}
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 font-medium">Low Risk</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{riskSummary.low || 0}</div>
            </div>
            
            {/* Unassessed */}
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
              <div className="text-sm text-gray-600 font-medium">Unassessed</div>
              <div className="text-3xl font-bold text-gray-500 mt-2">{riskSummary.unassessed || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route 
            path="/" 
            element={<PatientList patients={patients} loading={loading} onRefresh={fetchPatients} />} 
          />
          <Route 
            path="/patient/:patientId" 
            element={<PatientDetail onRefresh={fetchPatients} />} 
          />
          <Route 
            path="/add-patient" 
            element={<AddPatient onSuccess={fetchPatients} />} 
          />
        </Routes>
      </main>
    </div>
  )
}

export default DoctorDashboard
