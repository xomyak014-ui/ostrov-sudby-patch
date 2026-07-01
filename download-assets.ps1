$base = "https://clan.fastly.steamstatic.com/images/27012442"
$outDir = Join-Path $PSScriptRoot "assets"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$files = @(
  "4b9fcb6aba253dc2f6bc8074cc0b2e64ac2bc3f8.png",
  "b8813659d25de5af72ba34f12ec5881eced36e37.gif",
  "5357f0ca70d3f046fb6445f6fd1d6f3aa646c661.png",
  "cc736bb40f2a6dc1ea360a50b98e89564dc8d810.gif",
  "7d80306b8f32561584c0c1ca5cb65719bf90d09c.gif",
  "442c16e74b72be4bd78c02ee5f511ac255848b3b.gif",
  "3c71141b98037e2ce12a27e6bc7fa76a05c575b8.png",
  "5bcab67b2f30c66627606eb09290563bd5326206.png",
  "1f5547216a27a21a80798ccb04465396b2aed441.png",
  "482dbd7cb36d6e002fcbec96c9171d3711716d4f.png",
  "941248be33c7eb52ea58f68bbed2874d7c7b53ca.png",
  "d915664220abc6bcbd018c0afe6209b9b1b0b400.png",
  "34f8bfac25bbb5ea3741aea471675e7fe0c81617.png",
  "0a9e94f28f7168a7c152c39eeea5f304f759d98b.png",
  "e74b7def554ac2e5a9dbe9e439b2782916f39a8f.png",
  "2fbf949cbb92a7ea500f1992a719f81c53ed736e.png"
)

foreach ($f in $files) {
  $dest = Join-Path $outDir $f
  if (-not (Test-Path $dest)) {
    curl.exe -fsSL "$base/$f" -o $dest
    Write-Host "Downloaded $f"
  } else {
    Write-Host "Exists $f"
  }
}

Write-Host "Done. Files in $outDir"
