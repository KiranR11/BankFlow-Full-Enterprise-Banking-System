import { useState, useEffect } from 'react'
import { transactionService } from '../services/transactionService'
import Spinner from '../components/common/Spinner'

const TYPE_COLORS = {
  DEPOSIT:'#059669', WITHDRAWAL:'#ef4444',
  TRANSFER_DEBIT:'#f59e0b', TRANSFER_CREDIT:'#3b82f6',
  LOAN_DISBURSEMENT:'#8b5cf6', LOAN_REPAYMENT:'#06b6d4'
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [form, setForm] = useState({ accountNumber:'', amount:'', description:'' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchTxns = async () => {
    setLoading(true)
    try {
      const { data } = await transactionService.getHistory(page, 20)
      setTransactions(data.data?.content ?? [])
      setTotalPages(data.data?.totalPages ?? 0)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTxns() }, [page])

  const handleAction = async (action) => {
    setSubmitting(true)
    setMsg('')
    try {
      const payload = { accountNumber: form.accountNumber, amount: parseFloat(form.amount), description: form.description }
      if (action === 'deposit') await transactionService.deposit(payload)
      else await transactionService.withdraw(payload)
      setMsg(action === 'deposit' ? '✅ Deposit successful!' : '✅ Withdrawal successful!')
      setShowDeposit(false)
      setShowWithdraw(false)
      fetchTxns()
    } catch (err) { 
      setMsg('❌ ' + (err.response?.data?.message || 'Transaction failed')) 
    }
    finally { setSubmitting(false) }
  }

  const isCredit = (t) => t.type === 'DEPOSIT' || t.type === 'TRANSFER_CREDIT' || t.type === 'LOAN_DISBURSEMENT'

  if (loading && page === 0) return <Spinner size="lg" />

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn btn-success" onClick={() => setShowDeposit(true)}>+ Deposit</button>
          <button className="btn btn-danger" onClick={() => setShowWithdraw(true)}>− Withdraw</button>
        </div>
      </div>

      {msg && <div className={`alert ${msg.includes('❌') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {(showDeposit || showWithdraw) && (
        <div className="modal-overlay" onClick={() => { setShowDeposit(false); setShowWithdraw(false) }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showDeposit ? 'Deposit Money' : 'Withdraw Money'}</h3>
              <button className="modal-close" onClick={() => { setShowDeposit(false); setShowWithdraw(false) }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Account Number</label>
                <input className="form-input" placeholder="16-digit account number"
                  value={form.accountNumber} onChange={e => setForm(f => ({...f, accountNumber:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input className="form-input" type="number" placeholder="Enter amount" min="1"
                  value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="form-input" placeholder="Optional description"
                  value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowDeposit(false); setShowWithdraw(false) }}>Cancel</button>
                <button className={`btn ${showDeposit ? 'btn-success' : 'btn-danger'}`} disabled={submitting}
                  onClick={() => handleAction(showDeposit ? 'deposit' : 'withdraw')}>
                  {submitting ? 'Processing...' : showDeposit ? 'Deposit' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="transactions-table-wrap">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Account</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.transactionId}>
                <td className="txn-id-cell">{t.transactionId}</td>
                <td><span className="type-badge" style={{background:TYPE_COLORS[t.type]+'22',color:TYPE_COLORS[t.type]}}>{t.type?.replace(/_/g,' ')}</span></td>
                <td className={isCredit(t)?'amount-credit':'amount-debit'}>
                  {isCredit(t)?'+':'-'}₹{(t.amount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}
                </td>
                <td>{t.fromAccount || t.toAccount}</td>
                <td>{t.description || '—'}</td>
                <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                <td><span className={`status-chip ${t.status?.toLowerCase()}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-sm btn-outline" disabled={page===0} onClick={() => setPage(p=>p-1)}>← Prev</button>
          <span>Page {page+1} of {totalPages}</span>
          <button className="btn btn-sm btn-outline" disabled={page>=totalPages-1} onClick={() => setPage(p=>p+1)}>Next →</button>
        </div>
      )}
    </div>
  )
}