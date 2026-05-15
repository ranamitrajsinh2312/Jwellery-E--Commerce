import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const AdminLogin = ({ login }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/users/login', formData)
      
      if (response.data.token) {
        // Check if user is admin
        if (response.data.isAdmin) {
          login(response.data, response.data.token)
          navigate('/admin/dashboard')
        } else {
          setError('Access denied. Admin privileges required.')
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-header">
          <h2>🔐 Admin Login</h2>
          <p>Access admin dashboard</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="admin@jewelry.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter admin password"
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
        
        <div className="admin-footer">
          <p>
            <Link to="/login">← Back to User Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
