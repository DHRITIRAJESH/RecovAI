import React, { useState, useEffect } from 'react'
import axios from 'axios'

function LifestylePlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchLifestylePlan()
  }, [])

  const fetchLifestylePlan = async () => {
    try {
      const response = await axios.get('/api/patient/lifestyle-plan')
      if (response.data && response.data.plan_id) {
        setPlan(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch lifestyle plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePlan = async () => {
    setGenerating(true)
    try {
      const response = await axios.post('/api/patient/generate-lifestyle-plan')
      setPlan(response.data)
    } catch (error) {
      console.error('Failed to generate plan:', error)
      alert('Failed to generate lifestyle plan. Please ensure you have a risk assessment.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="mt-4 text-gray-600">Loading your plan...</p>
      </div>
    )
  }

  if (!plan || !plan.plan_id) {
    return (
      <div className="card text-center py-12">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No Lifestyle Plan Yet</h3>
        <p className="mt-2 text-gray-600">
          Generate a personalized recovery and lifestyle plan based on your surgery.
        </p>
        <button
          onClick={generatePlan}
          disabled={generating}
          className="mt-6 btn-primary disabled:opacity-50"
        >
          {generating ? 'Generating...' : '📋 Generate My Plan'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <h2 className="text-3xl font-bold mb-2">Your Personalized Care Plan</h2>
        <p className="text-purple-50">
          {plan.overview || 'This plan is designed to support your recovery and help you achieve the best possible outcome.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors flex-shrink-0 ${
              activeTab === 'overview'
                ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📋 Overview
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`px-6 py-3 font-medium transition-colors flex-shrink-0 ${
              activeTab === 'diet'
                ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🥗 Diet
          </button>
          <button
            onClick={() => setActiveTab('exercise')}
            className={`px-6 py-3 font-medium transition-colors flex-shrink-0 ${
              activeTab === 'exercise'
                ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            💪 Exercise
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`px-6 py-3 font-medium transition-colors flex-shrink-0 ${
              activeTab === 'medications'
                ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            💊 Medications
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-6 py-3 font-medium transition-colors flex-shrink-0 ${
              activeTab === 'recovery'
                ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📅 Recovery Timeline
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`px-6 py-3 font-medium transition-colors flex-shrink-0 ${
              activeTab === 'warnings'
                ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            ⚠️ Warning Signs
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">What to Expect</h3>
              {plan.what_to_expect && plan.what_to_expect.length > 0 ? (
                <ul className="space-y-3">
                  {plan.what_to_expect.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-teal-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No specific expectations listed.</p>
              )}

              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Monitoring & Care</h4>
                {plan.monitoring && plan.monitoring.length > 0 ? (
                  <div className="space-y-2">
                    {plan.monitoring.map((item, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-900">{item}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Standard monitoring will be provided.</p>
                )}
              </div>
            </div>
          )}

          {/* Diet Tab */}
          {activeTab === 'diet' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Nutrition Recommendations</h3>
              {plan.lifestyle_recommendations && plan.lifestyle_recommendations.filter(r => r.category === 'Nutrition').length > 0 ? (
                plan.lifestyle_recommendations.filter(r => r.category === 'Nutrition').map((rec, idx) => (
                  <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                        rec.importance === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        rec.importance === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.importance}
                      </span>
                      <h4 className="font-semibold text-gray-900">{rec.category}</h4>
                    </div>
                    <p className="text-gray-700">{rec.details}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>General Nutrition Guidelines:</strong>
                  </p>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>• Eat a balanced diet rich in protein to support healing</li>
                    <li>• Stay well-hydrated (8-10 glasses of water daily)</li>
                    <li>• Include fruits and vegetables for vitamins and minerals</li>
                    <li>• Avoid heavy, greasy meals immediately after surgery</li>
                    <li>• Follow any specific dietary restrictions from your care team</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Exercise Tab */}
          {activeTab === 'exercise' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Physical Activity Guidelines</h3>
              {plan.lifestyle_recommendations && plan.lifestyle_recommendations.filter(r => r.category === 'Physical Activity').length > 0 ? (
                plan.lifestyle_recommendations.filter(r => r.category === 'Physical Activity').map((rec, idx) => (
                  <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                        rec.importance === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        rec.importance === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.importance}
                      </span>
                      <h4 className="font-semibold text-gray-900">{rec.category}</h4>
                    </div>
                    <p className="text-gray-700">{rec.details}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>General Activity Guidelines:</strong>
                  </p>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>• Start with short walks (5-10 minutes) as soon as cleared</li>
                    <li>• Gradually increase activity level over several weeks</li>
                    <li>• Avoid heavy lifting or strenuous exercise until cleared</li>
                    <li>• Listen to your body and rest when needed</li>
                    <li>• Follow specific restrictions from your surgical team</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Medication Management</h3>
              {plan.lifestyle_recommendations && plan.lifestyle_recommendations.filter(r => 
                r.category === 'Medications' || r.category === 'Blood Sugar Control'
              ).length > 0 ? (
                plan.lifestyle_recommendations.filter(r => 
                  r.category === 'Medications' || r.category === 'Blood Sugar Control'
                ).map((rec, idx) => (
                  <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                        rec.importance === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        rec.importance === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.importance}
                      </span>
                      <h4 className="font-semibold text-gray-900">{rec.category}</h4>
                    </div>
                    <p className="text-gray-700">{rec.details}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>General Medication Guidelines:</strong>
                  </p>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>• Take all medications exactly as prescribed</li>
                    <li>• Set reminders to avoid missing doses</li>
                    <li>• Keep a list of all medications and dosages</li>
                    <li>• Report any side effects to your care team</li>
                    <li>• Don't stop medications without consulting your doctor</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recovery Timeline Tab */}
          {activeTab === 'recovery' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Your Recovery Journey</h3>
              {plan.recovery_timeline ? (
                <div className="space-y-4">
                  {Object.entries(plan.recovery_timeline).map(([phase, activities]) => (
                    <div key={phase} className="border-l-4 border-teal-500 pl-4 py-2">
                      <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                        {phase.replace(/_/g, ' ')}
                      </h4>
                      <ul className="space-y-1">
                        {activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start text-gray-700">
                            <span className="text-teal-500 mr-2">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Recovery timeline information will be provided by your care team.</p>
              )}
            </div>
          )}

          {/* Warning Signs Tab */}
          {activeTab === 'warnings' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">When to Seek Help</h3>
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                <p className="text-red-900 font-semibold mb-3">
                  🚨 Call your care team or go to the emergency room if you experience:
                </p>
                {plan.warning_signs && plan.warning_signs.length > 0 ? (
                  <ul className="space-y-2">
                    {plan.warning_signs.map((sign, idx) => (
                      <li key={idx} className="flex items-start text-red-800">
                        <span className="text-red-600 mr-2 font-bold">•</span>
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2 text-red-800">
                    <li>• Severe chest pain or difficulty breathing</li>
                    <li>• High fever (over 101°F / 38.3°C)</li>
                    <li>• Excessive bleeding or drainage</li>
                    <li>• Signs of infection at surgical site</li>
                    <li>• Severe pain not controlled by medication</li>
                  </ul>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-900 font-semibold mb-2">📞 Emergency Contacts</p>
                <p className="text-blue-800 text-sm">
                  Always keep your care team's contact information easily accessible.
                  Don't hesitate to call if you have any concerns about your recovery.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="card bg-gradient-to-br from-teal-50 to-blue-50">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Remember</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-teal-500 mr-2">✓</span>
            <span>Your recovery is a journey - be patient with yourself</span>
          </li>
          <li className="flex items-start">
            <span className="text-teal-500 mr-2">✓</span>
            <span>Follow all instructions from your care team</span>
          </li>
          <li className="flex items-start">
            <span className="text-teal-500 mr-2">✓</span>
            <span>Ask questions if anything is unclear</span>
          </li>
          <li className="flex items-start">
            <span className="text-teal-500 mr-2">✓</span>
            <span>Attend all follow-up appointments</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default LifestylePlan
