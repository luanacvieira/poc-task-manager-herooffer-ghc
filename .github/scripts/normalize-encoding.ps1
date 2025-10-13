Param(
  [string]$Path = ".github/workflows/orchestrator.yml"
)

if (-not (Test-Path $Path)) {
  Write-Error "File not found: $Path"; exit 1
}

# Read raw bytes
[byte[]]$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $Path))

# Detect BOM/encoding heuristically
$useUtf16 = $false
if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) { $useUtf16 = $true }
elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) { $useUtf16 = $true }

if ($useUtf16) {
  Write-Host "Detected UTF-16 BOM. Converting to UTF-8 (no BOM)."
  $text = [System.Text.Encoding]::Unicode.GetString($bytes)
} else {
  # Treat as UTF-8 (with or without BOM) fallback
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Host "Detected UTF-8 BOM. Removing BOM."; $text = [System.Text.Encoding]::UTF8.GetString($bytes,3,$bytes.Length-3)
  } else {
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $Path), $text, $utf8NoBom)

# Verify
$first = Get-Content -Encoding Byte -TotalCount 8 $Path
Write-Host "First bytes now: $($first -join ' ')"
if ($first.Length -ge 2 -and $first[0] -eq 0xFF -and $first[1] -eq 0xFE) { Write-Warning "Still appears UTF-16" } else { Write-Host "Normalization complete." }
