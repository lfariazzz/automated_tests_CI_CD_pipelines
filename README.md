# Testes Automatizados em Pipelines CI/CD

Trabalho prático da disciplina de Gerência de Configuração da Universidade Federal do Cariri (UFCA), com foco em **Integração, Entrega e Implantação Contínuas (CI/CD)**.

O sistema de exemplo é uma aplicação full-stack de cálculo de pedidos. Ele existe para demonstrar, de forma reproduzível, testes automatizados, quality gates, segurança, versionamento, empacotamento, deploy e rollback em uma pipeline completa.

## Estado atual

O projeto já possui um walking skeleton funcional na branch `develop`:

- API FastAPI com endpoint `GET /health`;
- frontend React com Vite;
- regras de negócio isoladas para desconto, frete, limite de itens e imposto;
- Dockerfiles para backend e frontend;
- Docker Compose para subir os dois serviços.

> A configuração dos hooks locais de pre-commit ainda está em correção para concluir integralmente a Fase 0.

O andamento das entregas é acompanhado nas [issues](https://github.com/lfariazzz/automated_tests_CI_CD_pipelines/issues) e no [Project do GitHub](https://github.com/users/lfariazzz/projects/3).

## Aplicação de exemplo

O domínio escolhido é um carrinho de compras com cálculo de checkout. As regras que orientam os testes são:

- desconto de 10% para subtotal a partir de R$ 200 e de 20% a partir de R$ 500;
- frete grátis para subtotal a partir de R$ 300; abaixo disso, taxa fixa de R$ 15;
- quantidade permitida de 1 a 10 unidades por produto;
- imposto de 5% calculado sobre o subtotal antes do desconto.

Os valores de fronteira são intencionalmente importantes: a demonstração do projeto inclui a introdução de um erro em um limite para comprovar que o CI reprova o pull request.

## Tecnologias

- **Backend:** Python 3.11, FastAPI, Uvicorn e pytest
- **Frontend:** React 19, Vite e Oxlint
- **Contêineres:** Docker e Docker Compose
- **CI/CD planejado:** GitHub Actions, GHCR, Playwright, auditoria de dependências e Trivy

## Estrutura do repositório

```text
.
├── backend/
│   ├── app/
│   │   ├── domain.py          # regras de negócio isoladas
│   │   └── main.py            # aplicação FastAPI e /health
│   ├── tests/                 # testes do backend
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                   # aplicação React
│   ├── Dockerfile
│   └── package.json
├── docs/
│   └── divisao-tarefas.md     # backlog, responsáveis e dependências
├── .pre-commit-config.yaml    # hooks locais (correção em andamento)
└── docker-compose.yml
```

Os diretórios `e2e/`, `.github/workflows/` e os demais documentos em `docs/` serão adicionados nas fases correspondentes do backlog.

## Como executar

### Com Docker Compose

Pré-requisito: Docker com o plugin Docker Compose.

```bash
git clone https://github.com/lfariazzz/automated_tests_CI_CD_pipelines.git
cd automated_tests_CI_CD_pipelines
git switch develop
docker compose up --build
```

Depois que os serviços iniciarem:

- frontend: <http://localhost:5173>
- healthcheck do backend: <http://localhost:8000/health>
- documentação interativa da API: <http://localhost:8000/docs>

Para encerrar os serviços, pressione `Ctrl+C` e execute:

```bash
docker compose down
```

### Backend local

```bash
cd backend
python -m venv .venv
```

Ative o ambiente virtual e instale as dependências:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Execute os testes com:

```bash
pytest
```

### Frontend local

```bash
cd frontend
npm install
npm run dev
```

Comandos adicionais:

```bash
npm run lint
npm run build
```

## Documentação

- [Divisão de tarefas](docs/divisao-tarefas.md)
- `docs/como-reproduzir.md` — guia completo de reprodução, a ser consolidado
- `docs/evidencias.md` — evidências da pipeline, a serem reunidas
- `docs/referencias.md` — referências oficiais das ferramentas, a serem reunidas

## Estratégia de branches

- `main`: versão estável e protegida;
- `develop`: integração das entregas em andamento;
- branches de feature/fix: trabalho isolado submetido por pull request para `develop`.

## Equipe

Levi, David, Henrique, Carlos, Angelo, Jetro e Malaquias.

A distribuição detalhada de responsabilidades e os critérios de aceite estão em [`docs/divisao-tarefas.md`](docs/divisao-tarefas.md).
