import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) { 
    navigate('/dashboard')
    return null 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await authService.login(form)
      const d = data.data
      login(
        { userId: d.userId, fullName: d.fullName, email: d.email, role: d.role }, 
        d.accessToken
      )
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">🏦</span>
          <h1>BankFlow</h1>
          <p>Secure Digital Banking</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              className="form-input" 
              type="email" 
              placeholder="you@example.com"
              value={form.email} 
              onChange={e => setForm(f => ({...f, email: e.target.value}))} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••"
              value={form.password} 
              onChange={e => setForm(f => ({...f, password: e.target.value}))} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : '🔐 Sign In'}
          </button>
        </form>
        <div className="auth-divider">
          <span>Admin: admin@bankflow.com / Admin@123</span>
        </div>
        <p className="auth-footer">New customer? <Link to="/register">Open Account</Link></p>
      </div>
    </div>
  )
}