import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Dashboard</h1>
      <p>Sesión activa.</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  )
}
