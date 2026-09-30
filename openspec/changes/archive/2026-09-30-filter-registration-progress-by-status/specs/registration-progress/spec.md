# Spec Delta

## Purpose

Acompanhamento do cadastro de dados sociais e motores por estado na competição selecionada,
permitindo filtrar os estados pelo status de preenchimento e ver as porcentagens do recorte.

## ADDED Requirements

### Requirement: Filtro de status na tela de acompanhamento
A tela de acompanhamento de cadastro SHALL oferecer um filtro de status multi-seleção com as
opções "Completo", "Realizando" e "Não iniciado". O usuário MUST poder marcar qualquer
combinação dessas opções (uma, duas, as três ou nenhuma). Ao abrir a tela, as três opções
SHALL estar marcadas, preservando o comportamento anterior (todos os estados visíveis). O filtro
SHALL ser exibido somente quando há uma competição específica selecionada.

#### Scenario: Estado inicial mostra todos os estados
- **WHEN** o usuário abre a tela de acompanhamento com uma competição selecionada
- **THEN** o filtro de status mostra as três opções marcadas
- **AND** as tabelas e KPIs exibem os mesmos valores de antes desta mudança

#### Scenario: Seleção de uma única opção
- **WHEN** o usuário deixa marcada apenas a opção "Completo"
- **THEN** somente estados com status "Completo" na dimensão da aba são listados

#### Scenario: Seleção de duas opções
- **WHEN** o usuário deixa marcadas "Realizando" e "Não iniciado"
- **THEN** são listados os estados cujo status, na dimensão da aba, é "Realizando" ou "Não iniciado"

#### Scenario: Sem competição selecionada
- **WHEN** a competição selecionada no topo é "todas"
- **THEN** o filtro de status não é exibido

### Requirement: Filtro aplicado por dimensão
Um único filtro de status SHALL valer para as abas Social e Motora, mas cada aba MUST avaliar o
status da própria dimensão do estado: a aba Social usa o status social do estado e a aba Motora
usa o status motor do estado. A seleção do filtro MUST ser mantida ao alternar entre as abas.

#### Scenario: Mesmo estado com status diferentes por dimensão
- **WHEN** um estado tem status social "Completo" e status motor "Realizando"
- **AND** o filtro tem apenas "Completo" marcado
- **THEN** o estado aparece na aba Social
- **AND** o estado não aparece na aba Motora

#### Scenario: Troca de aba preserva seleção
- **WHEN** o usuário marca apenas "Não iniciado" na aba Social e muda para a aba Motora
- **THEN** o filtro continua com apenas "Não iniciado" marcado e a aba Motora é filtrada por ele

### Requirement: Porcentagens refletem o recorte filtrado
Os KPIs "Social registrado" e "Motora registrada" SHALL ser calculados apenas sobre os estados
que passam no filtro na respectiva dimensão. A porcentagem MUST ser a soma de atletas
registrados desses estados dividida pela soma de atletas desses estados, e a descrição
"X de Y" MUST usar os mesmos numerador e denominador. Quando nenhum estado passa no filtro, o
KPI SHALL exibir "0.0%" com descrição "0 de 0". Os KPIs "Atletas na competição" e "Estados"
SHALL continuar mostrando os totais da competição, sem filtro.

#### Scenario: Porcentagem com dois status
- **WHEN** o filtro tem "Completo" e "Realizando" marcados
- **AND** os estados com status social nesses valores somam 120 atletas, dos quais 90 têm dados sociais registrados
- **THEN** o KPI "Social registrado" exibe "75.0%" com descrição "90 de 120"

#### Scenario: Cada KPI usa sua dimensão
- **WHEN** o filtro tem apenas "Não iniciado" marcado
- **THEN** o KPI "Social registrado" considera só estados com status social "Não iniciado"
- **AND** o KPI "Motora registrada" considera só estados com status motor "Não iniciado"

#### Scenario: Nenhum estado no recorte
- **WHEN** nenhum estado tem, na dimensão motora, um status marcado no filtro
- **THEN** o KPI "Motora registrada" exibe "0.0%" com descrição "0 de 0"

#### Scenario: Totais da competição não mudam
- **WHEN** o usuário altera a seleção do filtro
- **THEN** os KPIs "Atletas na competição" e "Estados" mantêm os totais da competição

### Requirement: Estado vazio da tabela filtrada
Quando nenhum estado da aba passa no filtro, a tabela SHALL exibir uma mensagem explicando que
não há estados com os status selecionados, diferente da mensagem de competição sem atletas.

#### Scenario: Filtro sem resultados
- **WHEN** o filtro não tem nenhuma opção marcada
- **THEN** as tabelas das duas abas mostram "Nenhum estado com os status selecionados."
