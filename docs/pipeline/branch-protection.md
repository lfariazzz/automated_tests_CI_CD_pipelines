# Branch protection e validacao dos checks de CI

Este documento descreve a configuracao remota da Task C2. O workflow do frontend esta
em `.github/workflows/ci-frontend.yml` e publica o check `Frontend CI`.

## Pre-requisitos

Antes de criar o ruleset, execute pelo menos uma vez cada workflow no repositorio. O
GitHub so permite selecionar como obrigatorio um status check que tenha concluido no
repositorio recentemente.

Os checks planejados para `main` sao:

- `Backend quality gate`, criado pela C1;
- `Frontend CI`, criado pela C2;
- o nome final do job do workflow `.github/workflows/e2e.yml`, criado pela J2.

O check de E2E deve ser selecionado pelo nome que aparecer no primeiro pull request da
J2. Nao cadastre um nome manual diferente do nome real reportado pelo Actions.

## Configuracao do ruleset no GitHub

1. Acesse `Settings` > `Rules` > `Rulesets` > `New branch ruleset`.
2. Use o nome `Protecao da main` e marque o ruleset como ativo.
3. Em `Target branches`, inclua somente `main`.
4. Habilite `Require a pull request before merging`.
5. Habilite `Require status checks to pass`.
6. Marque `Require branches to be up to date before merging`.
7. Selecione `Backend quality gate`, `Frontend CI` e o check real de E2E.
8. Habilite o bloqueio de force push e de exclusao da branch.
9. Salve o ruleset e confirme que ele aparece como ativo para `main`.

Durante a preparacao da demonstracao, o mesmo conjunto de checks pode ser aplicado
temporariamente a `develop`. Isso permite testar feature branches sem promover todo o
conteudo de `develop` para `main`. Remova essa inclusao temporaria depois de registrar
a evidencia, caso o fluxo do grupo proteja apenas `main`.

## Validacao com um pull request quebrado

A branch descartavel `demo/frontend-ci-failure` altera somente o titulo esperado pelo
teste em `frontend/src/App.test.jsx`. O codigo de producao permanece intacto, mas o
check `Frontend CI` reprova na etapa de testes.

1. Publique a branch da C2 e faca merge do pull request em `develop`.
2. Rebase `demo/frontend-ci-failure` sobre a `develop` atualizada.
3. Publique a branch quebrada e abra um pull request para a branch protegida de teste.
4. Confirme que `Frontend CI` esta vermelho e que o GitHub desabilitou o merge.
5. Registre prints do teste reprovado e da mensagem de bloqueio em
   `docs/evidencias.md`.
6. Nao faca merge da branch de demonstracao.

## Compatibilidade entre path filtering e checks obrigatorios

Em `push`, o workflow so dispara quando o frontend ou o proprio workflow muda. Em pull
requests, o job sempre reporta um resultado, mas pula instalacao, lint, testes e build
quando nao houve mudanca de frontend. Isso evita que um check obrigatorio fique em
`Pending` para pull requests que alteram apenas backend ou documentacao.
