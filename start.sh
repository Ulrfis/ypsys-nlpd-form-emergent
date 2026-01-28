#!/bin/bash

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Copy build to backend static folder
echo "Copying frontend build to backend..."
mkdir -p ../backend/static
cp -r build/* ../backend/static/

# Start backend
echo "Starting backend server..."
cd ../backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}
