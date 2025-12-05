# Start Local Development Server
# Simple script to run the application locally without AWS deployment

param(
    [Parameter(Mandatory=$false)]
    [switch]$Build
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Metrics Portal - Local Development" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Build if requested
if ($Build) {
    Write-Host "[INFO] Building application..." -ForegroundColor Yellow
    npm run build:dev
    Write-Host "[OK] Build complete" -ForegroundColor Green
    Write-Host ""
}

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found" -ForegroundColor Yellow
    Write-Host "[INFO] Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "[NOTE] You need to configure AWS credentials in .env for full functionality" -ForegroundColor Cyan
    Write-Host ""
}

# Start development server
Write-Host "[INFO] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Cyan
Write-Host "  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev
