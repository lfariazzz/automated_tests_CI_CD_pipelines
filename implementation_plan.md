# Plano de implementação — Issues do Jetro

Data da análise: 2026-08-19  
Repositório: `lfariazzz/automated_tests_CI_CD_pipelines`  
Branch analisada: `develop`  
Commit local/remoto confirmado: `30fc5587385b27c387c141d688e7016f975f5451`

## Escopo identificado

As Issues abertas atribuídas a `jetrokepler` são:

| Issue | Título | Dependência | Situação na `develop` |
|---|---|---|---|
| [#15](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/issues/15) | Docker Compose + testes E2E | #8 e #1 | Compose existe, mas sem healthcheck; API usada pelo frontend ainda não existe; não há Playwright/E2E |
| [#16](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/issues/16) | CI: workflow `e2e.yml` | #15 | `.github/workflows/e2e.yml` ainda não existe |
| [#10](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/issues/10) | `docs/como-reproduzir.md` | #15 | `docs/como-reproduzir.md` ainda não existe |

Não há Issues fechadas atribuídas a `jetrokepler` neste repositório. A Issue #1 está fechada, mas a #8 permanece aberta; o frontend da `develop` já contém a tela e os testes esperados pela #8, portanto a dependência prática restante para o fluxo E2E é a API de pedidos no backend.

## Diagnóstico técnico

- `backend/app/main.py` expõe somente `GET /health`.
- `frontend/src/api/pedidos.js` envia `POST /api/pedidos`; o proxy de `frontend/vite.config.js` remove `/api` e encaminha para o backend.
- O contrato do `README.md` documenta `POST /pedidos`, `GET /pedidos` e `GET /pedidos/{id}`, mas nenhum desses endpoints de pedidos está implementado.
- `backend/app/domain.py` já possui as quatro regras isoladas: desconto, frete, limite de itens e imposto.
- `docker-compose.yml` sobe os dois serviços, mas não declara `healthcheck` e usa apenas `depends_on` simples.
- O diretório `e2e/`, uma configuração Playwright, `e2e.yml` e `docs/como-reproduzir.md` não existem.
- Os testes atuais do frontend já fornecem seletores acessíveis e `data-testid` adequados para o teste E2E.
- A linha de base não foi executada integralmente no ambiente local: Python não está instalado/disponível e `frontend/node_modules` não existe. `git diff --check` passou; Node 24, npm 11 e Docker 29 estão disponíveis.

## Ordem de execução

### 1. Completar o contrato HTTP que desbloqueia a Issue #15

Arquivos:

- `[NEW] backend/app/schemas.py`
- `[MODIFY] backend/app/main.py`
- `[NEW] backend/tests/test_api.py`
- `[MODIFY] backend/requirements-dev.txt`

Implementação:

1. Criar modelos Pydantic para entrada e saída do pedido, com validação de cliente/item obrigatórios, preço positivo e quantidade entre 1 e 10.
2. Implementar `POST /pedidos`, usando as funções de `backend/app/domain.py` e a fórmula documentada `subtotal - desconto + frete + imposto`.
3. Usar armazenamento em memória com IDs incrementais para que o fluxo da aplicação e o E2E sejam determinísticos no ciclo de vida do contêiner.
4. Implementar também `GET /pedidos` e `GET /pedidos/{id}`, pois esses endpoints já fazem parte do contrato público do README; assim a documentação não continuará prometendo rotas inexistentes.
5. Preservar `GET /health` como sinal de disponibilidade do serviço.
6. Adicionar testes de integração com `TestClient` cobrindo criação, cálculo do total, listagem, busca por ID, `404` e validações `422`. Adicionar a dependência de teste HTTP necessária, caso ainda não esteja transitivamente disponível.

Critério de saída: o backend responde ao payload usado pelos testes do frontend e retorna, para preço `250` e quantidade `2`, subtotal `500`, desconto `100`, frete `0`, imposto `25` e total `425`.

### 2. Tornar o Compose observável e reproduzível — Issue #15

Arquivos:

- `[MODIFY] docker-compose.yml`
- `[MODIFY] frontend/Dockerfile`
- `[MODIFY] .gitignore`

Implementação:

1. Adicionar `healthcheck` ao backend consultando `http://localhost:8000/health` dentro do contêiner.
2. Fazer o frontend depender do backend saudável usando a condição de dependência do Compose; adicionar verificação de disponibilidade do frontend se isso for necessário para o workflow aguardar o stack completo.
3. Manter o proxy interno apontando para `http://backend:8000` e as portas públicas `8000` e `5173`.
4. Trocar `npm install` por `npm ci` no Dockerfile do frontend para respeitar o lockfile e tornar a reprodução mais determinística.
5. Ignorar relatório e resultados temporários do Playwright, sem ignorar os testes ou a configuração versionados.

Critério de saída: `docker compose up --build -d` sobe o backend e o frontend do zero; o healthcheck fica saudável; a página abre em `http://localhost:5173`; o envio do formulário chega à API.

### 3. Criar o teste E2E — Issue #15

Arquivos:

- `[NEW] e2e/package.json`
- `[NEW] e2e/package-lock.json`
- `[NEW] e2e/playwright.config.js`
- `[NEW] e2e/tests/pedido.spec.js`

Implementação:

1. Criar um pacote isolado para `@playwright/test`, sem misturar as dependências E2E com as dependências do frontend.
2. Configurar `baseURL` para `http://127.0.0.1:5173` e relatório HTML; o Compose será iniciado separadamente pelos comandos locais e pelo GitHub Actions.
3. Automatizar o fluxo feliz: abrir a página, preencher Cliente, Item, Preço unitário e Quantidade, submeter e aguardar `Pedido calculado`.
4. Validar os valores formatados do resumo (`500,00`, `100,00`, `0,00`, `25,00`, `425,00`) e a ausência do estado vazio após a resposta.
5. Usar labels/roles e os `data-testid` já presentes no frontend, evitando seletores dependentes de CSS visual.

Critério de saída: o teste passa contra o stack real, sem mocks de `fetch` e sem chamadas diretas ao backend que pulem a interface.

### 4. Automatizar o E2E no GitHub Actions — Issue #16

Arquivo:

- `[NEW] .github/workflows/e2e.yml`

Implementação:

1. Disparar em `push` para `develop`/`main`, em pull requests para essas branches e por `workflow_dispatch`.
2. Filtrar mudanças relevantes em `backend/**`, `frontend/**`, `e2e/**`, `docker-compose.yml`, Dockerfiles e no próprio workflow; em pull requests, manter um check conclusivo mesmo quando a etapa pesada for pulada.
3. Fazer checkout, configurar Node, executar `npm ci` em `e2e` e instalar o Chromium com as dependências do Playwright.
4. Subir `docker compose up --build -d`, aguardar explicitamente o healthcheck do backend e a resposta HTTP do frontend antes de iniciar o teste.
5. Executar o teste Playwright e publicar `e2e/playwright-report` e `e2e/test-results` com `if: always()`.
6. Coletar logs do Compose em caso de falha e executar `docker compose down` no encerramento, também com `if: always()`.
7. Usar permissões mínimas de leitura, seguindo o padrão dos workflows atuais.

Critério de saída: uma execução real do Actions fica verde e disponibiliza o relatório como artifact; em caso de falha, o artifact contém evidências suficientes para diagnóstico.

### 5. Documentar a reprodução — Issue #10

Arquivos:

- `[NEW] docs/como-reproduzir.md`
- `[MODIFY] README.md`

Conteúdo obrigatório:

1. Pré-requisitos e versões mínimas: Git, Docker Desktop/Compose v2, Node/npm, Python e navegador/dependências do Playwright para execução fora do Docker.
2. Clonagem, checkout da `develop` e inicialização completa com `docker compose up --build`.
3. URLs e verificações rápidas: frontend em `5173` e backend em `/health` na porta `8000`.
4. Execução isolada do backend: ambiente virtual, instalação de `requirements-dev.txt` e `python -m pytest` com cobertura quando aplicável.
5. Execução isolada do frontend: `npm ci`, lint, Vitest e build.
6. Execução do E2E: instalar dependências do diretório `e2e`, instalar navegador, iniciar o Compose, executar Playwright, abrir o relatório e desligar os serviços.
7. Limpeza, troubleshooting de portas/containers e explicação de que o backend usa armazenamento em memória.

Atualizar o README para apontar para o novo documento, retirar a indicação de que E2E e documentação estão apenas planejados e registrar os comandos efetivamente suportados após a implementação.

Critério de saída: uma pessoa externa consegue clonar o repositório, seguir o documento e reproduzir backend, frontend, testes unitários e E2E sem conhecimento prévio do projeto.

## Verificação final

Executar, nesta ordem:

1. `backend`: lint, testes unitários e testes de API com cobertura.
2. `frontend`: `npm ci`, lint, Vitest e build.
3. `docker compose config` para validar a configuração declarativa.
4. `docker compose up --build -d`, verificação de `/health` e verificação do frontend.
5. `e2e`: `npm ci`, instalação do Chromium e execução do Playwright contra o Compose real.
6. `docker compose logs` em qualquer falha e `docker compose down` ao final.
7. Abrir um PR para `develop`, confirmar o check real exibido pelo Actions e, depois da primeira execução verde, atualizar o ruleset da `main` para exigir o nome exato do job E2E descrito em `docs/branch-protection.md`.

## Riscos e decisões

- A API de pedidos é o bloqueio técnico principal: sem ela o frontend existente sempre recebe `404` e o E2E não pode validar o fluxo completo.
- O armazenamento em memória é suficiente para o escopo da Issue #15 e evita introduzir banco de dados, migrações ou novos serviços fora do objetivo.
- O workflow deve aguardar o serviço, não apenas iniciar containers; `depends_on` sozinho não garante prontidão da aplicação.
- O relatório do Playwright deve ser publicado mesmo em falhas, pois faz parte do diagnóstico do CI.
- A alteração do ruleset da `main` é uma ação remota posterior à criação do workflow; o nome do check não deve ser presumido antes da primeira execução no GitHub Actions.

