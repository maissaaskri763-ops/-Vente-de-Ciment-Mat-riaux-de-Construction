# Cimenterie Executive

A sales intelligence dashboard for a cement and construction-materials business. The app combines KPI monitoring, geographic analysis, customer risk review, AI-style forecasting, and transaction exploration into a single dashboard.

## Project summary

This project is built for management and business teams who need a clear view of:

- total revenue and delivery volume
- product mix and pricing
- regional sales performance
- customer credit exposure and risk
- future sales forecasting with scenario simulation
- raw transaction exploration and Excel import

## Tech stack

- Frontend: React + Vite + Tailwind-inspired CSS
- Backend: Express.js + Node.js
- Data layer: local JSON datasets and Excel upload parsing
- Charts: Recharts
- Icons: Lucide React
- Extra: canvas-confetti for presentation animations

## Folder structure

```text
vent-app/
├── README.md
├── package.json
├── start-local.cmd
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── data/
│   ├── uploads/
│   └── scripts/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── processed_data/
└── launch-readiness.md
```

## How the app works

### Frontend

The frontend is the dashboard layer. It loads KPIs and analytics from the backend and renders the business intelligence views.

Main screens:

- Executive overview
- Geographic analytics
- Product catalog
- Customer risk and CRM
- AI forecast simulator
- Transaction explorer
- Excel uploader modal
- B2B platform panel

### Backend

The backend is an Express API that exposes endpoints such as:

- /api/kpis
- /api/monthly
- /api/products
- /api/governorates
- /api/customers
- /api/transactions
- /api/forecast
- /api/upload

The server loads local JSON files into memory on startup and serves them to the dashboard. The upload API reads Excel .xlsx files and converts them into summary metrics.

## Launch instructions

### Run with Docker (recommended for sharing)

Install and start Docker Desktop, then open a terminal in the project folder and run:

```powershell
docker compose up --build
```

Open http://127.0.0.1:3000 and sign in with one of the local accounts below. Keep the terminal and Docker Desktop open while using the app. To stop the containers, press `Ctrl+C`, then run `docker compose down`.

To send the project to another computer, you can send `vent-app-docker.zip` or copy the whole project folder. Keep `backend/data`, `frontend`, and the Docker files together. The other computer needs Docker Desktop; it does not need Node.js. On first launch, Docker downloads the base images and app dependencies, so an internet connection is needed. Ports 3000 and 5000 must be available.

On Windows, you can also double-click `start-docker.cmd` to start the app and `stop-docker.cmd` to stop it.

### Run directly with Node.js

From the project root in Windows PowerShell, install each package and start the app:

```bash
npm.cmd install
npm.cmd --prefix backend install
npm.cmd --prefix frontend install
npm.cmd run dev
```

Use `npm.cmd` in PowerShell because Windows may block the `npm.ps1` wrapper. You can also double-click `start-local.cmd` from File Explorer to launch the app.

Then open:

- Frontend: http://127.0.0.1:3000
- Backend: http://localhost:5000

### Authentication

The dashboard requires a signed session token. For local development, three seeded accounts are available:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `Admin123!` | Full access |
| `manager` | `Manager123!` | Analytics and Excel upload |
| `analyst` | `Analyst123!` | Read-only analytics |

Set `JWT_SECRET` in `backend/.env` before sharing or deploying the application. The seeded accounts are intended for the local MVP and should be replaced by managed user accounts in production.

## Notes on data and logic

- The dashboard uses preloaded local data from the backend folder.
- Forecast values are generated from historical patterns and scenario inputs.
- The upload flow supports Excel spreadsheets and returns summary metrics after processing.
- The app includes a fallback strategy for missing data and port conflicts during startup.

## Common project issues and fixes

1. Port conflicts
   - If port 3000 or 5000 is already in use, stop the stale process and restart the app.
   - The project launch script has been hardened to detect this and fail clearly.

2. Windows startup behavior
   - The original launcher script had quoting issues in PowerShell.
   - The project now uses a more reliable root-level command flow.

3. Missing safe guards
   - Several components were assuming keys always existed in the data.
   - Defensive checks were added to keep the dashboard stable when values are missing.

## Main use cases

- Executive reporting for monthly performance
- Commercial analysis by governorate and product
- Customer credit review and controls
- Forecasting and scenario testing
- Detailed transaction inspection and CSV export

## Good next improvements

- Add authentication for admin-only views
- Move dataset storage to a real database instead of local JSON files
- Add API validation and Swagger docs
- Add unit/integration tests for the dashboard and API
- Improve forecast model accuracy with regression-based scoring

## Project intent

This project is best understood as a practical business dashboard prototype: it is designed to look like a strong strategic reporting system while remaining easy to run and explain.
