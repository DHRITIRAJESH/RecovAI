import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Info, Phone, Navigation } from 'lucide-react';
import axios from 'axios';

const AppointmentScheduler = () => {
  const [appointments, setAppointments] = useState([]);

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
        phone: '+1 (555) 123-4567',
        purpose: 'Wound check, remove staples/stitches, assess healing progress',
        preparation: ['Bring list of current medications', 'Write down any questions or concerns', 'Wear loose, comfortable clothing'],
        status: 'upcoming',
        daysUntil: 7,
        color: 'blue'
      },
      {
        id: 2,
        type: 'Lab Work',
        doctor: 'Laboratory Services',
        specialty: 'Blood Tests',
        date: '2025-10-30',
        time: '08:00 AM',
        location: 'Lab Services, Ground Floor',
        phone: '+1 (555) 123-4500',
        purpose: 'Check blood counts, kidney function, infection markers',
        preparation: ['Fasting required (no food/drink after midnight)', 'Bring insurance card', 'Arrive 15 minutes early'],
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
        phone: '+1 (555) 123-4580',
        purpose: 'Assess mobility, create personalized exercise plan, strengthen core',
        preparation: ['Wear comfortable athletic clothing', 'Bring sneakers', 'List current pain levels and limitations'],
        status: 'upcoming',
        daysUntil: 10,
        color: 'green'
      },
      {
        id: 4,
        type: 'Nutrition Consultation',
        doctor: 'Registered Dietitian',
        specialty: 'Clinical Nutrition',
        date: '2025-11-08',
        time: '11:00 AM',
        location: 'Wellness Center, Suite 201',
        phone: '+1 (555) 123-4590',
        purpose: 'Optimize diet for healing, manage weight, prevent complications',
        preparation: ['Keep food diary for 3 days before visit', 'List current supplements', 'Note any food allergies'],
        status: 'upcoming',
        daysUntil: 13,
        color: 'orange'
      }
    ];
  };

  const getAppointmentColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500'
    };
    return colors[color] || colors.blue;
  };

  const getCardColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">📅 My Appointments</h1>
        <p className="text-purple-100">Stay on top of your recovery appointments and preparation</p>
      </div>

      {/* Upcoming Count */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Upcoming Appointments</p>
            <p className="text-3xl font-bold text-purple-600">{appointments.length}</p>
          </div>
          <Calendar className="text-purple-600" size={48} />
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`${getAppointmentColor(apt.color)} h-2`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className={getCardColor(apt.color)} size={28} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{apt.type}</h3>
                      <p className="text-sm text-gray-500">{apt.doctor} • {apt.specialty}</p>
                    </div>
                  </div>
                </div>
                <div className={`text-right px-4 py-2 rounded-lg ${apt.daysUntil <= 3 ? 'bg-red-100 text-red-800' : apt.daysUntil <= 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  <div className="text-2xl font-bold">{apt.daysUntil}</div>
                  <div className="text-xs font-medium">days away</div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-3 gap-3 mb-4">
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
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="text-gray-600" size={20} />
                  <div>
                    <div className="text-xs text-gray-500">Contact</div>
                    <div className="font-semibold text-gray-800 text-sm">{apt.phone}</div>
                  </div>
                </div>
              </div>

              {/* Location & Purpose */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="text-blue-600 mt-0.5" size={18} />
                  <p className="text-sm font-semibold text-blue-900">{apt.location}</p>
                </div>
                <p className="text-sm text-blue-700 ml-6">{apt.purpose}</p>
              </div>

              {/* Preparation Checklist */}
              <div className="mb-4 bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={18} />
                  Preparation Checklist
                </h4>
                <ul className="space-y-2">
                  {apt.preparation.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer" 
                      />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
                  <Calendar size={18} />
                  Add to Calendar
                </button>
                <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium">
                  <Navigation size={18} />
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reminder Info */}
      <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <Info className="text-purple-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">📲 Smart Reminders Active</h3>
            <p className="text-sm text-purple-700">
              You'll receive push notifications 24 hours before each appointment. 
              Make sure to complete your preparation checklist the day before!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
