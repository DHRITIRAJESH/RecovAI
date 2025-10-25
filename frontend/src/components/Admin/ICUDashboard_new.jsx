import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ICUDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [icuData, setIcuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (admin) {
      fetchICUData();
      const interval = setInterval(fetchICUData, 30000); // Refresh every 30 seconds
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
      const [statusRes, waitlistRes, forecastRes, analyticsRes, recsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/icu-status', { credentials: 'include' }),
        fetch('http://localhost:5000/api/admin/icu-waitlist', { credentials: 'include' }),
        fetch('http://localhost:5000/api/admin/icu-forecast?days=7', { credentials: 'include' }),
        fetch('http://localhost:5000/api/admin/icu-analytics?days=30', { credentials: 'include' }),
        fetch('http://localhost:5000/api/admin/icu-recommendations', { credentials: 'include' }),
      ]);

      const [status, waitlist, forecast, analytics, recs] = await Promise.all([
        statusRes.json(),
        waitlistRes.json(),
        forecastRes.json(),
        analyticsRes.json(),
        recsRes.json(),
      ]);

      setIcuData({ status, waitlist, forecast, analytics });
      setRecommendations(recs);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch ICU data:', err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateBedStatus = async (bedId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/icu-beds/${bedId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchICUData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to update bed status:', err);
    }
  };

  const allocateBed = async (patientId, bedId, isOverride = false) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/allocate-bed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          patient_id: patientId, 
          bed_id: bedId,
          override: isOverride 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        addAuditLog(`Bed allocated to patient ${patientId} - Room ${result.bed_info?.room_number}`);
        fetchICUData(); // Refresh data
        alert('Bed allocated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to allocate bed');
      }
    } catch (err) {
      console.error('Failed to allocate bed:', err);
      alert('Failed to allocate bed');
    }
  };

  const autoAllocateBeds = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/icu/auto-allocate', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        addAuditLog(`Auto-allocation: ${result.allocations?.length || 0} beds assigned`);
        fetchICUData();
        alert(`Successfully allocated ${result.allocations?.length || 0} beds automatically!`);
      } else {
        alert('Auto-allocation failed');
      }
    } catch (err) {
      console.error('Auto-allocation failed:', err);
      alert('Auto-allocation failed');
    }
  };

  const addAuditLog = (action) => {
    const timestamp = new Date().toLocaleString();
    setAuditLog(prev => [{
      timestamp,
      action,
      admin: admin?.full_name || 'Admin'
    }, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  if (loading || !icuData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading ICU Dashboard...</p>
        </div>
      </div>
    );
  }

  const { status, waitlist, forecast, analytics } = icuData;
  const capacity = status.capacity || {};
  const isCapacityTight = capacity.utilization_rate > 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl mr-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">RecovAI Admin Portal</h1>
                <p className="text-sm text-blue-600 font-medium">Smart ICU Bed Management & Predictive Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isCapacityTight && (
                <div className="flex items-center px-4 py-2 bg-red-100 border border-red-300 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-semibold text-red-700">Capacity Alert</span>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{admin?.full_name}</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">{admin?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg shadow-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-Time Capacity Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Beds</p>
                <p className="text-4xl font-black text-gray-900 mt-2">{capacity.total_beds || 0}</p>
                <p className="text-xs text-gray-500 mt-1">ICU capacity</p>
              </div>
              <div className="bg-blue-600 p-4 rounded-xl shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Available Now</p>
                <p className="text-4xl font-black text-green-600 mt-2">{capacity.available || 0}</p>
                <p className="text-xs text-green-700 mt-1 font-medium">Ready for allocation</p>
              </div>
              <div className="bg-green-600 p-4 rounded-xl shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg p-6 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Occupied</p>
                <p className="text-4xl font-black text-red-600 mt-2">{capacity.occupied || 0}</p>
                <p className="text-xs text-red-700 mt-1 font-medium">Current patients</p>
              </div>
              <div className="bg-red-600 p-4 rounded-xl shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br from-white rounded-xl shadow-lg p-6 border ${
            capacity.utilization_rate > 90 ? 'to-red-50 border-red-300' :
            capacity.utilization_rate > 80 ? 'to-yellow-50 border-yellow-300' :
            'to-blue-50 border-blue-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Utilization</p>
                <p className={`text-4xl font-black mt-2 ${
                  capacity.utilization_rate > 90 ? 'text-red-600' :
                  capacity.utilization_rate > 80 ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>{capacity.utilization_rate || 0}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {capacity.utilization_rate > 90 ? 'CRITICAL' :
                   capacity.utilization_rate > 80 ? 'HIGH' : 'NORMAL'}
                </p>
              </div>
              <div className={`p-4 rounded-xl shadow-md ${
                capacity.utilization_rate > 90 ? 'bg-red-600' :
                capacity.utilization_rate > 80 ? 'bg-yellow-600' :
                'bg-blue-600'
              }`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b-2 border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview & Alerts', icon: '📊' },
                { id: 'auto-assign', name: 'Auto-Assignment', icon: '🤖' },
                { id: 'forecast', name: '7-Day Forecast', icon: '📈' },
                { id: 'recommendations', name: 'Smart Actions', icon: '💡' },
                { id: 'beds', name: 'Bed Status', icon: '🛏️' },
                { id: 'audit', name: 'Audit Trail', icon: '📋' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-4 text-sm font-semibold border-b-4 transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <OverviewTab 
                waitlist={waitlist.waitlist} 
                forecast={forecast.forecast}
                capacity={capacity}
                recommendations={recommendations}
              />
            )}
            {activeTab === 'auto-assign' && (
              <AutoAssignTab 
                waitlist={waitlist.waitlist} 
                beds={status.beds}
                allocateBed={allocateBed}
                autoAllocateBeds={autoAllocateBeds}
                addAuditLog={addAuditLog}
              />
            )}
            {activeTab === 'forecast' && (
              <ForecastTab 
                forecast={forecast.forecast} 
                discharges={forecast.expected_discharges_today}
                capacity={capacity}
              />
            )}
            {activeTab === 'recommendations' && (
              <RecommendationsTab 
                recommendations={recommendations}
                capacity={capacity}
                addAuditLog={addAuditLog}
              />
            )}
            {activeTab === 'beds' && (
              <BedsTab 
                beds={status.beds} 
                updateBedStatus={updateBedStatus}
                addAuditLog={addAuditLog}
              />
            )}
            {activeTab === 'audit' && (
              <AuditTab auditLog={auditLog} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component implementations will be added in next message due to length
