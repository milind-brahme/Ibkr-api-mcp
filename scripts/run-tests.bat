@echo off
REM Run tests for IBKR MCP Server

echo Running IBKR MCP Server Tests...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Install dependencies if not already installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build the project
echo Building project...
npm run build
if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo Running unit tests...
npm test

if errorlevel 1 (
    echo.
    echo Some tests failed. Check the output above.
) else (
    echo.
    echo All tests passed! ✅
)

echo.
echo To run integration tests with a live IBKR connection:
echo   1. Start IBKR Gateway: scripts\start-gateway.bat
echo   2. Run: node examples\test-client.js
echo.
pause