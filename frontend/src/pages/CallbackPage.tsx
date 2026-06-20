import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { startRegistration } from '@simplewebauthn/browser'

const BACKEND_URL =
  import.meta.env.VITE_TUNNEL_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  'http://localhost:3001'

async function fetchUserInfo(token: string) {
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return
  const data = await res.json()
  if (data.email) localStorage.setItem('user_email', data.email)
  if (data.name) localStorage.setItem('user_name', data.name)
}

async function registerPasskey(token: string): Promise<void> {
  const optRes = await fetch(`${BACKEND_URL}/auth/passkey/register/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!optRes.ok) throw new Error('register/start failed')
  const options = await optRes.json()

  const credential = await startRegistration({ optionsJSON: options })

  const finishRes = await fetch(`${BACKEND_URL}/auth/passkey/register/finish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(credential),
  })
  if (!finishRes.ok) throw new Error('register/finish failed')
  const result = await finishRes.json()
  if (result.success) localStorage.setItem('has_passkey', 'true')
}

export default function CallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('sc_returning', 'true')

      fetchUserInfo(token)
        .catch(() => {})
        .then(() => registerPasskey(token))
        .catch(() => {})
        .finally(() => navigate('/dashboard', { replace: true }))
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#111010', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#7A7570', fontFamily: '"DM Sans", sans-serif', fontSize: 14 }}>Iniciando sesión…</p>
    </div>
  )
}
