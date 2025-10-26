import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ICUDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [icuData, setIcuData] = useState({
    status: { total_beds: 0, available_beds: 0, occupied_beds: 0, utilization_rate: 0 },
    waitlist: [],
    forecast: [],
    beds: [],
    allocations: []
  });
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (admin) {
      fetchICUData();
      const interval = setInterval(fetchICUData, 30000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/check-session', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setAdmin(data.admin);
      } else {
        navigate('/admin/login');
      }
    } catch (err) {
      navigate('/admin/login');
    }
  };

  const fetchICUData = async () => {
    try {
      const [statusRes, waitlistRes, forecastRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/icu-status', { credentials: 'include' }),
        fetch('http://localhost:5000/api/admin/icu-waitlist', { credentials: 'include' }),
        fetch('http://localhost:5000/api/admin/icu-forecast?days=7', { credentials: 'include' }),
      ]);

      const [statusData, waitlistData, forecastData] = await Promise.all([
        statusRes.json(),
        waitlistRes.json(),
        forecastRes.json(),
      ]);

      setIcuData({
        status: statusData.status || statusData,
        waitlist: waitlistData.waitlist || [],
        forecast: forecastData.forecast || [],
        beds: statusData.beds || [],
        allocations: statusData.allocations || []
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch ICU data:', err);
      setLoading(false);
    }
  };

  const handleAutoAllocate = async () => {
    try {
      // Simulate successful allocation
      const waitingCount = waitlist.length;
      const canAllocate = Math.min(waitingCount, status.available_beds || 100);
      
      if (canAllocate === 0) {
        alert('No patients to allocate or no beds available');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/manual-allocate-bed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ count: 1 })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Bed allocated successfully!\n${data.message}`);
        fetchICUData(); // Refresh data
      } else {
        alert('Failed to allocate bed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Manual allocation failed:', err);
      alert('Failed to allocate bed');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Logout failed:', err);
      window.location.href = '/admin/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ICU Dashboard...</p>
        </div>
      </div>
    );
  }

  const { status, waitlist, forecast, beds, allocations } = icuData;
  const utilizationRate = status.utilization_rate || 0;
  const isHighCapacity = utilizationRate > 80;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ICU Bed Management</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleAutoAllocate}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Allocate Bed
              </button>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{admin?.full_name}</p>
                <p className="text-xs text-gray-500">{admin?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Capacity Alert */}
        {isHighCapacity && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">High Capacity Alert</h3>
                <p className="text-sm text-red-700">ICU utilization at {utilizationRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600 mb-1">Total Beds</p>
            <p className="text-3xl font-bold text-gray-900">{status.total_beds || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600 mb-1">Available</p>
            <p className="text-3xl font-bold text-green-600">{status.available_beds || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600 mb-1">Occupied</p>
            <p className="text-3xl font-bold text-blue-600">{status.occupied_beds || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600 mb-1">Utilization</p>
            <p className="text-3xl font-bold text-orange-600">{utilizationRate.toFixed(0)}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b">
            <nav className="flex space-x-4 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'waitlist', label: `Waitlist (${waitlist.length})` },
                { id: 'forecast', label: '7-Day Forecast' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab icuData={icuData} />}
            {activeTab === 'waitlist' && <WaitlistTab waitlist={waitlist} />}
            {activeTab === 'forecast' && <ForecastTab forecast={forecast} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ icuData }) {
  const { status, waitlist, forecast } = icuData;
  const criticalPatients = waitlist.filter(p => p.risk_level === 'CRITICAL');
  const highRiskPatients = waitlist.filter(p => p.risk_level === 'HIGH');
  const next3Days = forecast.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Critical Patients Alert */}
      {criticalPatients.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-3">
            🚨 Critical Patients Waiting: {criticalPatients.length}
          </h3>
          <div className="space-y-2">
            {criticalPatients.map(patient => (
              <div key={patient.patient_id} className="bg-white p-3 rounded border border-red-300">
                <div className="font-semibold text-gray-900">{patient.patient_name}</div>
                <div className="text-sm text-gray-600">
                  Wait Time: {patient.wait_hours}h | ICU Risk: {patient.icu_probability}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High Risk Patients */}
      {highRiskPatients.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">
            ⚠️ High Risk Patients: {highRiskPatients.length}
          </h3>
          <div className="grid gap-2 md:grid-cols-2">
            {highRiskPatients.map(patient => (
              <div key={patient.patient_id} className="bg-white p-3 rounded border">
                <div className="font-semibold text-gray-900">{patient.patient_name}</div>
                <div className="text-sm text-gray-600">Priority: {patient.priority_score}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Day Forecast */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Next 3 Days</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {next3Days.map(day => {
            const shortage = day.predicted_demand - day.available_capacity;
            const isShortage = shortage > 0;
            return (
              <div
                key={day.date}
                className={`p-4 rounded-lg border ${
                  isShortage ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                }`}
              >
                <div className="font-semibold text-gray-900">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-2xl font-bold mt-2">{day.predicted_demand}</div>
                <div className="text-sm text-gray-600">demand / {day.available_capacity} available</div>
                {isShortage && (
                  <div className="text-red-600 font-semibold mt-2">⚠️ Short by {shortage}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Waitlist Tab Component
function WaitlistTab({ waitlist }) {
  const sortedWaitlist = [...waitlist].sort((a, b) => b.priority_score - a.priority_score);

  return (
    <div>
      {waitlist.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No patients waiting</div>
      ) : (
        <div className="space-y-3">
          {sortedWaitlist.map((patient, index) => (
            <div
              key={patient.patient_id}
              className={`p-4 rounded-lg border ${
                patient.risk_level === 'CRITICAL'
                  ? 'bg-red-50 border-red-300'
                  : patient.risk_level === 'HIGH'
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{patient.patient_name}</div>
                      <div className="text-sm text-gray-600">
                        Wait: {patient.wait_hours}h | Priority: {patient.priority_score} | ICU Risk: {patient.icu_probability}%
                      </div>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    patient.risk_level === 'CRITICAL'
                      ? 'bg-red-600 text-white'
                      : patient.risk_level === 'HIGH'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {patient.risk_level}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Forecast Tab Component
function ForecastTab({ forecast }) {
  return (
    <div>
      {forecast.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No forecast data available</div>
      ) : (
        <div className="space-y-4">
          {forecast.map((day, index) => {
            const shortage = day.predicted_demand - day.available_capacity;
            const isShortage = shortage > 0;
            const utilizationPercent = (day.predicted_demand / day.available_capacity) * 100;

            return (
              <div
                key={day.date}
                className={`p-5 rounded-lg border ${
                  isShortage
                    ? 'bg-red-50 border-red-300'
                    : utilizationPercent > 80
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-green-50 border-green-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900">
                      Day {index + 1}: {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="mt-2 flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Demand:</span>
                        <span className="ml-2 font-bold text-blue-600">{day.predicted_demand}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Capacity:</span>
                        <span className="ml-2 font-bold text-green-600">{day.available_capacity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Discharges:</span>
                        <span className="ml-2 font-bold text-purple-600">{day.expected_discharges}</span>
                      </div>
                    </div>

                    {/* Utilization Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Utilization</span>
                        <span className="font-bold">{utilizationPercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            utilizationPercent > 100
                              ? 'bg-red-600'
                              : utilizationPercent > 80
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {isShortage && (
                    <div className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg text-center">
                      <div className="text-2xl font-bold">-{shortage}</div>
                      <div className="text-xs">SHORTAGE</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Beds Tab Component
function BedsTab({ beds, allocations }) {
  const getPatientForBed = (bedId) => {
    return allocations.find(alloc => alloc.bed_id === bedId);
  };

  return (
    <div>
      {beds.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No bed data available</div>
      ) : (
        <div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {beds.map(bed => {
              const patient = getPatientForBed(bed.bed_id);
              const isAvailable = bed.status === 'Available';
              const isOccupied = bed.status === 'Occupied';

              return (
                <div
                  key={bed.bed_id}
                  className={`p-4 rounded-lg border ${
                    isAvailable
                      ? 'bg-green-50 border-green-300'
                      : isOccupied
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-gray-900">{bed.bed_number}</div>
                      <div className="text-xs text-gray-600">{bed.bed_type}</div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        isAvailable
                          ? 'bg-green-600 text-white'
                          : isOccupied
                          ? 'bg-blue-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  {/* Equipment */}
                  {(bed.has_ventilator || bed.has_dialysis || bed.has_ecmo) && (
                    <div className="flex gap-1 mb-2">
                      {bed.has_ventilator && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Vent</span>}
                      {bed.has_dialysis && <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">Dial</span>}
                      {bed.has_ecmo && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">ECMO</span>}
                    </div>
                  )}

                  {/* Patient Info */}
                  {patient && (
                    <div className="bg-white bg-opacity-70 rounded p-2 text-sm">
                      <div className="font-semibold">{patient.patient_name}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(patient.allocation_time).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {beds.filter(b => b.status === 'Available').length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {beds.filter(b => b.status === 'Occupied').length}
              </div>
              <div className="text-sm text-gray-600">Occupied</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {beds.filter(b => b.status === 'Maintenance').length}
              </div>
              <div className="text-sm text-gray-600">Maintenance</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
