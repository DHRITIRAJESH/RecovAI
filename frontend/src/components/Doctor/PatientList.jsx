import React from 'react'
import { useNavigate } from 'react-router-dom'

function PatientList({ patients, loading, onRefresh }) {
  const navigate = useNavigate()

  const getRiskBadge = (assessment) => {
    if (!assessment) {
      return <span className="badge bg-gray-100 text-gray-600">Not Assessed</span>
    }

    const riskLevel = assessment.overall_risk
    const badges = {
      'CRITICAL': { class: 'badge-critical', icon: '🔴', text: 'CRITICAL' },
      'HIGH': { class: 'badge-high', icon: '⚠️', text: 'HIGH' },
      'MODERATE': { class: 'badge-moderate', icon: '🟡', text: 'MODERATE' },
      'LOW': { class: 'badge-low', icon: '✅', text: 'LOW' }
    }

    const badge = badges[riskLevel] || badges['LOW']
    return (
      <span className={`badge ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="mt-4 text-gray-600">Loading patients...</p>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No patients yet</h3>
        <p className="mt-2 text-gray-600">Get started by adding your first patient.</p>
        <button
          onClick={() => navigate('/doctor/add-patient')}
          className="mt-6 btn-primary"
        >
          + Add Patient
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Patients</h2>
        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surgery Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surgery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.patient_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-800 font-medium">
                          {patient.patient_name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.patient_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Age {patient.age} • {patient.gender === 0 ? 'F' : 'M'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.surgery_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(patient.surgery_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRiskBadge(patient.latest_assessment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      patient.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/doctor/patient/${patient.patient_id}`)}
                      className="text-teal-600 hover:text-teal-900 font-medium"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-800 font-medium">Critical Risk</p>
              <p className="text-2xl font-bold text-red-900">
                {patients.filter(p => p.latest_assessment?.overall_risk === 'CRITICAL').length}
              </p>
            </div>
            <div className="text-3xl">🔴</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-800 font-medium">High Risk</p>
              <p className="text-2xl font-bold text-orange-900">
                {patients.filter(p => p.latest_assessment?.overall_risk === 'HIGH').length}
              </p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 font-medium">Moderate Risk</p>
              <p className="text-2xl font-bold text-yellow-900">
                {patients.filter(p => p.latest_assessment?.overall_risk === 'MODERATE').length}
              </p>
            </div>
            <div className="text-3xl">🟡</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">Low Risk</p>
              <p className="text-2xl font-bold text-green-900">
                {patients.filter(p => p.latest_assessment?.overall_risk === 'LOW').length}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientList
