# Dados Mockados

Dados mockados existem apenas para manter telas demonstráveis quando uma fonte de backend não está disponível ou ainda não contém registros. Eles devem ser substituídos por dados reais assim que a fonte correspondente estiver pronta e nunca devem ser usados para decisões operacionais.

| Página | Fontes simuladas | Quando são usadas | Motivo |
| --- | --- | --- | --- |
| Default (`?view=default`) | Indicadores e registros da própria tela | Sempre | Tela explicitamente demonstrativa, sem origem operacional conectada. |

## Regras

- **`src/mocks/` é backup permanente do projeto.** Seus arquivos nunca devem ser apagados, movidos, renomeados ou alterados — mesmo sem nenhum consumidor no código.
- **Mock não é fallback de dado de negócio.** Nenhuma tela real deve substituir silenciosamente uma API vazia ou com erro por dado de `src/mocks/`: API vazia → estado vazio; API com erro → estado de erro. A única exceção deliberada é o template de `DefaultPage`/`default-dashboard`, explicitamente rotulado como demonstração (linha acima).
- A interface deve identificar visivelmente o uso de dados de demonstração.
- Mocks visuais/de template devem respeitar os tipos públicos da página e morar em `src/mocks/`.
- Não enviar mocks a endpoints, exports, relatórios ou fluxos de coleta.
- Ao conectar uma fonte real, remova a entrada correspondente da tabela acima e o **uso** dos dados mockados — nunca o arquivo em `src/mocks/`.
- A dimensão técnica (Acrobacias/Pé/Solo) é inferida do nome do movimento em `TechnicalAssessmentsPage` até que o backend entregue esse atributo. Essa regra serve apenas para apresentação e deve ser substituída por um campo de origem.

## Histórico

- `src/mocks/explorer.ts` foi usado como fallback em `TechnicalAssessmentsPage` (`?view=explorer`) e no componente órfão `ExplorerPage` (não roteado em `App.tsx`) enquanto `/api/competitions`, `/api/dashboard/motor` e `/api/dashboard/profiles` ainda não estavam disponíveis. Com a integração real concluída nessas telas, o uso do fallback foi removido — hoje elas mostram estado vazio genuíno quando a API não retorna dados. O arquivo `src/mocks/explorer.ts` continua preservado em `src/mocks/` como backup, conforme política do projeto, mesmo sem consumidores no momento.
