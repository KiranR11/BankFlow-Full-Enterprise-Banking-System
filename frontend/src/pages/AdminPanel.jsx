import { useState, useEffect } from 'react'
import { userService } from '../services/userService'
import { loanService } from '../services/loanService'
import Spinner from '../components/common/Spinner'

const TABS = ['Users','Pending Loans']

export default function AdminPanel() {
  const [tab, setTab] = useState('Users')
  const [users, setUsers] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [u, l] = await Promise.all([userService.getAllUsers(), loanService.getPendingLoans()])
      setUsers(u.data.data ?? [])
      setLoans(l.data.data ?? [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleToggle = async (userId) => {
    await userService.toggleStatus(userId)
    fetchAll()
  }

  const handleKyc = async (userId, kycStatus) => {
    await userService.updateKyc(userId, kycStatus)
    fetchAll()
  }

  const handleLoanApprove = async (loanId) => {
    await loanService.approveLoan(loanId)
    fetchAll()
  }

  const handleLoanReject = async (loanId) => {
    const reason = prompt('Rejection reason:')
    if (reason) { 
      await loanService.rejectLoan(loanId, reason)
      fetchAll() 
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div className="page">
      <div className="page-header"><h1>🛡️ Admin Panel</h1></div>
      <div className="tabs">
        {TABS.map(t => <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === 'Users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>KYC</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.userId}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar-sm">{u.fullName?.[0]}</div>
                      {u.fullName}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td><span className="role-badge">{u.role}</span></td>
                  <td><span className={`status-pill ${u.status?.toLowerCase()}`}>{u.status}</span></td>
                  <td><span className={`status-pill ${u.kycStatus?.toLowerCase()}`}>{u.kycStatus}</span></td>
                  <td>
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                      <button className={`btn btn-sm ${u.status==='ACTIVE'?'btn-danger':'btn-success'}`} onClick={() => handleToggle(u.userId)}>
                        {u.status==='ACTIVE'?'Suspend':'Activate'}
                      </button>
                      {u.kycStatus === 'PENDING' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleKyc(u.userId, 'VERIFIED')}>Verify KYC</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Pending Loans' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Tenure</th>
                <th>EMI</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign:'center',padding:'2rem',color:'#6b7280'}}>No pending loans 🎉</td>
                </tr>
              ) : loans.map(l => (
                <tr key={l.loanId}>
                  <td>{l.loanId}</td>
                  <td>{l.userId}</td>
                  <td>{l.loanType}</td>
                  <td>₹{l.amount?.toLocaleString('en-IN')}</td>
                  <td>{l.interestRate}%</td>
                  <td>{l.tenureMonths}m</td>
                  <td>₹{l.emiAmount?.toFixed(2)}</td>
                  <td>
                    <div style={{display:'flex',gap:'4px'}}>
                      <button className="btn btn-sm btn-success" onClick={() => handleLoanApprove(l.loanId)}>✅ Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleLoanReject(l.loanId)}>❌ Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}