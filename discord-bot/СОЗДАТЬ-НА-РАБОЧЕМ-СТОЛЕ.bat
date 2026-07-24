@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "%~dp0install-to-desktop.ps1" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-to-desktop.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0установить-на-рабочий-стол.ps1"
)
