# Tasks

## 1. Lógica de filtro e agregação (`src/lib/registrationProgress.ts`)

- [x] 1.1 Adicionar `REGISTRATION_STATUS_ORDER: RegistrationStatus[]` (`COMPLETE`, `IN_PROGRESS`, `NOT_STARTED`) e `filterStatesByStatus(states, statusKey, selected)` que retorna só os estados cujo `state[statusKey]` está em `selected`; verificar com `npm run build` sem erros de tipo
- [x] 1.2 Adicionar `summarizeStates(states, registeredKey)` retornando `{ registered, total, percentage }` (Σ `state[registeredKey]`, Σ `totalAthletes`, `percentage = 0` quando `total = 0`); verificar com `npm run build` e conferência manual no console/REPL de que `[{totalAthletes: 80, socialRegistered: 60}, {totalAthletes: 40, socialRegistered: 30}]` resulta em `75` e lista vazia em `{0, 0, 0}` (não há infraestrutura de testes — ver AGENTS.md)

## 2. Tabela de estados (`src/components/RegistrationProgressTables.tsx`)

- [x] 2.1 Adicionar prop opcional `emptyMessage` em `StateProgressTable`, com default "Nenhum atleta encontrado para esta competição."; verificar com `npm run build` e que `PublicRefereeAssessmentPage` compila sem alteração e mantém a mensagem antiga

## 3. Página de acompanhamento (`src/pages/RegistrationProgressPage.tsx`)

- [x] 3.1 Criar estado `selectedStatuses` inicializado com os três status e derivar `socialStates`/`motorStates` com `useMemo` via `filterStatesByStatus` (`socialStatus`/`motorStatus`); verificar que, com os três marcados, as tabelas exibem as mesmas linhas de antes
- [x] 3.2 Renderizar `FilterDropdown` (label "Status", opções de `REGISTRATION_STATUS_ORDER` com `REGISTRATION_STATUS_LABEL`) alinhado à direita da `TabsList` na mesma linha, empilhando em mobile, conforme `DESIGN.md`; verificar no `npm run dev` que o botão mostra `3/3`, alterna as marcações e segue visível ao trocar de aba com a mesma seleção
- [x] 3.3 Passar `socialStates`/`motorStates` às respectivas `StateProgressTable` e `emptyMessage="Nenhum estado com os status selecionados."` quando a competição tem estados mas o recorte está vazio; verificar no `npm run dev` que desmarcar tudo mostra essa mensagem nas duas abas
- [x] 3.4 Recalcular os KPIs "Social registrado" e "Motora registrada" com `summarizeStates` sobre `socialStates`/`motorStates` (valor `percentage.toFixed(1)%`, descrição `registered de total`), mantendo "Atletas na competição" e "Estados" com os totais da competição; verificar no `npm run dev` que, com os três status marcados, os valores são iguais aos de antes e que só "Não iniciado" marcado exibe `0.0%` com total de atletas desses estados

## 4. Verificação integrada

- [x] 4.1 Rodar `npm run build` e `npm run lint` sem erros e percorrer no navegador os cenários da spec (uma opção, duas opções, nenhuma, troca de aba, estado com status diferentes por dimensão, sem competição selecionada → filtro oculto)
