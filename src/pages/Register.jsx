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

const Register = ({ login }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault(); setError('')
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true)
    try {
      await axios.post('/api/users/register', { name: formData.name, email: formData.email, password: formData.password })
      const loginRes = await axios.post('/api/users/login', { email: formData.email, password: formData.password })
      if (loginRes.data.token) { login(loginRes.data, loginRes.data.token); navigate('/') }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const pwStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Weak', color: 'var(--error)', w: '30%' }
    if (pw.length < 10) return { label: 'Fair', color: 'var(--warning)', w: '60%' }
    return { label: 'Strong', color: 'var(--success)', w: '100%' }
  }
  const strength = pwStrength(formData.password)

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-bg" />
        <div className="auth-visual-content">
          <div className="auth-gems">💎 ✨ 💍</div>
          <div className="auth-visual-logo">💎 SterlingTouch</div>
          <p className="auth-tagline">Join thousands of jewellery lovers</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create account</h2>
            <p>Start your jewellery journey today</p>
          </div>

          <div className="social-login">
            <button className="social-btn social-btn-google" onClick={() => alert('Google OAuth: Configure GOOGLE_CLIENT_ID in backend .env')}>
              <GoogleIcon />
              Sign up with Google
            </button>
          </div>
          <div className="divider">or register with email</div>
          <br />

          {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="form-input-wrap">
                <input name="password" type={showPw ? 'text' : 'password'} value={formData.password} onChange={handleChange} required minLength="6" placeholder="Min. 6 characters" />
                <span className="input-icon" onClick={() => setShowPw(v => !v)}><EyeIcon open={showPw} /></span>
              </div>
              {strength && (
                <div style={{ marginTop: '0.35rem' }}>
                  <div style={{ height: 3, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.w, background: strength.color, borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required minLength="6" placeholder="Repeat password" />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.78rem' }}>
              By creating an account, you agree to our Terms of Service & Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
