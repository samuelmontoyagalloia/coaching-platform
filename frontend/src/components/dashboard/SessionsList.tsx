import SessionCard from './SessionCard'

const SESSIONS = [
  { number: 1, title: 'Ikigai — Fundamentos', description: 'El cruce entre lo que amas y el mundo necesita.' },
  { number: 2, title: 'Sistema y negocio', description: 'El modelo que encaja con tu perfil y tu vida actual.' },
  { number: 3, title: 'La oferta que vende', description: 'Construida desde la transformación, no el producto.' },
  { number: 4, title: 'Ejecución y momentum', description: 'Plan de 90 días con metas y hábitos semanales.' },
]

export default function SessionsList() {
  return (
    <section className="flex flex-col gap-4 h-full">
      <h2 className="font-[var(--font-body)] text-[10px] font-medium tracking-[0.36em] uppercase text-[var(--electric-light)] m-0 flex-none">
        Sesiones
      </h2>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-3 flex-1">
        {SESSIONS.map((s) => (
          <SessionCard key={s.number} {...s} />
        ))}
      </div>
    </section>
  )
}
