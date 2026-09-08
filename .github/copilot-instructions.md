# Diretrizes do CBW

Para criar, atualizar ou redesenhar interfaces, leia [DESIGN.md](../DESIGN.md) e [catalogo de padroes](../references/template-patterns.md) antes de editar. Use a tela fonte correspondente no submodulo como referencia de composicao, nao como codigo para copiar.

Use os primitives em `src/components/ui/`, `PageHeader`, tokens semanticos, Tailwind v4 e Lucide. Dentro de `SidebarInset`, use container queries. Preserve contratos de `src/lib/`, tipos, endpoints, payloads e autenticacao.

Nao introduza imports de Next.js/RSC, componentes `ui` do submodulo, TanStack Table v9 ou dados mockados em fluxos operacionais. Para dashboards e analises, determine a pergunta e os dados antes de selecionar o grafico conforme o catalogo. Sempre cubra loading, vazio, erro, foco por teclado, mobile e ambos os temas quando aplicavel.