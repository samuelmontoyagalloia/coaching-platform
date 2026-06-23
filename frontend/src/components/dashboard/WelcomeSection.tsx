interface WelcomeSectionProps {
  name: string
}

export default function WelcomeSection({ name }: WelcomeSectionProps) {
  const firstName = name.includes('@')
    ? name.split('@')[0]
    : (name.split(' ')[0] ?? name)

  return (
    <section className="flex flex-col gap-[10px] py-4 lg:py-6">
      <span className="font-[var(--font-body)] text-[10px] font-medium tracking-[0.36em] uppercase text-[var(--electric-light)]">
        Bienvenido de vuelta
      </span>
      <h1 className="font-[var(--font-display)] font-light text-[clamp(38px,4.5vw,54px)] tracking-[-0.02em] leading-[1.02] m-0 text-[var(--white)]">
        Hola, <span className="font-bold text-[var(--electric-light)]">{firstName}.</span>
      </h1>
      <p className="font-[var(--font-body)] font-light text-[15px] leading-[1.7] text-[var(--stone)] m-0 max-w-[38ch]">
        Ya tienes las herramientas. Ahora ejecuta.
      </p>
    </section>
  )
}
