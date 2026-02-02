# Masters Dashboard

A comprehensive dashboard for tracking Master's degree applications to Germany and Switzerland.

## Features

- 📚 **Research Tracker** - Track universities and programs with AI auto-fill
- 📝 **Preparation Tracker** - Track German language, GRE, and IELTS preparation
- 📋 **Application Tracker** - Manage application status and documents
- 🤖 **AI Assistant** - Gemini-powered chat for application guidance

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Express.js + PostgreSQL
- **AI**: Google Gemini API

## Quick Start (Local Development)

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database and Gemini API key
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render will detect `render.yaml` and create all services
6. Set environment variables:
   - `GEMINI_API_KEY` - Your Google AI API key
   - `CORS_ORIGINS` - Your frontend URL
   - `VITE_API_URL` - Your backend URL + `/api`

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-set by Render) |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `NODE_ENV` | `production` |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `https://your-api.onrender.com/api`) |

## Database Setup

After deployment, run the schema on your database:

```bash
# Connect to Render's shell or use psql
psql $DATABASE_URL -f backend/db/schema.sql
```

## License

MIT
