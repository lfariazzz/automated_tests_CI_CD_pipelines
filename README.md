# Testes Automatizados em Pipelines CI/CD

## Contexto

Trabalho prático da disciplina de Gerência de Configuração (UFCA), modalidade **prática**, tema **Integração, Entrega e Implantação Contínuas (CI/CD)**.

O foco do trabalho **não é a aplicação em si**: o código do sistema de exemplo será gerado com apoio de IA e serve apenas como material para demonstrar a pipeline funcionando. O esforço real do grupo está em **desenhar, implementar e validar a pipeline** — testes em múltiplas camadas, quality gates, segurança, versionamento, empacotamento, deploy e rollback.

## Grupo

Levi, David, Henrique, Carlos, Angelo, Jetro e Malaquias (7 integrantes).

A divisão completa das tarefas — quem faz o quê, critérios de aceite e dependências — está em [`docs/divisao-tarefas.md`](docs/divisao-tarefas.md), e o andamento é acompanhado no [Project do GitHub](https://github.com/users/lfariazzz/projects/3).

## Estado atual

A branch `develop` já contém o walking skeleton do projeto: backend FastAPI com `/health`, frontend React/Vite, as quatro regras de negócio isoladas, Dockerfiles e Docker Compose. A configuração dos hooks de pre-commit ainda está em correção para concluir integralmente a Fase 0.

## Aplicação de exemplo

Sistema full-stack de **cálculo de pedidos** (carrinho → checkout), escolhido porque tem regras de negócio simples, determinísticas e fáceis de "quebrar de propósito" para demonstrar a automação pegando erros.

**Regras de negócio (o que gera os casos de teste):**
- Desconto progressivo por faixa de valor do subtotal (ex: ≥ R$200 → 10%, ≥ R$500 → 20%)
- Frete grátis acima de um valor mínimo de subtotal, senão taxa fixa
- Limite máximo de itens por produto no pedido
- Imposto calculado sobre o subtotal (antes do desconto)

Essas regras têm **casos de borda clássicos** (comparação `>` vs `>=` no limite exato, ordem de aplicação de desconto/imposto) — é justamente esse tipo de bug que o grupo vai injetar de propósito numa demonstração ao vivo para mostrar o CI reprovando o PR.

**Stack:**
- **Backend**: Python + FastAPI (API com as regras de negócio) + pytest (testes unitários e de integração)
- **Frontend**: React + Vite (formulário de pedido consumindo a API) + Vitest (testes unitários/componente)
- **E2E**: Playwright, rodando contra os dois serviços orquestrados via Docker Compose

## Estrutura do repositório (planejada)

```
repo/
├── backend/                    # API FastAPI + testes unitários/integração
├── frontend/                   # Interface React + testes unitários/componente
├── e2e/                        # Testes end-to-end (Playwright)
├── docker-compose.yml          # sobe backend+frontend juntos (dev/CI)
├── .github/workflows/          # pipelines de CI, E2E, release e CD
└── docs/
    ├── divisao-tarefas.md      # backlog: quem faz o quê, critérios de aceite, dependências
    ├── como-reproduzir.md      # pré-requisitos, instalação, como rodar tudo localmente
    ├── evidencias.md           # prints/vídeo da pipeline funcionando
    └── referencias.md          # bibliografia (documentação oficial das ferramentas)
```

## Como executar a versão atual

Com Docker e Docker Compose instalados:

```bash
git switch develop
docker compose up --build
```

O frontend fica disponível em <http://localhost:5173> e o healthcheck do backend em <http://localhost:8000/health>. Para encerrar e remover os contêineres, execute `docker compose down`.

## Desenho da pipeline

### CI (Continuous Integration)
- `ci-backend.yml` e `ci-frontend.yml` rodam **em paralelo**, disparados só quando a pasta correspondente muda (path filtering)
- Cada um faz: instalar dependências → lint → testes automatizados com cobertura → **quality gate** (build falha se cobertura ou lint não passarem)
- Auditoria de dependências (`pip-audit`) e **scan de vulnerabilidade da imagem Docker** (Trivy) rodam como parte do CI do backend
- `e2e.yml` sobe o stack completo via Docker Compose e roda os testes end-to-end
- **Branch protection** em `main`: só permite merge se CI backend, CI frontend e E2E estiverem verdes — é aqui que a demonstração de "bug quebra o pipeline, PR fica bloqueado até corrigir" acontece

### Eficiência da pipeline
- Cache de dependências (pip/npm) e de camadas Docker, pra acelerar os builds do CI
- Convenção de tags nas imagens (sha de commit, versão semântica, `stable`), usada tanto no CI quanto no CD

### Continuous Delivery
- `release.yml`: ao mergear em `main`, gera versão semântica automaticamente (baseado em convenção de commits) e cria tag/release
- `cd-staging.yml`: builda as imagens Docker (backend e frontend), publica no registry (GHCR) e faz deploy automático em ambiente de staging, com healthcheck pós-deploy

### Continuous Deployment
- `cd-production.yml`: disparado manualmente, com **aprovação obrigatória** (GitHub Environments) — mostra a fronteira entre Delivery (staging automático) e Deployment (produção com gate humano)
- Healthcheck pós-deploy; se falhar, **rollback automático** para a última versão marcada como estável

## Por que esse desenho

- Cobre os três conceitos centrais do tema (CI, Delivery, Deployment) de forma **separada e demonstrável**, não misturada
- Full-stack com jobs paralelos e path filtering mostra domínio de pipeline mais avançado que um pipeline linear simples
- Múltiplas camadas de teste (unitário, integração, E2E) atende diretamente ao critério de "qualidade técnica do experimento" da avaliação
- Segurança (auditoria de dependências e scan de imagem) e eficiência (cache, estratégia de tags) entraram como conteúdo genuíno de pipeline — substituindo tasks que inicialmente seriam "escrever a aplicação", fora do foco do trabalho
- Escopo foi calibrado para ser **executável por um grupo de 7 pessoas em um semestre** sem comprometer a qualidade
