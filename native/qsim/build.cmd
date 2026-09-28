@echo off
REM KARDASHEV M2h - build the stochastic weather Monte Carlo kernel.
REM MSVC must be on PATH before nvcc runs; bash here has a link.exe collision,
REM so this goes through vcvars64 in cmd, as CLAUDE.md says.
setlocal
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" >nul
if errorlevel 1 (
  echo vcvars64 failed
  exit /b 1
)
pushd "%~dp0"
nvcc -O3 -arch=sm_120 -o qsim.exe qsim.cu
set RC=%errorlevel%
popd
endlocal & exit /b %RC%
