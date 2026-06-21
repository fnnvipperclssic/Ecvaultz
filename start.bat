@echo off
title Ecvaultz — Docker Startup
echo.
echo ╔══════════════════════════════════════════╗
echo ║       Ecvaultz — Docker Setup           ║
echo ╚══════════════════════════════════════════╝
echo.
echo [1/3] Building Docker images...
docker compose build
echo.
echo [2/3] Starting containers...
docker compose up -d
echo.
echo [3/3] Waiting for application to be ready...
echo       (this may take 30-60 seconds on first run)
echo.
echo ╔══════════════════════════════════════════╗
echo ║  Ecvaultz is starting...               ║
echo ║  http://localhost:8080                  ║
echo ║                                        ║
echo ║  View logs: docker compose logs -f app  ║
echo ║  Stop:      docker compose down         ║
echo ║  Email UI:  http://localhost:8025       ║
echo ╚══════════════════════════════════════════╝
echo.
pause
