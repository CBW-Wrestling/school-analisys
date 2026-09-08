import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const customerInitials = ['EM', 'OW', 'NO', 'MM'] as const

export function CustomerReviews() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">Avaliações</CardTitle>
        <CardDescription className="text-xl leading-none tracking-tight text-foreground tabular-nums">
          4,6 de média
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex gap-0.5 text-foreground">
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
              </div>
              <div>
                <div className="text-sm font-medium">Melody Macy</div>
                <p className="mt-2 line-clamp-3 min-h-[4.5em] text-sm text-muted-foreground">
                  A camisa de linho chegou antes do previsto e caiu exatamente como esperado.
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <Button aria-label="Avaliação anterior" size="icon-xs" variant="outline">
                <ArrowLeft />
              </Button>
              <Button aria-label="Próxima avaliação" size="icon-xs" variant="outline">
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">12,8 mil avaliações</div>
            <div className="line-clamp-2 min-h-[3em] text-xs text-muted-foreground">Clientes que avaliaram este mês</div>
          </div>

          <AvatarGroup>
            {customerInitials.map((initials) => (
              <Avatar key={initials}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}

            <AvatarGroupCount>+42</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </CardContent>
    </Card>
  )
}
