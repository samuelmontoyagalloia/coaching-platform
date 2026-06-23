import { ChatCircle } from '@phosphor-icons/react'

export default function ChatFAB() {
  return (
    <div className="fixed bottom-[104px] right-6 z-50 w-[56px] h-[56px] rounded-[var(--radius-pill)] bg-[var(--electric)] flex items-center justify-center shadow-lg">
      <ChatCircle size={26} weight="fill" className="text-[var(--white)]" />
      <span className="absolute -top-1 -right-1 w-[22px] h-[22px] rounded-[var(--radius-pill)] bg-[var(--electric-light)] flex items-center justify-center font-[var(--font-body)] text-[10px] font-bold text-[var(--white)]">
        3
      </span>
    </div>
  )
}
