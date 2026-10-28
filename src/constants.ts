import { Activity, Dumbbell, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PHYSICAL_ENABLED } from './lib/features'
import type { FormKind } from './types'

export const details: Record<FormKind, { label: string; title: string; icon: LucideIcon; color: string }> = {
  profile: { label: 'Perfil do atleta', title: 'Cadastro socioesportivo', icon: UserRound, color: 'green' },
  physical: { label: 'Parte física', title: 'Avaliação antropométrica', icon: Dumbbell, color: 'yellow' },
  motor: { label: 'Parte motora', title: 'Avaliação técnica', icon: Activity, color: 'blue' },
}

// Formulários oferecidos na coleta; o físico fica escondido enquanto PHYSICAL_ENABLED for false.
export const enabledFormKinds: FormKind[] = (Object.keys(details) as FormKind[]).filter((kind) => kind !== 'physical' || PHYSICAL_ENABLED)
