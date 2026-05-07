#!/bin/bash

# Start both Backend and Frontend

echo "Starting Family Tree Application..."

# Start Backend
echo "Starting Backend (port 5000)..."
cd backend
source venv/bin/activate || source venv/Scripts/activate
python main.py &
BACKEND_PID=$!

cd ..

# Start Frontend
echo "Starting Frontend (port 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo "✅ Both servers are running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the servers"

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
