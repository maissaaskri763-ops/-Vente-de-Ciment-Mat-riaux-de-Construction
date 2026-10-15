@echo off
setlocal

cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker was not found. Install and start Docker Desktop, then try again.
  pause
  exit /b 1
)

echo Starting Vent App in Docker...
echo Frontend: http://127.0.0.1:3000
echo Backend:  http://127.0.0.1:5000
echo.

docker compose up --build
if errorlevel 1 pause
