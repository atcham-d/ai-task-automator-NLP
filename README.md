# FlowAI — Visual Workflow Automation

FlowAI is a powerful visual workflow automation platform that allows you to build, manage, and execute complex automated sequences using natural language or a drag-and-drop editor.

## Features

- **Natural Language Parsing**: Describe your workflow in plain English (e.g., "When a Trello card moves to Done, send a Slack message and log it to HTTP").
- **Visual Flow Editor**: Fine-tune automated sequences with a high-fidelity visual canvas powered by React Flow and Lucide icons.
- **Service Integrations**: Connect Trello, Slack, Gmail, and custom HTTP endpoints.
- **Execution Monitoring**: Real-time logs and performance tracking for every automated step.
- **Secure Authentication**: Built-in Google OAuth and email/password support via Supabase.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS (Stitch UI), Lucide Icons, React Flow.
- **Backend**: FastAPI (Python), Gunicorn/Uvicorn, Pytest.
- **Database/Auth**: Supabase.
- **Deployment**: Vercel (Frontend), Render (Backend).

## Setup & Installation

### Backend Setup
1. `cd backend`
2. `pip install -r requirements.txt`
3. Create a `.env` file based on the environment variables section below.
4. Run locally: `uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run locally: `npm run dev`

## Production Deployment

### Backend (Render)
- **Runtime**: Python 3.11+
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn -k uvicorn.workers.UvicornWorker -c gunicorn_conf.py app.main:app`
- **Port**: 8000 (standardized)

### Frontend (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Rewrites**: Configured in `vercel.json` for SPA support.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `DATABASE_URL` | Supabase Postgres connection string |
| `TRELLO_API_KEY` | Trello Power-Up API Key |
| `TRELLO_TOKEN` | Trello OAuth Token |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins (e.g., `https://flow-ai.vercel.app`) |
| `NODE_ENV` | Set to `production` in live environments |

## Documentation
- [NLP Syntax Reference](docs/NLP_SYNTAX.md)
- [API Documentation](/api/docs) (once backend is running)

## License
MIT
