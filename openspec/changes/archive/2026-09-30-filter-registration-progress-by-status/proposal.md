# Proposal

## Why

A tela "Acompanhamento de cadastro" (`?view=registration-progress`) mostra, para a competição
selecionada, o progresso por estado dos dados sociais e motores e as porcentagens agregadas,
mas não permite focar em um grupo de estados pelo status (Completo, Realizando, Não iniciado).
Quem acompanha o cadastro precisa isolar, por exemplo, só os estados que ainda não começaram ou
os que estão em andamento, e ver as porcentagens daquele recorte — hoje isso exige ler a tabela
inteira e fazer a conta de cabeça.

## What Changes

- Adicionar um filtro multi-seleção de status ("Status") na tela de acompanhamento, com as
  opções **Completo**, **Realizando** e **Não iniciado**; o usuário pode marcar uma, duas ou
  as três (padrão: todas marcadas, equivalente ao comportamento atual).
- Um único filtro vale para as duas abas, mas cada dimensão usa o próprio status do estado:
  a aba Social filtra por `socialStatus` e a aba Motora por `motorStatus`.
- As porcentagens dos KPIs "Social registrado" e "Motora registrada" passam a ser calculadas
  apenas sobre os estados que passam no filtro da respectiva dimensão (registrados ÷ atletas
  desses estados), com a descrição "X de Y" refletindo o mesmo recorte.
- Quando nenhum estado corresponde ao filtro, a tabela mostra um estado vazio explicativo e o
  KPI mostra 0,0% (0 de 0).
- Sem mudança de API: o status por estado já é calculado pelo backend
  (`RegistrationProgressService.statusFor`) e vem na resposta; o filtro é aplicado no frontend.

## Capabilities

### New Capabilities
- `registration-progress`: acompanhamento de cadastro por estado na competição selecionada,
  incluindo o filtro de status e o cálculo das porcentagens sobre o recorte filtrado.

### Modified Capabilities
<!-- Nenhuma: ainda não há specs em openspec/specs/. -->

## Impact

- `src/pages/RegistrationProgressPage.tsx`: estado do filtro, toolbar ao lado da `TabsList`,
  KPIs recalculados, estados filtrados passados às tabelas.
- `src/lib/registrationProgress.ts`: funções puras de filtro por status e de agregação
  (registrados, total, porcentagem) sobre uma lista de estados.
- `src/components/RegistrationProgressTables.tsx`: mensagem de vazio configurável em
  `StateProgressTable` (hoje fixa em "Nenhum atleta encontrado para esta competição.").
- Reuso de `src/components/FilterDropdown.tsx` (padrão de multi-seleção do `DESIGN.md`).
- Fora do escopo: página pública do árbitro (`PublicRefereeAssessmentPage`), detalhe de
  atletas de um estado e backend — nenhum endpoint ou DTO muda.
