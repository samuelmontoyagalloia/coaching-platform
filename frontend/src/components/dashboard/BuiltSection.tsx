import { Target, Briefcase, Shield } from '@phosphor-icons/react'
import BuiltCard from './BuiltCard'

const BUILT_ITEMS = [
  {
    icon: Target,
    label: 'IKIGAI',
    title: 'Encontrar el Norte',
    description: 'Tu propósito en el cruce de lo que amas, haces bien y el mundo necesita.',
  },
  {
    icon: Briefcase,
    label: 'NEGOCIO',
    title: 'Investigación de mercado y negocio',
    description: 'Descubrí oportunidades reales y construí un modelo de negocio sólido.',
  },
  {
    icon: Shield,
    label: 'OFERTA',
    title: 'La oferta irresistible',
    description: 'Una propuesta que tu mercado no pueda rechazar.',
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
