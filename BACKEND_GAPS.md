# Gaps de backend — telas inspiradas no PowerBI

Este documento lista dados usados no frontend (`school-analisys`) que hoje são **mockados**
porque a API do `school-analysis-backend` ainda não os expõe agregados. Cada mock está isolado
em `src/mocks/dashboard-gaps.ts` com comentário `// MOCK: remover quando ...`.

## GAP 1 — Pontuação técnica por atleta (`entryId`)

- **Onde é usado**: aba "Correlações" de `TechnicalAssessmentsPage.tsx` (scatter pontuação ×
  colocação/vitórias/pontos técnicos).
- **Problema**: `/api/dashboard/motor` retorna linhas agregadas por estado/estilo/peso/
  competência, sem `entryId`. Não é possível cruzar a pontuação técnica de um atleta com seu
  resultado em `/api/results` (que tem `entryId`, `rank`, `wins`, `technicalPointsFor`).
- **Mock atual**: `mockAthleteMotorScores(results: ResultRow[])` gera uma pontuação plausível e
  estável (seed determinística por `entryId`) para cada resultado real.
- **Contrato sugerido**: `GET /api/dashboard/motor/athlete-scores?competitionId={uuid}`
  retornando `{ entryId: string; averageScore: number }[]`, calculado a partir de
  `motor_results` agregados por `athlete_entry_id`.

## GAP 2 — Tier de peso (Leve/Médio/Pesado) nas avaliações físicas

- **Onde é usado**: tabela detalhada por estilo × tier em `PhysicalPage.tsx`.
- **Problema**: `PhysicalRowDto.peso`/`PhysicalSummaryDto` expõem a categoria de peso bruta
  (kg), não a classificação Leve/Médio/Pesado usada no relatório de origem.
- **Mock previsto** (ainda não implementado): `mockWeightTier(rows)` classificaria por
  percentil (33%/66%) do campo `peso` dentro de cada estilo — heurística aproximada, não a
  regra de negócio real.
- **Contrato sugerido**: `PhysicalRowDto`/`PhysicalSummaryDto` ganharem campo
  `weightTier: "LEVE" | "MEDIO" | "PESADO"`, calculado no backend a partir de
  `weight_categories` (regra real por categoria de idade/gênero).

## GAP 3 — Comprimento de antebraço não exposto no dashboard físico

- **Onde seria usado**: coluna "Comprimento de antebraço (D/E)" da tabela de `PhysicalPage.tsx`,
  como no relatório de origem.
- **Problema**: `/api/dashboard/physical` já traz uma linha por avaliação real (envergadura,
  estatura, prensão manual D/E), então a correlação entre medidas **não precisa de mock** — é
  calculada direto sobre os dados reais (usamos envergadura × prensão manual, já disponíveis).
  Só o comprimento de antebraço (`forearmRightCm`/`forearmLeftCm`, presentes no
  `PhysicalUpdateDto` da coleta) não é exposto neste endpoint de leitura.
- **Contrato sugerido**: `PhysicalRowDto`/`PhysicalSummaryDto` ganharem
  `forearmRightCm`/`forearmLeftCm`, hoje só usados na gravação.

## GAP 4 — Distribuição por modalidade específica (perfil)

- **Onde é usado**: gráfico "Contagem de atletas por modalidade praticada" em
  `ProfilesPage.tsx`.
- **Problema**: `ProfileSummaryDto` só expõe o total agregado `practicesOtherSport`
  (sim/não), não a distribuição por modalidade específica (Judô, Jiu-Jitsu, Capoeira, etc.),
  mesmo o dado (`other_sports`) já existindo na tabela `athlete_profiles`.
- **Mock atual**: `mockOtherSportBreakdown(total)` distribui o total real entre modalidades
  plausíveis, mantendo a soma igual ao total real.
- **Contrato sugerido**: `ProfileSummaryDto` ganhar `byOtherSport: CountByCode[]`, agregando o
  array `other_sports` por valor.

---

Todos os outros widgets das telas (medalhas, pontos técnicos, KPIs de resumo, gráficos por
estado/competência) usam dado 100% real da API existente — não precisam de mock.
