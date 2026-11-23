import { useState, useEffect } from 'react'
import { loanService } from '../services/loanService'
import Spinner from '../components/common/Spinner'

const LOAN_TYPES = ['PERSONAL','HOME','VEHICLE','EDUCATION','BUSINESS','GOLD']
const INTEREST_RATES = { PERSONAL:12, HOME:8.5, VEHICLE:9.5, EDUCATION:7.5, BUSINESS:14, GOLD:10 }
const STATUS_COLORS = { PENDING:'#f59e0b', UNDER_REVIEW:'#3b82f6', APPROVED:'#059669', REJECTED:'#ef4444', DISBURSED:'#8b5cf6', CLOSED:'#6b7280' }

export default function Loans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showApply, setShowApply] = useState(false)
  const [showEmi, setShowEmi] = useState(null)
  const [emiSchedule, setEmiSchedule] = useState([])
  const [form, setForm] = useState({ loanType:'PERSONAL', amount:'', tenureMonths:12, accountNumber:'', purpose:'' })
  const [applying, setApplying] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loanService.getMyLoans()
      .then(r => setLoans(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const calcEmi = () => {
    if (!form.amount || !form.tenureMonths) return 0
    const r = INTEREST_RATES[form.loanType] / 1200
    const n = form.tenureMonths, p = parseFloat(form.amount)
    if (r === 0) return p / n
    return (p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1)
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setApplying(true)
    setMsg('')
    try {
      await loanService.apply({ ...form, amount: parseFloat(form.amount), tenureMonths: parseInt(form.tenureMonths) })
      setMsg('✅ Loan application submitted!')
      setShowApply(false)
      const r = await loanService.getMyLoans()
      setLoans(r.data.data ?? [])
    } catch (err) { 
      setMsg('❌ ' + (err.response?.data?.message || 'Application failed')) 
    }
    finally { setApplying(false) }
  }

  const viewEmi = async (loanId) => {
    setShowEmi(loanId)
    try {
      const r = await loanService.getEmiSchedule(loanId)
      setEmiSchedule(r.data.data ?? [])
    } catch (err) { console.error(err) }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div className="page">
      <div className="page-header">
        <h1>Loans</h1>
        <button className="btn btn-primary" onClick={() => setShowApply(true)}>+ Apply for Loan</button>
      </div>

      {msg && <div className={`alert ${msg.includes('❌') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for Loan</h3>
              <button className="modal-close" onClick={() => setShowApply(false)}>✕</button>
            </div>
            <form onSubmit={handleApply} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Loan Type</label>
                  <select className="form-input" value={form.loanType} onChange={e => setForm(f=>({...f,loanType:e.target.value}))}>
                    {LOAN_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Interest Rate</label>
                  <input className="form-input" value={`${INTEREST_RATES[form.loanType]}% p.a.`} readOnly style={{background:'#f9fafb'}} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loan Amount (₹)</label>
                  <input className="form-input" type="number" min="1000" placeholder="Minimum ₹1,000"
                    value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Tenure (months)</label>
                  <input className="form-input" type="number" min="6" max="360"
                    value={form.tenureMonths} onChange={e => setForm(f=>({...f,tenureMonths:e.target.value}))} required />
                </div>
              </div>
              {form.amount && <div className="emi-preview">
                <span>Estimated EMI:</span>
                <span className="emi-amount">₹{calcEmi().toFixed(2)}/month</span>
              </div>}
              <div className="form-group">
                <label>Disbursement Account</label>
                <input className="form-input" placeholder="Account number for disbursement"
                  value={form.accountNumber} onChange={e => setForm(f=>({...f,accountNumber:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <input className="form-input" placeholder="Purpose of loan"
                  value={form.purpose} onChange={e => setForm(f=>({...f,purpose:e.target.value}))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowApply(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={applying}>{applying?'Submitting...':'Apply Now'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmi && (
        <div className="modal-overlay" onClick={() => setShowEmi(null)}>
          <div className="modal" style={{maxWidth:'700px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>EMI Schedule — {showEmi}</h3>
              <button className="modal-close" onClick={() => setShowEmi(null)}>✕</button>
            </div>
            <div className="modal-body" style={{maxHeight:'400px',overflowY:'auto'}}>
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>EMI #</th>
                    <th>Due Date</th>
                    <th>EMI</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emiSchedule.map(e=>(
                    <tr key={e.id}>
                      <td>{e.emiNumber}</td>
                      <td>{e.dueDate}</td>
                      <td>₹{e.emiAmount?.toFixed(2)}</td>
                      <td>₹{e.principal?.toFixed(2)}</td>
                      <td>₹{e.interest?.toFixed(2)}</td>
                      <td><span className={`status-chip ${e.status?.toLowerCase()}`}>{e.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="empty-state">
          <span>💰</span>
          <p>No loans yet</p>
          <button className="btn btn-primary" onClick={() => setShowApply(true)}>Apply for Loan</button>
        </div>
      ) : (
        <div className="loans-grid">
          {loans.map(l => (
            <div key={l.loanId} className="loan-card">
              <div className="loan-card-header">
                <div>
                  <div className="loan-type">{l.loanType} LOAN</div>
                  <div className="loan-id">{l.loanId}</div>
                </div>
                <span className="status-pill" style={{background:STATUS_COLORS[l.status]+'22',color:STATUS_COLORS[l.status]}}>{l.status}</span>
              </div>
              <div className="loan-amount">₹{l.amount?.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div className="loan-meta-grid">
                <div><span className="meta-label">Rate</span><span>{l.interestRate}% p.a.</span></div>
                <div><span className="meta-label">Tenure</span><span>{l.tenureMonths} months</span></div>
                <div><span className="meta-label">EMI</span><span>₹{l.emiAmount?.toFixed(2)}</span></div>
                <div><span className="meta-label">Total</span><span>₹{l.totalAmount?.toFixed(2)}</span></div>
              </div>
              {(l.status==='APPROVED'||l.status==='DISBURSED') && (
                <button className="btn btn-sm btn-outline" onClick={() => viewEmi(l.loanId)}>View EMI Schedule</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}