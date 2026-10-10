import type { LinkHistorySource, LinkStatus, LinkedEntry } from '../../types'

export const LINK_STATUS_LABEL: Record<LinkStatus, string> = {
  EXACT: 'Exato',
  CONFIRMED: 'Confirmado',
  SUGGESTED: 'Sugerido',
  AMBIGUOUS: 'Ambíguo',
  UNLINKED: 'Não vinculado',
}

export const LINK_STATUS_VARIANT: Record<LinkStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  EXACT: 'default',
  CONFIRMED: 'default',
  SUGGESTED: 'secondary',
  AMBIGUOUS: 'outline',
  UNLINKED: 'destructive',
}

export const LINK_SOURCE_LABEL: Record<LinkHistorySource, string> = {
  IMPORT_AUTO: 'Proposta do import',
  IMPORT_REVIEW: 'Revisão do import',
  MANUAL: 'Correção manual',
  SWAP: 'Troca',
}

export const LINK_STATUS_OPTIONS: LinkStatus[] = ['EXACT', 'SUGGESTED', 'AMBIGUOUS', 'UNLINKED', 'CONFIRMED']

export function entryDetails(e: Pick<LinkedEntry, 'state' | 'style' | 'weightKg'>) {
  return [e.state, e.style, e.weightKg != null ? `${e.weightKg} kg` : null].filter(Boolean).join(' · ')
}
