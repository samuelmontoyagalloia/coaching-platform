import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { startAuthentication } from '@simplewebauthn/browser'
import './login.css'

const BACKEND_URL =
  import.meta.env.VITE_TUNNEL_URL ??
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  'http://localhost:3000'

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView]   = useState<'first' | 'return' | 'access_denied'>('first')
  const [phase, setPhase] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [userPhoto, setUserPhoto] = useState('')
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    const returning =
      localStorage.getItem('sc_returning') === 'true' ||
      localStorage.getItem('has_passkey') === 'true'
    if (returning) setView('return')

    setUserName(
      localStorage.getItem('user_name') ||
      localStorage.getItem('user_email') ||
      ''
    )
    setUserPhoto(localStorage.getItem('user_photo') || '')

    const params = new URLSearchParams(location.search)
    if (params.get('error') === 'access_denied') {
      setView('access_denied')
    } else if (params.get('error') === 'unauthorized') {
      setError('Este acceso es exclusivo para clientes del proceso de coaching.')
    }
  }, [location.search])

  const handleGoogleLogin = () => {
    setPhase('loading')
    window.location.href = `${BACKEND_URL}/auth/google`
  }

  const handleBiometric = async () => {
    if (phase === 'loading') return
    setPhase('loading')
    setError(null)
    try {
      const email = localStorage.getItem('user_email')
      if (!email) throw new Error('no-email')

      const optRes = await fetch(`${BACKEND_URL}/auth/passkey/login/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!optRes.ok) {
        const data = await optRes.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'start-failed')
      }

      const options = await optRes.json()
      const credential = await startAuthentication({ optionsJSON: options })

      const finishRes = await fetch(`${BACKEND_URL}/auth/passkey/login/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: credential }),
      })
      if (!finishRes.ok) throw new Error('finish-failed')

      const { token } = (await finishRes.json()) as { token: string }
      localStorage.setItem('auth_token', token)
      setPhase('success')
      setTimeout(() => navigate('/dashboard', { replace: true }), 2200)
    } catch (err) {
      setPhase('idle')
      const msg = err instanceof Error ? err.message : ''
      if (
        msg === 'no-email' ||
        msg.includes('No passkeys') ||
        msg.includes('not found') ||
        msg.includes('User not found')
      ) {
        setError('Este acceso es exclusivo para clientes del proceso de coaching.')
      } else {
        setError('Autenticación fallida. Intenta de nuevo.')
      }
    }
  }

  const handleSwitchAccount = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('sc_returning')
    localStorage.removeItem('has_passkey')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_photo')
    setView('first')
    setError(null)
  }

  const displayName = userName.includes('@')
    ? userName.split('@')[0]
    : (userName.split(' ')[0] ?? userName)

  const initial = displayName.charAt(0).toUpperCase() || '?'

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#111010',
      color: '#FDFCFA',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* ── Background effects ─────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '-22%', left: '50%', transform: 'translateX(-50%)', width: 760, height: 760, background: 'radial-gradient(circle, rgba(0,102,255,0.20) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-28%', right: '-14%', width: 520, height: 520, background: 'radial-gradient(circle, rgba(0,102,255,0.10) 0%, transparent 62%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: NOISE }} />

      {/* ── Wordmark — top left ────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 32, left: 36, zIndex: 3, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: '#FDFCFA' }}>Coaching</span>
        <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: '#3385FF' }}>1:1</span>
      </div>

      {/* ── Privado badge — top right ─────────────────────────── */}
      <div style={{ position: 'absolute', top: 34, right: 36, display: 'flex', alignItems: 'center', gap: 7, zIndex: 3 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0066FF', display: 'block' }} />
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 9, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7A7570' }}>Privado</span>
      </div>

      {/* ══════════════════════════════════════════════════════════
          STATE: FIRST ACCESS
      ══════════════════════════════════════════════════════════ */}
      {phase !== 'success' && view === 'first' && (
        <div className="sc-fade" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: 460, padding: '0 24px' }}>

          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#3385FF', marginBottom: 26 }}>
            Tu espacio de ejecución
          </span>

          <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 300, fontSize: 'clamp(44px, 8vw, 62px)', letterSpacing: '-0.02em', lineHeight: 1.0, margin: 0, color: '#FDFCFA' }}>
            Encuentra tu<br />
            <span style={{ color: '#3385FF' }}>negocio</span>
          </h1>

          <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: 15, lineHeight: 1.7, color: '#8C8780', margin: '22px 0 36px', maxWidth: '30ch' }}>
            Todo lo que construiste en tu coaching, en un solo lugar.<br />
            <span style={{ color: '#FDFCFA' }}>Tu plan. Tu progreso. Tu acompañamiento.</span>
          </p>

          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={phase === 'loading'}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              width: '100%', maxWidth: 320, padding: '15px 22px',
              background: '#FDFCFA', color: '#111010', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 15,
              transition: 'transform 160ms ease, box-shadow 160ms ease',
              opacity: phase === 'loading' ? 0.7 : 1,
            }}
          >
            {phase !== 'loading' ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ flex: 'none' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </>
            ) : (
              <>
                <span className="sc-spin" style={{ width: 17, height: 17, border: '2px solid #C8C2B8', borderTopColor: '#111010', borderRadius: '50%', display: 'inline-block' }} />
                Conectando…
              </>
            )}
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, color: '#6B6660' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fontWeight: 300, lineHeight: 1.5 }}>
              Acceso exclusivo para clientes del proceso de coaching.
            </span>
          </div>

          {error && (
            <p style={{ marginTop: 20, color: '#FF6B6B', fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 300, maxWidth: '32ch', lineHeight: 1.5 }}>
              {error}
            </p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          STATE: ACCESS DENIED
      ══════════════════════════════════════════════════════════ */}
      {phase !== 'success' && view === 'access_denied' && (
        <div className="sc-fade" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: 460, padding: '0 24px' }}>

          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#3385FF', marginBottom: 26 }}>
            Tu espacio de ejecución
          </span>

          <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 300, fontSize: 'clamp(44px, 8vw, 62px)', letterSpacing: '-0.02em', lineHeight: 1.0, margin: 0, color: '#FDFCFA' }}>
            Encuentra tu<br />
            <span style={{ color: '#3385FF' }}>negocio</span>
          </h1>

          <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: 15, lineHeight: 1.7, color: '#8C8780', margin: '22px 0 4px', maxWidth: '30ch' }}>
            Tu inicio de sesión fue denegado.
          </p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: 15, lineHeight: 1.7, color: '#FDFCFA', margin: '0 0 36px', maxWidth: '32ch' }}>
            Escríbele a Samuel para ser parte del proceso de coaching 1:1.
          </p>

          <a
            href={`https://wa.me/573125345323?text=${encodeURIComponent('Hola Samuel, estoy intentando acceder a la plataforma de coaching 1:1 y no me está permitiendo el acceso.')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              width: '100%', maxWidth: 320, padding: '15px 22px',
              background: '#25D366', color: '#FDFCFA', border: 'none', borderRadius: 8,
              textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 15,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FDFCFA" style={{ flex: 'none' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Escribirle a Samuel
          </a>

          <button
            className="switch-btn"
            onClick={() => { window.history.replaceState({}, '', '/login'); setView('first') }}
            style={{
              marginTop: 22, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif', fontSize: 11, fontWeight: 400,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B6660',
              transition: 'color 160ms ease',
            }}
          >
            Intentar con otra cuenta
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          STATE: RETURN / BIOMETRIC
      ══════════════════════════════════════════════════════════ */}
      {phase !== 'success' && view === 'return' && (
        <div className="sc-fade" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: 460, padding: '0 24px' }}>

          {/* Avatar */}
          <div style={{ position: 'relative', width: 86, height: 86, borderRadius: '50%', padding: 3, background: '#0066FF', marginBottom: 22, boxSizing: 'border-box' }}>
            {userPhoto && !imgFailed ? (
              <img
                src={userPhoto}
                alt={displayName}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setImgFailed(true)}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 30, color: '#FDFCFA' }}>
                {initial}
              </div>
            )}
          </div>

          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 300, color: '#8C8780' }}>
            Bienvenido de nuevo
          </span>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 34, letterSpacing: '-0.02em', margin: '4px 0 34px', color: '#FDFCFA' }}>
            {displayName || 'Cliente'}
          </h2>

          {/* Biometric button */}
          <div style={{ position: 'relative' }}>
            <span className="sc-pulse" style={{ position: 'absolute', inset: -1.5, borderRadius: '50%', border: '1.5px solid #0066FF', pointerEvents: 'none', display: 'block' }} />
            <button
              className="bio-btn"
              onClick={handleBiometric}
              disabled={phase === 'loading'}
              style={{
                position: 'relative', width: 96, height: 96, borderRadius: '50%',
                background: 'rgba(0,102,255,0.08)', border: '1.5px solid #0066FF',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 160ms ease',
              }}
            >
              {phase !== 'loading' ? (
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#3385FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
                  <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/>
                  <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
                  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
                  <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
                  <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
                  <path d="M2 16h.01"/>
                  <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
                  <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
                </svg>
              ) : (
                <span className="sc-spin" style={{ width: 28, height: 28, border: '2.5px solid rgba(51,133,255,.3)', borderTopColor: '#3385FF', borderRadius: '50%', display: 'inline-block' }} />
              )}
            </button>
          </div>

          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 300, color: '#8C8780', marginTop: 20, maxWidth: '26ch', lineHeight: 1.6, display: 'block' }}>
            Toca para entrar con tu huella o Face ID
          </span>

          {error && (
            <p style={{ marginTop: 16, color: '#FF6B6B', fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 300, maxWidth: '30ch', lineHeight: 1.5 }}>
              {error}
            </p>
          )}

          <button
            className="switch-btn"
            onClick={handleSwitchAccount}
            style={{
              marginTop: 28, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif', fontSize: 11, fontWeight: 400,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B6660',
              transition: 'color 160ms ease',
            }}
          >
            Usar otra cuenta
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          STATE: SUCCESS
      ══════════════════════════════════════════════════════════ */}
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

      {/* ── Footer pillars ─────────────────────────────────────── */}
      {phase !== 'success' && (
        <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, zIndex: 2, display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '7px 0' }}>
            {['Propósito', 'Negocio', 'Plan', 'Ejecución'].map((word, i, arr) => (
              <span key={word} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 9, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#5A5650' }}>{word}</span>
                {i < arr.length - 1 && (
                  <span style={{ color: '#0066FF', fontSize: 9, margin: '0 14px' }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
