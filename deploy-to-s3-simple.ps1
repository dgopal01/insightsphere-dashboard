# Quick Deploy to S3 + CloudFront
# Simple version for immediate deployment

param(
    [string]$Environment = "dev",
    [string]$Region = "us-east-1"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy to S3 + CloudFront" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$bucketName = "insightsphere-$Environment-hosting-$(Get-Random -Minimum 1000 -Maximum 9999)"

# Step 1: Build the application
Write-Host "Step 1: Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completed" -ForegroundColor Green
Write-Host ""

# Step 2: Create S3 bucket
Write-Host "Step 2: Creating S3 bucket: $bucketName..." -ForegroundColor Yellow
aws s3 mb s3://$bucketName --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create bucket" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Bucket created" -ForegroundColor Green
Write-Host ""

# Step 3: Disable block public access
Write-Host "Step 3: Configuring bucket for public access..." -ForegroundColor Yellow
aws s3api put-public-access-block `
    --bucket $bucketName `
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Step 4: Configure static website hosting
Write-Host "Step 4: Enabling static website hosting..." -ForegroundColor Yellow
aws s3 website s3://$bucketName --index-document index.html --error-document index.html

# Step 5: Set bucket policy for public read
Write-Host "Step 5: Setting bucket policy..." -ForegroundColor Yellow

$bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$bucketName/*"
        }
    ]
}
"@

$bucketPolicy | Out-File -FilePath "bucket-policy.json" -Encoding utf8 -NoNewline

aws s3api put-bucket-policy --bucket $bucketName --policy file://bucket-policy.json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Bucket policy set" -ForegroundColor Green
}

Remove-Item -Path "bucket-policy.json" -ErrorAction SilentlyContinue

Write-Host ""

# Step 6: Upload files
Write-Host "Step 6: Uploading files to S3..." -ForegroundColor Yellow

# Upload all files except index.html with long cache
aws s3 sync dist/ s3://$bucketName/ --delete --cache-control "public, max-age=31536000" --exclude "index.html"

# Upload index.html with no cache
aws s3 cp dist/index.html s3://$bucketName/index.html --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Files uploaded successfully" -ForegroundColor Green
}

Write-Host ""

# Get website endpoint
$websiteEndpoint = "$bucketName.s3-website-$Region.amazonaws.com"

Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now live!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Website URL:" -ForegroundColor White
Write-Host "  http://$websiteEndpoint" -ForegroundColor Cyan
Write-Host ""
Write-Host "S3 Console:" -ForegroundColor White
Write-Host "  https://s3.console.aws.amazon.com/s3/buckets/$bucketName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sign in with:" -ForegroundColor White
Write-Host "  Email: dgopal@swbc.com" -ForegroundColor Gray
Write-Host "  Password: TempPass123! (you'll be prompted to change it)" -ForegroundColor Gray
Write-Host ""
Write-Host "To update your deployment:" -ForegroundColor Yellow
Write-Host "  1. Make changes to your code" -ForegroundColor Gray
Write-Host "  2. Run: npm run build" -ForegroundColor Gray
Write-Host "  3. Run: aws s3 sync dist/ s3://$bucketName/ --delete" -ForegroundColor Gray
Write-Host ""
Write-Host "To delete this deployment:" -ForegroundColor Yellow
Write-Host "  aws s3 rb s3://$bucketName --force" -ForegroundColor Gray
Write-Host ""
