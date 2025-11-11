# ===============================================================
# 📁 repo-tree-clean.ps1 — Accurate HomeFix Repo Tree Generator
# ===============================================================
# ✅ Shows nested structure with precise file counts
# ✅ Excludes build/system directories
# ✅ Outputs both console view (colored) and text log
# ===============================================================

param(
  [string]$Root = ".",
  [int]$Depth = 6,
  [string]$OutFile = "repo-tree.txt"
)

Write-Host "📦 Scanning repository tree at: $Root ..." -ForegroundColor Cyan

# ---------------------------------------------------------------
# 🧱 Excluded directories
# ---------------------------------------------------------------
$ExcludeDirs = @("node_modules", ".next", ".vercel", ".git", ".turbo", "dist", "build")

# ---------------------------------------------------------------
# 🧮 Recursive tree renderer
# ---------------------------------------------------------------
function Show-Tree {
  param(
    [string]$Path,
    [string]$Indent = "",
    [int]$Level = 1,
    [int]$MaxDepth = 6
  )

  if ($Level -gt $MaxDepth) { return }

  # Safely list directories and files
  $dirs = @(Get-ChildItem -Directory -LiteralPath $Path -ErrorAction SilentlyContinue |
             Where-Object { $ExcludeDirs -notcontains $_.Name } |
             Sort-Object Name)

  $files = @(Get-ChildItem -File -LiteralPath $Path -ErrorAction SilentlyContinue |
              Sort-Object Name)

  foreach ($dir in $dirs) {
    $children = @(Get-ChildItem -LiteralPath $dir.FullName -ErrorAction SilentlyContinue |
                   Where-Object { $ExcludeDirs -notcontains $_.Name })
    $itemCount = $children.Count

    $line = "$Indent📂 $($dir.Name)  ($itemCount items)"
    Write-Host $line -ForegroundColor Cyan
    $line | Out-File -FilePath $OutFile -Encoding utf8 -Append

    # Recurse deeper
    Show-Tree -Path $dir.FullName -Indent ("$Indent   ") -Level ($Level + 1) -MaxDepth $MaxDepth
  }

  foreach ($file in $files) {
    $line = "$Indent📄 $($file.Name)"
    Write-Host $line -ForegroundColor Gray
    $line | Out-File -FilePath $OutFile -Encoding utf8 -Append
  }
}

# ---------------------------------------------------------------
# 🧹 Prepare and start scan
# ---------------------------------------------------------------
if (Test-Path $OutFile) {
  Remove-Item $OutFile -Force
}

Write-Host ""
"📍 Root Path: $(Resolve-Path $Root)" | Out-File $OutFile -Encoding utf8 -Append
"📏 Scan Depth: $Depth" | Out-File $OutFile -Encoding utf8 -Append
"🕶️ Excluded: $($ExcludeDirs -join ', ')" | Out-File $OutFile -Encoding utf8 -Append
"" | Out-File $OutFile -Encoding utf8 -Append

Show-Tree -Path $Root -MaxDepth $Depth

# ---------------------------------------------------------------
# ✅ Final summary
# ---------------------------------------------------------------
Write-Host "`n✅ Repository tree written to: $OutFile" -ForegroundColor Green
Write-Host "   You can now open $OutFile or share it with Edith for validation." -ForegroundColor Yellow
