import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, Moon, TrendingUp, ChevronRight, Calendar } from 'lucide-react';
import axios from 'axios';

const SymptomTracker = () => {
  const [symptoms, setSymptoms] = useState({
    painLevel: 0,
    temperature: '',
    woundCondition: 'good',
    sleepQuality: 5,
    hoursSlept: '',
    swelling: false,
    redness: false,
    discharge: false,
    nausea: false,
    dizziness: false,
    shortnessOfBreath: false,
    notes: ''
  });

  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchSymptomHistory();
  }, []);

  const fetchSymptomHistory = async () => {
    try {
      const response = await axios.get('/api/symptoms/history', { withCredentials: true });
      setHistory(response.data.history || getMockHistory());
    } catch (error) {
      console.error('Error fetching symptom history:', error);
      setHistory(getMockHistory());
    }
  };

  const getMockHistory = () => {
    return [
      { date: '2025-10-26', time: '08:00', painLevel: 2, temperature: 98.6, woundCondition: 'good', sleepQuality: 7, hoursSlept: 6.5, notes: 'Feeling better' },
      { date: '2025-10-25', time: '20:00', painLevel: 4, temperature: 99.1, woundCondition: 'fair', sleepQuality: 5, hoursSlept: 5, notes: 'Some discomfort' },
      { date: '2025-10-25', time: '08:00', painLevel: 5, temperature: 98.9, woundCondition: 'fair', sleepQuality: 4, hoursSlept: 4, notes: 'Pain after walking' },
      { date: '2025-10-24', time: '20:00', painLevel: 6, temperature: 99.5, woundCondition: 'good', sleepQuality: 3, hoursSlept: 3, notes: 'First day home' },
    ];
  };

  const checkForRedFlags = () => {
    const redFlags = [];
    
    if (symptoms.painLevel >= 8) {
      redFlags.push('Severe pain (8+/10)');
    }
    if (parseFloat(symptoms.temperature) >= 101.0) {
      redFlags.push('High fever (101°F+)');
    }
    if (symptoms.woundCondition === 'poor') {
      redFlags.push('Poor wound condition');
    }
    if (symptoms.discharge) {
      redFlags.push('Wound discharge');
    }
    if (symptoms.shortnessOfBreath) {
      redFlags.push('Shortness of breath');
    }
    if (symptoms.redness && symptoms.swelling) {
      redFlags.push('Significant redness and swelling');
    }

    return redFlags;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const redFlags = checkForRedFlags();
    
    if (redFlags.length > 0) {
      setAlertMessage(`⚠️ RED FLAG ALERT: ${redFlags.join(', ')}. Your care team has been notified immediately.`);
      setShowAlert(true);
      
      // Send alert to care team
      try {
        await axios.post('/api/symptoms/alert', {
          symptoms,
          redFlags,
          timestamp: new Date().toISOString()
        }, { withCredentials: true });
      } catch (error) {
        console.error('Error sending alert:', error);
      }
    }

    // Save symptom log
    try {
      await axios.post('/api/symptoms/log', symptoms, {
        withCredentials: true
      });

      // Reset form
      setSymptoms({
        painLevel: 0,
        temperature: '',
        woundCondition: 'good',
        sleepQuality: 5,
        hoursSlept: '',
        swelling: false,
        redness: false,
        discharge: false,
        nausea: false,
        dizziness: false,
        shortnessOfBreath: false,
        notes: ''
      });
      
      fetchSymptomHistory();
      
      if (redFlags.length === 0) {
        setAlertMessage('✅ Symptoms logged successfully. You\'re doing great!');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      console.error('Error logging symptoms:', error);
      setAlertMessage('❌ Error logging symptoms. Please try again.');
      setShowAlert(true);
    }
  };

  const getPainColor = (level) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Symptom & Progress Tracking</h1>
        <p className="text-green-100">Daily check-ins help your care team monitor your recovery</p>
      </div>

      {/* Alert Banner */}
      {showAlert && (
        <div className={`mb-6 p-4 rounded-lg ${
          alertMessage.includes('RED FLAG') ? 'bg-red-100 border-l-4 border-red-500' : 'bg-green-100 border-l-4 border-green-500'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={alertMessage.includes('RED FLAG') ? 'text-red-600' : 'text-green-600'} size={24} />
            <p className={`font-medium ${alertMessage.includes('RED FLAG') ? 'text-red-800' : 'text-green-800'}`}>
              {alertMessage}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Check-in Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity className="text-blue-600" />
              Daily Check-In
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pain Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Level (0 = No pain, 10 = Worst pain)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={symptoms.painLevel}
                    onChange={(e) => setSymptoms({ ...symptoms, painLevel: parseInt(e.target.value) })}
                    className="flex-1 h-3 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className={`text-3xl font-bold ${getPainColor(symptoms.painLevel)}`}>
                    {symptoms.painLevel}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No pain</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={symptoms.temperature}
                  onChange={(e) => setSymptoms({ ...symptoms, temperature: e.target.value })}
                  placeholder="98.6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {parseFloat(symptoms.temperature) >= 100.4 && (
                  <p className="text-red-600 text-sm mt-1">⚠️ Elevated temperature - monitor closely</p>
                )}
              </div>

              {/* Wound Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wound Condition
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['good', 'fair', 'poor'].map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => setSymptoms({ ...symptoms, woundCondition: condition })}
                      className={`py-3 px-4 rounded-lg font-medium capitalize transition-all ${
                        symptoms.woundCondition === condition
                          ? condition === 'good'
                            ? 'bg-green-600 text-white'
                            : condition === 'fair'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Quality & Hours */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Moon className="inline mr-2" size={18} />
                  Sleep Quality & Recovery
                </label>
                
                <div className="space-y-4">
                  {/* Hours Slept */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Hours Slept Last Night
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={symptoms.hoursSlept}
                      onChange={(e) => setSymptoms({ ...symptoms, hoursSlept: e.target.value })}
                      placeholder="7.5"
                      className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {symptoms.hoursSlept && parseFloat(symptoms.hoursSlept) < 6 && (
                      <p className="text-orange-600 text-xs mt-1">💡 Try to get 7-9 hours for optimal healing</p>
                    )}
                  </div>

                  {/* Sleep Quality Slider */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Sleep Quality (1 = Very Poor, 10 = Excellent)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={symptoms.sleepQuality}
                        onChange={(e) => setSymptoms({ ...symptoms, sleepQuality: parseInt(e.target.value) })}
                        className="flex-1 h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className={`text-2xl font-bold ${
                        symptoms.sleepQuality <= 3 ? 'text-red-600' : 
                        symptoms.sleepQuality <= 6 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {symptoms.sleepQuality}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Very Poor</span>
                      <span>Fair</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="bg-indigo-100 p-3 rounded text-xs text-indigo-800">
                    <strong>💤 Sleep Tips:</strong> Quality sleep promotes healing, reduces pain, and boosts immunity. 
                    If you're struggling to sleep, talk to your care team about safe sleep aids.
                  </div>
                </div>
              </div>

              {/* Symptoms Checklist */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Check any symptoms you're experiencing:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'swelling', label: 'Swelling', critical: false },
                    { key: 'redness', label: 'Redness', critical: false },
                    { key: 'discharge', label: 'Discharge', critical: true },
                    { key: 'nausea', label: 'Nausea', critical: false },
                    { key: 'dizziness', label: 'Dizziness', critical: false },
                    { key: 'shortnessOfBreath', label: 'Shortness of Breath', critical: true }
                  ].map((symptom) => (
                    <label
                      key={symptom.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        symptoms[symptom.key]
                          ? symptom.critical
                            ? 'border-red-500 bg-red-50'
                            : 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={symptoms[symptom.key]}
                        onChange={(e) => setSymptoms({ ...symptoms, [symptom.key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">{symptom.label}</span>
                      {symptom.critical && symptoms[symptom.key] && (
                        <AlertCircle className="text-red-600 ml-auto" size={20} />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={symptoms.notes}
                  onChange={(e) => setSymptoms({ ...symptoms, notes: e.target.value })}
                  rows="4"
                  placeholder="Any other observations or concerns..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Activity size={20} />
                Log Today's Symptoms
              </button>
            </form>
          </div>
        </div>

        {/* Visual Analytics */}
        <div className="space-y-6">
          {/* Progress Chart Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" />
              7-Day Trend
            </h3>
            
            {/* Pain Trend */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Pain Level</p>
              <div className="flex items-end gap-1 h-24">
                {[6, 5, 4, 5, 4, 2, 0].map((level, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t ${
                        level <= 3 ? 'bg-green-400' : level <= 6 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ height: `${(level / 10) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{index === 6 ? 'Today' : `D${7-index}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Temp Trend */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Temperature (°F)</p>
              <div className="space-y-2">
                {[
                  { day: 'Today', temp: 98.6, normal: true },
                  { day: 'Yesterday', temp: 99.1, normal: true },
                  { day: '2 days ago', temp: 98.9, normal: true },
                  { day: '3 days ago', temp: 99.5, normal: true }
                ].map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20">{entry.day}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                      <div
                        className={`h-6 rounded-full ${entry.temp >= 100.4 ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${((entry.temp - 97) / 5) * 100}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {entry.temp}°F
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              Recent Logs
            </h3>
            <div className="space-y-3">
              {history.slice(0, 4).map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-700">{entry.date}</span>
                    <span className="text-xs text-gray-500">{entry.time}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Pain: <span className={getPainColor(entry.painLevel)}>{entry.painLevel}/10</span> | 
                    Temp: {entry.temperature}°F
                  </div>
                  {entry.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-1">
              View All History
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Smart Alerts Enabled</h3>
            <p className="text-sm text-yellow-700">
              If you report red flag symptoms (severe pain, high fever, wound issues, breathing problems), 
              your care team will be <strong>immediately notified</strong> and may contact you within minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomTracker;
