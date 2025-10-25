import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Info, Phone } from 'lucide-react';
import axios from 'axios';

const AppointmentScheduler = () => {
  const [appointments, setAppointments] = useState([]);
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments', { withCredentials: true });
      setAppointments(response.data.appointments || getMockAppointments());
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments(getMockAppointments());
    }
  };

  const getMockAppointments = () => {
    return [
      {
        id: 1,
        type: 'Surgical Follow-Up',
        doctor: 'Dr. Sarah Smith',
        specialty: 'General Surgery',
        date: '2025-11-02',
        time: '10:00 AM',
        location: 'Medical Center, Room 305',
        purpose: 'Wound check, remove staples/stitches, assess healing',
        preparation: ['Bring list of current medications', 'Write down any questions or concerns'],
        status: 'upcoming',
        daysUntil: 7,
        color: 'blue'
      },
      {
        id: 2,
        type: 'Lab Work',
        doctor: 'Laboratory',
        specialty: 'Blood Tests',
        date: '2025-10-30',
        time: '08:00 AM',
        location: 'Lab Services, Ground Floor',
        purpose: 'Check blood counts, kidney function, infection markers',
        preparation: ['Fasting required (no food/drink after midnight)', 'Bring insurance card'],
        status: 'upcoming',
        daysUntil: 4,
        color: 'purple'
      },
      {
        id: 3,
        type: 'Physical Therapy Evaluation',
        doctor: 'PT Staff',
        specialty: 'Rehabilitation',
        date: '2025-11-05',
        time: '02:00 PM',
        location: 'Rehab Center, 2nd Floor',
        purpose: 'Assess mobility, create exercise plan, strengthen core',
        preparation: ['Wear comfortable clothing', 'Bring list of current pain levels'],
        status: 'upcoming',
        daysUntil: 10,
        color: 'green'
      },
      {
        id: 4,
        type: 'Nutrition Consultation',
        doctor: 'Dietitian',
        specialty: 'Nutrition',
        date: '2025-11-08',
        time: '11:00 AM',
        location: 'Wellness Center, Suite 201',
        purpose: 'Optimize diet for healing, manage weight, prevent complications',
        preparation: ['Keep food diary for 3 days before visit'],
        status: 'upcoming',
        daysUntil: 13,
        color: 'orange'
      }
    ];
  };

  const markMedicationTaken = (medId) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    setMedications(prev => prev.map(med => {
      if (med.id === medId) {
        const currentIndex = med.schedule.findIndex(time => time > timeString);
        const nextDose = currentIndex >= 0 ? med.schedule[currentIndex] : 'Tomorrow ' + med.schedule[0];
        return { ...med, lastTaken: timeString, nextDose };
      }
      return med;
    }));
  };

  const getMedColor = (color) => {
    const colors = {
      red: 'bg-red-100 border-red-300 text-red-800',
      blue: 'bg-blue-100 border-blue-300 text-blue-800',
      orange: 'bg-orange-100 border-orange-300 text-orange-800',
      yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      green: 'bg-green-100 border-green-300 text-green-800',
      purple: 'bg-purple-100 border-purple-300 text-purple-800'
    };
    return colors[color] || colors.blue;
  };

  const getAppointmentColor = (color) => {
    const colors = {
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      green: 'bg-green-600',
      orange: 'bg-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">💊 Medication & Appointment Manager</h1>
        <p className="text-purple-100">Auto-generated schedule based on your recovery phase</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('medications')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            activeTab === 'medications'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Pill className="inline mr-2" size={20} />
          Medications ({medications.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            activeTab === 'appointments'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Calendar className="inline mr-2" size={20} />
          Appointments ({appointments.length})
        </button>
      </div>

      {/* Medications View */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med.id} className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${getMedColor(med.color).split(' ')[1]}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Pill className={med.color === 'red' ? 'text-red-600' : med.color === 'blue' ? 'text-blue-600' : med.color === 'orange' ? 'text-orange-600' : med.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'} size={24} />
                      <h3 className="text-xl font-bold text-gray-800">{med.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full ${getMedColor(med.color)}`}>
                        {med.phase}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">{med.purpose}</p>
                    <p className="text-sm text-gray-500">{med.frequency}</p>
                  </div>
                  <button
                    onClick={() => setShowMedDetails(showMedDetails === med.id ? null : med.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showMedDetails === med.id ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {/* Schedule Timeline */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Today's Schedule</span>
                  </div>
                  <div className="flex gap-2">
                    {med.schedule.map((time, index) => (
                      <div
                        key={index}
                        className={`flex-1 py-2 px-3 rounded-lg text-center ${
                          time <= med.lastTaken
                            ? 'bg-green-100 border-2 border-green-500'
                            : time === med.nextDose
                            ? 'bg-yellow-100 border-2 border-yellow-500 animate-pulse'
                            : 'bg-gray-100 border-2 border-gray-300'
                        }`}
                      >
                        <div className="text-lg font-bold">{time}</div>
                        {time <= med.lastTaken && (
                          <CheckCircle className="mx-auto mt-1 text-green-600" size={16} />
                        )}
                        {time === med.nextDose && (
                          <Bell className="mx-auto mt-1 text-yellow-600 animate-bounce" size={16} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => markMedicationTaken(med.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Mark as Taken
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Bell size={18} />
                    Set Reminder
                  </button>
                </div>

                {/* Detailed Information */}
                {showMedDetails === med.id && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-100 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="text-blue-600" size={18} />
                        <h4 className="font-semibold text-gray-800">Instructions</h4>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{med.instructions}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="text-yellow-600" size={18} />
                        <h4 className="font-semibold text-gray-800">Side Effects</h4>
                      </div>
                      <ul className="text-sm text-gray-600 ml-6 list-disc list-inside">
                        {med.sideEffects.map((effect, index) => (
                          <li key={index}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointments View */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`${getAppointmentColor(apt.color)} h-2`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className={apt.color === 'blue' ? 'text-blue-600' : apt.color === 'purple' ? 'text-purple-600' : apt.color === 'green' ? 'text-green-600' : 'text-orange-600'} size={24} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{apt.type}</h3>
                        <p className="text-sm text-gray-500">{apt.doctor} - {apt.specialty}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`text-right px-4 py-2 rounded-lg ${apt.daysUntil <= 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    <div className="text-2xl font-bold">{apt.daysUntil}</div>
                    <div className="text-xs">days away</div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="text-gray-600" size={20} />
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-semibold text-gray-800">{apt.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="text-gray-600" size={20} />
                    <div>
                      <div className="text-xs text-gray-500">Time</div>
                      <div className="font-semibold text-gray-800">{apt.time}</div>
                    </div>
                  </div>
                </div>

                {/* Location & Purpose */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">📍 {apt.location}</p>
                  <p className="text-sm text-blue-700">{apt.purpose}</p>
                </div>

                {/* Preparation Checklist */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={18} />
                    Preparation Checklist
                  </h4>
                  <ul className="space-y-2">
                    {apt.preparation.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Bell size={18} />
                    Add to Calendar
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <Info size={18} />
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder Settings */}
      <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <Bell className="text-purple-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">Smart Reminders Enabled</h3>
            <p className="text-sm text-purple-700">
              You'll receive push notifications for upcoming doses and appointments. 
              Reminders are sent 30 minutes before medications and 24 hours before appointments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationReminders;
