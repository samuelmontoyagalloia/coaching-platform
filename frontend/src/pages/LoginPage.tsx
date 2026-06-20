import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startAuthentication } from '@simplewebauthn/browser'

const BACKEND_URL =
  import.meta.env.VITE_TUNNEL_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  'http://localhost:3000'

export default function LoginPage() {
  const navigate = useNavigate()
  const [returning, setReturning] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'loading'>('idle')

  useEffect(() => {
    setReturning(
      localStorage.getItem('sc_returning') === 'true' ||
      localStorage.getItem('has_passkey') === 'true'
    )
  }, [])

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Coaching Platform</h1>
      {returning ? (
        <>
          <button onClick={handleBiometric} disabled={phase === 'loading'}>
            {phase === 'loading' ? 'Verificando...' : 'Entrar con huella / Face ID'}
          </button>
          <button onClick={handleSwitchAccount}>Usar otra cuenta</button>
        </>
      ) : (
        <button onClick={handleGoogleLogin}>Continuar con Google</button>
      )}
    </div>
  )
}
