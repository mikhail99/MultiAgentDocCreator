#!/bin/bash

# Multi-Agent Document Creator Startup Script

echo "🚀 Starting Multi-Agent Document Creator..."

# Check if backend dependencies are installed
if [ ! -d "backend/venv" ]; then
    echo "📦 Setting up Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo "✅ Python virtual environment found"
fi

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Please create it from config/env.example"
    echo "   cp backend/config/env.example backend/.env"
    echo "   Then edit backend/.env with your OpenAI API key"
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📊 Backend API: http://localhost:8000"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
