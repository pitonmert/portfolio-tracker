# PortfolioTracker

PortfolioTracker is a web-based portfolio tracking application for managing assets, transactions, cash balance, market prices, and portfolio performance.

The project is built as a small modular monolith: a React frontend talks to an ASP.NET Core API, the API stores data in PostgreSQL, and market data is fetched through a small FastAPI service.

> This project is a personal and educational portfolio tool. It is not a commercial product, multi-user SaaS, or financial advice. Market data depends on external providers and their own terms of use.

## Features

- Track buy and sell transactions by asset.
- Use catalog-backed assets or create custom assets from transaction input.
- Store cash balance and include it in portfolio totals.
- Fetch market prices through the market data service.
- Override prices manually when provider data is unavailable or unsuitable.
- Calculate portfolio positions and dashboard summary in the backend.
- Store calculated position snapshots in the `PortfolioPositions` read model for faster reads.
- Browse open and closed positions with filtering, sorting, search, and history modals.
- Run the frontend, API, and market-data service locally with hot reload.
- Run a production-like Docker stack for the API, frontend, and market-data service.

## Architecture

```text
React + Vite frontend
        |
        | /api
        v
ASP.NET Core API
        |
        +--> PostgreSQL
        |
        +--> FastAPI market-data-service
                    |
                    +--> borsapy provider
```

Important backend concepts:

- `Transactions` are the source of truth for portfolio activity.
- `Assets` are the canonical asset catalog, including custom assets.
- `MarketPrices` stores the latest provider or manual price for each asset.
- `PortfolioPositions` is a rebuildable read model generated from transactions and prices.
- Financial calculations live in the API, mainly under `Features/Portfolio`.

## Tech Stack

- Backend: ASP.NET Core, Entity Framework Core, PostgreSQL
- Frontend: React, Vite, TypeScript, TanStack Query, Tailwind CSS
- Market data: FastAPI, [borsapy](https://github.com/saidsurucu/borsapy/)
- Tests: xUnit integration tests, Vitest, React Testing Library, pytest
- Deployment: Docker Compose

## Project Structure

```text
PortfolioTracker.API/              ASP.NET Core API
PortfolioTracker.Frontend/         React frontend
market-data-service/               FastAPI market data bridge
tests/                             API integration tests
ROADMAP.md                         candidate product directions
docker-compose.yml                 production-like app stack
.env.docker.example                Docker environment template
```

## Prerequisites

- .NET SDK 10
- Node.js and npm
- Python 3.11+
- PostgreSQL
- Docker and Docker Compose, optional for production-like runs

## Local Development

Use this mode while actively developing the app. PostgreSQL runs externally, and
the market-data service, API, and frontend run directly on the host machine with
hot reload.

Default local ports:

```text
market-data-service  http://localhost:8001
API                  http://localhost:5220
Frontend             http://localhost:5174
```

### 1. Configure PostgreSQL

Create a PostgreSQL database yourself, then store the API connection string with user secrets:

```bash
cd PortfolioTracker.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=portfolio_tracker;Username=postgres;Password=your_password"
```

The development appsettings already points market data to `http://localhost:8001`. If you want to set it explicitly:

```bash
dotnet user-secrets set "MarketData:BaseUrl" "http://localhost:8001"
```

Optional admin read-model rebuild token:

```bash
dotnet user-secrets set "Admin:ReadModelRebuildToken" "your_local_admin_token"
```

### 2. Run market-data-service

```bash
cd market-data-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Health check:

```bash
curl http://localhost:8001/health
```

### 3. Run the API

```bash
cd PortfolioTracker.API
dotnet restore
dotnet ef database update
dotnet watch run
```

Swagger is available in development:

```text
http://localhost:5220/swagger/index.html
```

### 4. Run the frontend

```bash
cd PortfolioTracker.Frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5174
```

The Vite dev server proxies `/api` to `http://localhost:5220` by default. To override it, create `PortfolioTracker.Frontend/.env.local`:

```bash
VITE_DEV_PROXY_TARGET=http://localhost:5220
```

## Production-like Docker Run

Use this mode when you want to run the application like a deployed stack. Docker
Compose builds and runs the market-data service, API, and frontend containers.
PostgreSQL is still external; the compose file does not create a database
container.

Create a local `.env` from the template:

```bash
cp .env.docker.example .env
```

Edit `.env`:

```bash
ConnectionStrings__DefaultConnection=Host=host.docker.internal;Port=5432;Database=portfolio_tracker;Username=postgres;Password=your_password
```

Run the production-like stack:

```bash
docker compose up -d --build
```

Docker ports:

```text
market-data-service  http://localhost:8001
API                  http://localhost:5219
Frontend             http://localhost:5173
```

## Tests

API:

```bash
dotnet test --no-restore
```

Frontend:

```bash
cd PortfolioTracker.Frontend
npm run test
npm run build
```

Market data service:

```bash
cd market-data-service
pip install -r requirements.txt
python3 -m pytest
```

## Database and Read Models

The API uses EF Core migrations. In development, migrations can be applied manually:

```bash
cd PortfolioTracker.API
dotnet ef database update
```

`PortfolioPositions` is a read model. It is not the source of truth and can be rebuilt from `Transactions` and `MarketPrices`.

If `Admin:ReadModelRebuildToken` is configured, a rebuild can be queued with:

```bash
curl -X POST http://localhost:5220/api/admin/read-models/portfolio-positions/rebuild \
  -H "X-Admin-Token: your_local_admin_token"
```

## Documentation

- [Roadmap](ROADMAP.md)
- [Security](SECURITY.md)
- [Issues](https://github.com/pitonmert/portfolio-tracker/issues)
- [Market data service notes](market-data-service/README.md)

## Security

See [SECURITY.md](SECURITY.md) for supported security expectations, deployment warnings, secrets handling, and vulnerability reporting.

## License

This project is licensed under the [MIT License](LICENSE).
