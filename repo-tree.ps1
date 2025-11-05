# ===============================================================
# 📁 repo-tree-clean.ps1 — Generate a clean HomeFix repo tree
# ===============================================================
# ✅ Excludes: node_modules, .next, .vercel, .git, .turbo, dist, build
# ✅ Includes: only actual project source (app/, components/, public/, etc.)
# ✅ Outputs: repo-tree.txt for easy sharing
# ===============================================================

param(
  [string]$Root = ".",
  [int]$Depth = 5,
  [string]$OutFile = "repo-tree.txt"
)

Write-Host "📦 Scanning repository tree at: $Root ..." -ForegroundColor Cyan

# Define excluded folder names
$ExcludeDirs = @("node_modules", ".next", ".vercel", ".git", ".turbo", "dist", "build")

function Show-Tree($Path, $Indent = "", $Level = 1, $MaxDepth = 5) {
  if ($Level -gt $MaxDepth) { return }

  # Get subfolders excluding the unwanted directories
  $folders = Get-ChildItem -Directory -LiteralPath $Path -ErrorAction SilentlyContinue |
             Where-Object { $ExcludeDirs -notcontains $_.Name } |
             Sort-Object Name

  # Get files
  $files = Get-ChildItem -File -LiteralPath $Path -ErrorAction SilentlyContinue |
           Sort-Object Name

  foreach ($folder in $folders) {
    $itemCount = (Get-ChildItem -LiteralPath $folder.FullName -Force -ErrorAction SilentlyContinue |
                  Where-Object { $ExcludeDirs -notcontains $_.Name } |
                  Measure-Object).Count
    "$Indent📂 $($folder.Name)  ($itemCount items)" | Tee-Object -FilePath $OutFile -Append
    Show-Tree -Path $folder.FullName -Indent ("$Indent   ") -Level ($Level + 1) -MaxDepth $MaxDepth
  }

  foreach ($file in $files) {
    "$Indent📄 $($file.Name)" | Tee-Object -FilePath $OutFile -Append
  }
}

# Clear previous log
if (Test-Path $OutFile) { Remove-Item $OutFile -Force }

Show-Tree -Path $Root -MaxDepth $Depth

Write-Host "`n✅ Clean tree written to: $OutFile" -ForegroundColor Green
Write-Host "   You can now share the contents of $OutFile with Edith for analysis." -ForegroundColor Yellow
