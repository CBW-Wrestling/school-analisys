# Referencias de Interface

`next-shadcn-admin-dashboard` e um submodulo Git fixado no commit `64e775837bded678341b09e3ab046d542a1a6a8a`. Ele e uma referencia de composicao, interacao e responsividade para o CBW.

Inicialize a referencia depois de clonar o repositorio:

```sh
git submodule update --init --recursive
```

Para atualizar, revise as telas relevantes no template, atualize deliberadamente o commit do submodulo e ajuste `template-patterns.md`. Nao importe codigo, dependencias ou componentes `ui` do submodulo para a aplicacao CBW.

O template usa Next.js/RSC e TanStack Table v9. O CBW usa Vite, componentes cliente e TanStack Table v8. Adapte apenas o padrao visual e os comportamentos que atendem ao dominio.

Consulte [template-patterns.md](./template-patterns.md) antes de criar ou redesenhar telas.