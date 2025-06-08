# PowerShell script for setting up IBKR MCP Server
# Run with: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1

Write-Host "Setting up IBKR MCP Server..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm is not available" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "`nCreating .env file..." -ForegroundColor Yellow
    @"
# IBKR MCP Server Configuration
# IBKR Client Portal Gateway URL (default: https://localhost:5000)
IBKR_BASE_URL=https://localhost:5000

# Session timeout in milliseconds (default: 900000 = 15 minutes)
IBKR_SESSION_TIMEOUT=900000

# Log level (ERROR, WARN, INFO, DEBUG)
LOG_LEVEL=INFO

# Development mode
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env file created successfully!" -ForegroundColor Green
}

# Build the project
Write-Host "`nBuilding project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error: Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`n" -NoNewline
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Start IBKR Gateway: .\scripts\start-gateway.bat" -ForegroundColor White
Write-Host "2. Start MCP server: npm run dev" -ForegroundColor White
Write-Host "3. Check the README.md for usage examples" -ForegroundColor White

Read-Host "`nPress Enter to exit"