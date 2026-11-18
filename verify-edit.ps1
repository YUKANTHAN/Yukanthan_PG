#!/usr/bin/env pwsh
# Quick verification after edits - run this after any code change
# Usage: ./verify-edit.ps1 [file-to-check]

param(
    [string]$File = ""
)

Write-Host "🔍 Verifying..." -ForegroundColor Cyan

# 1. TypeScript check
Write-Host "`n1. TypeScript check..." -ForegroundColor Yellow
$tsc = npm run tsc -- --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ TypeScript OK" -ForegroundColor Green
} else {
    Write-Host "   ✗ TypeScript errors:" -ForegroundColor Red
    $tsc | Select-Object -First 20
    exit 1
}

# 2. ESLint
Write-Host "`n2. ESLint..." -ForegroundColor Yellow
$lint = npm run lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Lint OK" -ForegroundColor Green
} else {
    Write-Host "   ✗ Lint errors:" -ForegroundColor Red
    $lint | Select-Object -First 20
    exit 1
}

# 3. Build
Write-Host "`n3. Build..." -ForegroundColor Yellow
$build = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Build OK" -ForegroundColor Green
} else {
    Write-Host "   ✗ Build failed:" -ForegroundColor Red
    $build | Select-Object -First 30
    exit 1
}

# 4. If file specified, show it
if ($File -and (Test-Path $File)) {
    Write-Host "`n4. File content ($File):" -ForegroundColor Yellow
    Get-Content $File | Select-Object -First 100
}

Write-Host "`n✅ All checks passed!" -ForegroundColor Green