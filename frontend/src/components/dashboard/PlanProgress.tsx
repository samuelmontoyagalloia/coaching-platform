interface PlanProgressProps {
  streak: number
  loading?: boolean
}

export default function PlanProgress({ streak, loading }: PlanProgressProps) {
  const years = ((streak / 3650) * 10).toFixed(1)
  const pct = Math.min((streak / 3650) * 100, 100)

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <section className="flex flex-col gap-4 h-full">
      <h2 className="font-[var(--font-body)] text-[10px] font-medium tracking-[0.36em] uppercase text-[var(--electric-light)] m-0 flex-none">
        Proyecto a 10 años
      </h2>

      <div className={[
        'flex items-center gap-8 lg:gap-5 px-12 py-5 border border-[var(--dust)] rounded-[var(--radius-0)] bg-[var(--paper)] flex-1 h-full',
        'transition-all duration-700 ease-out',
        loading ? 'opacity-30 scale-[0.97]' : 'opacity-100 scale-100',
      ].join(' ')}>
        <div className="flex items-center justify-center flex-none w-[40%] lg:w-[45%]">
          <div className="relative w-full max-w-[180px] lg:max-w-[200px] aspect-square">
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="var(--electric)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-[var(--font-display)] font-bold text-[clamp(20px,3vw,30px)] text-[var(--white)]">
                {pct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 flex-1 self-stretch py-1">
          <div className="self-end text-right">
            <span className="font-[var(--font-display)] font-bold text-lg text-[var(--white)] whitespace-nowrap">
              Años de proyecto
            </span>
            <span className="block font-[var(--font-body)] font-light text-sm text-[var(--stone)]">
              {Math.max(0, 10 - parseFloat(years)).toFixed(1)} años restantes
            </span>
          </div>
          <button className="self-end mt-0 font-[var(--font-body)] text-[11px] font-medium tracking-[0.28em] uppercase text-[var(--electric-light)] bg-transparent border border-[var(--electric)] rounded-[var(--radius-btn)] px-6 py-[11px] cursor-pointer transition-colors duration-200 hover:text-[var(--white)] hover:border-[var(--white)]">
            Ver plan
          </button>
        </div>
      </div>
    </section>
  )
}
