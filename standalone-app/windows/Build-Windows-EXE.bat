@echo off
setlocal
cd /d "%~dp0.."

echo ====================================================
echo   Building Native Windows .EXE Installer & Portable
echo ====================================================
echo.

call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

call npm run build:win
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [SUCCESS] Windows installers generated in release-builds\
explorer release-builds
