import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { accountService } from '../services/accountService'
import { transactionService } from '../services/transactionService'
import { loanService } from '../services/loanService'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/common/Spinner'

export default function Dashboard() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0)

  useEffect(() => {
    Promise.all([
      accountService.getMyAccounts(),
      transactionService.getHistory(0, 5),
      loanService.getMyLoans(),
    ]).then(([acc, txn, loan]) => {
      setAccounts(acc.data.data ?? [])
      setTransactions(txn.data.data?.content ?? [])
      setLoans(loan.data.data ?? [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size="lg" />

  const statCards = [
    { label:'Total Balance', value:`₹${totalBalance.toLocaleString('en-IN', {minimumFractionDigits:2})}`, icon:'💰', color:'#2563eb' },
    { label:'Accounts', value:accounts.length, icon:'💳', color:'#059669' },
    { label:'Active Loans', value:loans.filter(l=>l.status==='APPROVED'||l.status==='DISBURSED').length, icon:'🏦', color:'#d97706' },
    { label:'Total Transactions', value:transactions.length, icon:'📊', color:'#7c3aed' },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Good day, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p>Here's your financial overview</p>
      </div>
      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{borderTopColor:s.color}}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{color:s.color}}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="dash-panel">
          <div className="panel-header">
            <h3>My Accounts</h3>
            <Link to="/accounts" className="btn btn-sm btn-outline">View All</Link>
          </div>
          {accounts.length === 0 ? (
            <div className="empty-state">
              <span>💳</span>
              <p>No accounts yet</p>
              <Link to="/accounts" className="btn btn-primary">Open Account</Link>
            </div>
          ) : accounts.map(a => (
            <div key={a.accountNumber} className="account-mini">
              <div>
                <div className="acct-type">{a.accountType} Account</div>
                <div className="acct-num">{a.accountNumber}</div>
              </div>
              <div className="acct-balance">₹{(a.balance||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
            </div>
          ))}
        </div>
        <div className="dash-panel">
          <div className="panel-header">
            <h3>Recent Transactions</h3>
            <Link to="/transactions" className="btn btn-sm btn-outline">View All</Link>
          </div>
          {transactions.length === 0 ? (
            <div className="empty-state">
              <span>📋</span>
              <p>No transactions yet</p>
            </div>
          ) : transactions.map(t => (
            <div key={t.transactionId} className="txn-mini">
              <div>
                <div className="txn-type">{t.type?.replace(/_/g,' ')}</div>
                <div className="txn-id">{t.transactionId}</div>
              </div>
              <div className={`txn-amount ${t.type?.includes('CREDIT')||t.type==='DEPOSIT' ? 'credit' : 'debit'}`}>
                {t.type?.includes('CREDIT')||t.type==='DEPOSIT' ? '+' : '-'}₹{(t.amount||0).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}