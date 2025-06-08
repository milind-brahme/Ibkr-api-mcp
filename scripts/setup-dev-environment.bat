@echo off
REM Setup development environment for IBKR MCP Server

echo Setting up IBKR MCP Server development environment...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    echo # IBKR MCP Server Configuration > .env
    echo # IBKR Client Portal Gateway URL ^(default: https://localhost:5000^) >> .env
    echo IBKR_BASE_URL=https://localhost:5000 >> .env
    echo. >> .env
    echo # Session timeout in milliseconds ^(default: 900000 = 15 minutes^) >> .env
    echo IBKR_SESSION_TIMEOUT=900000 >> .env
    echo. >> .env
    echo # Log level ^(ERROR, WARN, INFO, DEBUG^) >> .env
    echo LOG_LEVEL=INFO >> .env
    echo. >> .env
    echo # Development mode >> .env
    echo NODE_ENV=development >> .env
)

REM Build the project
echo Building project...
call npm run build

if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo Development environment setup complete!
echo.
echo Configuration file created: .env
echo.
echo Available commands:
echo   npm run dev     - Start in development mode
echo   npm run build   - Build the project
echo   npm start       - Start in production mode
echo   npm test        - Run tests
echo.
echo To start the IBKR Gateway, run: scripts\start-gateway.bat
echo To start the MCP server, run: npm run dev
echo.
pause