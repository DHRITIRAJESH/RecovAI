// This file contains the tab component implementations for ICU Dashboard
// Copy the contents below (after this comment block) and append to ICUDashboard.jsx

// Overview Tab - Alerts and Critical Information
function OverviewTab({ waitlist, forecast, capacity, recommendations }) {
  const criticalPatients = waitlist.filter(p => p.risk_level === 'CRITICAL');
  const highRiskPatients = waitlist.filter(p => p.risk_level === 'HIGH');
  const upcomingSurgeries = forecast.slice(0, 3);
  
  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {capacity.utilization_rate > 80 && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600 p-6 rounded-lg shadow-md">
          <div className="flex items-start">
            <svg className="w-8 h-8 text-red-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ CAPACITY ALERT: ICU at {capacity.utilization_rate}%</h3>
              <p className="text-sm text-red-800 mb-3">
                Only {capacity.available} bed(s) available. {criticalPatients.length} CRITICAL patients waiting. 
                Immediate action required to prevent unsafe transfers.
              </p>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  {criticalPatients.length} CRITICAL
                </span>
                <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                  {highRiskPatients.length} HIGH RISK
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Patients Waiting */}
        <div className="bg-white border-2 border-red-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">CRITICAL Patients Waiting</h3>
              <p className="text-sm text-gray-600">Require immediate ICU admission</p>
            </div>
          </div>
          {criticalPatients.length === 0 ? (
            <p className="text-green-600 font-medium">✓ No critical patients waiting</p>
          ) : (
            <div className="space-y-3">
              {criticalPatients.map((patient) => (
                <div key={patient.waitlist_id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-red-900">{patient.patient_name}</p>
                      <p className="text-sm text-gray-700">{patient.surgery_type}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                          PRIORITY: {patient.priority}
                        </span>
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          {patient.predicted_icu_days}d ICU
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming High-Demand Days */}
        <div className="bg-white border-2 border-blue-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Next 3 Days Forecast</h3>
              <p className="text-sm text-gray-600">Predicted ICU demand</p>
            </div>
          </div>
          <div className="space-y-3">
            {upcomingSurgeries.map((day, idx) => {
              const demand = day.predicted_icu_needs;
              const isDemandHigh = demand > capacity.available;
              return (
                <div key={idx} className={`p-4 rounded-lg border-2 ${
                  isDemandHigh ? 'bg-orange-50 border-orange-300' : 'bg-green-50 border-green-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">
                        {new Date(day.surgery_day).toLocaleDateString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">Surgeries scheduled</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${isDemandHigh ? 'text-orange-600' : 'text-green-600'}`}>
                        {demand}
                      </p>
                      <p className="text-xs text-gray-600">ICU needs</p>
                    </div>
                  </div>
                  {isDemandHigh && (
                    <p className="text-xs text-orange-700 font-semibold mt-2">
                      ⚠️ Demand exceeds current availability
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">Total Waitlist</h4>
          <p className="text-3xl font-black text-purple-600">{waitlist.length}</p>
          <p className="text-xs text-purple-700 mt-1">Patients awaiting ICU beds</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">7-Day Demand</h4>
          <p className="text-3xl font-black text-blue-600">
            {forecast.reduce((sum, day) => sum + day.predicted_icu_needs, 0)}
          </p>
          <p className="text-xs text-blue-700 mt-1">Total ICU needs next week</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <h4 className="text-sm font-semibold text-green-900 mb-2">Avg Wait Time</h4>
          <p className="text-3xl font-black text-green-600">
            {waitlist.length > 0 ? Math.round(waitlist.reduce((sum, p) => sum + p.priority, 0) / waitlist.length / 10) : 0}h
          </p>
          <p className="text-xs text-green-700 mt-1">Estimated from priority</p>
        </div>
      </div>
    </div>
  );
}

export { OverviewTab };
