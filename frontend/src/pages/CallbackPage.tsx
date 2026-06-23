import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startRegistration } from '@simplewebauthn/browser'
import '../app/login/login.css'

const BACKEND_URL =
  import.meta.env.VITE_TUNNEL_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  'http://localhost:3000'

async function fetchUserInfo(token: string) {
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return
  const data = await res.json()
  if (data.email)     localStorage.setItem('user_email', data.email)
  if (data.name)      localStorage.setItem('user_name', data.name)
  if (data.photo_url) localStorage.setItem('user_photo', data.photo_url)
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
  const [phase, setPhase] = useState<'loading' | 'success'>('loading')

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    localStorage.setItem('auth_token', token)
    localStorage.setItem('sc_returning', 'true')
    setPhase('success')

    // Animate for at least 2200ms, but also wait for async work.
    // Timer lives inside the promise chain so StrictMode cleanup can't cancel it.
    const started = performance.now()
    fetchUserInfo(token)
      .catch(() => {})
      .then(() => registerPasskey(token))
      .catch(() => {})
      .then(() => {
        const remaining = Math.max(0, 2200 - (performance.now() - started))
        setTimeout(() => navigate('/dashboard', { replace: true }), remaining)
      })
  }, [navigate])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#111010', color: '#FDFCFA', fontFamily: '"DM Sans", system-ui, sans-serif', overflow: 'hidden' }}>

      {/* Loading state */}
      {phase === 'loading' && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#7A7570', fontFamily: '"DM Sans", sans-serif', fontSize: 14 }}>Iniciando sesión…</p>
        </div>
      )}

      {/* Success state — identical to biometric login success */}
      {phase === 'success' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: '#111010', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span className="sc-pop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: '#0066FF', marginBottom: 26 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FDFCFA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </span>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#3385FF', marginBottom: 12 }}>
            Acceso concedido
          </span>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 300, fontSize: 32, letterSpacing: '-0.02em', margin: '0 0 28px', color: '#FDFCFA' }}>
            Entrando a tu espacio
          </h2>
          <div style={{ position: 'relative', width: 180, height: 3, background: 'rgba(255,255,255,.12)', borderRadius: 999, overflow: 'hidden' }}>
            <span className="sc-bar" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '38%', background: '#0066FF', borderRadius: 999 }} />
          </div>
        </div>
      )}
    </div>
  )
}
