# PetroMallis — Dealer Module

Controlled B2B commercial space matchmaking platform for petrol station dealers.

## Tech Stack

| Layer        | Technology              |
| ------------ | ----------------------- |
| Architecture | Modular Monolith        |
| Backend      | FastAPI (Python 3.12+)  |
| Frontend     | React + Material UI     |
| Database     | PostgreSQL 16           |
| Auth         | JWT (Phase 3)           |
| ORM          | SQLAlchemy + Alembic    |
| Deployment   | Linux VM, Nginx, Uvicorn|

## Project Structure

```
PetroMall/
├── backend/                 # FastAPI modular monolith
│   ├── app/
│   │   ├── api/             # REST route handlers
│   │   ├── core/            # Config, security, constants
│   │   ├── db/              # Database session & base
│   │   ├── middleware/      # CORS, logging, etc.
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── repositories/    # Data access layer
│   │   ├── schemas/         # Pydantic request/response DTOs
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helpers (storage, validators)
│   ├── alembic/             # Database migrations (Phase 2)
│   ├── uploads/             # Local file storage
│   └── requirements.txt
├── frontend/                # React SPA
│   └── src/
│       ├── pages/           # Route-level views
│       ├── components/      # Reusable UI
│       ├── layouts/         # App shell (sidebar, navbar)
│       ├── services/        # Axios API clients
│       ├── routes/          # React Router config
│       ├── contexts/        # Auth & global state
│       ├── hooks/           # Custom React hooks
│       └── utils/           # Formatters, constants
├── docker-compose.yml       # PostgreSQL container
└── .env.example             # Environment template
```

## Phase 1 — Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker Desktop (for PostgreSQL)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/macOS

uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

API docs: http://127.0.0.1:8001/docs

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env   # Windows
npm run dev
```

App: http://localhost:5173

## Development Phases

| Phase | Scope                                      | Status |
| ----- | ------------------------------------------ | ------ |
| 1     | Setup, env, PostgreSQL connection          | Done   |
| 2     | Database models & migrations                 | Next   |
| 3     | JWT authentication                         |        |
| 4     | Dealer profile module                      |        |
| 5     | Station CRUD                               |        |
| 6     | Space management                           |        |
| 7     | Utility management                         |        |
| 8     | Preferred brands                           |        |
| 9     | Image upload                               |        |
| 10    | Frontend UI pages                          |        |
| 11    | Frontend-backend integration               |        |
| 12    | Testing & validation                       |        |

## License

Proprietary — PetroMallis corporate project.
