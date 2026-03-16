#!/usr/bin/env bash

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "Done."
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "Ensuring ports 5000 and 8080 are free..."
lsof -ti:5000 -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null || true

echo "Installing backend dependencies..."
(cd backend && npm install)

echo "Installing frontend dependencies..."
(cd frontend && npm install)

echo ""
echo "Starting backend (port 5000)..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "Starting frontend (Vite)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both."
echo ""

wait
