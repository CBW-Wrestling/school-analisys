import { Banknote, Bitcoin, Building2, CircleDollarSign, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// icon: substitui os ícones de marca (simple-icons) do template por ícones lucide-react já disponíveis no projeto.
const walletCards = [
  {
    id: 1,
    bank: 'Banco Principal Premium',
    last4: '4182',
    balance: 'R$ 12.450,60',
    icon: Landmark,
  },
  {
    id: 2,
    bank: 'Banco Nacional',
    last4: '1004',
    balance: 'R$ 3.200,11',
    icon: Building2,
  },
  {
    id: 4,
    bank: 'Banco Regional',
    last4: '9912',
    balance: 'R$ 1.450,00',
    icon: Banknote,
  },
]

const cryptoAssets = [
  {
    id: 1,
    name: 'Bitcoin',
    vault: 'Corretora A',
    balance: '0,42 BTC',
    usdValue: 'R$ 124.150,00',
    icon: Bitcoin,
  },
  {
    id: 2,
    name: 'Ethereum',
    vault: 'Carteira digital',
    balance: '4,85 ETH',
    usdValue: 'R$ 62.420,10',
    icon: CircleDollarSign,
  },
]

export function Wallet() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Carteira</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {walletCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm leading-none">
                    {card.bank} • **** {card.last4}
                  </span>
                </div>
                <span className="font-normal text-muted-foreground text-xs">{card.balance}</span>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                <card.icon className="size-4 text-foreground" />
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          {cryptoAssets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm leading-none">
                    {asset.name} • {asset.vault}
                  </span>
                </div>
                <span className="font-normal text-muted-foreground text-xs">
                  {asset.balance} • {asset.usdValue}
                </span>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                <asset.icon className="size-4 text-foreground" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[10px] text-muted-foreground">
              Cofre físico: <span className="text-foreground">Ledger Nano X</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="font-bold text-[9px] text-green-500 uppercase tracking-widest">Offline</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
