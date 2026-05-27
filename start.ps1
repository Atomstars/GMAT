#!/bin/bash
# GMAT Prep System Startup Script (Windows PowerShell)
# Run this file to start both the backend and frontend servers

Write-Host "Starting GMAT Prep System..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Starting FastAPI Backend on http://127.0.0.1:8000" -ForegroundColor Yellow
Start-Process -FilePath "py" -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000" -WorkingDirectory "C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\backend"

Start-Sleep -Seconds 2

Write-Host "Step 2: Starting React Frontend on http://localhost:5173" -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\frontend"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "GMAT Prep System is running!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"
