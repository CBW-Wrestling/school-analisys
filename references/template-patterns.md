# Catalogo de Padroes do Template

Fonte: `references/next-shadcn-admin-dashboard`, fixada no commit documentado em [README.md](./README.md). Cada entrada e uma referencia de UX; o codigo deve ser refeito com os primitives e contratos locais do CBW.

| Necessidade | Tela fonte | Aplicacao CBW | Estrutura a reter |
| --- | --- | --- | --- |
| Painel geral | `src/app/(main)/dashboard/default/page.tsx` | Painel, Default | KPIs, grafico, tabela em cards |
| Analise com drill-down | `src/app/(main)/dashboard/analytics/page.tsx` | Analise, resultados | Tabs, faixa de KPIs, layout assimetrico |
| Metricas financeiras | `src/app/(main)/dashboard/finance/page.tsx` | Indicadores de competicao | Resumo, tendencia e comparacao |
| Relacionamento/lista | `src/app/(main)/dashboard/crm/page.tsx` | Atletas e resultados | filtros, lista acionavel, detalhe |
| Operacao por tarefas | `src/app/(main)/dashboard/tasks/page.tsx` | Coleta e pendencias | toolbar, agrupamento e status |
| Gestao de arquivos | `src/app/(main)/dashboard/file-manager/page.tsx` | Importacoes | dropzone, progresso, erro e sucesso |
| Lista administrativa | `src/app/(main)/dashboard/users/page.tsx` | Atletas | busca, filtros, tabela e paginacao |
| Perfil/detalhe | `src/app/(main)/dashboard/profile/page.tsx` | Perfil e detalhe do atleta | resumo, secoes e acoes claras |
| Infraestrutura | `src/app/(main)/dashboard/infrastructure/page.tsx` | Saude de fontes de dados | cards densos, tabelas e status |
| Monitoramento | `src/app/(main)/dashboard/patient-monitoring/page.tsx` | Acompanhamento de atleta | prioridade, series temporais e alertas |
| Operacao comercial | `src/app/(main)/dashboard/ecommerce/page.tsx` | Competicoes e inscritos | cards, tabela e estados de pedido |
| Planejamento | `src/app/(main)/dashboard/calendar/page.tsx`, `kanban/page.tsx` | Agenda e acompanhamento futuros | tempo, agrupamento e mudanca de estado |
| Comunicacao | `src/app/(main)/dashboard/chat/page.tsx`, `mail/page.tsx` | Comunicacao futura | lista-detalhe e estados vazios |
| Documento | `src/app/(main)/dashboard/invoice/page.tsx` | Relatorios exportaveis | cabecalho de documento, totais e acoes |
| Formacao e logistica | `src/app/(main)/dashboard/academy/page.tsx`, `logistics/page.tsx` | Capacitacao e eventos futuros | progresso, cronograma e acompanhamento |
| Autenticacao | `src/app/(main)/auth/v1/login/page.tsx`, `src/app/(main)/auth/v2/login/page.tsx` | Login e cadastro | hierarquia clara, campos agrupados, estados de erro |

## Selecao de grafico

| Pergunta sobre os dados | Modelo | Exemplo CBW | Evite |
| --- | --- | --- | --- |
| Como a medida evoluiu? | `LineChart` ou `AreaChart` | Avaliacoes por mes | Barras para muitos periodos |
| Qual categoria e maior? | `BarChart` | Atletas por UF ou estilo | Pizza com muitas categorias |
| Como as partes compoem o total? | `PieChart` ou barra empilhada | Resultados por medalha | Pizza com mais de cinco partes |
| Como a composicao mudou? | Barras empilhadas no tempo | Tecnicas por etapa | Varias pizzas sequenciais |
| Como os valores se distribuem? | Histograma ou barras ordenadas | Faixas de pontuacao | Linha sem eixo temporal |
| Existe relacao entre duas medidas? | Dispersao | Forca e desempenho tecnico | Eixo sem unidade ou escala |
| Onde esta a diferenca geografica? | `BrazilHeatmap` | Cobertura por UF | Mapa para menos de cinco UFs |

Para qualquer grafico, registre: pergunta, medida, dimensao, periodo, unidade, nulos e a decisao `pergunta -> grafico -> motivo`. Use `src/components/ui/chart.tsx` e Recharts. Inclua alternativa textual acessivel, altura estavel e estados de loading, vazio e erro. Nivo permanece apenas no legado de `ExplorerPage`.

## Regras de adaptacao

- Comece por [DESIGN.md](../DESIGN.md), `PageHeader` e os primitives em `src/components/ui/`.
- Dentro de `SidebarInset`, declare `@container/main` em um wrapper e consuma a query em descendentes.
- Preserve `src/lib/`, tipos, endpoints, payloads e autenticacao. Dados sinteticos so cabem em uma tela explicitamente marcada como demonstracao.
- Nao copie imports de Next.js, Server Components, APIs de Table v9 ou arquivos `ui` do submodulo.
- Crie componente compartilhado somente depois de duas reutilizacoes reais.