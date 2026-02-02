# Masters Dashboard - Deployment Guide

## Quick Start (Local Development)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

**Backend:**
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) and connect repo
3. Add PostgreSQL database from Railway dashboard
4. Set environment variables:
   ```
   NODE_ENV=production
   GEMINI_API_KEY=your_key
   DATABASE_URL=<auto-filled by Railway>
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
5. Deploy

**Frontend:**
1. Go to [vercel.com](https://vercel.com) and connect repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy

---

### Option 2: Cloudflare Pages + Render

**Frontend (Cloudflare Pages):**
```bash
# Build command
npm run build

# Output directory
dist
```

**Backend (Render):**
1. Create Web Service on [render.com](https://render.com)
2. Build command: `npm install`
3. Start command: `npm start`
4. Add PostgreSQL database
5. Set environment variables

---

### Option 3: VPS (DigitalOcean/AWS EC2)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Clone and setup
git clone <your-repo>
cd dashboard

# Backend
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values
pm2 start npm --name "dashboard-api" -- start

# Frontend
cd ../frontend
npm install
npm run build
# Serve with nginx or similar
```

**Nginx config for frontend:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/dashboard/frontend/dist;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

---

## Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `GEMINI_API_KEY` | Google AI key | `AIza...` |
| `CORS_ORIGINS` | Allowed origins | `https://app.example.com` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.example.com/api` |

---

## Database Setup

Run the schema on your PostgreSQL database:
```bash
psql -U postgres -d your_database -f backend/db/schema.sql
```

---

## SSL/HTTPS

For production, always use HTTPS:
- **Railway/Render/Vercel**: Automatic SSL
- **VPS**: Use Let's Encrypt with Certbot
