import { useState, useEffect } from 'react'
import { accountService } from '../services/accountService'
import Spinner from '../components/common/Spinner'

const ACCOUNT_TYPES = ['SAVINGS','CURRENT','FIXED_DEPOSIT','RECURRING_DEPOSIT']

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ accountType:'SAVINGS', branch:'Main Branch', nominee:'' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const fetchAccounts = async () => {
    try {
      const { data } = await accountService.getMyAccounts()
      setAccounts(data.data ?? [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAccounts() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await accountService.createAccount(form)
      setShowCreate(false)
      fetchAccounts()
    } catch (err) { 
      setError(err.response?.data?.message || 'Failed to create account') 
    }
    finally { setCreating(false) }
  }

  const statusColor = s => ({ACTIVE:'#059669',FROZEN:'#ef4444',INACTIVE:'#6b7280',CLOSED:'#374151'}[s]||'#6b7280')

  if (loading) return <Spinner size="lg" />

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Accounts</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Open Account</button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Open New Account</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label>Account Type</label>
                <select className="form-input" value={form.accountType} onChange={e => setForm(f => ({...f, accountType:e.target.value}))}>
                  {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input className="form-input" value={form.branch} onChange={e => setForm(f => ({...f, branch:e.target.value}))} placeholder="Branch name" />
              </div>
              <div className="form-group">
                <label>Nominee</label>
                <input className="form-input" value={form.nominee} onChange={e => setForm(f => ({...f, nominee:e.target.value}))} placeholder="Nominee name (optional)" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Opening...' : 'Open Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="empty-state"><span>💳</span><p>No accounts found</p></div>
      ) : (
        <div className="accounts-grid">
          {accounts.map(a => (
            <div key={a.accountNumber} className="account-card">
              <div className="account-card-header">
                <div>
                  <div className="acct-label">{a.accountType} Account</div>
                  <div className="acct-ifsc">IFSC: {a.ifscCode}</div>
                </div>
                <span className="status-pill" style={{background:statusColor(a.status)+'22',color:statusColor(a.status)}}>{a.status}</span>
              </div>
              <div className="account-number">{a.accountNumber}</div>
              <div className="account-balance">₹{(a.balance||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div className="account-meta">
                <span>Branch: {a.branch}</span>
                <span>{new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}