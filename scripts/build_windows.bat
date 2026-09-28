@echo off
REM Central Business Workflow - Windows Automated Build & Packaging Script

echo ========================================================
echo CENTRAL BUSINESS WORKFLOW - WINDOWS BUILD PIPELINE
echo ========================================================

echo [1/4] Running Database Migrations...
python scripts\init_db.py
if %ERRORLEVEL% NEQ 0 (
    echo Database initialization failed!
    exit /b %ERRORLEVEL%
)

echo [2/4] Executing Automated Vitest Verification Suite...
call npx vitest run
if %ERRORLEVEL% NEQ 0 (
    echo Unit test suite failed!
    exit /b %ERRORLEVEL%
)

echo [3/4] Compiling React + TypeScript + Tailwind Production Bundle...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo Frontend build failed!
    exit /b %ERRORLEVEL%
)

echo [4/4] Verifying Python Background Worker Pipeline...
python python\main.py --action health
if %ERRORLEVEL% NEQ 0 (
    echo Python worker check failed!
    exit /b %ERRORLEVEL%
)

echo ========================================================
echo BUILD SUCCESSFUL! All modules compiled and verified.
echo To run the desktop application in dev mode:
echo   npm run dev
echo ========================================================
pause
