@echo off
setlocal
set PORT=5173

start "" http://localhost:%PORT%/

where node >nul 2>nul && ( npx --yes serve . -l %PORT% & goto :eof )
where py   >nul 2>nul && ( py -m http.server %PORT% & goto :eof )

REM no Node / Python needed - pure PowerShell fallback
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port %PORT%
