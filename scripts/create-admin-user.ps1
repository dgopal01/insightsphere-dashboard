# Create Admin User Script
# This script creates an admin user in Cognito after deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$Username = 'admin',
    
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$false)]
    [string]$Password = 'TempPass123!',
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = 'dev',
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-east-1'
)

$ErrorActionPreference = "Stop"

Write-Host "Creating admin user in Cognito..." -ForegroundColor Cyan
Write-Host ""

# Get stack outputs
$stackName = "insightsphere-$Environment"

try {
    $outputs = aws cloudformation describe-stacks `
        --stack-name $stackName `
        --region $Region `
        --query 'Stacks[0].Outputs' | ConvertFrom-Json
    
    $userPoolId = ($outputs | Where-Object { $_.OutputKey -eq 'UserPoolId' }).OutputValue
    
    if (-not $userPoolId) {
        Write-Host "Error: Could not find User Pool ID in stack outputs" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "User Pool ID: $userPoolId" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "Error: Could not retrieve stack outputs" -ForegroundColor Red
    Write-Host "Make sure the stack '$stackName' exists in region '$Region'" -ForegroundColor Yellow
    exit 1
}

# Create user
Write-Host "Creating user '$Username'..." -ForegroundColor Yellow

try {
    aws cognito-idp admin-create-user `
        --user-pool-id $userPoolId `
        --username $Username `
        --user-attributes Name=email,Value=$Email Name=email_verified,Value=true `
        --temporary-password $Password `
        --message-action SUPPRESS `
        --region $Region | Out-Null
    
    Write-Host "✓ User created successfully" -ForegroundColor Green
    
} catch {
    if ($_.Exception.Message -like "*UsernameExistsException*") {
        Write-Host "⚠ User already exists" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Failed to create user" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

# Add user to admin group
Write-Host "Adding user to admin group..." -ForegroundColor Yellow

try {
    aws cognito-idp admin-add-user-to-group `
        --user-pool-id $userPoolId `
        --username $Username `
        --group-name admin `
        --region $Region | Out-Null
    
    Write-Host "✓ User added to admin group" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Failed to add user to group" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Set permanent password (optional)
Write-Host ""
$setPermanent = Read-Host "Do you want to set a permanent password now? (yes/no)"

if ($setPermanent -eq 'yes') {
    $newPassword = Read-Host "Enter permanent password" -AsSecureString
    $newPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword))
    
    try {
        aws cognito-idp admin-set-user-password `
            --user-pool-id $userPoolId `
            --username $Username `
            --password $newPasswordPlain `
            --permanent `
            --region $Region | Out-Null
        
        Write-Host "✓ Permanent password set" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to set permanent password" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Admin User Created Successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "  Username: $Username" -ForegroundColor White
Write-Host "  Email: $Email" -ForegroundColor White
if ($setPermanent -eq 'yes') {
    Write-Host "  Password: (the one you just set)" -ForegroundColor White
} else {
    Write-Host "  Temporary Password: $Password" -ForegroundColor White
    Write-Host "  (You'll be prompted to change it on first login)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "You can now sign in to the application!" -ForegroundColor Green
Write-Host ""
