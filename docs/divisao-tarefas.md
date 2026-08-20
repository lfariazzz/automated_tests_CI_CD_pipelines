# Divisão de Tarefas — Backlog do Grupo

Grupo: **Levi, David, Henrique, Carlos, Angelo, Jetro e Malaquias** (7 pessoas). Baseado no desenho descrito no [`README.md`](../README.md).

## Como este backlog está organizado

- **12 tasks de desenvolvimento**, além da Fase 0 — são o que conta como participação/esforço técnico de cada um. Foram divididas considerando dependências, afinidade e disponibilidade.
- **Tasks de apoio** (documentação e apresentação) — são necessárias, mas ficam fora do cálculo das tasks técnicas. Cada uma já tem responsáveis definidos nas issues.
- Cada task segue um template fixo (Contexto / Escopo / Critérios de aceite / Depende de / Domínio) — é assim que vocês vão poder transformar isso direto em Issues do GitHub.
- As **issues do GitHub são a fonte de verdade operacional**. Este documento resume a divisão e deve continuar alinhado a elas quando houver alguma mudança.
- As dependências estão descritas em cada task. Quando der, o trabalho pode começar em paralelo usando os contratos definidos no README; E2E, quality gate e CD entram naturalmente depois das bases que validam.

---

## Fase 0 — Pré-requisito

**Esqueleto mínimo + hooks locais**

- **Responsável**: Malaquias

- **Contexto**: antes de existir regra de negócio nenhuma, o grupo precisa de algo rodando pra pipeline validar desde o primeiro commit (é o padrão real de "walking skeleton": monta o esqueleto + automação cedo, depois cada funcionalidade nova já nasce protegida). Como o código da aplicação em si não é o foco do trabalho, as 4 regras de negócio também nascem aqui, geradas com apoio de IA.
- **Escopo**:
  - Backend: FastAPI com só um endpoint `/health`
  - Frontend: projeto Vite/React rodando, tela em branco ou "hello world"
  - Hooks locais de lint/format (pre-commit ou husky) configurados nos dois projetos
  - Dockerfiles básicos (backend e frontend), sem otimização ainda
  - Gerar com IA e revisar (legibilidade, nomes) as 4 regras de negócio (desconto, limite de itens, frete, imposto), conforme definidas no README
- **Critérios de aceite**: `docker compose up` sobe os dois serviços; `/health` responde 200; hook local bloqueia commit com erro de lint; as 4 regras existem como funções isoladas e testáveis (não misturadas com a camada HTTP)
- **Depende de**: nada
- **Domínio**: fundação (backend + frontend + tooling local)
- **Sugestão de execução**: pode ser feita em par, mas Malaquias é o responsável por consolidar e entregar a task

---

## Tasks de desenvolvimento

### Malaquias
**M1 — Segurança de dependências e da imagem Docker**
- **Contexto**: pipeline de CI/CD precisa validar não só que o código funciona, mas que não introduz vulnerabilidades conhecidas — conteúdo genuinamente de Gerência de Configuração/DevSecOps
- **Escopo**: adicionar step de auditoria de dependências (ex: `pip-audit`) ao workflow de backend; adicionar scan de vulnerabilidade da imagem Docker (ex: Trivy) rodando contra a imagem gerada pelo Dockerfile da Fase 0
- **Critérios de aceite**: pipeline roda a auditoria e o scan, gerando relatório visível (não precisa bloquear o build no MVP, mas o relatório precisa aparecer no log/artifact do CI)
- **Depende de**: Fase 0 (Dockerfile básico)
- **Domínio**: segurança → CI

---

### David
**D2 — CI: workflow `ci-backend.yml` + quality gate + testes das próprias regras (desconto/limite)**
- **Contexto**: pipeline de integração contínua do backend, incluindo a validação das 2 regras de desconto e limite de itens (geradas na Fase 0)
- **Escopo**: testes unitários dessas 2 regras (casos de borda nos limites exatos) + workflow que instala dependências, roda lint e os testes com cobertura, disparado só quando `backend/` muda; falha se cobertura ou lint não passarem
- **Critérios de aceite**: testes cobrem os limites exatos das 2 regras; workflow fica verde
- **Depende de**: Fase 0 (regras já geradas e revisadas)
- **Domínio**: backend (testes) → CI

---

### Henrique
**H1 — Cache de build e estratégia de tags no registry de imagens**
- **Contexto**: eficiência da pipeline e organização dos artefatos publicados — complementa diretamente o que o Levi consome no CD
- **Escopo**: configurar cache de dependências (pip/npm) e cache de camadas Docker no CI pra acelerar builds; definir e documentar a convenção de tags das imagens (ex: tag por sha de commit, tag semver, tag `stable`)
- **Critérios de aceite**: tempo de build visivelmente menor com cache (comparar antes/depois); convenção de tags documentada e alinhada com o Levi antes dele implementar `cd-staging.yml`
- **Depende de**: Fase 0 (Dockerfile básico)
- **Domínio**: pipeline (performance e artefatos)

