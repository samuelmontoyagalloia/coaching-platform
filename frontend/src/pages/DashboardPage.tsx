import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './DashboardPage.css'

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`

type LogoutPhase = 'idle' | 'loggingOut'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [logoutPhase, setLogoutPhase] = useState<LogoutPhase>('idle')
  const [userName, setUserName] = useState('')
  const [userPhoto, setUserPhoto] = useState('')
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setUserName(localStorage.getItem('user_name') || localStorage.getItem('user_email') || '')
    setUserPhoto(localStorage.getItem('user_photo') || '')
  }, [])

  const firstName = userName.includes('@')
    ? userName.split('@')[0]
    : (userName.split(' ')[0] ?? userName)

  const initial = firstName.charAt(0).toUpperCase() || '?'

  const handleLogout = () => {
    if (logoutPhase !== 'idle') return
    setLogoutPhase('loggingOut')
    setTimeout(() => {
      localStorage.removeItem('auth_token')
      navigate('/login', { replace: true })
    }, 1800)
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#111010',
      color: '#FDFCFA',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Background blobs ── */}
      <div style={{ position: 'absolute', top: '-24%', left: '64%', transform: 'translateX(-50%)', width: 760, height: 760, background: 'radial-gradient(circle, rgba(0,102,255,0.18) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-30%', left: '-16%', width: 540, height: 540, background: 'radial-gradient(circle, rgba(0,102,255,0.09) 0%, transparent 62%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: NOISE }} />

      {/* ══════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════ */}
      <header style={{
        position: 'relative', zIndex: 3, flex: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '22px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#0066FF', flex: 'none' }} />
          <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 300, fontSize: 20, letterSpacing: '-0.02em', color: '#FDFCFA', whiteSpace: 'nowrap' }}>
            Coaching <span style={{ color: '#3385FF' }}>1:1</span>
          </span>
        </div>

        {/* Right: Privado + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="db-privado" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3385FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 9, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#8C8780' }}>Privado</span>
          </div>

          {/* Avatar */}
          <div style={{ width: 38, height: 38, borderRadius: '50%', padding: 2, background: '#0066FF', flex: 'none', boxSizing: 'border-box' }}>
            {userPhoto && !imgFailed ? (
              <img
                src={userPhoto}
                alt={firstName}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setImgFailed(true)}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 14, color: '#FDFCFA' }}>
                {initial}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          MAIN
      ══════════════════════════════════════════════════ */}
      <main style={{
        position: 'relative', zIndex: 2, flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 28px', gap: 34,
      }}>

        {/* Title block */}
        <div className="db-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#3385FF' }}>
            Tu espacio de ejecución
          </span>
          <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 300, fontSize: 'clamp(38px, 4.5vw, 54px)', letterSpacing: '-0.02em', lineHeight: 1.02, margin: 0, color: '#FDFCFA' }}>
            Bienvenido,<br /><span style={{ color: '#3385FF' }}>{firstName || 'Cliente'}.</span>
          </h1>
        </div>

        {/* Empty state card */}
        <div className="db-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 420, padding: '26px 30px', border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.02)', animationDelay: '0.12s' }}>

          {/* Indicator */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, flex: 'none' }}>
              <span className="db-pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#0066FF' }} />
              <span className="db-breathe"    style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#3385FF' }} />
            </span>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 9, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8C8780' }}>En construcción</span>
          </div>

          <p style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 300, fontSize: 'clamp(18px, 1.7vw, 21px)', lineHeight: 1.35, letterSpacing: '-0.01em', margin: 0, color: '#FDFCFA' }}>
            Tu proceso está en camino.
          </p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: 13, lineHeight: 1.7, margin: 0, color: '#8C8780', maxWidth: '34ch' }}>
            Cuando Samuel cargue tu primera sesión,{' '}
            <span style={{ color: '#C8C2B8' }}>todo aparecerá aquí.</span>
          </p>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer style={{
        position: 'relative', zIndex: 2, flex: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '20px 28px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 9, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#5A5650' }}>
          MVP · v0.1
        </span>
        <button
          className="db-logout-btn"
          onClick={handleLogout}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 6, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 12, letterSpacing: '0.04em', color: '#8C8780', transition: 'color 160ms ease, border-color 160ms ease' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </footer>

      {/* ══════════════════════════════════════════════════
          LOGOUT OVERLAY
      ══════════════════════════════════════════════════ */}
      {logoutPhase !== 'idle' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 6, background: '#111010', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span className="db-pop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: '#0066FF', marginBottom: 26 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FDFCFA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#3385FF', marginBottom: 12 }}>
            Cerrando sesión
          </span>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 300, fontSize: 32, letterSpacing: '-0.02em', margin: '0 0 28px', color: '#FDFCFA' }}>
            Hasta pronto, {firstName}.
          </h2>
          <div style={{ position: 'relative', width: 180, height: 3, background: 'rgba(255,255,255,.12)', borderRadius: 999, overflow: 'hidden' }}>
            <span className="db-bar" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '38%', background: '#0066FF', borderRadius: 999 }} />
          </div>
        </div>
      )}
    </div>
  )
}
