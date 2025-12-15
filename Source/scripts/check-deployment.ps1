# Quick Amplify Deployment Status Checker
# Run this to check your latest deployment status

$APP_ID = "d33feletv96fod"
$BRANCH = "main"
$REGION = "us-east-1"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Amplify Deployment Status" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get latest job
$job = aws amplify list-jobs --app-id $APP_ID --branch-name $BRANCH --region $REGION --max-results 1 | ConvertFrom-Json

if ($job.jobSummaries.Count -gt 0) {
    $latestJob = $job.jobSummaries[0]
    
    Write-Host "Job ID: " -NoNewline
    Write-Host $latestJob.jobId -ForegroundColor Yellow
    
    Write-Host "Status: " -NoNewline
    switch ($latestJob.status) {
        "RUNNING" { Write-Host $latestJob.status -ForegroundColor Yellow }
        "SUCCEED" { Write-Host $latestJob.status -ForegroundColor Green }
        "FAILED" { Write-Host $latestJob.status -ForegroundColor Red }
        default { Write-Host $latestJob.status -ForegroundColor White }
    }
    
    Write-Host "Commit: " -NoNewline
    Write-Host $latestJob.commitMessage -ForegroundColor White
    
    Write-Host "Commit ID: " -NoNewline
    Write-Host $latestJob.commitId.Substring(0, 7) -ForegroundColor Gray
    
    Write-Host "Start Time: " -NoNewline
    Write-Host $latestJob.startTime -ForegroundColor White
    
    Write-Host "`nApp URL: " -NoNewline
    Write-Host "https://d33feletv96fod.amplifyapp.com" -ForegroundColor Cyan
    
    Write-Host "Console: " -NoNewline
    Write-Host "https://console.aws.amazon.com/amplify/home?region=us-east-1#/d33feletv96fod" -ForegroundColor Cyan
    
    if ($latestJob.status -eq "RUNNING") {
        Write-Host "`n⏳ Build is in progress..." -ForegroundColor Yellow
        Write-Host "Run this script again to check status" -ForegroundColor Gray
    } elseif ($latestJob.status -eq "SUCCEED") {
        Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
        Write-Host "Your app is live at: https://d33feletv96fod.amplifyapp.com" -ForegroundColor Green
    } elseif ($latestJob.status -eq "FAILED") {
        Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
        Write-Host "Check the console for error details" -ForegroundColor Red
    }
} else {
    Write-Host "No jobs found" -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
