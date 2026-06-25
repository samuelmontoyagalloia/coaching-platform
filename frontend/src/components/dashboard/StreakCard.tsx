import { Fire, Check } from '@phosphor-icons/react'

interface StreakCardProps {
  days: number
}

// Mon-start: index 0=L, 1=M, 2=M, 3=J, 4=V, 5=S — Sunday excluded
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S']

// JS getDay(): 1=Mon → index 0, …, 6=Sat → index 5; 0=Sun → -1 (hidden)
function getTodayIndex() {
  const d = new Date().getDay()
  return d === 0 ? -1 : d - 1
}

export default function StreakCard({ days }: StreakCardProps) {
  const todayIndex = getTodayIndex()

  return (
    <section className="bg-[var(--electric)] border border-[rgba(255,255,255,0.12)] rounded-[var(--radius-0)] p-6 flex flex-col items-center gap-4 lg:sticky lg:top-6">
      <h2 className="font-[var(--font-body)] text-[10px] font-medium tracking-[0.36em] uppercase text-[var(--white)] opacity-70 m-0">
        Racha
      </h2>

      <div className="flex items-center justify-center gap-3">
        <Fire size={24} weight="fill" className="text-[var(--white)] opacity-50" />
        <span className="font-[var(--font-display)] font-bold text-[72px] leading-none text-[var(--white)]">
          {days}
        </span>
        <Fire size={24} weight="fill" className="text-[var(--white)]" />
      </div>

      <span className="font-[var(--font-body)] font-light text-sm text-[var(--white)] opacity-70">
        Días consecutivos ejecutando
      </span>

      <div className="flex items-center gap-[6px] mt-1">
        {WEEKDAYS.map((day, i) => {
          const isPast   = i < todayIndex
          const isToday  = i === todayIndex
          const isFuture = i > todayIndex
          return (
            <span
              key={i}
              className={[
                'w-7 h-7 rounded-[var(--radius-pill)] flex items-center justify-center',
                isPast   && 'bg-[var(--white)] text-[var(--electric)]',
                isToday  && 'bg-transparent border-2 border-[var(--white)] text-[var(--white)] font-semibold',
                isFuture && 'bg-[var(--white)]/15 text-[var(--white)]/40 font-medium',
              ].filter(Boolean).join(' ')}
            >
              {isPast
                ? <Check size={11} weight="bold" />
                : <span className="font-[var(--font-body)] text-[9px]">{day}</span>
              }
            </span>
          )
        })}
      </div>
    </section>
  )
}
