# Dados Mockados

Dados mockados existem apenas para manter telas demonstráveis quando uma fonte de backend não está disponível ou ainda não contém registros. Eles devem ser substituídos por dados reais assim que a fonte correspondente estiver pronta e nunca devem ser usados para decisões operacionais.

| Página | Fontes simuladas | Quando são usadas | Motivo |
| --- | --- | --- | --- |
| Avaliações técnicas (`?view=explorer`) | `/api/competitions`, `/api/dashboard/motor` | Quando qualquer resposta falha ou retorna uma lista vazia | O backend local pode estar indisponível durante desenvolvimento e a tela precisa permitir validar filtros, pontuação média e comparativos regionais/estaduais. |
| Default (`?view=default`) | Indicadores e registros da própria tela | Sempre | Tela explicitamente demonstrativa, sem origem operacional conectada. |

## Regras

- A interface deve identificar visivelmente o uso de dados de demonstração.
- Mocks devem respeitar os tipos públicos da página e morar em `src/mocks/`.
- Não enviar mocks a endpoints, exports, relatórios ou fluxos de coleta.
- Ao conectar uma fonte real, remova a entrada correspondente e seus dados mockados.
- A dimensão técnica é inferida do nome do movimento até que o backend entregue esse atributo. Essa regra serve apenas para apresentação e deve ser substituída por um campo de origem.