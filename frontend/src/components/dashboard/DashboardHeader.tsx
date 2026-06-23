import { useState } from 'react'
import { Lock } from '@phosphor-icons/react'

interface DashboardHeaderProps {
  userName: string
  userPhoto: string
}

export default function DashboardHeader({ userName, userPhoto }: DashboardHeaderProps) {
  const [imgFailed, setImgFailed] = useState(false)

  const firstName = userName.includes('@')
    ? userName.split('@')[0]
    : (userName.split(' ')[0] ?? userName)

  const initial = firstName.charAt(0).toUpperCase() || '?'

  return (
    <header className="flex items-center justify-between gap-4 px-7 py-[22px] border-b border-[var(--dust)] bg-[var(--ink)]">
      <div className="flex items-center gap-[10px]">
        <span className="w-[9px] h-[9px] rounded-[var(--radius-pill)] bg-[var(--electric)] flex-none" />
<span className="font-[var(--font-display)] font-bold text-[20px] tracking-[-0.02em] text-[var(--white)] whitespace-nowrap">
            Coaching <span className="text-[var(--electric-light)]">1:1</span>
          </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-[7px] px-[11px] py-[5px] border border-[var(--border-strong)] rounded-[var(--radius-pill)]">
          <Lock size={11} weight="bold" className="text-[var(--electric-light)] flex-none" />
          <span className="font-[var(--font-body)] text-[9px] font-medium tracking-[0.28em] uppercase text-[var(--stone)]">
            Privado
          </span>
        </div>
        <span className="hidden lg:inline font-[var(--font-display)] font-bold text-sm text-[var(--white)]">
          {firstName}
        </span>
        <div className="w-[38px] h-[38px] rounded-[var(--radius-pill)] p-[2px] bg-[var(--electric)] flex-none box-border">
          {userPhoto && !imgFailed ? (
            <img
              src={userPhoto}
              alt={firstName}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setImgFailed(true)}
              className="w-full h-full rounded-[var(--radius-pill)] object-cover block"
            />
          ) : (
            <div className="w-full h-full rounded-[var(--radius-pill)] bg-[#1C1C1C] flex items-center justify-center font-[var(--font-display)] font-bold text-sm text-[var(--white)]">
              {initial}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
