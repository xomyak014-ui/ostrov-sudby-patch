# Скопируй в Windows PowerShell:
# irm https://raw.githubusercontent.com/xomyak014-ui/ostrov-sudby-patch/cursor/discord-ticket-bot-2a81/discord-bot/install-to-desktop.ps1 | iex
& ([scriptblock]::Create((Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/xomyak014-ui/ostrov-sudby-patch/cursor/discord-ticket-bot-2a81/discord-bot/install-to-desktop.ps1').Content))
