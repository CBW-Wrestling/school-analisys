# CLAUDE.md

Siga [AGENTS.md](AGENTS.md) — é a fonte de verdade sobre stack, comandos, estrutura e padrões
deste repositório. Este arquivo só adiciona o que é específico do Claude Code.

## Skills disponíveis (`.claude/skills/`)

| Skill | Use quando |
|---|---|
| `shadcn` | Adicionar, buscar, corrigir ou compor componentes shadcn/ui; qualquer tarefa que toque `components.json` ou `src/components/ui/` |
| `migrate-radix-to-base` | Migrar um componente ou o projeto inteiro de Radix UI para Base UI |

Ambas são sincronizadas de `shadcn/ui` via `skills-lock.json` — não editar os arquivos de
skill à mão; atualizações vêm da própria ferramenta de sync.

## Agents

Não há agents especializados configurados neste repositório (`.claude/agents/` não existe). O
projeto é pequeno o suficiente para não justificar agents dedicados hoje — revisar mudanças
diretamente. Se a sincronia entre `types.ts`/`lib/api.ts` e os DTOs do backend virar fonte
recorrente de bugs, um agent de revisão de contrato de API seria o primeiro candidato.

## Regra de ouro

Não duplique regras de `DESIGN.md` na conversa nem em código gerado — leia o arquivo antes de
implementar UI.

## Uso de contexto

- Leia `DESIGN.md` somente ao mexer em UI/componentes/páginas — não é necessário para tarefas
  puramente de lógica em `lib/`.
- Não há documento de contrato de API separado: para o contrato atual, leia `src/lib/api.ts`,
  `src/lib/auth.ts` e `src/types.ts`, ou o backend diretamente.
- Não invoque a skill `migrate-radix-to-base` a menos que a tarefa seja explicitamente sobre
  migrar de Radix para Base UI — o projeto ainda está em Radix (`radix-nova`) de propósito.
