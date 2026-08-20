# Como reproduzir o projeto

Este guia executa o Carrinho & Checkout localmente e valida as camadas de backend, frontend e E2E.

## Pré-requisitos

- Git;
- Docker Desktop com Docker Compose v2 (`docker compose version`);
- Python 3.11 ou superior para executar o backend fora do Docker;
- Node.js 20 ou superior e npm para executar frontend e E2E fora do Docker.

Para o Playwright, a instalação do Chromium pode exigir dependências adicionais no Linux. Nesse caso, use `npx playwright install --with-deps chromium`.

## Subir a aplicação completa

Clone o repositório e selecione a branch de integração:

```bash
git clone https://github.com/lfariazzz/automated_tests_CI_CD_pipelines.git
cd automated_tests_CI_CD_pipelines
git switch develop
docker compose up --build
```

O Docker Compose inicia o backend antes do frontend. Ambos possuem healthchecks, e o frontend só é iniciado quando o backend responde em `/health`.

Verifique os serviços em:

- frontend: <http://localhost:5173>;
- backend: <http://localhost:8000/health>.

Para iniciar em segundo plano, use `docker compose up --build --detach`. Para acompanhar os logs, execute `docker compose logs --follow`. Ao terminar, remova os contêineres com `docker compose down --volumes`.

## Backend isolado

No Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m ruff check .
python -m pytest --cov=app --cov-report=term-missing --cov-fail-under=75
```

Em macOS ou Linux, ative o ambiente com `source .venv/bin/activate` antes de instalar as dependências e executar os mesmos comandos Python.

## Frontend isolado

```bash
cd frontend
npm ci
npm run lint
npm test
npm run build
```

Para desenvolver contra um backend local, mantenha o backend na porta `8000` e execute `npm run dev`. O proxy do Vite encaminha `/api` para `http://localhost:8000`.

## Teste E2E

O E2E usa o stack Docker real; ele não usa mocks da API.

```bash
docker compose up --build --detach
cd e2e
npm ci
npx playwright install chromium
npm test
```

Abra o relatório HTML com:

```bash
npm run test:report
```

Depois do teste, retorne à raiz do repositório e execute `docker compose down --volumes`.

## Solução de problemas

- Se as portas `5173` ou `8000` estiverem ocupadas, encerre o processo que as utiliza ou altere o mapeamento em `docker-compose.yml`.
- Se um serviço não ficar saudável, consulte `docker compose ps` e `docker compose logs backend frontend`.
- Se o Playwright não encontrar o navegador, repita `npx playwright install chromium`; em Linux, use a variante com `--with-deps`.
- Os pedidos são mantidos somente em memória. Reiniciar o contêiner do backend ou executar `docker compose down --volumes` limpa os pedidos criados.
