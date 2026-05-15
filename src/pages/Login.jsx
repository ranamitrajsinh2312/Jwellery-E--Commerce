import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const EyeIcon = ({ open }) => open
  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>

const Login = ({ login }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await axios.post('/api/users/login', formData)
      if (res.data.token) {
        login(res.data, res.data.token)
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // In production: redirect to /api/auth/google
    alert('Google OAuth: Configure GOOGLE_CLIENT_ID in your backend .env and add /api/auth/google route (Passport.js). Redirecting to demo...')
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-bg" />
        <div className="auth-visual-content">
          <div className="auth-gems">💎 ✨ 💍</div>
          <div className="auth-visual-logo">💎 SterlingTouch</div>
          <p className="auth-tagline">Crafted with love, worn with pride</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <div className="social-login">
            <button className="social-btn social-btn-google" onClick={handleGoogleLogin}>
              <GoogleIcon />
              Continue with Google
            </button>
            <button className="social-btn" onClick={() => alert('Configure your email magic-link provider (e.g. SendGrid / Resend) in the backend.')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
              Continue with Email Link
            </button>
          </div>

          <div className="divider">or sign in with password</div>
          <br />

          {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-link" onClick={e => { e.preventDefault(); alert('Password reset: Add /api/users/forgot-password endpoint.'); }}>Forgot password?</a>
              </div>
              <div className="form-input-wrap">
                <input id="password" name="password" type={showPw ? 'text' : 'password'} value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                <span className="input-icon" onClick={() => setShowPw(v => !v)}><EyeIcon open={showPw} /></span>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
          <div className="admin-link-text">
            <Link to="/admin/login">Admin login →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
