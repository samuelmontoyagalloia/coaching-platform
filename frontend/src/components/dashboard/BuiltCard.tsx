import type { Icon } from '@phosphor-icons/react'

interface BuiltCardProps {
  icon: Icon
  label: string
  title: string
  description: string
}

export default function BuiltCard({ icon: IconComp, label, title, description }: BuiltCardProps) {
  return (
    <div className="flex flex-col gap-3 p-5 border border-[var(--dust)] rounded-[var(--radius-0)] bg-[var(--paper)] border-l-[3px] transition-opacity duration-200 hover:opacity-80">
      <div className="w-[36px] h-[36px] bg-[var(--ink)] rounded-[var(--radius-btn)] flex items-center justify-center">
        <IconComp size={18} weight="bold" className="text-[var(--electric-light)]" />
      </div>
      <span className="font-[var(--font-body)] text-[9px] font-medium tracking-[0.32em] uppercase text-[var(--stone)]">
        {label}
      </span>
      <h3 className="font-[var(--font-display)] font-bold text-[15px] text-[var(--white)] m-0 leading-snug">
        {title}
      </h3>
      <p className="font-[var(--font-body)] font-light text-[13px] leading-[1.6] text-[var(--stone)] m-0">
        {description}
      </p>
    </div>
  )
}
