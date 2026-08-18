# Passo a Passo da Pipeline

Este documento explica **como o trabalho se encaixa como um todo**: a ordem em que as peças da pipeline nascem, o que cada task resolve dentro do desenho geral de CI/CD, qual é o papel dela (o conceito que ela demonstra) e o que ela efetivamente entrega.

Ele é complementar a dois outros documentos:
- [`divisao-tarefas.md`](divisao-tarefas.md) — **quem** faz o quê, critérios de aceite e dependências (o backlog).
- [`README.md`](../README.md) — visão geral do projeto, stack e como rodar.

Aqui o foco é diferente: **por que cada task existe** e **como uma alimenta a próxima**, na ordem em que a pipeline é construída — não na ordem em que aparecem no backlog.

---

## Visão geral do encadeamento

```
Fase 0 (fundação)
   │
   ├── CI Backend (D2) ──────────┐
   ├── CI Frontend (C2) ─────────┤
   ├── Segurança (M1)            │
   ├── Cache/Tags (H1)           │
   │                             │
   ├── Quality Gate + demo (C1) ─┤ (depende do CI backend)
   ├── Testes integração (H2)    │
   ├── Frontend: formulário (A1)─┼── Testes frontend (A2)
   │                             │
   └── Docker Compose + E2E (J1)─┴── CI E2E (J2)
                                        │
                              CD Delivery — staging (L1)
                                        │
                              CD Deployment — produção (L2)

Documentação de fechamento (README, como-reproduzir, evidências,
referências, roteiro) acompanha o processo inteiro e fecha no final.
```

A regra geral: **tudo nasce da Fase 0**. A partir daí, CI (backend/frontend), segurança e eficiência podem andar em paralelo. Quality gate, testes de integração e o frontend também não dependem uns dos outros. E2E só faz sentido depois que backend e frontend existem. CD só faz sentido depois que existe algo validado (CI + E2E verdes) pra entregar.

---

## Fase 0 — Fundação
**Issue:** [`#1`](../../../issues/1) · **Responsável:** Malaquias · **Estado:** ✅ concluída

- **O que é:** o "walking skeleton" — a versão mínima do sistema rodando ponta a ponta (backend, frontend, Docker, hooks locais) antes de qualquer regra de negócio existir.
- **Por que existe:** uma pipeline de CI/CD não tem o que validar sem algo rodando. A prática usual é montar o esqueleto e a automação **primeiro**, pra que cada funcionalidade nova já nasça protegida por testes e CI — em vez de escrever tudo e só depois pensar em pipeline.
- **Conteúdo entregue:** endpoint `/health` no backend (FastAPI), projeto Vite/React rodando no frontend, Dockerfiles básicos, hooks de pre-commit/lint, e as 4 regras de negócio (desconto, limite de itens, frete, imposto) geradas com apoio de IA e revisadas, isoladas como funções testáveis.

---

## CI Backend
**Issue:** [`#3`](../../../issues/3) · **Responsável:** David · **Estado:** ✅ concluída

- **O que é:** o workflow `ci-backend.yml`, que valida automaticamente o código Python a cada mudança.
- **Por que existe:** é o "C" de CI (Continuous **Integration**) na prática — garantir que toda mudança no backend é testada e revisada antes de entrar no código principal, sem depender de alguém lembrar de rodar os testes manualmente.
- **Conteúdo entregue:** lint (Ruff), testes unitários das regras de desconto e limite de itens (cobrindo os limites exatos, ex: `>= 200` vs `> 200`), quality gate de cobertura mínima, disparado só quando a pasta `backend/` muda.

## CI Frontend + Branch Protection
**Issue:** [`#7`](../../../issues/7) · **Responsável:** Carlos · **Estado:** ✅ concluída

- **O que é:** o workflow `ci-frontend.yml` (lint, testes, build) + a configuração de branch protection na `main`.
- **Por que existe:** replica pro frontend a mesma garantia que o CI backend dá — e a branch protection é o mecanismo que efetivamente **impede** um PR quebrado de ser mergeado, transformando "o CI roda" em "o CI barra".
- **Conteúdo entregue:** workflow de frontend verde; regra de proteção da `main` exigindo os checks de CI (backend, frontend, e2e) passando antes do merge.

