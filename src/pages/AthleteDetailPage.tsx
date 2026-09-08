import { ArrowLeft, Brain, Dumbbell, Info, Medal, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApiData } from '../lib/api'
import type { AthleteDetail, AthleteDetailItem } from '../types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  entryId: string
  onBack: () => void
  backLabel?: string
}

// Ícones conhecidos que o backend pode enviar por seção; qualquer valor não
// mapeado cai no ícone neutro (Info) em vez de quebrar a renderização.
const SECTION_ICONS: Record<string, LucideIcon> = {
  medal: Medal,
  user: User,
  dumbbell: Dumbbell,
  brain: Brain,
}

const SECTION_GROUPS = [
  { value: 'results', label: 'Resultado', icon: 'medal' },
  { value: 'profile', label: 'Perfil', icon: 'user' },
  { value: 'physical', label: 'Físico', icon: 'dumbbell' },
  { value: 'technical', label: 'Técnico', icon: 'brain' },
  { value: 'other', label: 'Outros', icon: 'other' },
] as const

function iconFor(icon: string): LucideIcon {
  return SECTION_ICONS[icon] ?? Info
}

function DetailRow({ item }: { item: AthleteDetailItem }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-b-0">
      <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">
        {item.value || <span className="font-normal text-muted-foreground">—</span>}
      </dd>
    </div>
  )
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <dl>{children}</dl>
      </CardContent>
    </Card>
  )
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

export function AthleteDetailPage({ entryId, onBack, backLabel = 'Voltar' }: Props) {
  const { data: d, loading, error } = useApiData<AthleteDetail>(`/api/athletes/entries/${entryId}`)

  if (loading) return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-16 text-center text-sm text-muted-foreground md:px-6">Carregando dados do atleta…</div>
  )

  if (error) return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-16 text-center md:px-6">
      <p className="mb-4 text-sm text-muted-foreground">Erro ao carregar dados: {error}</p>
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> {backLabel}</Button>
    </div>
  )

  if (!d) return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-16 text-center md:px-6">
      <p className="mb-4 text-sm text-muted-foreground">Atleta não encontrado.</p>
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> {backLabel}</Button>
    </div>
  )

  const groupedSections = SECTION_GROUPS.map((group) => ({
    ...group,
    sections: d.sections.filter((section) => group.icon === 'other'
      ? !Object.hasOwn(SECTION_ICONS, section.icon)
      : section.icon === group.icon),
  })).filter((group) => group.sections.length > 0)

  return (
    <div className="@container/main">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><button type="button" onClick={onBack}>{backLabel}</button></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{d.athleteName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-5 @xl/main:flex-row @xl/main:items-end @xl/main:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-16 shrink-0 sm:size-20">
              <AvatarFallback className="text-lg font-semibold">{initialsFor(d.athleteName)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate text-xs font-medium tracking-wide text-muted-foreground">{d.competitionName}</p>
              <h1 className="truncate text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">{d.athleteName}</h1>
              {d.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {d.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              )}
            </div>
          </div>
          {d.rank != null && (
            <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg border bg-card px-5 py-3.5">
              <Medal className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="font-mono text-lg font-bold text-foreground">{d.rank}º lugar</span>
            </div>
          )}
        </div>

        {groupedSections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma informação adicional disponível.</p>
        ) : (
          <Tabs defaultValue={groupedSections[0].value} className="gap-0">
            <div className="scrollbar-none touch-pan-x overflow-x-auto overscroll-x-contain border-y">
              <TabsList className="w-max min-w-full justify-start gap-4 px-1 *:data-[slot=tabs-trigger]:flex-none sm:px-4" variant="line">
                {groupedSections.map((group) => {
                  const Icon = iconFor(group.icon)
                  return <TabsTrigger key={group.value} value={group.value}><Icon aria-hidden="true" />{group.label}</TabsTrigger>
                })}
              </TabsList>
            </div>
            {groupedSections.map((group) => (
              <TabsContent key={group.value} value={group.value} className="py-4 md:py-6">
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
                  {group.sections.map((section) => {
                    const Icon = iconFor(section.icon)
                    return (
                      <DetailSection key={section.code} icon={<Icon className="size-4" aria-hidden="true" />} title={section.title}>
                        {section.items.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
                        ) : (
                          section.items.map((item) => <DetailRow key={item.code} item={item} />)
                        )}
                      </DetailSection>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  )
}
