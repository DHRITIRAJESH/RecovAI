import React, { useState, useEffect } from 'react'
import axios from 'axios'

function MySurgery() {
  const [surgeryInfo, setSurgeryInfo] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSurgeryInfo()
    fetchRiskAssessment()
  }, [])

  const fetchSurgeryInfo = async () => {
    try {
      const response = await axios.get('/api/patient/my-surgery')
      setSurgeryInfo(response.data)
    } catch (error) {
      console.error('Failed to fetch surgery info:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRiskAssessment = async () => {
    try {
      const response = await axios.get('/api/patient/risk-assessment')
      setAssessment(response.data)
    } catch (error) {
      console.error('Failed to fetch assessment:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="mt-4 text-gray-600">Loading your information...</p>
      </div>
    )
  }

  if (!surgeryInfo) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No surgery information available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="card bg-gradient-to-br from-teal-500 to-blue-500 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to Your Care Journey</h2>
        <p className="text-teal-50">
          Your surgical team is here to support you every step of the way. 
          Below you'll find important information about your upcoming procedure.
        </p>
      </div>

      {/* Surgery Details */}
      <div className="card">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Surgery Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="bg-teal-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Procedure</p>
              <p className="text-lg font-semibold text-gray-900">{surgeryInfo.surgery_type}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Scheduled Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(surgeryInfo.surgery_date)}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                surgeryInfo.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                surgeryInfo.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {surgeryInfo.status.charAt(0).toUpperCase() + surgeryInfo.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Care Team */}
      {surgeryInfo.doctor && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Care Team</h3>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-teal-500 text-white rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{surgeryInfo.doctor.full_name}</p>
              <p className="text-sm text-gray-600">{surgeryInfo.doctor.department}</p>
              <p className="text-sm text-teal-600">{surgeryInfo.doctor.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Care Level (Patient-Friendly) */}
      {assessment && assessment.care_level && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your Care Plan</h3>
              <p className="text-blue-800">{assessment.care_level}</p>
              {assessment.summary && (
                <p className="text-blue-700 mt-2 text-sm">{assessment.summary}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* What to Expect */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-semibold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Pre-operative Preparation</p>
              <p className="text-sm text-gray-600 mt-1">
                You'll meet with your surgical team to review your medical history and answer any questions.
                Please follow all fasting and medication instructions carefully.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-semibold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Day of Surgery</p>
              <p className="text-sm text-gray-600 mt-1">
                Arrive at the scheduled time. The anesthesia team will discuss pain management options.
                Your family will be updated throughout the procedure.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-semibold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Recovery and Monitoring</p>
              <p className="text-sm text-gray-600 mt-1">
                You'll be monitored closely in the recovery room. Your care team will manage pain and
                help you begin the recovery process.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-semibold">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Going Home</p>
              <p className="text-sm text-gray-600 mt-1">
                You'll receive detailed instructions for home care, medications, and follow-up appointments.
                Contact your care team immediately if you have any concerns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Reminders */}
      <div className="card bg-yellow-50 border border-yellow-200">
        <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Important Reminders</h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Do not eat or drink anything after midnight before your surgery (unless instructed otherwise)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Arrange for someone to drive you home after the procedure</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Bring a list of all medications you currently take</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Contact your care team immediately if you develop a fever or feel unwell before surgery</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MySurgery
