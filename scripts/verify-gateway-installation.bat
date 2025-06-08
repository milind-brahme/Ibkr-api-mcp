@echo off
REM IBKR Gateway Installation Verification Script

echo Checking IBKR Gateway installation...
echo.

set "GATEWAY_DIR=C:\Users\milin\clientportalapi"

echo Gateway Directory: %GATEWAY_DIR%
echo.

REM Check if main directories exist
if exist "%GATEWAY_DIR%\bin" (
    echo [OK] bin/ directory found
) else (
    echo [ERROR] bin/ directory missing
)

if exist "%GATEWAY_DIR%\root" (
    echo [OK] root/ directory found
) else (
    echo [ERROR] root/ directory missing
)

if exist "%GATEWAY_DIR%\lib" (
    echo [OK] lib/ directory found
) else (
    echo [ERROR] lib/ directory missing
)

REM Check for startup scripts
if exist "%GATEWAY_DIR%\bin\run.bat" (
    echo [OK] Windows startup script found: bin\run.bat
) else if exist "%GATEWAY_DIR%\bin\run.sh" (
    echo [OK] Shell startup script found: bin\run.sh
) else (
    echo [ERROR] No startup script found in bin/
)

REM Check for configuration
if exist "%GATEWAY_DIR%\root\conf.yaml" (
    echo [OK] Configuration file found: root\conf.yaml
) else (
    echo [WARNING] Configuration file missing: root\conf.yaml
    echo Please move conf.yaml from gateway root to root\conf.yaml
)

echo.
echo Installation verification complete.
echo.

REM Check if gateway can be started
if exist "%GATEWAY_DIR%\bin\run.bat" (
    echo To start the gateway, run: scripts\start-gateway.bat
) else (
    echo Please complete the installation first.
)

echo.
pause
