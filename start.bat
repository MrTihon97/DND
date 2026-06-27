@echo off
echo Starting D&D Tracker Backend...
start cmd /c "node server.js"

echo Starting D&D Tracker Frontend...
start cmd /c "node node_modules/vite/bin/vite.js"

echo Servers started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
pause
