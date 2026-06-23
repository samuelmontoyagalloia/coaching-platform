import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startAuthentication } from '@simplewebauthn/browser'
import '../app/login/login.css'

const BACKEND_URL =
  import.meta.env.VITE_TUNNEL_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  'http://localhost:3000'

const isIphone = /iPhone/i.test(navigator.userAgent)

function FaceIdIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9"/>
      <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9"/>
      <path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15"/>
      <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>
      <line x1="9" y1="9.5" x2="9" y2="11.5"/>
      <line x1="15" y1="9.5" x2="15" y2="11.5"/>
      <path d="M12 11.5v1.5"/>
      <path d="M9.5 15.5a4 4 0 0 0 5 0"/>
    </svg>
  )
}

function FingerprintIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10a2 2 0 0 0-2 2c0 1.5-.5 3-1.5 4"/>
      <path d="M12 10a2 2 0 0 1 2 2c0 3 1 5 3 6"/>
      <path d="M12 10c-2.8 0-5 2.2-5 5 0 2.5-.8 4.5-2 6"/>
      <path d="M12 4a8 8 0 0 1 8 8c0 4.5-1.5 8-4 10"/>
      <path d="M12 4a8 8 0 0 0-8 8c0 2-.5 4-1.5 6"/>
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [returning, setReturning] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'loading'>('idle')
  const [accessDenied, setAccessDenied] = useState(
    new URLSearchParams(window.location.search).get('error') === 'access_denied'
  )

  useEffect(() => {
    setReturning(
      localStorage.getItem('sc_returning') === 'true' ||
      localStorage.getItem('has_passkey') === 'true'
    )
  }, [])

  const handleRetry = () => {
    setAccessDenied(false)
    window.history.replaceState({}, '', '/login')
  }

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`
  }

  const handleBiometric = async () => {
    if (phase === 'loading') return
    setPhase('loading')
    try {
      const email = localStorage.getItem('user_email')
      if (!email) throw new Error('No email found')

      const optRes = await fetch(`${BACKEND_URL}/auth/passkey/login/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!optRes.ok) throw new Error('login/start failed')
      const options = await optRes.json()

      const credential = await startAuthentication({ optionsJSON: options })

      const finishRes = await fetch(`${BACKEND_URL}/auth/passkey/login/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: credential }),
      })
      if (!finishRes.ok) throw new Error('login/finish failed')
      const { token } = await finishRes.json()

      localStorage.setItem('auth_token', token)
      navigate('/dashboard')
    } catch {
      setPhase('idle')
    }
  }

  const handleSwitchAccount = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('sc_returning')
    localStorage.removeItem('has_passkey')
    localStorage.removeItem('user_email')
    setReturning(false)
  }

  if (accessDenied) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#111010', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
        <span className="sc-pop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,80,80,0.10)', marginBottom: 28 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#FF6B6B', marginBottom: 14 }}>
          Acceso restringido
        </span>
        <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 300, fontSize: 'clamp(26px, 4vw, 36px)', letterSpacing: '-0.02em', color: '#FDFCFA', margin: '0 0 16px' }}>
          Acceso no autorizado
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#8C8780', maxWidth: '32ch', margin: '0 0 10px' }}>
          Esta plataforma es exclusiva para clientes del proceso de coaching de Samuel Montoya.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#5A5650', maxWidth: '34ch', margin: '0 0 40px' }}>
          Si crees que esto es un error, escríbele a Samuel por WhatsApp.
        </p>
        <button
          onClick={handleRetry}
          style={{ padding: '11px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 6, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 13, letterSpacing: '0.02em', color: '#8C8780' }}
        >
          Intentar con otra cuenta
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Coaching Platform</h1>
      {returning ? (
        <>
          <button onClick={handleBiometric} disabled={phase === 'loading'}>
            {phase === 'loading' ? 'Verificando...' : (
              <>
                {isIphone ? <FaceIdIcon /> : <FingerprintIcon />}
                {isIphone ? 'Entrar con Face ID' : 'Entrar con huella'}
              </>
            )}
          </button>
          <button onClick={handleSwitchAccount}>Usar otra cuenta</button>
        </>
      ) : (
        <button onClick={handleGoogleLogin}>Continuar con Google</button>
      )}
    </div>
  )
}
