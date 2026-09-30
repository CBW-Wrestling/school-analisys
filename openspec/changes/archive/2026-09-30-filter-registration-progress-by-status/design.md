# Design

## Context

- `RegistrationProgressPage` busca `GET /api/dashboard/registration-progress?competitionCode=`
  e recebe `states[]`, cada um com `socialRegistered/socialPercentage/socialStatus` e
  `motorRegistered/motorPercentage/motorStatus`. O status por estado é derivado no backend
  (`statusFor`: 0 registrados → `NOT_STARTED`, todos → `COMPLETE`, senão `IN_PROGRESS`); não é
  coluna de banco.
- Os KPIs de porcentagem hoje somam `socialRegistered`/`motorRegistered` de todos os estados e
  dividem por `data.totalAthletes`, direto no componente.
- `StateProgressTable` também é usada por `PublicRefereeAssessmentPage` (só motora).
- Não há infraestrutura de testes (ver AGENTS.md → Dívidas conhecidas).

## Goals / Non-Goals

**Goals:**
- Filtrar e reagregar no cliente, a partir da resposta atual, sem nova chamada de rede ao
  mudar o filtro.
- Isolar a lógica de filtro/agregação em funções puras em `src/lib/registrationProgress.ts`.

**Non-Goals:**
- Filtro por status de atleta individual (contaria atletas "Realizando" motor parcial, o que
  exigiria nova contagem no backend).
- Persistir o filtro na URL ou em `localStorage`.
- Aplicar o filtro na página pública do árbitro ou no detalhe de atletas do estado.

## Decisions

1. **Filtro no nível do estado, no frontend.** O status já vem por estado na API e o usuário
   trabalha com a tabela de estados. Alternativa considerada: status por atleta com contagem no
   backend — mais preciso para "Realizando", mas muda contrato de API e DTOs mantidos à mão;
   descartado por ora (pode ser uma mudança futura).
2. **Componente: `FilterDropdown` com label "Status"**, alinhado à direita da `TabsList` na
   mesma linha (`flex` com `justify-between`, empilhando em mobile), conforme `DESIGN.md`
   (multi-seleção → `FilterDropdown`; não usar `ToggleGroup`). Opções a partir de
   `REGISTRATION_STATUS_LABEL`, na ordem Completo, Realizando, Não iniciado.
3. **Estado:** `useState<RegistrationStatus[]>` em `RegistrationProgressPage`, inicializado com
   os três valores. Como o `Tabs` é não controlado e o filtro vive fora dele, a seleção se
   mantém ao trocar de aba sem esforço extra.
4. **Funções puras em `src/lib/registrationProgress.ts`:**
   - `filterStatesByStatus(states, statusKey, selected)` → estados cujo `state[statusKey]` está
     em `selected`.
   - `summarizeStates(states, registeredKey)` → `{ registered, total, percentage }`, com
     `total = Σ totalAthletes`, `registered = Σ state[registeredKey]` e `percentage = 0` quando
     `total = 0`.
   A página calcula `socialStates`/`motorStates` (via `useMemo`) e usa cada um tanto para a
   tabela da aba quanto para o KPI da dimensão.
5. **Denominador do KPI = atletas dos estados filtrados**, não `data.totalAthletes`. Com todos
   os status marcados, Σ `totalAthletes` dos estados equivale a `data.totalAthletes` (backend
   agrupa as mesmas linhas), então o comportamento padrão não muda.
6. **"Atletas na competição" e "Estados" ficam sem filtro**: são dimensionais-neutros e o
   filtro é por dimensão; mostrar valores filtrados exigiria escolher uma dimensão arbitrária.
7. **Vazio configurável:** `StateProgressTable` ganha prop opcional `emptyMessage` (default = a
   mensagem atual), mantendo `PublicRefereeAssessmentPage` inalterada. A página passa
   "Nenhum estado com os status selecionados." quando há estados na competição mas o filtro
   zera a lista.

## Risks / Trade-offs

- [Filtrar só "Completo" produz 100% e só "Não iniciado" produz 0% — números triviais por
  construção do status do estado] → Esperado; o valor útil está nas combinações (ex.:
  Completo + Realizando) e nas contagens "X de Y". Se o usuário precisar de granularidade por
  atleta, abrir mudança para a Decisão 1 alternativa.
- [Sem testes automatizados para as funções puras] → Verificação manual listada nas tasks;
  funções pequenas e isoladas facilitam cobrir quando existir infraestrutura de testes.
