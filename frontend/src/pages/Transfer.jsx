import { useState } from 'react'
import { transactionService } from '../services/transactionService'

const MODES = ['IMPS','NEFT','RTGS','UPI']

export default function Transfer() {
  const [form, setForm] = useState({ fromAccount:'', toAccount:'', amount:'', transactionMode:'IMPS', description:'' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      const { data } = await transactionService.transfer({ ...form, amount: parseFloat(form.amount) })
      setMsg('✅ ' + data.message)
      setForm({ fromAccount:'', toAccount:'', amount:'', transactionMode:'IMPS', description:'' })
    } catch (err) { 
      setMsg('❌ ' + (err.response?.data?.message || 'Transfer failed')) 
    }
    finally { setLoading(false) }
  }

  return (
    <div className="page">
      <div className="page-header"><h1>Fund Transfer</h1></div>
      <div className="transfer-container">
        <div className="transfer-card">
          <div className="transfer-header">
            <span className="transfer-icon">↔️</span>
            <h3>Transfer Money</h3>
            <p>Transfer funds between accounts instantly</p>
          </div>
          {msg && <div className={`alert ${msg.includes('❌') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
          <form onSubmit={handleSubmit} className="transfer-form">
            <div className="form-group">
              <label>From Account Number</label>
              <input className="form-input" placeholder="Your 16-digit account number"
                value={form.fromAccount} onChange={e => setForm(f => ({...f, fromAccount:e.target.value}))} required />
            </div>
            <div className="transfer-arrow">↓</div>
            <div className="form-group">
              <label>To Account Number</label>
              <input className="form-input" placeholder="Beneficiary account number"
                value={form.toAccount} onChange={e => setForm(f => ({...f, toAccount:e.target.value}))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Amount (₹)</label>
                <input className="form-input" type="number" min="1" placeholder="Enter amount"
                  value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Transfer Mode</label>
                <select className="form-input" value={form.transactionMode} onChange={e => setForm(f => ({...f, transactionMode:e.target.value}))}>
                  {MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <input className="form-input" placeholder="Purpose of transfer (optional)"
                value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} />
            </div>
            <div className="transfer-info">
              <div className="info-row"><span>IMPS</span><span>Instant, 24×7, up to ₹5 Lakh</span></div>
              <div className="info-row"><span>NEFT</span><span>Batch processing, any amount</span></div>
              <div className="info-row"><span>RTGS</span><span>Instant, min ₹2 Lakh</span></div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Processing Transfer...' : '↔️ Transfer Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}