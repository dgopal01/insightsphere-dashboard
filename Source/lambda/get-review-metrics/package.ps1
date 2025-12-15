# PowerShell script to package Lambda function for deployment

Write-Host "Packaging Lambda function..." -ForegroundColor Cyan

# Create a clean package directory
if (Test-Path "package") {
    Remove-Item -Recurse -Force "package"
}
New-Item -ItemType Directory -Path "package" | Out-Null

# Copy function code
Copy-Item "index.py" -Destination "package/"

# Install dependencies (if any beyond boto3 which is provided by Lambda runtime)
# pip install -r requirements.txt -t package/

# Create deployment package
$currentDir = Get-Location
Set-Location "package"

# Remove existing zip if it exists
if (Test-Path "../get-review-metrics.zip") {
    Remove-Item "../get-review-metrics.zip"
}

# Create zip file
Compress-Archive -Path "*" -DestinationPath "../get-review-metrics.zip"

Set-Location $currentDir

Write-Host "Lambda function packaged successfully: get-review-metrics.zip" -ForegroundColor Green
