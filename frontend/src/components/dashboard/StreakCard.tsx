import { Fire } from '@phosphor-icons/react'

interface StreakCardProps {
  days: number
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S']

export default function StreakCard({ days }: StreakCardProps) {
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
        {WEEKDAYS.map((day, i) => (
          <span
            key={i}
            className={`w-7 h-7 rounded-[var(--radius-pill)] flex items-center justify-center font-[var(--font-body)] text-[9px] font-medium ${
              i < 5
                ? 'bg-[var(--white)] text-[var(--electric)]'
                : 'bg-[var(--white)]/20 text-[var(--white)]'
            }`}
          >
            {day}
          </span>
        ))}
      </div>
    </section>
  )
}
