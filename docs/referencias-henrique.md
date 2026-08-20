# Referências — Henrique (H1 e H2)

Ferramentas e documentação oficial usadas nas tasks H1 (cache de build + convenção de
tags) e H2 (testes de integração + regras de frete/imposto). Deve ser incorporado ao
`docs/referencias.md` consolidado quando o Malaquias criar o arquivo final da issue
#12.

## H1 — Cache de build e convenção de tags

- **GitHub Actions cache** (`type=gha` em `cache-from`/`cache-to`) —
  <https://docs.docker.com/build/ci/github-actions/cache/>
- **`docker/build-push-action`** —
  <https://github.com/docker/build-push-action>
- **`docker/setup-buildx-action`** (necessário pro backend `type=gha`) —
  <https://github.com/docker/setup-buildx-action>
- **Cache de dependências em `actions/setup-python`** (`cache: pip`) —
  <https://github.com/actions/setup-python#caching-packages-dependencies>
- **Cache de dependências em `actions/setup-node`** (`cache: npm`) —
  <https://github.com/actions/setup-node#caching-global-packages-data>
- **Ordenação de camadas no Dockerfile para aproveitar cache** —
  <https://docs.docker.com/build/cache/>
- **Conventional Commits** (base da tag semver gerada pelo `release.yml` do Levi,
  documentada na convenção de tags) — <https://www.conventionalcommits.org/>

## H2 — Testes de integração e regras de negócio

- **FastAPI `TestClient`** — <https://fastapi.tiangolo.com/tutorial/testing/>
- **Pydantic `Field` (validação de modelos)** —
  <https://docs.pydantic.dev/latest/concepts/fields/>
- **pytest** — <https://docs.pytest.org/>
- **`pytest.mark.parametrize`** (casos de borda de frete/imposto e validação da API) —
  <https://docs.pytest.org/en/stable/how-to/parametrize.html>
- **`pytest-cov`** (relatório de cobertura usado no quality gate) —
  <https://pytest-cov.readthedocs.io/>
- **`httpx`** (dependência do `TestClient` do Starlette/FastAPI) —
  <https://www.python-httpx.org/>
- **Ruff** (lint aplicado ao código novo) — <https://docs.astral.sh/ruff/>
