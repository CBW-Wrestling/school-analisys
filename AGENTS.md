# AGENTS.md

Fonte única de verdade para qualquer agente (Claude Code, Codex, ou humano) trabalhando neste
repositório. Padrões de UI detalhados vivem em [DESIGN.md](DESIGN.md); este arquivo aponta
para lá, não os repete.

## Stack

- React 19 + TypeScript + Vite, SPA sem framework de rotas (ver "Navegação" abaixo).
- Tailwind CSS v4 + shadcn/ui (`components.json`: style `radix-nova`, base Radix — ainda não
  migrado para Base UI).
- Recharts para gráficos, TanStack Table para tabelas, `xlsx` para leitura de planilhas.
- Backend: `school-analysis-backend` (Kotlin/Spring Boot), consumido via HTTP/JSON puro.

## Comandos

```bash
npm run dev       # servidor de desenvolvimento (Vite)
npm run build     # tsc -b && vite build — typecheck e build juntos, não há script separado
npm run lint      # oxlint
npm run preview   # preview do build de produção
```

Não existe script de teste nem de format — ver "Dívidas conhecidas".

## Estrutura de pastas (`src/`)

| Pasta | Responsabilidade |
|---|---|
| `pages/` | Uma página por tela, selecionada em `App.tsx` via query string (`?view=`) |
| `components/` | Componentes de domínio (wizard, header, gráficos) |
| `components/ui/` | Componentes shadcn/ui — gerenciados pela skill `shadcn`, não editar à mão sem necessidade |
| `lib/` | Lógica de negócio: `api.ts` (fetch + hooks), `auth.ts` (tokens/login), `importApi.ts`, `utils.ts` |
| `navigation/` | Definição dos itens de menu (`sidebar-items.ts`) |
| `hooks/` | Hooks reutilizáveis genéricos (ex.: `use-mobile`) |
| `types.ts` | Tipos TS espelhando os DTOs do backend — mantidos manualmente, sem geração automática |

## Navegação

Não há React Router. `App.tsx` lê `URLSearchParams` (`?view=`, `?form=`) e escolhe a página a
renderizar; `navigation/sidebar-items.ts` define os links como `href` de query string. Isso é
uma decisão intencional, não uma lacuna — não introduza um router sem alinhar antes.

## Estado e dados

Sem Redux/Zustand/Context global. Padrão: estado local de componente + hooks de fetch
(`useApiRows`, `useApiData` em `src/lib/api.ts`) + `localStorage` para tokens de auth. Mantenha
esse padrão; não introduza uma lib de estado global sem necessidade concreta.

## Comunicação com a API

- `src/lib/api.ts`: `apiGet`/`apiPost`/`apiPut` sobre `fetch`, header `Authorization: Bearer`
  automático, trata `401` limpando `localStorage` e recarregando a página.
- `src/lib/auth.ts`: access token + refresh token, renovação automática (`getValidToken`),
  suporta login por e-mail/senha e callback OAuth Google (tokens recebidos via query string em
  `App.tsx`).
- Os tipos de request/response em `types.ts` e nas interfaces de `importApi.ts` são mantidos à
  mão em espelho dos DTOs Kotlin do backend. **Não há geração automática nem contrato
  compartilhado** — ao mudar um endpoint, confira o DTO real no backend em vez de confiar em
  documentação antiga.

## Convenções não-negociáveis

- Cor sempre via tokens semânticos do Tailwind/shadcn (`bg-background`, `text-muted-foreground`,
  `chart-*`) — nunca hex direto em componentes. Regras completas de UI: [DESIGN.md](DESIGN.md).
- Lógica de negócio fica em `src/lib`, hooks e tipos — mudanças visuais/redesign não devem tocar
  endpoints, payloads ou regras de autenticação sem necessidade explícita (regra de
  `DESIGN.md`).
- Mensagens voltadas ao usuário e erros em português; nomes de classe/variável/arquivo em
  inglês.
- `src/components/ui/*` segue as regras da skill `shadcn` (`.claude/skills/shadcn`) — usar
  componentes/variants existentes antes de criar markup customizado, `gap-*` em vez de
  `space-x-*`/`space-y-*`, `size-*` quando largura = altura.
- Nunca commitar `.env` nem segredo — `.env` já está no `.gitignore`.

## Dívidas conhecidas (não finja que não existem)

- **Sem testes**: nenhum framework de teste instalado, nenhum arquivo `*.test.*`/`*.spec.*`.
  Todo código novo que justifique teste deveria vir com um, mas a infraestrutura de teste
  ainda não existe — precisa ser criada antes.
- **Sem CI**: build/lint não são verificados automaticamente antes de merge.
- **`prettier` e `eslint-config-prettier` estão em `devDependencies` mas não são usados**: não
  há script `format`, nem `.prettierrc`, nem ESLint configurado. O lint real é só `oxlint`. Não
  assuma que existe formatação automática rodando.
- **Sem convenção de commit documentada**: o histórico do repo mistura estilos (`feat: ...`,
  `new`, mensagens livres). O backend usa Conventional Commits em inglês; o frontend ainda não
  adotou isso formalmente.
- Ainda em `components.json` como `radix-nova` (base Radix). A skill
  `migrate-radix-to-base` existe para uma eventual migração para Base UI, mas não foi
  iniciada.
