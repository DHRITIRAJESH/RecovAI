import React from 'react'

function RiskAssessmentReport({ assessment, patient }) {
  // Add null check
  if (!assessment || !assessment.risks) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">No risk assessment available for this patient.</p>
      </div>
    )
  }

  const getRiskColor = (category) => {
    const colors = {
      'CRITICAL': 'bg-red-500',
      'HIGH': 'bg-orange-500',
      'MODERATE': 'bg-yellow-500',
      'LOW': 'bg-green-500'
    }
    return colors[category] || colors['LOW']
  }

  const getRiskIcon = (category) => {
    const icons = {
      'CRITICAL': '🔴',
      'HIGH': '⚠️',
      'MODERATE': '🟡',
      'LOW': '✅'
    }
    return icons[category] || icons['LOW']
  }

  const getRiskPercentage = (risk) => {
    return Math.min(100, Math.max(0, risk))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Risk Assessment Report</h2>

      {/* Risk Levels Banner (legend) - placed at the top */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className="font-semibold text-gray-800">Risk Levels</div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center px-2 py-1 rounded bg-red-100 text-red-800 text-sm">🔴 CRITICAL</div>
          <div className="flex items-center px-2 py-1 rounded bg-orange-100 text-orange-800 text-sm">⚠️ HIGH</div>
          <div className="flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">🟡 MODERATE</div>
          <div className="flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-sm">✅ LOW</div>
        </div>
      </div>

      {/* Overall Risk Badge */}
      <div className={`card ${
        assessment.overall_risk === 'CRITICAL' ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300' :
        assessment.overall_risk === 'HIGH' ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300' :
        assessment.overall_risk === 'MODERATE' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300' :
        'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">{getRiskIcon(assessment.overall_risk)}</div>
          <h3 className="text-3xl font-bold mb-2">
            {assessment.overall_risk} RISK
          </h3>
          <p className="text-gray-700">Overall Surgical Risk Category</p>
        </div>
      </div>

      {/* Individual Risk Metrics - build a sorted list of metrics so highest risk shows first */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {
          // build entries from known metric keys
          (() => {
            const keys = ['aki', 'cardiovascular', 'transfusion', 'mortality']
            const labelMap = {
              aki: 'Acute Kidney Injury (AKI)',
              cardiovascular: 'Cardiovascular Complications',
              transfusion: 'Transfusion Required',
              mortality: 'Mortality Risk'
            }

            const entries = keys.reduce((acc, k) => {
              const value = assessment.risks?.[k]
              if (value === undefined || value === null) return acc
              acc.push({ key: k, label: labelMap[k] || k, value: value, category: assessment.risk_categories?.[k], factors: assessment.contributing_factors?.[k] })
              return acc
            }, [])

            // sort descending by numeric risk value
            entries.sort((a, b) => b.value - a.value)

            return entries.map((entry) => (
              <div className="card" key={entry.key}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{entry.label}</h4>
                  <span className={`badge ${
                    entry.category === 'CRITICAL' ? 'badge-critical' :
                    entry.category === 'HIGH' ? 'badge-high' :
                    entry.category === 'MODERATE' ? 'badge-moderate' :
                    'badge-low'
                  }`}>
                    {getRiskIcon(entry.category)} {entry.category}
                  </span>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="text-xs font-semibold inline-block text-gray-600">Risk Level</div>
                    <div className="text-xs font-semibold inline-block text-gray-900">{entry.value.toFixed(1)}%</div>
                  </div>
                  <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200">
                    <div
                      style={{ width: `${getRiskPercentage(entry.value)}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getRiskColor(entry.category)}`}
                    ></div>
                  </div>
                </div>

                {entry.factors && entry.factors.length > 0 && (
                  <div className="mt-3 text-sm">
                    <p className="text-gray-600 font-medium mb-1">Contributing Factors:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {entry.factors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          })()
        }
      </div>

      {/* Clinical Recommendations */}
      {assessment.recommendations && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Clinical Recommendations</h3>
          
          {/* Summary */}
          {assessment.recommendations.summary && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-800">{assessment.recommendations.summary}</p>
            </div>
          )}

          {/* Priority Actions */}
          {assessment.recommendations.priority_actions && assessment.recommendations.priority_actions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                🔴 Priority Actions
              </h4>
              <ul className="space-y-2">
                {assessment.recommendations.priority_actions.map((action, idx) => (
                  <li key={idx} className="flex items-start p-3 bg-red-50 rounded border border-red-200">
                    <span className="text-red-700 mr-2">•</span>
                    <span className="text-gray-800">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Recommendations by Complication */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(assessment.recommendations.recommendations || {}).map(([complication, recs]) => (
              recs.length > 0 && (
                <div key={complication}>
                  <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                    {complication === 'aki' ? 'AKI' : complication} Management
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {recs.map((rec, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-teal-600 mr-2">✓</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>

          {/* Procedural Modifications */}
          {assessment.recommendations.procedural_modifications && 
           Object.keys(assessment.recommendations.procedural_modifications).length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3">Procedural Modifications</h4>
              {Object.entries(assessment.recommendations.procedural_modifications).map(([complication, mods]) => (
                <div key={complication} className="mb-3">
                  <p className="text-sm font-medium text-purple-800 mb-1 capitalize">
                    {complication === 'aki' ? 'AKI' : complication}:
                  </p>
                  <ul className="space-y-1 text-sm">
                    {mods.map((mod, idx) => (
                      <li key={idx} className="flex items-start ml-4">
                        <span className="text-purple-600 mr-2">▸</span>
                        <span className="text-gray-700">{mod}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RiskAssessmentReport
