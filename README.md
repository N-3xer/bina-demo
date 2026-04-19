# Bina — Virtual Science Labs

Interactive browser-based science experiments for Kenyan secondary school students who lack physical lab equipment.

**Stack:** React 18 + Vite · FastAPI · Supabase · Gemini Flash · Groq (Llama 3.3)  
**MVP deadline:** 26 May 2026

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase project (free tier)
- Gemini API key (free tier)
- Groq API key (free tier)

### 1. Clone & configure
```bash
git clone https://github.com/yourname/bina.git
cd bina
cp .env.example .env
# Fill in all values in .env before proceeding
```

### 2. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### 3. Seed database
```bash
cd backend
python data/seed.py
```

### 4. Frontend
```bash
cd frontend
npm install
cp ../.env.example .env.local
# Edit .env.local with VITE_ prefixed vars
npm run dev
# App: http://localhost:5173
```

---

## Project Structure
```
bina/
├── frontend/        React + Vite
├── backend/         FastAPI
├── .env.example     All required env vars
└── README.md
```

See PRD for full architecture, DB schema, and agent design.
# bina-demo