## Segurança de Dependências e Imagem
**Issue:** [`#2`](../../../issues/2) · **Responsável:** Malaquias · **Estado:** ✅ concluída

- **O que é:** auditoria de dependências Python (`pip-audit`) e scan de vulnerabilidades da imagem Docker (Trivy).
- **Por que existe:** uma pipeline de CI/CD madura não valida só "o código funciona" — valida também que ele não está introduzindo vulnerabilidades conhecidas. É o conteúdo de **DevSecOps/Gerência de Configuração** do trabalho.
- **Conteúdo entregue:** steps no CI backend que rodam a auditoria e o scan e publicam relatório (JSON) como artifact, sem bloquear o build no MVP.

## Cache de Build e Convenção de Tags
**Issue:** [`#4`](../../../issues/4) · **Responsável:** Henrique · **Estado:** 🟡 em revisão (PR aberto)

- **O que é:** cache de dependências (pip/npm) e de camadas Docker no CI, mais a convenção de nomenclatura das tags de imagem (sha de commit, semver, `stable`).
- **Por que existe:** eficiência de pipeline importa — builds mais rápidos economizam tempo de todo o time. E a convenção de tags é o contrato que o CD (Levi) precisa **antes** de implementar o deploy, senão não sabe qual imagem publicar.
- **Conteúdo entregue:** cache configurado (`cache-from`/`cache-to`) e `docs/convencao-tags-imagens.md` documentando as tags.

## Quality Gate + Demonstração de Bug
**Issue:** [`#6`](../../../issues/6) · **Responsável:** Carlos · **Estado:** ✅ concluída

- **O que é:** o limite mínimo de cobertura configurado no CI backend + uma branch com um bug proposital numa das regras de negócio, preparada só pra demonstração.
- **Por que existe:** é a **prova viva** de que a pipeline funciona — não basta o CI existir, o grupo precisa mostrar ao vivo o CI **reprovando** um PR quebrado. É o momento mais importante da apresentação.
- **Conteúdo entregue:** quality gate testado e funcional; PR de demonstração (`demo/bug-limite-desconto`) com o bug proposital, mantido aberto de propósito — nunca deve ser mergeado.

## Testes de Integração da API
**Issue:** [`#5`](../../../issues/5) · **Responsável:** Henrique · **Estado:** ⚪ não iniciada

- **O que é:** testes via `TestClient` cobrindo os endpoints da API (criação, listagem, busca, erros de validação) + testes unitários das regras de frete e imposto.
- **Por que existe:** testes unitários (David) validam as regras isoladas; isso aqui valida a **API como um todo**, incluindo o comportamento de erro — camada intermediária entre unitário e E2E.
- **Conteúdo entregue:** suíte de testes de integração cobrindo sucesso e erro por endpoint, e os limites exatos das 2 regras restantes.

## Frontend: Formulário de Pedido
**Issue:** [`#8`](../../../issues/8) · **Responsável:** Angelo · **Estado:** ⚪ não iniciada

- **O que é:** a interface que consome a API — formulário de pedido e exibição do resumo calculado.
- **Por que existe:** é a peça que falta pra pipeline validar o sistema **como o usuário usa**, não só a API isolada. Também é pré-requisito direto pro E2E (Jetro), que precisa de uma tela pra testar.
- **Conteúdo entregue:** formulário (cliente, item, preço, quantidade) com labels/testids acessíveis, exibindo subtotal/desconto/frete/imposto/total, tratando erro de validação da API.

## Testes de Frontend
**Issue:** [`#14`](../../../issues/14) · **Responsável:** Angelo · **Estado:** ⚪ não iniciada

- **O que é:** testes unitários/componente (Vitest) do formulário e do resumo.
- **Por que existe:** mesma lógica do backend — validar a UI isoladamente, sem precisar do sistema inteiro rodando, cobrindo estado vazio e estado de erro.
- **Conteúdo entregue:** testes cobrindo renderização correta e tratamento de erro.

## Docker Compose + Testes E2E
**Issue:** [`#15`](../../../issues/15) · **Responsável:** Jetro · **Estado:** ⚪ não iniciada

