@echo off
REM Script to start IBKR Client Portal Gateway on Windows
REM Adjust paths according to your installation

setlocal

REM Set default gateway directory if not provided
if "%IBKR_GATEWAY_DIR%"=="" (
    set "GATEWAY_DIR=%USERPROFILE%\clientportalapi"
) else (
    set "GATEWAY_DIR=%IBKR_GATEWAY_DIR%"
)

set "CONFIG_FILE=%GATEWAY_DIR%\root\conf.yaml"

REM Check if gateway directory exists
if not exist "%GATEWAY_DIR%" (
    echo Error: Gateway directory not found at %GATEWAY_DIR%
    echo Please set IBKR_GATEWAY_DIR environment variable or download the gateway
    pause
    exit /b 1
)

REM Check if configuration file exists
if not exist "%CONFIG_FILE%" (
    echo Error: Configuration file not found at %CONFIG_FILE%
    pause
    exit /b 1
)

echo Starting IBKR Client Portal Gateway...
echo Gateway directory: %GATEWAY_DIR%
echo Configuration file: %CONFIG_FILE%
echo.

REM Change to gateway directory
cd /d "%GATEWAY_DIR%"

REM Start the gateway
if exist "bin\run.bat" (
    call bin\run.bat root\conf.yaml
) else if exist "bin\run.sh" (
    REM If only shell script exists, try to run it with bash (if available)
    bash bin/run.sh root/conf.yaml
) else (
    echo Error: No startup script found in bin directory
    pause
    exit /b 1
)

pause