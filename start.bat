@echo off
echo ========================================
echo  MK1300 V2 Custom RGB Effects Tool
echo ========================================
echo.

:: Start local server in background
start /B npx -y serve -l 8080 -s . >nul 2>&1
timeout /t 3 /nobreak >nul

echo Server running at http://localhost:8080
echo.
echo Launching Chrome with HID blocklist disabled...
echo (This is required for WebHID to see keyboard devices)
echo.

:: Try common Chrome install paths
set CHROME=""
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set CHROME="%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set CHROME="%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set CHROME="%LocalAppData%\Google\Chrome\Application\chrome.exe"

if %CHROME%=="" (
    echo Chrome not found. Please open this URL manually in Chrome:
    echo   chrome.exe --disable-hid-blocklist http://localhost:8080
    echo.
    echo Or in Edge:
    echo   msedge.exe --disable-hid-blocklist http://localhost:8080
    pause
) else (
    echo Found Chrome at %CHROME%
    start "" %CHROME% --disable-hid-blocklist http://localhost:8080
)

echo.
echo Press any key to stop the server...
pause >nul
taskkill /f /im serve.exe >nul 2>&1
