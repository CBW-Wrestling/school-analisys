// Links por query string para telas abertas a partir de várias páginas.
export function athleteHref(athleteId: string) {
  return `?view=athlete&id=${encodeURIComponent(athleteId)}`
}
