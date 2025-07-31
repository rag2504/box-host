# Deploy to Render PowerShell Script
# This script helps prepare and deploy your application to Render

# Function to check if a file exists
function Test-FileExists {
    param (
        [string]$FilePath
    )
    return Test-Path -Path $FilePath
}

# Function to display a section header
function Write-SectionHeader {
    param (
        [string]$Title
    )
    Write-Host ""
    Write-Host "===== $Title ====="
    Write-Host ""
}

# Check render.yaml configuration
function Check-RenderYaml {
    Write-SectionHeader "Checking render.yaml Configuration"
    
    if (-not (Test-FileExists "./render.yaml")) {
        Write-Host "❌ render.yaml not found!" -ForegroundColor Red
        return $false
    }
    
    $renderYaml = Get-Content "./render.yaml" -Raw
    
    # Check for port configuration
    if ($renderYaml -match "PORT" -and $renderYaml -match "value: 10000") {
        Write-Host "⚠️ PORT is set to 10000 in render.yaml, but server code uses process.env.PORT || 3001" -ForegroundColor Yellow
        Write-Host "   This might cause issues if the application is hardcoded to listen on a specific port" -ForegroundColor Yellow
        
        $updatePort = Read-Host "Do you want to update the PORT value to 3001? (y/n)"
        if ($updatePort -eq "y") {
            $renderYaml = $renderYaml -replace "value: 10000", "value: 3001"
            Set-Content -Path "./render.yaml" -Value $renderYaml
            Write-Host "✅ Updated PORT value in render.yaml from 10000 to 3001" -ForegroundColor Green
        }
    }
    
    Write-Host "✅ render.yaml exists and has been checked" -ForegroundColor Green
    return $true
}

# Check package.json for Node.js version
function Check-PackageJson {
    Write-SectionHeader "Checking package.json Configuration"
    
    if (-not (Test-FileExists "./package.json")) {
        Write-Host "❌ package.json not found!" -ForegroundColor Red
        return $false
    }
    
    $packageJson = Get-Content "./package.json" -Raw | ConvertFrom-Json
    
    # Check for engines field
    if (-not $packageJson.engines -or -not $packageJson.engines.node) {
        Write-Host "⚠️ No Node.js version specified in package.json engines field" -ForegroundColor Yellow
        
        $addEngines = Read-Host "Do you want to add Node.js version specification? (y/n)"
        if ($addEngines -eq "y") {
            $nodeVersion = Read-Host "Enter Node.js version to use (e.g., 18.x, 20.x)"
            
            # Read the file as text to preserve formatting
            $packageJsonText = Get-Content "./package.json" -Raw
            
            # Check if engines field exists
            if ($packageJsonText -match '"engines"\s*:\s*{') {
                # Update existing engines field
                $packageJsonText = $packageJsonText -replace '"engines"\s*:\s*{[^}]*}', """engines"": { ""node"": ""$nodeVersion"" }"
            } else {
                # Add engines field after the first property
                $packageJsonText = $packageJsonText -replace '("[^"]+"\s*:\s*"[^"]+",?)', "$1`n  ""engines"": { ""node"": ""$nodeVersion"" },"
            }
            
            Set-Content -Path "./package.json" -Value $packageJsonText
            Write-Host "✅ Added Node.js version $nodeVersion to package.json" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ Node.js version specified in package.json: $($packageJson.engines.node)" -ForegroundColor Green
    }
    
    return $true
}

# Test health check endpoint
function Test-HealthCheck {
    Write-SectionHeader "Testing Health Check Endpoint"
    
    Write-Host "Starting server to test health check endpoint..."
    
    # Start the server in the background
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "server/index.js" -PassThru -NoNewWindow
    
    # Wait for server to start
    Start-Sleep -Seconds 5
    
    # Test health check endpoint
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5
        Write-Host "✅ Health check endpoint is working! Status code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to connect to health check endpoint: $_" -ForegroundColor Red
        Write-Host "Make sure your server is configured to listen on port 3001 and has a /api/health endpoint" -ForegroundColor Yellow
    }
    
    # Stop the server
    Stop-Process -Id $serverProcess.Id -Force
    
    Write-Host "Server stopped"
}

# Deployment checklist
function Show-DeploymentChecklist {
    Write-SectionHeader "Deployment Checklist"
    
    Write-Host "Before deploying to Render, make sure you have:"
    Write-Host "1. ✓ Updated render.yaml with correct PORT value (3001)" -ForegroundColor Cyan
    Write-Host "2. ✓ Specified Node.js version in package.json engines field" -ForegroundColor Cyan
    Write-Host "3. ✓ Configured server to listen on process.env.PORT || 3001" -ForegroundColor Cyan
    Write-Host "4. ✓ Configured server to bind to 0.0.0.0 in production" -ForegroundColor Cyan
    Write-Host "5. ✓ Implemented a health check endpoint at /api/health" -ForegroundColor Cyan
    Write-Host "6. ✓ Set all required environment variables in render.yaml or Render dashboard" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "After deploying to Render:"
    Write-Host "1. Monitor the deployment logs for any errors" -ForegroundColor Cyan
    Write-Host "2. Check if the health check endpoint is accessible" -ForegroundColor Cyan
    Write-Host "3. Verify the application is running correctly" -ForegroundColor Cyan
}

# Main function
function Main {
    Write-Host "🚀 Render Deployment Helper" -ForegroundColor Magenta
    Write-Host "This script will help you prepare your application for deployment to Render"
    
    Check-RenderYaml
    Check-PackageJson
    
    $testHealth = Read-Host "Do you want to test the health check endpoint locally? (y/n)"
    if ($testHealth -eq "y") {
        Test-HealthCheck
    }
    
    Show-DeploymentChecklist
    
    Write-Host ""
    Write-Host "🎉 Your application is now ready for deployment to Render!" -ForegroundColor Green
    Write-Host "Go to your Render dashboard and trigger a new deployment" -ForegroundColor Green
}

# Run the main function
Main