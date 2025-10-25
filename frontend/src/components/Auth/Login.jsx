import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loginType, setLoginType] = useState('user') // 'user' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    user_type: 'doctor',
    department: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Admin login
      if (loginType === 'admin') {
        const response = await axios.post('/api/admin/login', {
          email: formData.email,
          password: formData.password
        })
        console.log('Admin login response:', response.data)
        navigate('/admin/dashboard')
        return
      }

      // Regular user login/register
      const endpoint = isLogin ? '/api/login' : '/api/register'
      console.log('Making request to:', endpoint, 'with data:', { ...formData, password: '***' })
      const response = await axios.post(endpoint, formData)
      console.log('Login response:', response.data)

      if (isLogin) {
        onLogin(response.data.user.user_type)
      } else {
        // After registration, switch to login
        setIsLogin(true)
        setError('Registration successful! Please log in.')
      }
    } catch (err) {
      console.error('Login error:', err)
      console.error('Error response:', err.response?.data)
      const errorMsg = err.response?.data?.error || err.message || 'An error occurred. Please check the backend server.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-teal-500 text-white rounded-full p-4 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">RecovAI</h1>
          <p className="text-gray-600">Surgical Risk Prediction System</p>
        </div>

        {/* Login/Register Card */}
        <div className="card">
          {/* Login Type Selector */}
          <div className="flex mb-4 gap-2">
            <button
              type="button"
              onClick={() => { setLoginType('user'); setIsLogin(true); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                loginType === 'user' 
                  ? 'bg-teal-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👨‍⚕️ Doctor/Patient
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('admin'); setIsLogin(true); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                loginType === 'admin' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔐 Admin
            </button>
          </div>

          {loginType === 'user' && (
            <div className="flex mb-6 border-b">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 font-medium transition-colors ${
                  isLogin ? 'text-teal-500 border-b-2 border-teal-500' : 'text-gray-500'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 font-medium transition-colors ${
                  !isLogin ? 'text-teal-500 border-b-2 border-teal-500' : 'text-gray-500'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {loginType === 'admin' && (
            <div className="mb-6 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm font-medium text-blue-900">🏥 ICU Management Portal</p>
              <p className="text-xs text-blue-700 mt-1">Admin access for ICU bed management & analytics</p>
            </div>
          )}

          {error && (
            <div className={`mb-4 p-3 rounded-lg ${
              error.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === 'user' && !isLogin && (
              <>
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-field"
                    required={!isLogin}
                  />
                </div>

                <div>
                  <label className="label">User Type</label>
                  <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>

                {formData.user_type === 'doctor' && (
                  <div>
                    <label className="label">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., General Surgery"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                loginType === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'btn-primary'
              }`}
            >
              {loading ? 'Processing...' : (
                loginType === 'admin' ? 'Admin Login' : (isLogin ? 'Login' : 'Register')
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 space-y-3">
            {loginType === 'user' && (
              <div className="p-3 bg-teal-50 rounded-lg text-sm border border-teal-200">
                <p className="font-semibold text-teal-900 mb-2">👨‍⚕️ Demo Credentials:</p>
                <div className="space-y-1">
                  <p className="text-teal-800"><span className="font-medium">Doctor:</span> dr.smith@hospital.com / doctor123</p>
                  <p className="text-teal-800"><span className="font-medium">Patient:</span> john.doe@email.com / patient123</p>
                </div>
              </div>
            )}
            
            {loginType === 'admin' && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">🔐 Admin Credentials:</p>
                <p className="text-blue-800">Email: admin@hospital.com</p>
                <p className="text-blue-800">Password: admin123</p>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-700">Access ICU bed management, analytics & forecasting</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          HIPAA Compliant • Secure • Confidential
        </p>
      </div>
    </div>
  )
}

export default Login