- **O que é:** o `docker-compose.yml` subindo backend e frontend juntos, e o teste E2E (Playwright) do fluxo completo.
- **Por que existe:** é a validação de **ponta a ponta**, do ponto de vista do usuário real — a última camada de teste antes de confiar que o sistema pode ser entregue.
- **Conteúdo entregue:** compose funcional com healthcheck; teste E2E cobrindo "preencher pedido → ver total calculado na tela".

## CI para os Testes E2E
**Issue:** [`#16`](../../../issues/16) · **Responsável:** Jetro · **Estado:** ⚪ não iniciada

- **O que é:** o workflow `e2e.yml`, que automatiza o que foi feito manualmente em `#15` dentro da pipeline.
- **Por que existe:** um teste E2E que só roda localmente não protege ninguém — precisa rodar no CI pra virar parte do gate de qualidade que bloqueia PRs quebrados.
- **Conteúdo entregue:** workflow que sobe o compose, espera o healthcheck, roda os testes Playwright e publica o relatório como artifact.

## CD (Delivery): Versionamento + Deploy em Staging
**Issue:** [`#17`](../../../issues/17) · **Responsável:** Levi · **Estado:** ⚪ não iniciada

- **O que é:** o workflow `release.yml` (versionamento semântico automático + tag/release) e o `cd-staging.yml` (build, push das imagens e deploy automático no ambiente de staging).
- **Por que existe:** é o "CD" de **Continuous Delivery** — depois que CI e E2E aprovam, o sistema deve estar sempre pronto pra ser entregue automaticamente a um ambiente de homologação, sem intervenção manual.
- **Conteúdo entregue:** tag nova dispara build + push + deploy automaticamente; healthcheck confirma que o deploy funcionou.
- **Depende de:** `#3`, `#7` e `#16` (CI backend, CI frontend e CI E2E) passando — só faz sentido entregar algo já validado.

## CD (Deployment): Produção com Aprovação e Rollback
**Issue:** [`#18`](../../../issues/18) · **Responsável:** Levi · **Estado:** ⚪ não iniciada

- **O que é:** o workflow `cd-production.yml`, disparado manualmente, com aprovação obrigatória via GitHub Environments, healthcheck pós-deploy e rollback automático.
- **Por que existe:** é o "CD" de **Continuous Deployment**, com a diferença central em relação ao Delivery: aqui existe um **gate humano** — produção não é implantada sozinha, alguém precisa aprovar. E se o healthcheck falhar, o sistema volta sozinho pra última versão estável.
- **Conteúdo entregue:** deploy de produção bloqueado até aprovação; rollback automático testado com um deploy proposital quebrado.

---

## Documentação de fechamento

Essas tasks não competem com as técnicas em volume de esforço, mas são exigidas pelo enunciado e fecham o trabalho.

| Task | Issue | Responsável(is) | Papel |
|---|---|---|---|
| `README.md` | [`#9`](../../../issues/9) | David | Porta de entrada do repositório — objetivos, estrutura, como navegar |
| `docs/como-reproduzir.md` | [`#10`](../../../issues/10) | Jetro | Passo a passo pra alguém de fora rodar o projeto do zero, usando o Compose de `#15` |
| `docs/evidencias.md` | [`#11`](../../../issues/11) | Todos (coordenam Levi + Malaquias) | Prova de que cada parte da pipeline funciona de verdade — inclui os cenários de falha/correção do quality gate e do rollback |
| `docs/referencias.md` | [`#12`](../../../issues/12) | Todos (coordena Malaquias) | Bibliografia oficial das ferramentas usadas em cada task |
| Roteiro da apresentação | [`#13`](../../../issues/13) | Todos (coordena David) | Estrutura da fala: objetivos → arquitetura → demonstração ao vivo → desafios → resultados |

---

## Estado atual (resumo)

- ✅ **Concluídas:** Fase 0, CI Backend, CI Frontend + branch protection, Segurança, Quality Gate + demo
- 🟡 **Em andamento:** Cache/Tags (PR em revisão), README (atualizado incrementalmente)
- ⚪ **Não iniciadas:** Testes de integração, Frontend (formulário e testes), Docker Compose + E2E, CI E2E, CD Delivery, CD Deployment, como-reproduzir, evidências, referências, roteiro

O acompanhamento em tempo real fica no [Project do GitHub](https://github.com/users/lfariazzz/projects/3) — este documento descreve o desenho e o raciocínio por trás da ordem, não substitui o board como fonte do status atual.
