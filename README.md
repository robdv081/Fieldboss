# 👷 FieldBoss

**All-in-one business management for trades** — scheduling, CRM, estimates, invoicing, crew management & reviews.

Built for plumbers, electricians, HVAC techs, landscapers, car detailers, and every other trade.

## Features

- 📊 **Dashboard** — Today's jobs, revenue, metrics at a glance
- 📅 **Job Scheduling** — Schedule, assign, track status & costs
- 👥 **Customer CRM** — Full contact management with lead sources
- 📝 **Estimates** — Line-item estimates with tax calculation
- 💰 **Invoicing** — Create invoices, one-click mark paid
- 👷 **Crew Manager** — Workers, rates, trades, availability
- ⭐ **Reviews** — Track ratings by platform, response status
- 🔐 **Multi-tenant Auth** — Each user sees only their own data

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + DaisyUI
- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3)
- **Auth:** JWT + bcrypt

## Quick Start (Local)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd fieldboss

# 2. Install all dependencies
npm run install:all

# 3. Set up environment
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# 4. Build the frontend
npm run build

# 5. Start the server
npm start
# App is running at http://localhost:3000
```

## Development Mode

```bash
# Install dependencies
npm run install:all

# Run backend + frontend dev servers simultaneously
npm run dev
# Backend: http://localhost:3000
# Frontend: http://localhost:5173 (with hot reload)
```

## Deploy to Railway (Recommended — Free Tier)

1. Push your code to a GitHub repo
2. Go to [railway.app](https://railway.app) and sign up
3. Click "New Project" → "Deploy from GitHub Repo"
4. Select your repo
5. Add environment variables:
   - `JWT_SECRET` = (generate a random 64-char string)
   - `NODE_ENV` = production
   - `PORT` = 3000
6. Railway auto-detects Node.js, runs `npm install` + `npm run build` + `npm start`
7. Get your public URL and share it!

## Deploy to Render (Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. New → Web Service → Connect your repo
4. Settings:
   - Build Command: `npm run install:all && npm run build`
   - Start Command: `npm start`
5. Add environment variables (same as Railway)
6. Deploy!

## Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Set secrets
fly secrets set JWT_SECRET=your-secret-here

# Deploy
fly deploy
```

## Project Structure

```
fieldboss/
├── package.json          # Root config & scripts
├── .env                  # Environment variables
├── server/               # Backend API
│   ├── index.js          # Express server entry
│   ├── db.js             # SQLite database setup
│   ├── auth.js           # JWT & password hashing
│   ├── middleware.js      # Auth & CORS middleware
│   └── routes/           # API route handlers
│       ├── auth.js       # Login/register
│       ├── dashboard.js  # Stats & metrics
│       ├── customers.js  # Customer CRUD
│       ├── jobs.js       # Job CRUD + status
│       ├── estimates.js  # Estimate CRUD
│       ├── invoices.js   # Invoice CRUD
│       ├── crew.js       # Crew CRUD
│       └── reviews.js    # Review CRUD
├── client/               # Frontend React app
│   ├── src/
│   │   ├── App.tsx       # Main app shell
│   │   ├── api.ts        # API client
│   │   ├── types.ts      # TypeScript types
│   │   ├── context/      # Auth context
│   │   └── components/   # All UI components
│   └── vite.config.ts    # Vite + proxy config
└── data/                 # SQLite database (auto-created)
```

## License

MIT
