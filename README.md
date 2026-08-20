# Testes Automatizados em Pipelines CI/CD

Trabalho prático da disciplina de **Gerência de Configuração** (UFCA — Bacharelado em
Engenharia de Software), modalidade **prática**, tema **10. Testes Automatizados em
Pipelines CI/CD**.

## Objetivos do trabalho

O foco do trabalho **não é a aplicação de exemplo em si** — o código do sistema usado como
pretexto foi gerado com apoio de IA e serve só de material para demonstrar a pipeline
funcionando. O esforço real do grupo está em **desenhar, implementar e validar uma pipeline
completa de CI/CD**, cobrindo:

- Testes automatizados em múltiplas camadas (unitário, integração, E2E) como parte do
  pipeline, não como etapa isolada;
- Quality gates que bloqueiam merge quando os critérios de qualidade não são atingidos;
- Segurança integrada ao pipeline (auditoria de dependências, scan de imagem Docker);
- Versionamento semântico automatizado e gerenciamento de releases;
- Entrega contínua (build, publicação de artefatos e deploy automático em staging);
- Implantação contínua com aprovação humana e rollback automático em produção.

Objetivos de aprendizagem específicos: compreender os conceitos e práticas de CI/CD e do
ecossistema DevOps, investigar ferramentas amplamente usadas na indústria (GitHub Actions,
Docker, GHCR, Playwright, Trivy, pip-audit), e entender como essas práticas aumentam a
qualidade, confiabilidade e produtividade do desenvolvimento de software.

## Grupo

Levi, David, Henrique, Carlos, Angelo, Jetro e Malaquias (7 integrantes).

