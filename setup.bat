@echo off
REM Family Tree Application Setup Script for Windows

echo ======================================
echo Family Tree Application Setup
echo ======================================

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please update .env with your Supabase credentials
)

REM Setup Backend
echo.
echo 📦 Setting up Backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

cd ..

REM Setup Frontend
echo.
echo 📦 Setting up Frontend...
cd frontend

REM Install Node dependencies
echo Installing Node.js dependencies...
npm install

cd ..

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update .env with your Supabase credentials
echo 2. Run: run.bat    (to start both servers)
echo    OR
echo 3. Backend: cd backend ^&^& venv\Scripts\activate.bat ^&^& python main.py
echo 4. Frontend: cd frontend ^&^& npm run dev
echo.
echo Application will be available at: http://localhost:3000
pause
