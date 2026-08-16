# Practice Portal

A full-stack exam-practice application built with React, Vite, and FastAPI. Students can choose an exam topic, answer a practice set, submit an attempt, and review performance analytics and question solutions.

## Features

- Demo login and practice dashboard
- CUET and IPMAT topic selection
- Configurable question count and difficulty
- Timed multiple-choice practice sessions
- Attempt history and detailed reports
- Accuracy, response-time, difficulty, and fatigue analytics
- FastAPI endpoints for quizzes, submissions, and analytics
- Frontend fallback results when the API is unavailable

The login remains intentionally dummy, as allowed by the assignment. All hierarchy, quiz, answer-event, and analytics data is persisted in MongoDB.

## Tech stack

- Frontend: React 19, Vite 8, plain CSS
- Backend: Python, FastAPI, Uvicorn
- Data storage: MongoDB with PyMongo and aggregation pipelines

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- Python 3.10+
- MongoDB 7+ locally, MongoDB Atlas, or Docker Desktop

Check the installed versions:

```bash
node --version
npm --version
python --version
```

On Windows PowerShell, if `npm` is blocked by the execution policy, use `npm.cmd` instead of `npm` in the commands below.

## Setup

### 1. Install frontend dependencies

From the project root:

```bash
npm install
```

### 2. Create a Python virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Keep the virtual environment activated when running the backend or the combined development command.

### 3. Configure the application

Copy `.env.example` to `.env` and edit it if your MongoDB or API uses a different address:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:8000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=skillbytes_quiz
CORS_ORIGINS=http://localhost:5173
```

Restart Vite after changing `.env`.

### 4. Start MongoDB

With Docker Desktop:

```bash
docker compose up -d mongodb
```

You may instead start a local MongoDB service or set `MONGODB_URI` to a MongoDB Atlas connection string.

### 5. Seed the database

With the virtual environment activated:

```bash
npm run seed
```

The idempotent seed command replaces demo collections and creates 50 users, 3 exams, 10 subjects, 30 chapters, 500 questions, 50 completed quizzes, and 500 answer events. It also creates the required indexes. Use `user-001` in the dummy login screen.

## Run the project

With the Python virtual environment activated, start the frontend and backend together:

```bash
npm run dev
```

Open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

The login form is for demonstration only. Its prefilled credentials can be submitted as-is; the backend does not validate them.

### Run services separately

Terminal 1 (activated Python environment):

```bash
npm run backend
```

Terminal 2:

```bash
npm run client
```

Alternatively, run the API directly:

```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the frontend and backend together |
| `npm run client` | Start only the Vite development server |
| `npm run backend` | Start only the FastAPI server |
| `npm run seed` | Rebuild deterministic MongoDB demo data and indexes |
| `npm run lint` | Check frontend code with Oxlint |
| `npm run build` | Create a production frontend build in `dist/` |
| `npm run preview` | Preview the production frontend build |

## Project structure

```text
practice_app/
|-- backend/
|   |-- analytics.py     # MongoDB aggregation pipelines
|   |-- config.py        # Environment configuration
|   |-- database.py      # Client and index management
|   |-- main.py          # FastAPI routes
|   |-- schemas.py       # Pydantic request validation
|   `-- seed.py          # Deterministic assignment dataset
|-- public/
|   `-- favicon.svg
|-- src/
|   |-- App.css
|   |-- App.jsx          # Main UI and practice workflow
|   |-- index.css
|   `-- main.jsx
|-- .env.example
|-- .gitignore
|-- index.html
|-- package.json
|-- docker-compose.yml
|-- requirements.txt
`-- README.md
```

## API overview

Complete request and response schemas are available at `/docs` while the backend is running.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API availability |
| GET | `/api/users` | List predefined dummy-login users |
| GET | `/api/exams` | List exams |
| GET | `/api/exams/{examId}/subjects` | List subjects for an exam |
| GET | `/api/exams/{examId}/subjects/{subjectId}/chapters` | List chapters |
| POST | `/api/quizzes/start` | Create a randomized quiz without exposing answers |
| POST | `/api/quizzes/{quizId}/answers` | Persist one immutable answer event |
| POST | `/api/quizzes/{quizId}/batch-submit` | Submit the web client's recorded answers |
| POST | `/api/quizzes/{quizId}/submit` | Complete a quiz and return server-graded solutions |
| GET | `/api/analytics/comprehensive` | Get all calculated analytics |
| GET | `/api/analytics/events` | List tracked answer events |
| DELETE | `/api/analytics/events` | Clear tracked events |

Example health check:

```bash
curl http://localhost:8000/api/health
```

## Production frontend build

Set `VITE_API_BASE_URL` to the deployed API URL before building, then run:

```bash
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host. Deploy the FastAPI app separately with this start command:

```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

For production use, set a restricted `CORS_ORIGINS`, protect MongoDB credentials, and replace dummy login with real authentication.

## Troubleshooting

### `python` is not recognized

Install Python and enable the installer option that adds Python to `PATH`. On macOS/Linux, try `python3` when creating the environment.

### `No module named uvicorn` or `No module named fastapi`

Activate the virtual environment and reinstall the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

### PowerShell blocks virtual-environment activation

For the current PowerShell session only:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### PowerShell blocks `npm.ps1`

Use the Windows command shim:

```powershell
npm.cmd install
npm.cmd run dev
```

### Port 5173 or 8000 is already in use

Stop the process using that port, or start the service on a different port. If the backend port changes, update `VITE_API_BASE_URL` to match.

### The API returns `503 MongoDB is unavailable`

Start MongoDB (or check the Atlas URI), then run `npm run seed`. The API intentionally fails clearly instead of silently falling back to temporary in-memory data.
