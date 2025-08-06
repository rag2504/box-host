# PowerShell script to help with Render deployment

Write-Host "BoxCric Render Deployment Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# 1. Test health check endpoint
Write-Host "\n1. Testing health check endpoint..." -ForegroundColor Yellow
node test-health-check.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Health check failed. Please fix any issues before deploying." -ForegroundColor Red
    exit 1
}

# 2. Verify package.json has engines field
Write-Host "\n2. Verifying package.json configuration..." -ForegroundColor Yellow
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json

if (-not $packageJson.engines -or -not $packageJson.engines.node) {
    Write-Host "Warning: package.json is missing engines.node field. This helps Render use the correct Node.js version." -ForegroundColor Yellow
    $addEngines = Read-Host "Would you like to add Node.js v18.x to package.json? (y/n)"
    
    if ($addEngines -eq "y") {
        # This is a simplified approach - in a real script you'd want to use a JSON parser
        $packageContent = Get-Content -Path "package.json" -Raw
        $packageContent = $packageContent -replace '"name": "boxcric-app",', '"name": "boxcric-app",\n  "engines": {\n    "node": "18.x"\n  },'
        Set-Content -Path "package.json" -Value $packageContent
        Write-Host "Added engines field to package.json" -ForegroundColor Green
    }
}

# 3. Check for render.yaml
Write-Host "\n3. Checking for render.yaml configuration..." -ForegroundColor Yellow
if (Test-Path "render.yaml") {
    Write-Host "render.yaml found. This will help with automatic deployment configuration." -ForegroundColor Green
} else {
    Write-Host "No render.yaml found. You'll need to configure your service manually in the Render dashboard." -ForegroundColor Yellow
    Write-Host "See RENDER_DEPLOYMENT.md for manual configuration instructions." -ForegroundColor Yellow
}

# 4. Deployment checklist
Write-Host "\n4. Deployment Checklist" -ForegroundColor Yellow
Write-Host "   ✓ Ensure all environment variables are set in Render dashboard" -ForegroundColor White
Write-Host "   ✓ Configure health check path to /api/health" -ForegroundColor White
Write-Host "   ✓ Set NODE_ENV to production" -ForegroundColor White
Write-Host "   ✓ Verify MongoDB connection string is correct" -ForegroundColor White
Write-Host "   ✓ Set FRONTEND_URL to https://boxcric.netlify.app" -ForegroundColor White

Write-Host "\nDeployment preparation complete!" -ForegroundColor Green
Write-Host "Follow the instructions in RENDER_DEPLOYMENT.md to complete the deployment." -ForegroundColor Cyan