A divisão completa das tarefas — quem faz o quê, critérios de aceite e dependências — está em
[`docs/divisao-tarefas.md`](docs/divisao-tarefas.md), e o andamento é acompanhado no
[Project do GitHub](https://github.com/users/lfariazzz/projects/3).

A apresentação do projeto - desenvolvida pelos 7 integrantes da equipe - foi feito por slides no Canva no link abaixo:
## [Apresentação Pipeline CI/CD](https://canva.link/65933sp1lnq1291)

## Organização do repositório

```
repo/
├── backend/                    # API FastAPI + testes unitários/integração
├── frontend/                   # Interface React + testes unitários/componente
├── e2e/                        # Testes end-to-end (Playwright)
├── docker-compose.yml          # sobe backend+frontend juntos (dev/CI)
├── docker-compose.staging.yml  # mesma composição, usando as imagens publicadas no GHCR
├── .github/workflows/          # pipelines de CI, E2E, release e CD
└── docs/
    ├── divisao-tarefas.md      # backlog: quem faz o quê, critérios de aceite, dependências
    ├── pipeline/                 # docs de infraestrutura da pipeline
    │   ├── branch-protection.md      # configuração e validação da proteção da main
    │   ├── convencao-tags-imagens.md # convenção de tags das imagens Docker
    │   ├── como-reproduzir.md        # execução local, por camada, e do E2E
    │   └── roteiro-demonstracao-ci.md # roteiro da demonstração do quality gate
    └── evidencias/              # evidências por pessoa (uma pasta de imagens + um .md por pessoa)
        ├── <nome>.md
        └── <nome>/<prints>
```

## Navegação na documentação

- **Quer entender o que cada pessoa fez e por quê?** Comece por
  [`docs/divisao-tarefas.md`](docs/divisao-tarefas.md) — tem o contexto, escopo e critério de
  aceite de cada task.
- **Quer ver prova de que cada entrega funciona?** `docs/evidencias/<nome>.md` — um por
  pessoa, com links de PR, execuções de workflow e prints.
- **Quer entender como a pipeline foi montada e como reproduzi-la localmente?**
  `docs/pipeline/` — convenção de tags, proteção de branch, roteiro de demonstração e guia de
  reprodução.
- **Quer ver o contrato da API consumido por frontend, backend e testes?** Seção
  [Contrato da API](#contrato-da-api) abaixo, neste README.

> **Pendente:** a seção de referências bibliográficas (documentação oficial das ferramentas
> usadas por cada pessoa) e o roteiro de apresentação ainda não foram consolidados — cada
> integrante deve produzir a própria lista de referências antes da entrega final; a versão
> consolidada será publicada em `docs/referencias.md`.

## Estado atual

A `main` já recebeu a primeira entrega completa do pipeline, testada de ponta a ponta:

- Walking skeleton com backend FastAPI, frontend React/Vite, Dockerfiles e Docker Compose;
- API de pedidos (`POST/GET /pedidos`, `GET /pedidos/{id}`) e frontend consumindo-a via
  formulário com resumo calculado;
- Quatro regras de negócio isoladas, com testes cobrindo os limites exatos de cada uma;
- CI do backend (lint, testes, cobertura mínima de 75%) e do frontend (lint, testes, build de
  produção), cada um com path filtering e cancelamento de execuções obsoletas;
- Auditoria de dependências (`pip-audit`) e scan de vulnerabilidades da imagem Docker
  (Trivy), com relatórios publicados como artifacts;
- Pipeline E2E com Playwright, subindo o stack completo via Docker Compose com healthcheck;
- Rulesets de proteção configurados para `develop` e `main`;
- Cache de camadas Docker no CI e convenção de tags de imagem documentada e aplicada;
- **Release automático** (`release.yml`): versão semântica calculada a partir dos commits,
  tag e GitHub Release criados a cada merge na `main`;
- **Deploy contínuo em staging** (`cd-staging.yml`): disparado automaticamente após o
  release, builda e publica as imagens no GHCR e valida o deploy com healthcheck;
- **Deploy em produção com aprovação e rollback** (`cd-production.yml`): disparo manual,
  aprovação obrigatória via GitHub Environment, promoção da imagem a `stable` se o
  healthcheck passar, ou rollback automático para a última `stable` se falhar.

O ciclo completo (merge → release → staging automático → aprovação → produção) já foi
validado de ponta a ponta com a versão `v0.0.2` — ver
[`docs/evidencias/levi.md`](docs/evidencias/levi.md).

## Aplicação de exemplo

Sistema full-stack de **cálculo de pedidos** (carrinho → checkout), escolhido porque tem
regras de negócio simples, determinísticas e fáceis de "quebrar de propósito" para demonstrar
a automação pegando erros.

**Regras de negócio (o que gera os casos de teste):**
- Desconto progressivo por faixa de valor do subtotal (ex: ≥ R$200 → 10%, ≥ R$500 → 20%)
- Frete grátis acima de um valor mínimo de subtotal, senão taxa fixa
- Limite máximo de itens por produto no pedido
- Imposto calculado sobre o subtotal (antes do desconto)

Essas regras têm **casos de borda clássicos** (comparação `>` vs `>=` no limite exato, ordem
de aplicação de desconto/imposto) — é justamente esse tipo de bug que o grupo injeta de
propósito nas demonstrações para mostrar o CI reprovando o PR.

**Stack:**
- **Backend**: Python + FastAPI (API com as regras de negócio) + pytest (testes unitários e de
  integração)
- **Frontend**: React + Vite (formulário de pedido consumindo a API) + Vitest (testes
  unitários/componente)
- **E2E**: Playwright, rodando contra os dois serviços orquestrados via Docker Compose

## Contrato da API

A API usa como base `http://localhost:8000`. O endpoint `/health` já existe; os endpoints de
pedidos abaixo definem o contrato seguido pelas implementações de backend, frontend e testes
de integração.

### `GET /health`

Verifica se o backend está disponível.

**Resposta `200 OK`:**

```json
{
  "status": "ok"
}
```

### `POST /pedidos`

Cria um pedido e devolve o resumo com os valores calculados pelas regras de negócio.

**Corpo da requisição:**

```json
{
  "cliente": "Maria",
  "item": "Teclado",
  "preco_unitario": 250.0,
  "quantidade": 2
}
```

Regras mínimas de validação:

- `cliente` e `item` são obrigatórios;
- `preco_unitario` deve ser maior que zero;
- `quantidade` deve estar entre `1` e `10`, inclusive.

**Resposta `201 Created`:**

```json
{
  "id": 1,
  "cliente": "Maria",
  "item": "Teclado",
  "preco_unitario": 250.0,
  "quantidade": 2,
  "subtotal": 500.0,
  "desconto": 100.0,
  "frete": 0.0,
  "imposto": 25.0,
  "total": 425.0
}
```

O total segue a fórmula:

```text
total = subtotal - desconto + frete + imposto
```

### `GET /pedidos`

Lista os pedidos já criados.

**Resposta `200 OK`:**

```json
[
  {
    "id": 1,
    "cliente": "Maria",
    "item": "Teclado",
    "preco_unitario": 250.0,
    "quantidade": 2,
    "subtotal": 500.0,
    "desconto": 100.0,
    "frete": 0.0,
    "imposto": 25.0,
    "total": 425.0
  }
]
```

Quando ainda não houver pedidos, a resposta deve ser uma lista vazia:

```json
[]
```

### `GET /pedidos/{id}`

Busca um pedido pelo identificador.

**Resposta `200 OK`:** o mesmo objeto retornado na criação do pedido.

**Resposta `404 Not Found`:**

```json
{
  "detail": "Pedido não encontrado"
}
```

### Erros de validação

Requisições com campos ausentes, tipos inválidos, preço não positivo ou quantidade fora do
intervalo permitido devem retornar `422 Unprocessable Entity`, seguindo o formato de erro de
validação do FastAPI.

## Como executar a versão atual

Com Docker e Docker Compose instalados:

```bash
git switch develop
docker compose up --build
```

O frontend fica disponível em <http://localhost:5173> e o healthcheck do backend em
<http://localhost:8000/health>. Para encerrar e remover os contêineres, execute
`docker compose down`. Consulte o
[guia de reprodução](docs/pipeline/como-reproduzir.md) para executar as camadas isoladamente
e rodar o E2E.

## Desenho da pipeline

### CI (Continuous Integration)
- `ci-backend.yml`: instala as dependências, executa Ruff e pytest com cobertura mínima de
  75%, publica o relatório de cobertura como artifact, audita dependências com `pip-audit` e
  escaneia a imagem Docker com Trivy (informativo, não bloqueante)
- `ci-frontend.yml`: instala as dependências, executa lint, testes Vitest e o build de produção
- `e2e.yml`: sobe o stack completo via Docker Compose (com healthcheck), aguarda os serviços
  e executa os testes end-to-end com Playwright, publicando o relatório como artifact
- Em `push`, cada workflow usa path filtering; em pull requests, os checks sempre respondem,
  mas pulam as etapas pesadas quando a pasta correspondente não mudou
- Todos usam cache (pip/npm e camadas Docker via `type=gha`) para builds mais rápidos
- Os rulesets de `develop` e `main` exigem os checks de backend e frontend

### Continuous Delivery
- `release.yml`: a cada merge na `main`, calcula a próxima versão semântica a partir dos
  commits (Conventional Commits, com fallback para patch), cria a tag e a GitHub Release
- `cd-staging.yml`: disparado automaticamente quando o `release.yml` termina com sucesso
  (via `workflow_run` — pushes com o token padrão não disparam outros workflows), builda e
  publica as imagens no GHCR (tags `sha-<hash>` e `vX.Y.Z`) e faz deploy simulado em staging,
  validado por healthcheck

### Continuous Deployment
- `cd-production.yml`: disparo manual (`workflow_dispatch`, informando a versão), com
  **aprovação obrigatória** via GitHub Environment `production` antes de qualquer passo
  rodar — a fronteira entre Delivery (staging automático) e Deployment (produção com gate
  humano)
- Guarda a imagem `stable` atual antes de sobrescrevê-la; após o deploy, valida com
  healthcheck — se passar, promove a versão a `stable`; se falhar, **reimplanta
  automaticamente** a `stable` anterior (rollback) e falha o job de propósito, sinalizando que
  o deploy não foi bem-sucedido mesmo com o serviço restaurado

## Por que esse desenho

- Cobre os três conceitos centrais do tema (CI, Delivery, Deployment) de forma **separada e
  demonstrável**, não misturada
- Full-stack com jobs paralelos e path filtering mostra domínio de pipeline mais avançado que
  um pipeline linear simples
- Múltiplas camadas de teste (unitário, integração, E2E) atende diretamente ao critério de
  "qualidade técnica do experimento" da avaliação
- Segurança (auditoria de dependências e scan de imagem) e eficiência (cache, estratégia de
  tags) entraram como conteúdo genuíno de pipeline — substituindo tasks que inicialmente
  seriam "escrever a aplicação", fora do foco do trabalho
- Escopo foi calibrado para ser **executável por um grupo de 7 pessoas em um semestre** sem
  comprometer a qualidade
