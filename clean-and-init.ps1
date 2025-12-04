# Clean and Initialize Amplify
Write-Host "Cleaning up partial Amplify configuration..." -ForegroundColor Yellow

# Backup current config
if (Test-Path "amplify") {
    Write-Host "Backing up amplify folder..." -ForegroundColor Gray
    if (Test-Path "amplify-backup") {
        Remove-Item "amplify-backup" -Recurse -Force
    }
    Copy-Item "amplify" "amplify-backup" -Recurse
    Write-Host "Backup created at: amplify-backup" -ForegroundColor Green
}

# Remove problematic files
Write-Host "Removing incomplete configuration..." -ForegroundColor Gray
if (Test-Path "amplify\#current-cloud-backend") {
    Remove-Item "amplify\#current-cloud-backend" -Recurse -Force
}
if (Test-Path "amplify\backend\amplify-meta.json") {
    Remove-Item "amplify\backend\amplify-meta.json" -Force
}
if (Test-Path "amplify\.config\local-aws-info.json") {
    Remove-Item "amplify\.config\local-aws-info.json" -Force
}

Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now initializing fresh Amplify project..." -ForegroundColor Cyan
Write-Host ""

amplify init
