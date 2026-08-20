# Convenção de tags das imagens Docker

Define como as imagens `checkout-backend` e `checkout-frontend` devem ser nomeadas
(tagueadas) em cada estágio da pipeline, para que CI e CD (`cd-staging.yml`,
`cd-production.yml`) usem sempre o mesmo padrão.

## Tags e quando cada uma é gerada

| Tag | Formato | Gerada por | Quando | Uso |
|---|---|---|---|---|
| Commit SHA | `sha-<7 primeiros chars do commit>` (ex: `sha-c8bcdfe`) | CI (build de toda imagem) | Todo build, em qualquer branch | Rastreabilidade exata: qualquer imagem publicada aponta pra um commit único. É a tag que builds locais/CI usam pra rodar o Trivy contra a imagem que acabou de ser construída. |
| Semver | `vMAJOR.MINOR.PATCH` (ex: `v1.4.0`) | `release.yml` (L1, Levi) | Ao mergear em `main`, a partir da convenção de commits (conventional commits) | Identifica versões de release de forma legível e ordenável; é o que aparece nas releases do GitHub. |
| `stable` | `stable` | `cd-production.yml` (L2, Levi) | Após um deploy em produção passar no healthcheck pós-deploy | Aponta sempre para a última versão comprovadamente estável em produção; é o alvo do rollback automático. |

## Regras

- **Toda imagem publicada no GHCR carrega no mínimo a tag de commit SHA.** Isso garante
  que uma imagem nunca fica "anônima" — mesmo antes de virar uma release semver.
- **`latest` não é usada.** É ambígua sobre qual código está rodando; SHA e semver já
  cobrem os dois casos de uso (debug exato / versão legível).
- **`stable` é sempre um ponteiro (não é uma tag imutável de conteúdo)** — ela é
  re-taguada a cada deploy de produção bem-sucedido, nunca criada do zero. É o que o
  rollback do L2 usa como alvo.
- Uma mesma imagem pode (e deve) carregar mais de uma tag simultaneamente: o build que
  vira release em produção recebe `sha-<hash>`, `vX.Y.Z` **e** `stable` na mesma
  publicação.

## Fluxo resumido

```
push em qualquer branch     → CI builda e tagueia localmente como sha-<hash> (não publica)
merge em main                → release.yml cria vX.Y.Z + cd-staging.yml publica sha-<hash> e vX.Y.Z no GHCR, deploy em staging
aprovação manual + deploy OK → cd-production.yml move a tag stable para essa mesma imagem
```

## Cache de build

Complementar à convenção de tags, o CI do backend (`ci-backend.yml`) usa
`docker/build-push-action` com cache de camadas Docker persistido no backend do GitHub
Actions (`cache-from`/`cache-to: type=gha`). Isso evita reconstruir camadas que não
mudaram (ex: instalação de dependências) a cada execução do workflow — só a camada
`COPY . .` é reconstruída quando apenas o código da aplicação muda, já que os
Dockerfiles do backend e do frontend já separam a instalação de dependências da cópia
do código-fonte (ordem que favorece o cache de camadas do próprio Docker).

O cache de dependências de linguagem (pip e npm) já está configurado desde a Fase 0,
via `cache: pip` em `actions/setup-python` (`ci-backend.yml`) e `cache: npm` em
`actions/setup-node` (`ci-frontend.yml`).
