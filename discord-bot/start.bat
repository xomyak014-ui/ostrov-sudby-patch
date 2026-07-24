@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js не найден. Установите с https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Устанавливаю зависимости…
  call npm install
  if errorlevel 1 (
    echo Ошибка npm install
    pause
    exit /b 1
  )
)

if not exist ".env" (
  echo Файл .env не найден. Скопируйте .env.example в .env и укажите токен.
  pause
  exit /b 1
)

echo Запуск бота Остров Судьбы (с автоперезапуском)…
npm run start:safe
pause
