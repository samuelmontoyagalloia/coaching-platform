import { jwtDecode } from 'jwt-decode'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface JwtPayload {
  userId: string
  role: string
  exp: number
}

interface Props {
  children: ReactNode
  role: 'client' | 'admin'
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    if (payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export default function ProtectedRoute({ children, role }: Props) {
  const token = localStorage.getItem('auth_token')

  if (!token) return <Navigate to="/login" replace />

  const payload = decodeToken(token)
  if (!payload) {
    localStorage.removeItem('auth_token')
    return <Navigate to="/login" replace />
  }

  if (payload.role !== role) {
    return <Navigate to={payload.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return <>{children}</>
}
