# GMAT Prep System

A local-first, full-stack GMAT preparation platform that extracts questions directly from Manhattan Prep PDFs and presents them in a beautiful dark-themed UI with an AI tutor powered by local Ollama.

## Quick Start

```powershell
# Run this from the project root:
.\start.ps1
```

Or manually:
```powershell
# Terminal 1 — Backend
cd backend
py -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/docs

## Project Structure

```
gmat-prep-system/
├── extractor/           # Phase 1: PDF Extraction Pipeline
│   ├── extract_all.py   # Runs extraction for all 3 books
│   ├── parse_toc.py     # Parses chapter boundaries from TOC
│   ├── data/            # Extracted JSON (448+ questions)
│   └── images/          # Cropped question images (PNG)
├── backend/             # Phase 2: FastAPI + SQLite
│   ├── main.py          # REST API + Ollama tutor routing
│   ├── db_manager.py    # Schema creation + data seeder
│   └── gmat_prep.db     # SQLite database
└── frontend/            # Phase 4: React + Vite + TypeScript
    └── src/
        ├── App.tsx      # Full UI — navigation, practice, analytics
        ├── api.ts       # Typed API client
        └── index.css    # Dark-mode design system
```

## AI Tutor Setup

The AI Tutor requires Ollama running locally with a model:

```bash
# Install Ollama from https://ollama.ai
ollama serve
ollama pull qwen2.5:14b   # recommended (best reasoning)
# OR
ollama pull llama3.1:8b   # faster alternative
```

## Question Guarantee

> **Every question, option, and official explanation is extracted verbatim from the PDFs.** No AI model rewrites or paraphrases question content at any point in the pipeline. The LLM only acts as a tutor *after* the student has answered, grounded strictly in the official explanation.

## Re-Running Extraction

If you want to re-extract questions (after updating PDFs):

```powershell
cd extractor
py dump_toc.py       # Dump TOC to text files
py parse_toc.py      # Parse chapter boundaries to JSON
py extract_all.py    # Extract all questions + crop images
cd ../backend
py db_manager.py     # Re-create schema and re-seed database
```
