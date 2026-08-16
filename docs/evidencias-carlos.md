# Evidências das tasks C1 e C2 - Carlos

Este documento registra o estado das tasks de quality gate, demonstração de bug,
CI do frontend e branch protection. Os dados foram conferidos em 16/08/2026, antes
da configuração administrativa das regras de proteção.

## Resumo executivo

| Task | Entrega técnica | Evidência | Estado |
|---|---|---|---|
| C1 | Quality gate de 75% no backend e roteiro da demonstração | PR #28 verde e PR #30 vermelho | Implementação concluída; bloqueio administrativo pendente |
| C2 | CI do frontend com instalação, lint, teste e build | PR #29 verde | Workflow concluído; proteção final da `main` depende do administrador e do E2E |

As alterações corretas foram incorporadas apenas em `develop`. O bug proposital está
isolado na branch `demo/bug-limite-desconto` e nunca deve ser mergeado.

## C1 - Quality gate e bug proposital

### O que foi implementado

- Workflow `.github/workflows/ci-backend.yml`.
- Ruff para análise estática.
- Pytest para execução dos testes.
- Cobertura do pacote `app` com limite mínimo de 75%.
- Relatório `coverage.xml` publicado como artifact.
- Detecção de mudanças para evitar execução pesada quando o backend não foi alterado.
- Roteiro em `docs/roteiro-demonstracao-ci.md`.

### Por que o limite é 75%

A cobertura medida durante a implementação foi 75,86%. O limite de 75% permite que o
estado atual seja aprovado, mas faz uma pequena inclusão de código sem testes reprovar
o pipeline. Um teste controlado com limite temporário de 77% retornou falha, provando
que o gate funciona.

### Evidência de aprovação

