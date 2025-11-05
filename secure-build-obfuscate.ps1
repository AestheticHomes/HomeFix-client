<#
.SYNOPSIS
  Build Next app and obfuscate browser JS output in .next/static.

.USAGE
  PS D:\HomeFix Repo\HomeFix-Client> ./secure-build-obfuscate.ps1
#>

param(
  [string]$NextBuildCmd = "npm run build",
  [string]$ObfuscatorOptions = "--compact true --control-flow-flattening true --dead-code-injection true --string-array true --string-array-encoding rc4 --string-array-threshold 1 --disable-console-output true"
)

function Run-Command($cmd) {
  Write-Host "→ $cmd" -ForegroundColor Cyan
  $proc = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -Command $cmd" -NoNewWindow -Wait -PassThru
  if ($proc.ExitCode -ne 0) {
    throw "Command failed with exit code $($proc.ExitCode): $cmd"
  }
}

try {
  Write-Host "🔧 Installing javascript-obfuscator (dev dependency)..." -ForegroundColor Yellow
  Run-Command "npm install --save-dev javascript-obfuscator"

  Write-Host "`n🧰 Running Next.js build..." -ForegroundColor Yellow
  Run-Command $NextBuildCmd

  # Backup .next
  if (Test-Path ".next") {
    if (Test-Path ".next.bak") { Remove-Item -Recurse -Force ".next.bak" -ErrorAction SilentlyContinue }
    Write-Host "`n📦 Backing up .next → .next.bak" -ForegroundColor Yellow
    Rename-Item ".next" ".next.bak"
  }

  Write-Host "`n🧰 Regenerating build artifacts (npm run build)..." -ForegroundColor Yellow
  Run-Command $NextBuildCmd

  # Find JS files under .next/static (client bundles)
  $jsFiles = Get-ChildItem -Path ".next\static" -Recurse -Filter *.js -ErrorAction SilentlyContinue
  if (-not $jsFiles) {
    Write-Host "⚠️ No JS files found under .next/static. Skipping obfuscation." -ForegroundColor Red
    exit 0
  }

  Write-Host "`n🔐 Obfuscating JS files under .next/static (this may take a while)..." -ForegroundColor Yellow
  foreach ($f in $jsFiles) {
    $path = $f.FullName
    Write-Host "Obfuscating: $path"
    # Use npx to run the obfuscator CLI for each file
    $cmd = "npx javascript-obfuscator `"$path`" --output `"$path`" $ObfuscatorOptions"
    Run-Command $cmd
  }

  Write-Host "`n✅ Obfuscation complete. .next has been updated (original backed up at .next.bak)." -ForegroundColor Green
  Write-Host "⚠️ Test the build locally before deploying to production." -ForegroundColor Yellow
} catch {
  Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
  if (Test-Path ".next.bak") {
    Write-Host "Restoring backup .next.bak → .next" -ForegroundColor Yellow
    if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue }
    Rename-Item ".next.bak" ".next"
  }
  throw
}
