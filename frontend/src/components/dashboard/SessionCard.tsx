import { Play } from '@phosphor-icons/react'

interface SessionCardProps {
  number: number
  title: string
  description: string
}

export default function SessionCard({ number, title, description }: SessionCardProps) {
  return (
    <button className="group flex items-center gap-4 p-4 border border-[var(--dust)] rounded-[var(--radius-0)] bg-[var(--paper)] transition-all duration-300 ease-out hover:bg-[color-mix(in_srgb,var(--electric)_8%,transparent)] hover:border-[var(--electric)] h-full cursor-pointer text-left">
      <div className="w-[40px] h-[40px] rounded-[var(--radius-pill)] border border-[var(--dust)] flex items-center justify-center flex-none group-hover:border-[var(--electric)] transition-colors duration-300 ease-out">
        <span className="font-[var(--font-display)] font-bold text-sm text-[var(--electric-light)]">
          {number}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-[var(--font-display)] font-bold text-[15px] text-[var(--white)] m-0 truncate">
          {title}
        </h3>
        <p className="font-[var(--font-body)] font-light text-[13px] text-[var(--stone)] m-0 truncate">
          {description}
        </p>
      </div>
      <div className="w-[36px] h-[36px] rounded-[var(--radius-pill)] border border-[var(--dust)] bg-transparent text-[var(--stone)] flex items-center justify-center flex-none transition-all duration-300 ease-out group-hover:bg-[color-mix(in_srgb,var(--electric)_15%,transparent)] group-hover:text-[var(--electric-light)] group-hover:border-[var(--electric)]">
        <Play size={18} weight="fill" />
      </div>
    </button>
  )
}
