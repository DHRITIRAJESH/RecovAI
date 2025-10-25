import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'

// Configure axios defaults
axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:5000'

// Components
import Login from './components/Auth/Login'
import DoctorDashboard from './components/Doctor/DoctorDashboard'
import PatientPortal from './components/Patient/PatientPortal'
import AdminLogin from './components/Admin/AdminLogin'
import ICUDashboard from './components/Admin/ICUDashboard'

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await axios.get('/api/check-session')
      setAuthenticated(response.data.authenticated)
      setUserType(response.data.user_type)
    } catch (error) {
      console.error('Session check failed:', error)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (type) => {
    setAuthenticated(true)
    setUserType(type)
  }

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout')
      setAuthenticated(false)
      setUserType(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            authenticated ? (
              <Navigate to={userType === 'doctor' ? '/doctor' : '/patient'} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        
        <Route 
          path="/doctor/*" 
          element={
            authenticated && userType === 'doctor' ? (
              <DoctorDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/patient/*" 
          element={
            authenticated && userType === 'patient' ? (
              <PatientPortal onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ICUDashboard />} />
        
        <Route 
          path="/" 
          element={
            authenticated ? (
              <Navigate to={userType === 'doctor' ? '/doctor' : '/patient'} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

