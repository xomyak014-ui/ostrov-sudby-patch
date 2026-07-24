@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js не найден. Установите LTS с https://nodejs.org/
  pause
  exit /b 1
)

echo Установка зависимостей…
call npm install
if errorlevel 1 (
  echo Ошибка установки
  pause
  exit /b 1
)

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Создан .env — откройте его и вставьте токен бота.
)

echo.
echo Готово. Дальше:
echo 1^) Откройте .env и проверьте DISCORD_TOKEN
echo 2^) В Discord Developer Portal включите Privileged Gateway Intents при необходимости
echo 3^) Пригласите бота на сервер с правами Manage Channels
echo 4^) Запустите start.bat
pause
