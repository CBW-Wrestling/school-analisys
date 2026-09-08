import * as XLSX from 'xlsx'
import { AlertCircle, Download, FileSpreadsheet, FileText, MapPinned } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { SelectPairs } from '../components/Field'
import { useApiRows } from '../lib/api'
import { generateStateLinks, type StateLinkGenerationResponse } from '../lib/stateLinksApi'
import { openPrintableLinks } from '../lib/printableLinks'
import type { CompetitionRow } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function statePublicUrl(accessToken: string) {
  const url = new URL(window.location.href)
  url.search = `?view=state-assessment&token=${encodeURIComponent(accessToken)}`
  return url.toString()
}

function fileSafeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

// Cada link fica isolado em sua própria linha para ficar clicável no dontpad/WhatsApp.
function linksText(result: StateLinkGenerationResponse) {
  const lines = result.links.flatMap((link) => [`${link.state.name} (${link.state.code})`, statePublicUrl(link.accessToken), ''])
  return [`Competição: ${result.competition.name}`, '', 'Links por estado:', ...lines].join('\n').trimEnd()
}

async function copyToClipboard(text: string, successMessage: string) {
  await navigator.clipboard?.writeText(text)
  toast.success(successMessage)
}

function downloadTextLinks(result: StateLinkGenerationResponse) {
  const blob = new Blob([linksText(result)], { type: 'text/plain;charset=utf-8' })
  const anchor = document.createElement('a')
  anchor.href = URL.createObjectURL(blob)
  anchor.download = `links-estados-${fileSafeName(result.competition.code)}.txt`
  anchor.click()
  URL.revokeObjectURL(anchor.href)
}

function downloadSpreadsheetLinks(result: StateLinkGenerationResponse) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(result.links.map((link) => ({
    Estado: link.state.name,
    Sigla: link.state.code,
    Link: statePublicUrl(link.accessToken),
  })))
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Links')
  XLSX.writeFile(workbook, `links-estados-${fileSafeName(result.competition.code)}.xlsx`)
}

function downloadPdfLinks(result: StateLinkGenerationResponse) {
  const opened = openPrintableLinks(`Links por estado - ${result.competition.name}`, [
    { heading: 'Links por estado', items: result.links.map((link) => ({ label: `${link.state.name} (${link.state.code})`, url: statePublicUrl(link.accessToken) })) },
  ])
  if (!opened) toast.error('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.')
}

export function StateLinksPage() {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StateLinkGenerationResponse | null>(null)
  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')

  const competitionOptions = competitions.map((competition) => ({ label: competition.name, value: competition.id }))

  async function handleGenerate() {
    if (!selectedCompetitionId) return
    setGenerating(true)
    setError(null)
    try {
      const response = await generateStateLinks(selectedCompetitionId)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar os links por estado.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageHeader
      active="state-links"
      breadcrumb={[{ label: 'Operações' }, { label: 'Links por estado' }]}
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">Links por estado</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Gere um link público por estado para que cada técnico preencha os dados sociais dos atletas do próprio estado nesta competição.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecionar competição</CardTitle>
            <CardDescription>Os links são gerados para os estados que já têm atletas cadastrados na competição.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SelectPairs
              label="Competição"
              value={selectedCompetitionId}
              placeholder={competitionsLoading ? 'Carregando competições…' : 'Selecione a competição'}
              options={competitionOptions}
              onChange={setSelectedCompetitionId}
              disabled={competitionsLoading}
            />
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertTitle>Não foi possível gerar os links</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button disabled={!selectedCompetitionId || generating} onClick={handleGenerate}>
              {generating ? 'Gerando…' : 'Gerar links por estado'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Links gerados</CardTitle>
              <CardDescription>Envie o link correspondente ao técnico de cada estado.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead className="w-28 text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.links.map((link) => {
                      const url = statePublicUrl(link.accessToken)
                      return (
                        <TableRow key={link.state.id}>
                          <TableCell className="font-medium">{link.state.name} ({link.state.code})</TableCell>
                          <TableCell className="max-w-[420px] truncate font-mono text-xs text-muted-foreground">{url}</TableCell>
                          <TableCell className="text-right">
                            <Button type="button" variant="outline" size="sm" onClick={() => void copyToClipboard(url, `Link de ${link.state.name} copiado.`)}>Copiar</Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => void copyToClipboard(linksText(result), 'Todos os links foram copiados.')}>
                  <MapPinned data-icon="inline-start" aria-hidden="true" /> Copiar todos os links
                </Button>
                <Button type="button" variant="outline" onClick={() => downloadTextLinks(result)}>
                  <Download data-icon="inline-start" aria-hidden="true" /> Baixar .txt
                </Button>
                <Button type="button" variant="outline" onClick={() => downloadSpreadsheetLinks(result)}>
                  <FileSpreadsheet data-icon="inline-start" aria-hidden="true" /> Baixar .xlsx
                </Button>
                <Button type="button" variant="outline" onClick={() => downloadPdfLinks(result)}>
                  <FileText data-icon="inline-start" aria-hidden="true" /> Baixar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageHeader>
  )
}
