# School Analysis — Frontend (CBW)

Painel de análise de dados de competições e avaliações da CBW (Confederação Brasileira de
Wrestling): dashboards, resultados por competição, perfil/físico/técnico dos atletas e coleta
de avaliações via formulário.

Frontend em React 19 + TypeScript + Vite, consumindo o backend em
[`school-analysis-backend`](../school-analysis-backend) (Kotlin/Spring Boot) via HTTP/JSON.

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:5173
```

Requer um `.env` com `VITE_API_URL` apontando para o backend local (ver `.env` existente ou
pedir as variáveis ao time; nunca commitar esse arquivo).

```bash
npm run build     # typecheck + build de produção
npm run lint      # oxlint
npm run preview   # preview do build
```

## Documentação

- **[AGENTS.md](AGENTS.md)** — stack, estrutura de pastas, convenções e dívidas conhecidas.
  Comece por aqui.
- **[DESIGN.md](DESIGN.md)** — design system: tokens, padrões de página, formulário, gráfico e
  tabela.
- **[CLAUDE.md](CLAUDE.md)** — skills e regras específicas para Claude Code.
