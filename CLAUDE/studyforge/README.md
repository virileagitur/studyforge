# StudyForge

**Your AI-powered academic co-pilot.** StudyForge helps students organize tasks, track research, build flashcard decks, take notes, and get AI tutoring — all in one clean, focused workspace.

---

## Features

- **Dashboard** — Stats, AI-recommended task focus, quick actions, and activity feed
- **Task Manager** — Create, filter, and complete tasks with priority and deadline tracking
- **Research Bookmarker** — Save URLs, paste content, and AI-summarize research sources
- **Book Tracker** — Track reading progress, ratings, and generate AI chapter summaries
- **Flashcard System** — Create decks, study in flip mode, and generate cards with AI
- **Note-Taking** — Rich text editor with AI summary and quiz generation
- **AI Tutor** — Persistent chat sessions for homework help and concept explanations
- **AI Study Guide** — Generate key concepts, terms, practice questions from any topic
- **Homework Scanner** — Upload a photo, extract text via OCR, get step-by-step solutions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, MUI Icons |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT (HTTP-only cookies) |
| AI | Anthropic Claude (claude-3-5-sonnet-20241022) |
| OCR | Tesseract.js |

---

## Project Structure

```
studyforge/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # Express routes
│   │   ├── db/
│   │   │   ├── index.js      # DB connection pool
│   │   │   └── schema.sql    # Full database schema
│   │   └── index.js          # App entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/       # AppLayout, sidebar, mobile nav
    │   │   └── ui/           # Reusable UI components
    │   ├── context/           # AuthContext
    │   ├── lib/               # Axios API client
    │   └── pages/             # All page components
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- An Anthropic API key (optional — the app works without it using placeholder responses)

---

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/studyforge.git
cd studyforge

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### 2. Set Up the Database

Create a PostgreSQL database:

```sql
CREATE DATABASE studyforge;
```

Then run the schema:

```bash
psql -U postgres -d studyforge -f backend/src/db/schema.sql
```

Or using a connection string:

```bash
psql "postgresql://user:password@localhost:5432/studyforge" -f backend/src/db/schema.sql
```

---

### 3. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/studyforge
JWT_SECRET=your_very_long_random_secret_key_here
ANTHROPIC_API_KEY=sk-ant-...        # Optional — AI features use placeholders without this
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 4. Run the Development Servers

**Backend** (from `/backend`):
```bash
npm run dev
# API running on http://localhost:5000
```

**Frontend** (from `/frontend`):
```bash
npm run dev
# App running on http://localhost:5173
```

The frontend proxies all `/api` requests to the backend automatically (configured in `vite.config.js`).

---

## Deployment

### Backend — Render / Railway

1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app)
3. Set the root directory to `backend/`
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add all environment variables from `.env`
7. Set `NODE_ENV=production`
8. Set `CORS_ORIGIN=https://your-frontend-domain.vercel.app`

### Database — Supabase / Neon

1. Create a free PostgreSQL database at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Run `schema.sql` using their SQL editor
3. Copy the connection string into your backend's `DATABASE_URL`

### Frontend — Vercel / Netlify

1. Push to GitHub
2. Connect the repo to [Vercel](https://vercel.com)
3. Set root directory to `frontend/`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`
5. Update `frontend/src/lib/api.js` base URL:
   ```js
   baseURL: import.meta.env.VITE_API_URL || '/api'
   ```

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `ANTHROPIC_API_KEY` | Claude API key for AI features | No (uses placeholders) |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | `development` or `production` | Yes |
| `CORS_ORIGIN` | Frontend URL for CORS | Yes |

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/complete` | Mark complete |

### Research, Books, Flashcards, Notes
Standard CRUD at `/api/research`, `/api/books`, `/api/flashcards`, `/api/notes`.

### AI Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/tutor/chat` | Chat with AI tutor |
| GET | `/api/ai/tutor/conversations` | List conversations |
| GET | `/api/ai/prioritize` | AI task prioritizer |
| POST | `/api/ai/study-guide` | Generate study guide |
| POST | `/api/ai/research/:id/summarize` | Summarize research |
| POST | `/api/ai/research/:id/flashcards` | Generate flashcards from research |
| POST | `/api/ai/notes/:id/summarize` | Summarize note |
| POST | `/api/ai/notes/:id/quiz` | Generate quiz from note |
| POST | `/api/ai/books/:id/summarize-chapter` | Summarize book chapter |
| POST | `/api/ai/flashcards/:id/explain-simply` | Explain flashcard simply |
| POST | `/api/ai/flashcards/:id/give-example` | Give real-world example |
| POST | `/api/ai/flashcards/generate-from-text` | Generate flashcards from text |
| POST | `/api/ai/daily-checkin` | Daily study buddy check-in |
| POST | `/api/ai/homework-scan` | Homework scanner |

---

## Adding the Anthropic API Key

Without an API key, all AI features return a placeholder message. To enable real AI:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com)
2. Add to `backend/.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```
3. Restart the backend server

The app uses `claude-3-5-sonnet-20241022` model.

---

## Security Notes

- JWT tokens are stored in HTTP-only cookies (not accessible to JavaScript)
- Passwords are hashed with bcrypt (12 salt rounds)
- All SQL queries use parameterized statements (no SQL injection risk)
- Rate limiting: 200 req/15min general, 20 req/min for AI endpoints
- Helmet.js sets secure HTTP headers
- CORS restricted to configured frontend origin

---

## Design System

StudyForge uses a warm orange and yellow palette:

- Primary: `#F97316` (Orange)
- Accent: `#FACC15` (Yellow)
- Background: `#FFFDF7` (Warm white)
- Cards: `#FFFBF5` with soft shadow
- Font: Plus Jakarta Sans (Google Fonts)

All components use MUI Icons exclusively (no emojis). Cards use shadow-based borders (no hard border lines). Rounded corners (`border-radius: 12px`).

---

## License

MIT
