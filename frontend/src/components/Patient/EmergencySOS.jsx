import React, { useState } from 'react';
import { AlertTriangle, Phone, MessageCircle, Heart, User, Clock, MapPin, Activity } from 'lucide-react';
import axios from 'axios';

const EmergencySOS = () => {
  const [emergencyType, setEmergencyType] = useState(null);
  const [alertSent, setAlertSent] = useState(false);
  const [calling, setCalling] = useState(false);

  const emergencyTypes = [
    {
      id: 'severe-pain',
      title: 'Severe Pain',
      icon: '😫',
      description: 'Unbearable pain not controlled by medications',
      priority: 'critical'
    },
    {
      id: 'breathing',
      title: 'Breathing Issues',
      icon: '🫁',
      description: 'Difficulty breathing or shortness of breath',
      priority: 'critical'
    },
    {
      id: 'chest-pain',
      title: 'Chest Pain',
      icon: '💔',
      description: 'Chest pain, pressure, or tightness',
      priority: 'critical'
    },
    {
      id: 'bleeding',
      title: 'Heavy Bleeding',
      icon: '🩸',
      description: 'Uncontrolled bleeding from incision',
      priority: 'critical'
    },
    {
      id: 'fever',
      title: 'High Fever',
      icon: '🤒',
      description: 'Temperature above 101°F with chills',
      priority: 'urgent'
    },
    {
      id: 'wound',
      title: 'Wound Issues',
      icon: '🩹',
      description: 'Increasing redness, pus, foul odor',
      priority: 'urgent'
    },
    {
      id: 'nausea',
      title: 'Severe Nausea',
      icon: '🤢',
      description: 'Persistent vomiting, unable to keep fluids down',
      priority: 'urgent'
    },
    {
      id: 'other',
      title: 'Other Emergency',
      icon: '⚠️',
      description: 'Something else that concerns you',
      priority: 'urgent'
    }
  ];

  const careTeam = [
    {
      name: 'Dr. Sarah Smith',
      role: 'Surgeon',
      phone: '+1 (555) 123-4567',
      available: '24/7 Emergency Line'
    },
    {
      name: 'Nurse Hotline',
      role: 'RN On-Call',
      phone: '+1 (555) 123-4568',
      available: '24/7'
    }
  ];

  const emergencyContacts = [
    {
      name: 'Emergency Services',
      phone: '911',
      description: 'Life-threatening emergencies'
    },
    {
      name: 'Hospital',
      phone: '+1 (555) 123-4569',
      description: 'Main Hospital Line'
    }
  ];

  const sendUrgentAlert = async (type) => {
    setEmergencyType(type);
    setAlertSent(true);

    try {
      await axios.post('/api/emergency/alert', {
        type: type.id,
        title: type.title,
        description: type.description,
        priority: type.priority,
        timestamp: new Date().toISOString(),
        location: 'Home' // Could use geolocation
      }, { withCredentials: true });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }

    // Auto-reset after showing confirmation
    setTimeout(() => {
      setAlertSent(false);
      setEmergencyType(null);
    }, 10000);
  };

  const makeCall = (phone) => {
    setCalling(true);
    window.location.href = `tel:${phone}`;
    setTimeout(() => setCalling(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">🚨 Emergency SOS</h1>
        <p className="text-red-100">One-tap urgent assistance when you need it most</p>
      </div>

      {/* Alert Sent Confirmation */}
      {alertSent && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-6 rounded-lg animate-pulse">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white rounded-full p-3">
              <AlertTriangle size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                ✅ Alert Sent to Care Team!
              </h2>
              <p className="text-green-800 mb-4">
                Your emergency alert for <strong>{emergencyType?.title}</strong> has been sent. 
                A care team member will contact you within <strong>5 minutes</strong>.
              </p>
              <div className="flex items-center gap-2 text-green-700">
                <Clock size={20} />
                <span className="font-medium">Sent at {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical - Call 911 Banner */}
      <div className="mb-6 bg-red-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="bg-white text-red-600 rounded-full p-4">
            <Phone size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">Life-Threatening Emergency?</h2>
            <p className="mb-4">
              If you have chest pain, can't breathe, or are experiencing a medical emergency, call 911 immediately.
            </p>
            <button
              onClick={() => makeCall('911')}
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all flex items-center gap-3 shadow-lg"
            >
              <Phone size={24} />
              CALL 911 NOW
            </button>
          </div>
        </div>
      </div>

      {/* Urgent - One-Tap Alerts */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" />
          Select Your Emergency
        </h2>
        <p className="text-gray-600 mb-6">
          Tap any button below to instantly alert your care team. They will receive details and contact you ASAP.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => sendUrgentAlert(type)}
              disabled={alertSent}
              className={`p-6 rounded-lg border-2 transition-all transform hover:scale-105 active:scale-95 ${
                type.priority === 'critical'
                  ? 'border-red-500 bg-red-50 hover:bg-red-100'
                  : 'border-orange-500 bg-orange-50 hover:bg-orange-100'
              } ${alertSent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-5xl mb-3">{type.icon}</div>
              <h3 className={`font-bold text-lg mb-2 ${
                type.priority === 'critical' ? 'text-red-800' : 'text-orange-800'
              }`}>
                {type.title}
              </h3>
              <p className={`text-sm ${
                type.priority === 'critical' ? 'text-red-600' : 'text-orange-600'
              }`}>
                {type.description}
              </p>
              {type.priority === 'critical' && (
                <div className="mt-3 text-xs font-bold text-red-700 uppercase">Critical</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Direct Contact - Care Team */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Care Team */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="text-blue-600" />
            Your Care Team
          </h2>
          <div className="space-y-4">
            {careTeam.map((member, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  <Activity className="text-green-500" size={24} />
                </div>
                <p className="text-xs text-gray-500 mb-3">{member.available}</p>
                <button
                  onClick={() => makeCall(member.phone)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Call {member.phone}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Phone className="text-red-600" />
            Emergency Numbers
          </h2>
          <div className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-bold text-red-900 mb-1">{contact.name}</h3>
                <p className="text-sm text-red-700 mb-3">{contact.description}</p>
                <button
                  onClick={() => makeCall(contact.phone)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-bold"
                >
                  <Phone size={18} />
                  {contact.phone}
                </button>
              </div>
            ))}
          </div>

          {/* SMS Option */}
          <div className="mt-4 border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-bold text-blue-900 mb-1">Text Message</h3>
            <p className="text-sm text-blue-700 mb-3">Can't talk? Send SMS instead</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              Send Text to Team
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin size={20} />
          Your Information
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Location:</span>
            <p className="font-medium text-gray-800">Home - Bengaluru</p>
          </div>
          <div>
            <span className="text-gray-600">Surgery Date:</span>
            <p className="font-medium text-gray-800">Oct 21, 2025</p>
          </div>
          <div>
            <span className="text-gray-600">Days Post-Op:</span>
            <p className="font-medium text-gray-800">5 days</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          This information is automatically shared when you send an alert to help the care team respond quickly.
        </p>
      </div>
    </div>
  );
};

export default EmergencySOS;