**H2 — Testes de integração da API + testes das próprias regras (frete/imposto)**
- **Contexto**: validar a API como um todo, incluindo as 2 regras restantes (frete e imposto, geradas na Fase 0)
- **Escopo**: testes unitários dessas 2 regras (casos de borda) + testes via `TestClient` cobrindo criação de pedido, listagem, busca por id, e casos de erro de validação
- **Critérios de aceite**: cobre os limites exatos das 2 regras + pelo menos um caso de sucesso e um de erro por endpoint
- **Depende de**: Fase 0
- **Domínio**: backend (testes)

---

### Carlos
**C1 — Quality Gate + cenário de demonstração de bug**
- **Contexto**: essa é a task que vai gerar a demonstração ao vivo do CI reprovando um PR — o coração da apresentação
- **Escopo**: configurar o limite de cobertura mínima (quality gate) no workflow de backend em conjunto com o David; preparar, numa branch separada, um bug proposital numa das 4 regras (ex: trocar `>=` por `>` num limite) coordenando com David/Henrique sobre qual regra usar; documentar o roteiro da demonstração
- **Critérios de aceite**: quality gate configurado e testado (falha de propósito quando cobertura cai abaixo do limite); branch com o bug pronta, PR de fato bloqueado pelo CI
- **Depende de**: D2 (workflow de CI já existindo) e dos testes unitários de David/Henrique já escritos
- **Domínio**: qualidade → pipeline

**C2 — CI: workflow `ci-frontend.yml` + branch protection em `main`**
- **Contexto**: pipeline de integração contínua do frontend + a trava que impede merge de código quebrado
- **Escopo**: workflow que instala dependências, roda lint, testes e build do frontend; configurar branch protection em `main` exigindo os workflows de CI (backend, frontend, e2e) verdes
- **Critérios de aceite**: workflow verde contra o esqueleto da Fase 0; branch protection configurada e testada (um PR quebrado de propósito é de fato bloqueado)
- **Depende de**: Fase 0; branch protection final depende dos workflows de D2/J2 existirem, mas o workflow em si (`ci-frontend.yml`) não
- **Domínio**: frontend → CI

---

### Angelo
**A1 — Frontend: formulário de pedido + exibição do resumo**
- **Contexto**: interface que consome a API de pedidos
- **Escopo**: formulário simples (cliente, item, preço, quantidade) que chama a API e exibe o resumo calculado (subtotal, desconto, frete, imposto, total)
- **Critérios de aceite**: elementos do formulário com labels/testids acessíveis (necessário pros testes E2E de Jetro); trata erro de validação retornado pela API
- **Depende de**: Fase 0 (só precisa do contrato da API, documentado no README — não precisa esperar as demais tasks de CI prontas pra começar a UI)
- **Domínio**: frontend

**A2 — Testes unitários/componente do frontend**
- **Contexto**: garantir que a UI renderiza e se comporta corretamente de forma isolada
- **Escopo**: testes (Vitest) do formulário e do componente de resumo, incluindo estado vazio e estado com erro
- **Critérios de aceite**: cobre pelo menos um caso de renderização correta e um de erro tratado
- **Depende de**: A1 (mesma pessoa, dependência interna, não afeta o resto do grupo)
- **Domínio**: frontend → testes

---

### Jetro
**J1 — Docker Compose + testes E2E**
- **Contexto**: validar o sistema como um todo, do ponto de vista do usuário
- **Escopo**: `docker-compose.yml` subindo backend e frontend juntos com healthcheck; teste E2E (Playwright) do fluxo completo (preencher pedido → ver total calculado na tela)
- **Critérios de aceite**: `docker compose up` funciona do zero; teste E2E passa contra o fluxo feliz
- **Depende de**: precisa de A1 e das regras de negócio da Fase 0 rodando — é natural que essa task comece um pouco depois das outras, mas não trava ninguém, só começa a "fechar" o que já foi feito
- **Domínio**: integração (backend + frontend)

**J2 — CI: workflow `e2e.yml`**
- **Contexto**: automatizar o que foi feito em J1 dentro da pipeline
- **Escopo**: workflow que sobe o compose, aguarda healthcheck, roda os testes Playwright, sobe artifact do relatório
- **Critérios de aceite**: workflow verde no GitHub Actions, não só localmente
- **Depende de**: J1
- **Domínio**: integração → CI

---

### Levi
**L1 — CD (Delivery): versionamento + deploy em staging**
- **Contexto**: primeira metade da entrega contínua — o que acontece depois que o CI aprova
- **Escopo**: workflow `release.yml` (versionamento semântico automático a partir de convenção de commits, criação de tag/release) + workflow `cd-staging.yml` (build e push das imagens Docker pro GHCR, deploy automático em staging, healthcheck pós-deploy)
- **Critérios de aceite**: uma tag nova dispara build+push+deploy automaticamente; healthcheck confirma que o deploy funcionou
- **Depende de**: D2, C2 e J2 (workflows de CI) estarem passando — é a natureza do CD, só faz sentido depois que há algo validado pra entregar
- **Domínio**: CD (Delivery)

