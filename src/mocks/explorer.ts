import type { CompetitionRow, MotorRow, ProfileRow } from '../types'

export const explorerMockCompetitions: CompetitionRow[] = [
  { id: 'mock-jebs-u14-2024', code: 'JEBS-U14-2024', name: "JEB's U14", year: 2024, arenaId: null },
  { id: 'mock-jejs-u16-2025', code: 'JEJS-U16-2025', name: "JEJ's U16", year: 2025, arenaId: null },
]

export const explorerMockMotorRows: MotorRow[] = [
  { estado: 'SP', estilo: 'FS', peso: '57 kg', competencia: 'Quedas', avaliacao: 'Double leg', resultado: 'COMPLETE', eventIdentifier: 'JEBS-U14-2024' },
  { estado: 'RJ', estilo: 'FS', peso: '65 kg', competencia: 'Quedas', avaliacao: 'Single leg', resultado: 'COMPLETE', eventIdentifier: 'JEBS-U14-2024' },
  { estado: 'MG', estilo: 'GR', peso: '60 kg', competencia: 'Defesa', avaliacao: 'Sprawl', resultado: 'INCOMPLETE', eventIdentifier: 'JEBS-U14-2024' },
  { estado: 'GO', estilo: 'WW', peso: '57 kg', competencia: 'Solo', avaliacao: 'Nelson', resultado: 'INCOMPLETE', eventIdentifier: 'JEBS-U14-2024' },
  { estado: 'BA', estilo: 'GR', peso: '67 kg', competencia: 'Solo', avaliacao: 'Cruzeta', resultado: 'NOT_COMPLETED', eventIdentifier: 'JEBS-U14-2024' },
  { estado: 'PR', estilo: 'FS', peso: '74 kg', competencia: 'Transições', avaliacao: 'Rolamento', resultado: 'COMPLETE', eventIdentifier: 'JEJS-U16-2025' },
  { estado: 'PA', estilo: 'WW', peso: '62 kg', competencia: 'Solo', avaliacao: 'Arranco', resultado: 'NOT_COMPLETED', eventIdentifier: 'JEJS-U16-2025' },
  { estado: 'SP', estilo: 'GR', peso: '67 kg', competencia: 'Acrobacias', avaliacao: 'Ponte', resultado: 'COMPLETE', eventIdentifier: 'JEJS-U16-2025' },
  { estado: 'BA', estilo: 'FS', peso: '57 kg', competencia: 'Quedas', avaliacao: 'Double leg', resultado: 'INCOMPLETE', eventIdentifier: 'JEJS-U16-2025' },
  { estado: 'SC', estilo: 'WW', peso: '65 kg', competencia: 'Solo', avaliacao: 'Passagem de guarda', resultado: 'COMPLETE', eventIdentifier: 'JEJS-U16-2025' },
]

export const explorerMockProfileRows: ProfileRow[] = [
  { estado: 'SP', estilo: 'Livre', peso: '57 kg', tempoPratica: '1 a 3 anos', localPratica: 'Clube', frequenciaSemanal: '3 a 4 vezes', flagOutraModalidade: 'sim', iniciouNaLuta: 'sim', eventIdentifier: 'JEBS-2024' },
  { estado: 'RJ', estilo: 'Livre', peso: '65 kg', tempoPratica: 'Mais de 3 anos', localPratica: 'Escola', frequenciaSemanal: '3 a 4 vezes', flagOutraModalidade: 'não', iniciouNaLuta: 'sim', eventIdentifier: 'JEBS-2024' },
  { estado: 'MG', estilo: 'Greco-romana', peso: '60 kg', tempoPratica: '1 a 3 anos', localPratica: 'Clube', frequenciaSemanal: '1 a 2 vezes', flagOutraModalidade: 'sim', iniciouNaLuta: 'não', eventIdentifier: 'JEBS-2025' },
  { estado: 'BA', estilo: 'Greco-romana', peso: '67 kg', tempoPratica: 'Menos de 1 ano', localPratica: 'Projeto social', frequenciaSemanal: '1 a 2 vezes', flagOutraModalidade: 'não', iniciouNaLuta: 'sim', eventIdentifier: 'JEBS-2025' },
]