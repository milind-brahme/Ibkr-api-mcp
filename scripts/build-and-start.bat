@echo off
REM Build and start the IBKR MCP Server

echo Building and starting IBKR MCP Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Build the project
echo Building project...
npm run build

if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo Build completed successfully!
echo.

REM Start the server
echo Starting MCP server...
npm start

pause