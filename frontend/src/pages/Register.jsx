import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

export default function Register() {
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', password:'' })
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
      const { data } = await authService.register(form)
      const d = data.data
      login(
        { userId: d.userId, fullName: d.fullName, email: d.email, role: d.role }, 
        d.accessToken
      )
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">🏦</span>
          <h1>Open Account</h1>
          <p>Join BankFlow today</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          {[
            { label:'Full Name', name:'fullName', type:'text', placeholder:'John Doe' },
            { label:'Email', name:'email', type:'email', placeholder:'john@example.com' },
            { label:'Phone', name:'phone', type:'tel', placeholder:'9876543210' },
            { label:'Password', name:'password', type:'password', placeholder:'Min 8 characters' },
          ].map(f => (
            <div className="form-group" key={f.name}>
              <label>{f.label}</label>
              <input 
                className="form-input" 
                type={f.type} 
                placeholder={f.placeholder}
                value={form[f.name]} 
                onChange={e => setForm(p => ({...p, [f.name]: e.target.value}))} 
                required 
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : '🏦 Open Account'}
          </button>
        </form>
        <p className="auth-footer">Already a customer? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}