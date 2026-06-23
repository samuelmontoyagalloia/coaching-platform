import { Target, Briefcase, Shield } from '@phosphor-icons/react'
import BuiltCard from './BuiltCard'

const BUILT_ITEMS = [
  {
    icon: Target,
    label: 'IKIGAI',
    title: 'Impactar personas a través de sistemas',
    description: 'Tu propósito en el cruce de lo que amas, haces bien y el mundo necesita.',
  },
  {
    icon: Briefcase,
    label: 'NEGOCIO',
    title: 'Consultoría de procesos',
    description: 'Ingresos desde tu experiencia de ingeniería, sin intercambiar horas por dinero.',
  },
  {
    icon: Shield,
    label: 'OFERTA',
    title: 'Plan 90 días + acompañamiento',
    description: 'Transformación clara, precio justo y fricción de entrada mínima al cerrar.',
  },
]

export default function BuiltSection() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-[var(--font-body)] text-[10px] font-medium tracking-[0.36em] uppercase text-[var(--electric-light)] m-0">
        Lo que construiste
      </h2>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-3">
        {BUILT_ITEMS.map((item, i) => (
          <BuiltCard key={i} {...item} />
        ))}
      </div>
    </section>
  )
}
