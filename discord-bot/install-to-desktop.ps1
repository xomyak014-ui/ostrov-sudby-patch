# Создаёт папку бота на рабочем столе Windows.
$ErrorActionPreference = 'Stop'
$Branch = 'cursor/discord-ticket-bot-2a81'
$RepoZip = "https://codeload.github.com/xomyak014-ui/ostrov-sudby-patch/zip/refs/heads/$Branch"
$Desktop = [Environment]::GetFolderPath('Desktop')
$Target = Join-Path $Desktop 'Остров-Судьбы-Бот'
$Temp = Join-Path $env:TEMP ("ostrov-bot-" + [guid]::NewGuid().ToString())
$ZipPath = Join-Path $Temp 'repo.zip'

Write-Host ""
Write-Host "=== Остров Судьбы — установка на рабочий стол ===" -ForegroundColor Cyan
Write-Host "Папка: $Target"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js не найден. Скачай LTS: https://nodejs.org/" -ForegroundColor Yellow
  Write-Host "После установки запусти этот скрипт снова."
  if ($Host.Name -eq 'ConsoleHost') { pause }
  exit 1
}

New-Item -ItemType Directory -Force -Path $Temp | Out-Null
Write-Host "Скачиваю файлы бота с GitHub..."
Invoke-WebRequest -Uri $RepoZip -OutFile $ZipPath -UseBasicParsing
Write-Host "Распаковываю..."
Expand-Archive -Path $ZipPath -DestinationPath $Temp -Force

$extracted = Get-ChildItem -Path $Temp -Directory | Where-Object { $_.Name -like 'ostrov-sudby-patch-*' } | Select-Object -First 1
$source = Join-Path $extracted.FullName 'discord-bot'
if (-not (Test-Path $source)) { throw "Папка discord-bot не найдена в архиве" }

if (Test-Path $Target) {
  Write-Host "Папка уже есть — обновляю файлы..."
  Get-ChildItem -Path $source -Force | ForEach-Object {
    if ($_.Name -in @('node_modules', '.env', 'logs', 'data')) { return }
    Copy-Item -Path $_.FullName -Destination (Join-Path $Target $_.Name) -Recurse -Force
  }
} else {
  New-Item -ItemType Directory -Force -Path $Target | Out-Null
  Copy-Item -Path (Join-Path $source '*') -Destination $Target -Recurse -Force
}

$envFile = Join-Path $Target '.env'
if (-not (Test-Path $envFile)) {
  $token = Read-Host 'Вставь Discord-токен бота'
  @"
DISCORD_TOKEN=$token
TICKET_CHANNEL_ID=1514901109322547240
TICKET_CATEGORY_ID=1514901003776819241
TICKET_PREFIX=ticket
"@ | Set-Content -Path $envFile -Encoding UTF8
  Write-Host "Создан .env" -ForegroundColor Green
} else {
  # ensure category id present
  $content = Get-Content $envFile -Raw
  if ($content -notmatch 'TICKET_CATEGORY_ID=') {
    Add-Content $envFile "`nTICKET_CATEGORY_ID=1514901003776819241"
  }
  Write-Host ".env уже есть — не трогаю токен." -ForegroundColor DarkGray
}

Write-Host "Ставлю зависимости (npm install)..."
Push-Location $Target
try { npm install } finally { Pop-Location }

Remove-Item -Recurse -Force $Temp -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "Готово! Папка: $Target" -ForegroundColor Green
Write-Host "Запуск: start.bat"
explorer.exe $Target
if ($Host.Name -eq 'ConsoleHost') { pause }
