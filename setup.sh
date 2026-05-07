#!/bin/bash

# Family Tree Application Setup Script
set -e

echo "======================================"
echo "Family Tree Application Setup"
echo "======================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Supabase credentials"
fi

# Setup Backend
echo -e "\n📦 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

cd ..

# Setup Frontend
echo -e "\n📦 Setting up Frontend..."
cd frontend

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

cd ..

echo -e "\n✅ Setup complete!"
echo -e "\n📋 Next steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Run: ./run.sh    (to start both servers)"
echo "   OR"
echo "3. Backend: cd backend && source venv/bin/activate && python main.py"
echo "4. Frontend: cd frontend && npm run dev"
echo ""
echo "Application will be available at: http://localhost:3000"
