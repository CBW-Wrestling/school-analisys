# CBW Design System

Este documento registra os padrões visuais e de interação adotados do template `next-shadcn-admin-dashboard` e sua tradução para o CBW. Ele funciona como referência para novas telas e refactors. Consulte também o [catálogo de padrões](references/template-patterns.md) para escolher uma tela fonte antes de implementar.

## Direção visual

- Interface operacional, clara e densa, com superfícies neutras e contraste alto.
- Figtree é a fonte sans principal; Geist permanece disponível apenas para compatibilidade.
- Cor deve vir dos tokens semânticos (`background`, `foreground`, `muted`, `primary`, `border`, `chart-*`). Não usar cores hexadecimais diretamente em componentes.
- Radius padrão moderado (`--radius: 0.625rem`); cards e menus usam `rounded-lg`.
- Light e dark mode usam os mesmos componentes e tokens; não duplicar estilos por tela.

## Shell da aplicação

- `SidebarProvider` envolve a aplicação autenticada.
- `Sidebar variant="inset" collapsible="icon"` fica como irmão direto de `SidebarInset`.
- `SidebarInset` recebe `min-w-0`, overflow horizontal controlado e margem/raio no modo inset.
- Header: `h-12` ou `h-14`, `shrink-0`, `border-b`, `SidebarTrigger` à esquerda, breadcrumb depois, ações globais à direita.
- Ações globais: busca quando necessária, CTA contextual, tema e avatar/menu de conta.
- Sidebar: logo no header, grupos nomeados no conteúdo, navegação com ícones Lucide e `text-sm`, usuário no footer.
- Item ativo: `data-active` com `font-medium`, fundo/accent sem cor arbitrária.
- Ícones dentro de `Button` não recebem tamanho manual; usar `data-icon="inline-start|inline-end"`. Ícones independentes usam `size-4`.

## Títulos e páginas

Padrão de topo:

```tsx
<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
  <div className="flex flex-col gap-1">
    <h1 className="text-3xl leading-none tracking-tight">Título</h1>
    <p className="text-sm text-muted-foreground">Subtítulo ou data</p>
  </div>
  <div className="flex flex-wrap items-end justify-end gap-2">...</div>
</div>
```

- Título de tela: `text-3xl`, `leading-none`, `tracking-tight`, peso regular/semibold conforme hierarquia.
- Título de seção: `text-xl` ou `text-2xl font-semibold`.
- Eyebrow: `text-xs font-semibold uppercase tracking-wide text-muted-foreground`.
- Descrição: `text-sm text-muted-foreground`, largura limitada quando for texto explicativo.
- Página: `flex flex-col gap-4 md:gap-6`; conteúdo: `p-4 md:p-6`; container máximo apenas quando necessário.
- Nunca usar hero grande em telas operacionais. A primeira viewport deve mostrar título, controles e conteúdo útil.

## Cards e espaçamento

- Card completo usa `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` e `CardFooter` quando aplicável.
- Seções da página: `gap-4`, ampliando para `gap-6` em desktop.
- Elementos relacionados: `gap-2`; filtros: `gap-2` ou `gap-3`; label e controle: `gap-1.5`.
- Padding padrão: `p-4` em mobile e `p-6` em desktop; não empilhar cards dentro de cards sem necessidade.
- Cards de KPI: ícone em superfície muted, label curta, valor tabular grande e descrição curta.
- Textos de cards devem caber em uma linha sempre que possível; preferir rótulos curtos a reduzir a legibilidade.

## Filtros e menus

- Filtros de uma página ficam na mesma faixa do título em desktop e empilham em mobile.
- `SelectTrigger size="sm"` para filtros compactos, com largura fixa quando os controles precisam alinhar.
- `SelectContent` segue o comportamento do template (`position="item-aligned"`, `align="center"`) para preservar a âncora visual.
- `DropdownMenuContent` abre próximo do trigger; menus de conta usam `align="end"`, menus de filtros usam `align="start"`.
- `Clear/Reset` começa desabilitado e só habilita quando há filtro diferente do padrão.
- Menus precisam de `Group` quando o componente exigir agrupamento, labels acessíveis e foco por teclado.

