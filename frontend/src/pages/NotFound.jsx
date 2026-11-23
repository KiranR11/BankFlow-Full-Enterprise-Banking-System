import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <h1 style={{fontSize:'4rem'}}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn btn-primary" style={{marginTop:'1rem'}}>Go Home</Link>
      </div>
    </div>
  )
}