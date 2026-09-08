import { addDays, format, set } from 'date-fns'
import { ChevronRight, KanbanSquare, Mail, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'

// icon: substitui os ícones de marca (simple-icons) do template por ícones lucide-react já disponíveis no projeto.
const transactions = [
  {
    id: 1,
    title: 'Assinatura assistente de IA',
    date: format(set(addDays(new Date(), 2), { hours: 14, minutes: 45 }), "HH.mm '•' dd 'de' MMMM 'de' yyyy"),
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Plano de e-mail transacional',
    date: format(set(addDays(new Date(), 4), { hours: 7, minutes: 0 }), "HH.mm '•' dd 'de' MMMM 'de' yyyy"),
    icon: Mail,
  },
  {
    id: 3,
    title: 'Plano de gestão de projetos',
    date: format(set(addDays(new Date(), 10), { hours: 7, minutes: 0 }), "HH.mm '•' dd 'de' MMMM 'de' yyyy"),
    icon: KanbanSquare,
  },
]

export function UpcomingTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Próximas contas e pagamentos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="flex items-baseline text-3xl leading-none tracking-tight">
              <span className="font-normal">R$ 1.245</span>
              <span className="text-muted-foreground text-xl">,00</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-none">
              Você tem <span className="font-medium text-foreground">3</span> contas vencendo este mês
            </p>
          </div>
          <div className="flex w-max items-center gap-2 rounded-md border border-border bg-muted/70 px-2 py-1.5 text-sm">
            <Zap className="size-4 fill-primary text-primary" />
            <span className="text-muted-foreground">
              O débito automático processará <span className="font-medium text-foreground">R$ 145,00</span> hoje
            </span>
          </div>
        </div>

        <ItemGroup>
          {transactions.map((transaction) => (
            <Item key={transaction.id} variant="outline" size="xs">
              <ItemMedia>
                <div className="grid size-9 place-items-center rounded-md border bg-background">
                  <transaction.icon className="size-4 text-foreground" />
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{transaction.title}</ItemTitle>
                <ItemDescription>{transaction.date}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-5 text-muted-foreground" />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
