#!/bin/bash

# Start Django backend without SSL
echo "Starting Django backend..."
cd backend
pipenv run python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Start Next.js frontend without HTTPS
echo "Starting Next.js frontend..."
cd ../frontend/gephiltephish
npm run dev &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Set up trap for cleanup on script termination
trap cleanup SIGINT SIGTERM

# Keep script running
wait