**L2 — CD (Deployment): produção com aprovação + rollback**
- **Contexto**: segunda metade — a fronteira entre Delivery (staging automático) e Deployment (produção controlada)
- **Escopo**: workflow `cd-production.yml` disparado manualmente, com aprovação obrigatória via GitHub Environments; healthcheck pós-deploy; rollback automático pra última versão estável se o healthcheck falhar; configuração dos secrets necessários (token de registry, credenciais)
- **Critérios de aceite**: deploy em produção só acontece com aprovação; um deploy proposital quebrado dispara o rollback automático
- **Depende de**: L1
- **Domínio**: CD (Deployment)

---

## Tasks de apoio (responsáveis definidos nas issues)

Continuam **não contando no cálculo das tasks técnicas**. Duas coisas diferentes são separadas aqui: **quem escreve o conteúdo** (pode ser mais de uma pessoa, ou todo mundo, quando o conteúdo depende do que cada um construiu) e **quem coordena/consolida** (garante que aconteça e organiza o resultado final).

1. **Ligação direta forte e única** — quando o conteúdo depende só do que uma pessoa construiu, fica só com ela (custo marginal baixo)
2. **Conteúdo distribuído entre todos** — quando o doc precisa de uma peça de cada task pra ficar completo (evidência, referência, ou fala da apresentação), o conteúdo é de todos; só a coordenação/organização final fica com 1-2 pessoas
3. **Vocação/preferência pessoal** — quando alguém se encaixa melhor num tipo de tarefa (ex: mais afinidade com escrita/organização), isso pesa mais que o balanceamento puro

| Solta | Quem escreve | Quem coordena | Por quê |
|---|---|---|---|
| `docs/pipeline/como-reproduzir.md` | **Jetro** | — | Único dono: o Compose (J1) é o caminho único de reprodução, cobre backend+frontend juntos — fragmentar entre vários donos não agrega |
| `README.md` | **David** | — | Único dono, por vocação: doc editorial/estrutural, múltiplos autores deixariam a voz inconsistente |
| `docs/evidencias.md` | **Todos** (cada um sobe a evidência da própria task) | **Levi + Malaquias** | Sem contribuição de todos, a maior parte da pipeline ficaria sem prova de funcionamento; os coordenadores organizam e conferem o material final |
| `docs/referencias.md` | **Todos** (cada um lista a documentação oficial das ferramentas que usou na própria task) | **Malaquias** | Cada pessoa conhece melhor as ferramentas que usou; Malaquias consolida tudo num único documento |
| Roteiro da apresentação | **Todos** (cada um traz a explicação da própria task) | **David** | O próprio enunciado exige participação equilibrada de todos na fala; David estrutura a narrativa geral (objetivos → arquitetura → demo → desafios → resultados) |

- [ ] `docs/pipeline/como-reproduzir.md` — **Jetro**: pré-requisitos, instalação, como rodar tudo localmente
- [ ] `README.md` — **David**: manter atualizado (objetivos, estrutura, como navegar)
- [ ] `docs/evidencias.md` — **Todos** (coordenam: Levi + Malaquias): cada um sobe print/log da própria task; inclui o cenário de falha/correção do C1 e o rollback do L2
- [ ] `docs/referencias.md` — **Todos** (coordena: Malaquias): cada um lista as referências das ferramentas que usou; Malaquias consolida
- [ ] Roteiro da apresentação — **Todos** (coordena: David): cada um prepara a fala da própria task; David amarra a narrativa geral

---

## Por que essa divisão

- **A aplicação de exemplo nasce na Fase 0, sob responsabilidade do Malaquias**: as 4 regras de negócio e os Dockerfiles são gerados com apoio de IA e revisados antes das demais tasks — isso mantém o restante do trabalho focado em CI/CD
- **Testes das regras de negócio, misturados entre David e Henrique**: em vez de uma pessoa só testar as 4 regras (volume desproporcional em relação às demais tasks), cada um testa as 2 regras que valida na própria task de CI/integração — mantém o tamanho das tasks parecido e ainda assim cobre 100% das regras
- **Carlos livre pra focar em Quality Gate + o cenário de demonstração do bug**: com o teste das regras redistribuído, a task do Carlos deixou de ser a maior em volume do grupo e virou uma task de configuração/coordenação de pipeline, coerente com o resto
- **Responsabilidades alinhadas às issues**: Malaquias cuida da Fase 0 e da segurança; David fica com o CI e os testes do backend, além da coordenação editorial já atribuída a ele
- **Domínios não espelhados**: quase ninguém fica preso a um único tipo de atividade — quem mexe em CI também testa, quem faz frontend também testa frontend, etc. A exceção é o Levi, que por pouco tempo disponível pediu pra ficar num domínio só (CD) — mas mesmo assim com 2 tasks do mesmo peso das dos outros, não uma versão "menor"
- **Dependências visíveis**: E2E, quality gate e CD começam um passo depois das bases correspondentes; deixar isso explícito ajuda o grupo a organizar a ordem sem criar surpresa no fim
- **Tasks de documentação separadas do cálculo de esforço**: existem porque o enunciado exige, mas não competem com as tasks técnicas na hora de avaliar quem fez o quê
