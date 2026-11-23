import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to:'/dashboard', icon:'📊', label:'Dashboard' },
  { to:'/accounts',  icon:'💳', label:'Accounts' },
  { to:'/transactions', icon:'📋', label:'Transactions' },
  { to:'/transfer',  icon:'↔️', label:'Transfer' },
  { to:'/loans',     icon:'💰', label:'Loans' },
]

export default function Sidebar() {
  const { isAdmin } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🏦</span>
        <span className="brand-name">BankFlow</span>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} className={({isActive}) => `nav-link ${isActive?'active':''}`}>
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
        {isAdmin() && (
          <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive?'active':''}`}>
            <span className="nav-icon">🛡️</span>
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="bank-badge">🔒 Secured Banking</div>
      </div>
    </aside>
  )
}