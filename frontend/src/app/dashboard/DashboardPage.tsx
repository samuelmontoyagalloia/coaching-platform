import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './DashboardPage.css'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import WelcomeSection from '../../components/dashboard/WelcomeSection'
import StreakCard from '../../components/dashboard/StreakCard'
import SessionsList from '../../components/dashboard/SessionsList'
import PlanProgress from '../../components/dashboard/PlanProgress'
import BuiltSection from '../../components/dashboard/BuiltSection'
import ChatFAB from '../../components/dashboard/ChatFAB'

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`

type LogoutPhase = 'idle' | 'loggingOut'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [logoutPhase, setLogoutPhase] = useState<LogoutPhase>('idle')
  const [userName, setUserName] = useState('')
  const [userPhoto, setUserPhoto] = useState('')

  useEffect(() => {
    setUserName(localStorage.getItem('user_name') || localStorage.getItem('user_email') || '')
    setUserPhoto(localStorage.getItem('user_photo') || localStorage.getItem('photo_url') || '')
  }, [])

  const firstName = userName.includes('@')
    ? userName.split('@')[0]
    : (userName.split(' ')[0] ?? userName)

  const handleLogout = () => {
    if (logoutPhase !== 'idle') return
    setLogoutPhase('loggingOut')
    setTimeout(() => {
      localStorage.removeItem('auth_token')
      navigate('/login', { replace: true })
    }, 1800)
  }

  return (
    <div className="relative h-dvh flex flex-col bg-[var(--ink)] text-[var(--white)] font-[var(--font-body)] overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-24%] left-[64%] -translate-x-1/2 w-[760px] h-[760px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,102,255,0.18) 0%, transparent 60%)' }} />
      <div className="absolute bottom-[-30%] left-[-16%] w-[540px] h-[540px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,102,255,0.09) 0%, transparent 62%)' }} />
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: NOISE }} />

      <DashboardHeader userName={userName} userPhoto={userPhoto} />

      <main className="relative z-[2] flex-1 flex flex-col gap-8 lg:gap-6 px-5 py-6 lg:px-7 lg:py-8 max-w-[1400px] mx-auto w-full overflow-y-auto">
        <WelcomeSection name={userName || 'Cliente'} />
          <div className="flex flex-col gap-8 lg:gap-8">
          {/* Row 1: Sessions | Streak */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:hidden">
              <StreakCard days={23} />
            </div>
            <div className="lg:w-[70%] flex flex-col">
              <SessionsList />
            </div>
            <div className="hidden lg:block lg:w-[30%] lg:min-w-[320px] pt-[30px]">
              <StreakCard days={23} />
            </div>
          </div>
          {/* Row 2: Built | Plan */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:hidden">
              <PlanProgress progress={67} />
            </div>
            <div className="lg:w-[70%] flex flex-col">
              <BuiltSection />
            </div>
            <div className="hidden lg:block lg:w-[30%] lg:min-w-[320px]">
              <PlanProgress progress={67} />
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-[2] flex-none flex items-center justify-between gap-4 px-7 py-5 border-t border-[var(--dust)]">
        <span className="font-[var(--font-body)] text-[9px] font-medium tracking-[0.28em] uppercase text-[#5A5650]">
          MVP · v0.1
        </span>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-[9px] px-4 py-[9px] bg-transparent border border-[var(--dust)] rounded-[var(--radius-btn)] cursor-pointer font-[var(--font-body)] font-medium text-xs tracking-[0.04em] text-[var(--stone)] transition-colors duration-200 hover:text-[var(--white)] hover:border-[var(--border-strong)] active:translate-y-px"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      </footer>

      <ChatFAB />

      {logoutPhase !== 'idle' && (
        <div className="absolute inset-0 z-[6] bg-[var(--ink)] flex flex-col items-center justify-center text-center px-6">
          <span className="db-pop inline-flex items-center justify-center w-[72px] h-[72px] rounded-[var(--radius-pill)] bg-[var(--electric)] mb-[26px]">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FDFCFA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span className="font-[var(--font-body)] text-[10px] font-medium tracking-[0.36em] uppercase text-[var(--electric-light)] mb-3">
            Cerrando sesión
          </span>
          <h2 className="font-[var(--font-display)] font-light text-[32px] tracking-[-0.02em] m-0 mb-7 text-[var(--white)]">
            Hasta pronto, {firstName}.
          </h2>
          <div className="relative w-[180px] h-[3px] bg-white/12 rounded-[var(--radius-pill)] overflow-hidden">
            <span className="db-bar absolute top-0 left-0 h-full w-[38%] bg-[var(--electric)] rounded-[var(--radius-pill)]" />
          </div>
        </div>
      )}
    </div>
  )
}