- [PR #28 - implementação do quality gate](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/pull/28)
- [Check Backend quality gate aprovado](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/actions/runs/31920972053/job/95100685002)
- Resultado local: 10 testes aprovados e cobertura de 75,86%.

### Evidência de reprovação

- [PR #30 - bug proposital](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/pull/30)
- [Check Backend quality gate reprovado](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/actions/runs/31921757934/job/95102593873)
- [Check Frontend CI aprovado no mesmo PR](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/actions/runs/31921757922/job/95102593869)

O PR #30 altera somente uma comparação:

```diff
-    if subtotal >= 200.0:
+    if subtotal > 200.0:
```

No subtotal exato de R$ 200,00, o código com bug retorna desconto zero, enquanto o
teste espera R$ 20,00. O backend reprova e o frontend permanece verde, mostrando que
os pipelines são independentes.

## C2 - CI do frontend e branch protection

### O que foi implementado

- Workflow `.github/workflows/ci-frontend.yml`.
- Node.js 24 e cache de dependências npm.
- Instalação reproduzível com `npm ci`.
- Lint com Oxlint.
- Teste de componente com Vitest e Testing Library.
- Build de produção com Vite.
- Detecção de mudanças compatível com checks obrigatórios.
- Instruções administrativas em `docs/branch-protection.md`.

### Evidência de aprovação

- [PR #29 - CI do frontend](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/pull/29)
- [Check Frontend CI aprovado](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/actions/runs/31921152188/job/95101111332)
- [Check Backend quality gate aprovado no mesmo PR](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/actions/runs/31921152142/job/95101111222)

O PR comprovou que `npm ci`, lint, teste e build terminam com sucesso no GitHub
Actions.

## Estado antes da configuração administrativa

Na data deste registro:

- `main` não está protegida.
- `develop` não está protegida.
- O autor das tasks possui permissão de escrita, mas não permissão administrativa.
- O PR #30 está com o backend vermelho e o frontend verde.
- O PR #30 ainda é tecnicamente mergeável porque não existe um ruleset obrigatório.
- O workflow E2E da J2 ainda não existe em `develop`.

Assim, a automação já detecta o erro, mas o GitHub ainda não impede administrativamente
o clique em merge. Essa última etapa depende do administrador do repositório.

## O que o administrador deve fazer agora

### Proteção temporária para concluir a demonstração

1. Acessar `Settings` > `Rules` > `Rulesets`.
2. Criar um branch ruleset chamado `Proteção temporária da develop`.
3. Definir o status como `Active`.
4. Selecionar `develop` como branch alvo.
5. Habilitar `Require a pull request before merging`.
6. Habilitar `Require status checks to pass`.
7. Habilitar `Require branches to be up to date before merging`.
8. Adicionar os checks obrigatórios `Backend quality gate` e `Frontend CI`.
9. Bloquear force pushes e exclusão da branch.
10. Salvar o ruleset.
11. Atualizar o PR #30 e confirmar que o merge aparece bloqueado.

Depois dessa confirmação, deve ser feito um print da mensagem de bloqueio. O PR #30
deve permanecer sem merge e pode ser convertido em draft até a apresentação.

### Proteção definitiva da main

Depois que a J2 publicar e executar o workflow `e2e.yml`, o administrador deve criar
ou atualizar um ruleset para `main` exigindo:

- `Backend quality gate`;
- `Frontend CI`;
- o nome real do check E2E reportado pelo primeiro workflow da J2.

A proteção definitiva também deve exigir pull request, branch atualizada, bloquear
force push e impedir exclusão da `main`.

## Prints que devem ser guardados

| Identificador | Conteúdo do print | Estado |
|---|---|---|
| C1-01 | PR #28 com Backend quality gate verde | Pendente anexar |
| C1-02 | Diff do PR #30 mostrando `>=` para `>` | Pendente anexar |
| C1-03 | Log do teste reprovado no valor R$ 200,00 | Pendente anexar |
| C1-04 | PR #30 com Backend vermelho e Frontend verde | Pendente anexar |
| C1-05 | Mensagem de merge bloqueado após o ruleset | Depende do administrador |
| C2-01 | PR #29 com Frontend CI verde | Pendente anexar |
| C2-02 | Log contendo `npm ci`, lint, teste e build aprovados | Pendente anexar |
| C2-03 | Ruleset definitivo da `main` com três checks | Depende do administrador e da J2 |

Os arquivos de imagem podem ser organizados posteriormente em
`docs/evidencias/carlos/`, durante a consolidação do documento geral de evidências.

## Roteiro simples para a apresentação

### Fala sugerida - aproximadamente 2 minutos

> Minha primeira task foi configurar o quality gate do backend. O workflow executa
> lint, testes e mede a cobertura, exigindo no mínimo 75%. No PR #28, o código correto
> passou com cobertura de 75,86%.
>
> Para provar que o pipeline detecta uma regressão real, criamos o PR #30 em uma
> branch separada. A única mudança foi trocar maior ou igual por maior na faixa de
> desconto de R$ 200,00. O código continua sintaticamente válido, mas falha exatamente
> no caso de borda: o teste esperava R$ 20,00 de desconto e recebeu zero. Por isso, o
> backend ficou vermelho, enquanto o frontend permaneceu verde.
>
> Minha segunda task foi criar o CI do frontend. Ele instala as dependências com
> `npm ci`, executa lint, testes Vitest e o build de produção. O PR #29 comprova que
> todas essas etapas passaram no GitHub Actions.
>
> Por fim, os checks serão obrigatórios pela branch protection. Assim, um erro que
> poderia passar despercebido deixa de depender de revisão manual e é bloqueado antes
> de chegar à branch principal.

### Sequência da demonstração ao vivo

1. Mostrar o PR #28 e o check verde.
2. Mostrar no PR #30 a alteração de uma única linha.
3. Abrir o log vermelho e destacar o caso de R$ 200,00.
4. Mostrar que o Frontend CI continuou verde.
5. Após o ruleset, mostrar a mensagem de merge bloqueado.
6. Mostrar o PR #29 e resumir as quatro etapas do frontend.

## Respostas rápidas para possíveis perguntas

**Por que criar um bug proposital?**

Para demonstrar com evidência reproduzível que o CI detecta uma regressão e impede que
ela chegue às branches oficiais. O bug nunca é mergeado.

**Por que usar um caso de borda?**

Porque trocar `>=` por `>` é um erro pequeno, válido sintaticamente e fácil de escapar
em revisão manual, mas deve ser detectado por um bom teste automatizado.

**Por que o frontend ficou verde quando o backend falhou?**

Os workflows identificam quais áreas mudaram. O check do frontend ainda reporta um
resultado válido, mas pula as etapas pesadas quando não houve mudança no frontend.

**O trabalho está totalmente concluído?**

A implementação das duas tasks está concluída. O bloqueio administrativo final depende
de permissão de administrador e o ruleset completo da `main` depende do E2E da J2.

## Encerramento correto do PR de demonstração

O PR #30 não deve ser mergeado. Depois da apresentação e da coleta dos prints, ele
pode ser fechado com o comentário:

> PR encerrado sem merge. Criado exclusivamente para demonstrar que o pipeline de CI
> detecta uma regressão em um caso de borda.