## Formulários e pesquisa

- Usar `FieldGroup` + `Field` + `FieldLabel` + controle + `FieldDescription`/`FieldError`.
- Estados inválidos: `data-invalid` no `Field` e `aria-invalid` no controle.
- Grupos de opções usam `FieldSet`/`FieldLegend` ou `ToggleGroup`; não criar grids de checkbox sem semântica.
- Fluxos longos de pesquisa usam cabeçalho fixo compacto, stepper, uma etapa por vez e resumo antes do envio.
- Loading usa `Skeleton` ou `Spinner`; submit deve ficar desabilitado durante a operação.
- Empty state deve explicar ausência de dados e oferecer próxima ação real.

## Gráficos

- Gráficos ficam dentro de `ChartContainer` com `ChartConfig` semântico.
- Recharts é o padrão: `ComposedChart` para séries combinadas, `LineChart`/`BarChart` para comparações e `PieChart` para composição.
- Escolha a visualização pela pergunta: evolução no tempo usa linha/área; comparação entre categorias usa barras; composição com poucas partes usa pizza; composição no tempo usa barras empilhadas; distribuição usa histograma/barras; relação entre duas medidas usa dispersão; UF usa `BrazilHeatmap`.
- Antes de implementar, registre `pergunta -> gráfico -> motivo` e confirme medida, dimensão, período, unidade, cardinalidade e tratamento de nulos. Quando não houver decisão visual clara, prefira KPI ou tabela.
- Altura estável (`h-68`, `h-80` ou equivalente) e `ResponsiveContainer`; nunca deixar o gráfico depender de altura automática.
- Remover bordas e linhas visuais desnecessárias: `CartesianGrid vertical={false}`, eixos sem linha e ticks discretos.
- Tooltip e legenda vêm dos componentes shadcn (`ChartTooltipContent`, `ChartLegendContent`).
- Dados sem fonte real não entram em telas de produção; estados vazios devem ser explícitos.
- Nivo existente no Explorer será mantido até uma migração dedicada para Recharts.

## Tabelas

- Tabela operacional fica dentro de Card, com busca e filtros acima, `TableHeader` discreto, linhas hover e paginação abaixo.
- Primeira coluna pode ser seleção; ações ficam na última coluna em menu de ícone.
- Cabeçalhos curtos, valores tabulares e truncamento apenas onde houver tooltip/detalhe alternativo.
- Desktop compara colunas; mobile deve permitir overflow horizontal controlado ou uma apresentação compacta equivalente.

## Responsividade e acessibilidade

- Dentro de `SidebarInset`, usar container queries quando a largura disponível depender da sidebar; não confiar apenas no viewport.
- O elemento que declara `@container/name` não deve também consumir a query; usar wrapper e filho.
- Botões de ícone precisam de `aria-label` e tooltip quando a ação não for óbvia.
- Elementos interativos do mapa, tabelas e filtros devem funcionar com teclado.
- Não usar texto apenas por cor; estados devem combinar cor, label ou ícone.
- Testar desktop e mobile para overflow, sobreposição e menus próximos às bordas.

## Tradução para o CBW

| Conceito do template | CBW |
| --- | --- |
| Default / Ecommerce | Painel nacional e dashboards de análise |
| CRM KPI cards | Atletas, compleção, média técnica e medalhas |
| Qualified Lead Flow | Termômetro Nacional: mapa + detalhe regional |
| Users / Profile | Atletas, perfis e detalhe do atleta |
| Login v2 | Autenticação Google/e-mail do CBW |
| Tasks / Forms | Coleta de perfil, físico e técnico |
| Opportunities table | Resultados, atletas e importações |
| File Manager | Importação, validação e histórico de arquivos |
| Analytics / Finance | Análises com KPIs, filtros e gráficos de decisão |

## Regra de implementação

Manter a lógica de negócio em `src/lib`, hooks e tipos. Redesign deve alterar composição visual e componentes, não endpoints, payloads ou regras de autenticação sem necessidade explícita.