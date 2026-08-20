# Roteiro da demonstracao: CI bloqueando um bug

Este roteiro demonstra o quality gate do backend e um pull request bloqueado por uma
regressao em uma regra de negocio. A branch de implementacao e
`feat/quality-gate-demo`; a branch descartavel do bug deve ser criada a partir dela com
o nome `demo/bug-limite-desconto`.

## O que foi configurado

- Workflow: `.github/workflows/ci-backend.yml`
- Check usado na protecao de branch: `Backend quality gate`
- Cobertura minima: 75%
- Eventos: `push` e `pull_request` para `develop` e `main`
- Path filter em `push`; em pull requests, um passo leve detecta as alteracoes
- Validacoes: Ruff, testes Pytest e cobertura do pacote `app`
- Evidencia: `coverage.xml` publicado como artifact por 14 dias

Em pull requests sem alteracoes no backend, o check ainda termina com sucesso, mas pula
a instalacao, o lint e os testes. Isso permite tornar `Backend quality gate` obrigatorio
na protecao de branch sem deixar PRs de frontend ou documentacao presos em `Pending`.

O limite de 75% fica imediatamente abaixo da cobertura atual de 76%. Assim, o estado
atual passa, mas uma pequena quantidade de codigo sem testes ja reprova o gate. O valor
tambem esta registrado em `backend/pyproject.toml`, permitindo a mesma verificacao fora
do GitHub Actions.

## Preparacao antes da apresentacao

1. Abra um pull request de `feat/quality-gate-demo` para `develop` e confirme que o
   check `Backend quality gate` esta verde.
2. Configure a protecao de `develop` ou `main` para exigir esse check antes do merge.
3. Crie `demo/bug-limite-desconto` a partir da versao aprovada da branch de
   implementacao.
4. Em `backend/app/domain.py`, troque somente:

   ```diff
   -    if subtotal >= 200.0:
   +    if subtotal > 200.0:
   ```

5. Confirme localmente que `test_desconto_respeita_limites_das_faixas` reprova no
   valor exato de `200.0`.
6. Envie a branch do bug e abra um pull request para `develop`. Nao faca merge.
7. Deixe abertas, em abas separadas, a pagina do pull request e a execucao do Actions.

## Demonstracao ao vivo

1. Apresente a regra correta: compras com subtotal de R$ 200,00 recebem 10% de
   desconto.
2. Mostre o diff de uma unica linha (`>=` para `>`), destacando que o codigo continua
   valido e o erro e um caso de borda.
3. Abra o check vermelho `Backend quality gate`.
4. Mostre o teste que esperava desconto de R$ 20,00 para subtotal de R$ 200,00 e
   recebeu zero.
5. Volte ao pull request e mostre que a protecao de branch impede o merge.
6. Corrija a comparacao para `>=`, envie a correcao e aguarde o mesmo check ficar
   verde.
7. Mostre que o bloqueio foi removido somente depois da validacao automatizada.

## Demonstracao especifica do limite de cobertura

Para provar o quality gate sem manter codigo artificial no repositorio, execute
temporariamente, a partir de `backend/`, um limite maior que a cobertura atual:

```powershell
..\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing --cov-fail-under=77
```

O comando deve terminar com codigo diferente de zero e informar que a cobertura de
76% nao atingiu 77%. Em seguida, execute o limite oficial:

```powershell
..\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing --cov-fail-under=75
```

O mesmo conjunto de testes deve passar. Essa comparacao prova que a falha e causada
pelo limite de cobertura, nao por um teste funcional.

## Plano de contingencia

- Se o GitHub Actions estiver lento, use uma execucao vermelha previamente preservada
  e o log local do teste.
- Se a branch protection ainda nao estiver disponivel, mostre a configuracao do ruleset
  e explique que o check obrigatorio e `Backend quality gate`.
- Nao reutilize a branch do bug em desenvolvimento normal; ela existe apenas como
  evidencia e deve permanecer sem merge.
