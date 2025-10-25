import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import MySurgery from './MySurgery'
import LifestylePlan from './LifestylePlan'
import ChatBot from './ChatBot'
import NearbyRehabCenters from './NearbyRehabCenters'
import RecoveryPlan from './RecoveryPlan'
import SymptomTracker from './SymptomTracker'
import AppointmentScheduler from './AppointmentScheduler'
import EducationLibrary from './EducationLibrary'
import EmergencySOS from './EmergencySOS'
import MentalHealthWellness from './MentalHealthWellness'

function PatientPortal({ onLogout }) {
  const [activeTab, setActiveTab] = useState('surgery')
  const navigate = useNavigate()

  const handleLogout = async () => {
    await onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-500 text-white rounded-full p-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RecovAI</h1>
                <p className="text-sm text-gray-600">Patient Portal</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('surgery')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'surgery'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏥 My Surgery
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'recovery'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Recovery Plan
            </button>
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'symptoms'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Symptom Tracker
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              � Appointments
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'education'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📚 Education
            </button>
            <button
              onClick={() => setActiveTab('mental-health')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'mental-health'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🧠 Mental Health
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'emergency'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚨 Emergency
            </button>
            <button
              onClick={() => setActiveTab('lifestyle')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'lifestyle'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💪 Lifestyle Plan
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'nearby'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📍 Find Centers
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'surgery' && <MySurgery />}
        {activeTab === 'recovery' && <RecoveryPlan />}
        {activeTab === 'symptoms' && <SymptomTracker />}
        {activeTab === 'appointments' && <AppointmentScheduler />}
        {activeTab === 'education' && <EducationLibrary />}
        {activeTab === 'mental-health' && <MentalHealthWellness />}
        {activeTab === 'emergency' && <EmergencySOS />}
        {activeTab === 'lifestyle' && <LifestylePlan />}
        {activeTab === 'nearby' && <NearbyRehabCenters />}
      </main>

      {/* AI Chatbot - Always visible */}
      <ChatBot />
    </div>
  )
}

export default PatientPortal
