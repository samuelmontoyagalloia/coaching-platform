import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import LoginPage from './app/login'
import CallbackPage from './pages/CallbackPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'

function RootRedirect() {
  const token = localStorage.getItem('auth_token')
  if (!token) return <Navigate to="/login" replace />
  try {
    const { role, exp } = jwtDecode<{ role: string; exp: number }>(token)
    if (exp * 1000 < Date.now()) {
      localStorage.removeItem('auth_token')
      return <Navigate to="/login" replace />
    }
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />
  } catch {
    localStorage.removeItem('auth_token')
    return <Navigate to="/login" replace />
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="client">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
