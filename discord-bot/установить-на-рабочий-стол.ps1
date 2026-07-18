# Создаёт папку бота на рабочем столе Windows и ставит зависимости.
# Запуск: ПКМ → «Выполнить с помощью PowerShell»
# или в PowerShell: Set-ExecutionPolicy -Scope Process Bypass; .\установить-на-рабочий-стол.ps1

$ErrorActionPreference = 'Stop'

$Branch = 'cursor/discord-ticket-bot-2a81'
$RepoZip = "https://github.com/xomyak014-ui/ostrov-sudby-patch/archive/refs/heads/$Branch.zip"
$Desktop = [Environment]::GetFolderPath('Desktop')
$Target = Join-Path $Desktop 'Остров-Судьбы-Бот'
$Temp = Join-Path $env:TEMP ("ostrov-bot-" + [guid]::NewGuid().ToString())
$ZipPath = Join-Path $Temp 'repo.zip'

Write-Host ""
Write-Host "=== Остров Судьбы — установка бота на рабочий стол ===" -ForegroundColor Cyan
Write-Host "Папка: $Target"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js не найден." -ForegroundColor Yellow
  Write-Host "Скачай LTS: https://nodejs.org/  затем запусти этот скрипт снова."
  pause
  exit 1
}

New-Item -ItemType Directory -Force -Path $Temp | Out-Null

Write-Host "Скачиваю файлы бота..."
Invoke-WebRequest -Uri $RepoZip -OutFile $ZipPath -UseBasicParsing

Write-Host "Распаковываю..."
Expand-Archive -Path $ZipPath -DestinationPath $Temp -Force

$extracted = Get-ChildItem -Path $Temp -Directory | Where-Object { $_.Name -like 'ostrov-sudby-patch-*' } | Select-Object -First 1
$source = Join-Path $extracted.FullName 'discord-bot'

if (-not (Test-Path $source)) {
  Write-Host "Ошибка: папка discord-bot не найдена в архиве." -ForegroundColor Red
  pause
  exit 1
}

if (Test-Path $Target) {
  Write-Host "Папка уже есть — обновляю файлы (node_modules и .env сохраняю)..."
  Get-ChildItem -Path $source -Force | ForEach-Object {
    if ($_.Name -in @('node_modules', '.env', 'logs', 'data')) { return }
    Copy-Item -Path $_.FullName -Destination (Join-Path $Target $_.Name) -Recurse -Force
  }
} else {
  New-Item -ItemType Directory -Force -Path $Target | Out-Null
  Copy-Item -Path (Join-Path $source '*') -Destination $Target -Recurse -Force
}

# .env
$envFile = Join-Path $Target '.env'
if (-not (Test-Path $envFile)) {
  $token = Read-Host 'Вставь Discord-токен бота (из Developer Portal → Bot → Reset Token)'
  @"
DISCORD_TOKEN=$token
TICKET_CHANNEL_ID=1514901109322547240
TICKET_CATEGORY_ID=1514901003776819241
TICKET_PREFIX=ticket
"@ | Set-Content -Path $envFile -Encoding UTF8
  Write-Host "Создан файл .env" -ForegroundColor Green
} else {
  Write-Host ".env уже есть — не трогаю." -ForegroundColor DarkGray
}

Write-Host "Ставлю зависимости (npm install)..."
Push-Location $Target
try {
  npm install
} finally {
  Pop-Location
}

Remove-Item -Recurse -Force $Temp -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Готово!" -ForegroundColor Green
Write-Host "Папка: $Target"
Write-Host "Запуск: дважды кликни start.bat внутри папки."
Write-Host ""
explorer.exe $Target
pause
