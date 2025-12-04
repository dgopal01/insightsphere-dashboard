# Quick Deploy to S3 + CloudFront
# This deploys your built app to S3 with CloudFront for immediate testing

param(
    [string]$Environment = "dev",
    [string]$Region = "us-east-1"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy to S3 + CloudFront" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$stackName = "insightsphere-$Environment"
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
Write-Host "Step 2: Creating S3 bucket..." -ForegroundColor Yellow

try {
    aws s3 mb s3://$bucketName --region $Region
    Write-Host "✓ Bucket created: $bucketName" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create bucket" -ForegroundColor Red
    exit 1
}

# Step 3: Configure bucket for static website hosting
Write-Host ""
Write-Host "Step 3: Configuring static website hosting..." -ForegroundColor Yellow

$websiteConfig = @"
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}
"@

$websiteConfig | Out-File -FilePath "website-config.json" -Encoding utf8

aws s3 website s3://$bucketName --index-document index.html --error-document index.html

# Step 4: Set bucket policy for public read
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

$bucketPolicy | Out-File -FilePath "bucket-policy.json" -Encoding utf8

aws s3api put-bucket-policy --bucket $bucketName --policy file://bucket-policy.json

Write-Host "✓ Website hosting configured" -ForegroundColor Green

# Step 5: Upload files
Write-Host ""
Write-Host "Step 4: Uploading files to S3..." -ForegroundColor Yellow

aws s3 sync dist/ s3://$bucketName/ --delete --cache-control "public, max-age=31536000" --exclude "index.html"
aws s3 cp dist/index.html s3://$bucketName/index.html --cache-control "no-cache, no-store, must-revalidate"

Write-Host "✓ Files uploaded" -ForegroundColor Green

# Step 6: Create CloudFront distribution (optional but recommended)
Write-Host ""
Write-Host "Step 5: Creating CloudFront distribution..." -ForegroundColor Yellow
Write-Host "(This step takes 10-15 minutes)" -ForegroundColor Gray

$websiteEndpoint = "$bucketName.s3-website-$Region.amazonaws.com"

$distributionConfig = @"
{
    "CallerReference": "insightsphere-$Environment-$(Get-Date -Format 'yyyyMMddHHmmss')",
    "Comment": "InsightSphere Dashboard - $Environment",
    "Enabled": true,
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$bucketName",
                "DomainName": "$websiteEndpoint",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$bucketName",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"]
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}
"@

$distributionConfig | Out-File -FilePath "distribution-config.json" -Encoding utf8

try {
    $distribution = aws cloudfront create-distribution --distribution-config file://distribution-config.json | ConvertFrom-Json
    $distributionId = $distribution.Distribution.Id
    $distributionDomain = $distribution.Distribution.DomainName
    
    Write-Host "✓ CloudFront distribution created" -ForegroundColor Green
    Write-Host "  Distribution ID: $distributionId" -ForegroundColor Gray
    Write-Host "  Domain: $distributionDomain" -ForegroundColor Gray
} catch {
    Write-Host "⚠ CloudFront creation failed (optional)" -ForegroundColor Yellow
    Write-Host "  You can still access via S3 website endpoint" -ForegroundColor Gray
}

# Cleanup temp files
Remove-Item -Path "website-config.json" -ErrorAction SilentlyContinue
Remove-Item -Path "bucket-policy.json" -ErrorAction SilentlyContinue
Remove-Item -Path "distribution-config.json" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now live!" -ForegroundColor Cyan
Write-Host ""
Write-Host "S3 Website URL:" -ForegroundColor White
Write-Host "  http://$websiteEndpoint" -ForegroundColor Cyan
Write-Host ""

if ($distributionDomain) {
    Write-Host "CloudFront URL (recommended):" -ForegroundColor White
    Write-Host "  https://$distributionDomain" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Note: CloudFront distribution is deploying (10-15 minutes)" -ForegroundColor Yellow
    Write-Host "      Use S3 URL for immediate access" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To update your deployment:" -ForegroundColor White
Write-Host "  1. Make changes to your code" -ForegroundColor Gray
Write-Host "  2. Run: npm run build" -ForegroundColor Gray
Write-Host "  3. Run: aws s3 sync dist/ s3://$bucketName/ --delete" -ForegroundColor Gray

if ($distributionId) {
    Write-Host "  4. Invalidate CloudFront cache:" -ForegroundColor Gray
    Write-Host "     aws cloudfront create-invalidation --distribution-id $distributionId --paths '/*'" -ForegroundColor Gray
}

Write-Host ""
