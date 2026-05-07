@echo off
REM Start both Backend and Frontend for Windows

echo Starting Family Tree Application...

REM Start Backend
echo Starting Backend (port 5000)...
start "Family Tree Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python main.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo Starting Frontend (port 3000)...
start "Family Tree Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close the command windows to stop the servers
pause
