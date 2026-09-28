@echo off
setlocal enabledelayedexpansion
title KARDASHEV
cd /d "%~dp0"

echo.
echo    KARDASHEV
echo    ==========================================
echo.

REM ---- si ya esta corriendo, no arranques otro: abre y sal -------------
call :isup
if "%UP%"=="1" (
  echo    Ya estaba corriendo. Abriendo el navegador.
  start "" "http://localhost:8080"
  echo.
  echo    http://localhost:8080
  echo.
  timeout /t 3 >nul
  exit /b 0
)

where node >nul 2>&1
if errorlevel 1 (
  echo    [X] Node no esta en el PATH. Instala Node.js y reabre este archivo.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo    Primera vez: instalando dependencias ^(un par de minutos^).
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo    [X] npm install fallo. Mira el error de arriba.
    pause
    exit /b 1
  )
  echo.
)

REM ---- OJO: no usamos "npm run dev".                                   -
REM ---- with-app-env.mjs lanza `vite` con spawn sin shell, y en Windows -
REM ---- `vite` es un .cmd que spawn no puede ejecutar: da ENOENT.       -
REM ---- Le pasamos el .js de vite, que node si puede lanzar. El env de  -
REM ---- .grok/app-env.json se sigue cargando igual.                     -
echo    Arrancando el servidor...
start "KARDASHEV server" /min cmd /c "node scripts\with-app-env.mjs node node_modules\vite\bin\vite.js dev --host 127.0.0.1 --port 8080"

echo    Esperando a http://localhost:8080 ...
set /a n=0
:wait
set /a n+=1
call :isup
if "%UP%"=="1" goto ready
if !n! GEQ 60 goto failed
timeout /t 1 >nul
goto wait

:failed
echo.
echo    [X] No respondio en 60s. Abre la ventana "KARDASHEV server"
echo        que se ha minimizado para ver el error.
echo.
pause
exit /b 1

:ready
echo    Listo.
start "" "http://localhost:8080"
echo.
echo    ==========================================
echo      http://localhost:8080
echo.
echo      Deja esta ventana abierta mientras la uses.
echo      Pulsa una tecla para APAGAR el servidor.
echo    ==========================================
echo.
pause >nul

echo    Apagando...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8080 " ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
echo    Hecho.
timeout /t 2 >nul
exit /b 0

REM ---- ¿hay algo escuchando en 8080? -> UP=1 --------------------------
:isup
set UP=0
for /f %%r in ('powershell -NoProfile -Command "try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',8080);$c.Close();1}catch{0}"') do set UP=%%r
exit /b 0
