# Fix Render Deployment PowerShell Script
# This script helps diagnose and fix issues with Render deployments

# Function to display a section header
function Write-SectionHeader {
    param (
        [string]$Title
    )
    Write-Host ""
    Write-Host "===== $Title =====" -ForegroundColor Cyan
    Write-Host ""
}

# Function to check server binding configuration
function Check-ServerBinding {
    Write-SectionHeader "Checking Server Binding Configuration"
    
    $serverPath = "./server/index.js"
    if (-not (Test-Path $serverPath)) {
        Write-Host "❌ server/index.js not found!" -ForegroundColor Red
        return $false
    }
    
    $serverContent = Get-Content $serverPath -Raw
    
    # Check for HOST configuration
    if ($serverContent -match "const\s+HOST\s*=\s*process\.env\.RENDER\s*\?\s*['|\"]0\.0\.0\.0['|\"]\s*:\s*\(process\.env\.NODE_ENV\s*===\s*['|\"]production['|\"]\s*\?\s*['|\"]0\.0\.0\.0['|\"]\s*:\s*['|\"]localhost['|\"]\);") {
        Write-Host "✅ Server is correctly configured to use 0.0.0.0 on Render" -ForegroundColor Green
        return $true
    } elseif ($serverContent -match "const\s+HOST\s*=\s*process\.env\.NODE_ENV\s*===\s*['|\"]production['|\"]\s*\?\s*['|\"]0\.0\.0\.0['|\"]\s*:\s*['|\"]localhost['|\"];") {
        Write-Host "⚠️ Server is configured to use 0.0.0.0 in production, but not specifically for Render" -ForegroundColor Yellow
        
        $updateBinding = Read-Host "Do you want to update the server to always use 0.0.0.0 on Render? (y/n)"
        if ($updateBinding -eq "y") {
            $newServerContent = $serverContent -replace "const\s+HOST\s*=\s*process\.env\.NODE_ENV\s*===\s*['|\"]production['|\"]\s*\?\s*['|\"]0\.0\.0\.0['|\"]\s*:\s*['|\"]localhost['|\"];", "// Always use 0.0.0.0 on Render or in production to accept connections from any IP`nconst HOST = process.env.RENDER ? '0.0.0.0' : (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');"
            
            Set-Content -Path $serverPath -Value $newServerContent
            Write-Host "✅ Updated server to always use 0.0.0.0 on Render" -ForegroundColor Green
            return $true
        }
        return $false
    } else {
        Write-Host "❌ Server binding configuration not found or in unexpected format" -ForegroundColor Red
        return $false
    }
}

# Function to add debug logs to server
function Add-DebugLogs {
    Write-SectionHeader "Adding Debug Logs to Server"
    
    $serverPath = "./server/index.js"
    if (-not (Test-Path $serverPath)) {
        Write-Host "❌ server/index.js not found!" -ForegroundColor Red
        return $false
    }
    
    $serverContent = Get-Content $serverPath -Raw
    
    # Check if debug logs already exist
    if ($serverContent -match "console\.log\(`NODE_ENV: \$\{process\.env\.NODE_ENV\}\`\);") {
        Write-Host "✅ Debug logs already exist in server code" -ForegroundColor Green
        return $true
    }
    
    # Add debug logs after HOST definition
    $newServerContent = $serverContent -replace "(const\s+HOST\s*=.*?;)\s*", "$1`n`n// Debug environment variables`nconsole.log('Environment Variables:');`nconsole.log(\`NODE_ENV: \${process.env.NODE_ENV}\`);`nconsole.log(\`RENDER: \${process.env.RENDER ? 'true' : 'undefined'}\`);`nconsole.log(\`HOST: \${HOST}\`);`nconsole.log(\`PORT: \${PORT}\`);`n`n"
    
    Set-Content -Path $serverPath -Value $newServerContent
    Write-Host "✅ Added debug logs to server code" -ForegroundColor Green
    return $true
}

# Function to check render.yaml configuration
function Check-RenderYaml {
    Write-SectionHeader "Checking render.yaml Configuration"
    
    if (-not (Test-Path "./render.yaml")) {
        Write-Host "❌ render.yaml not found!" -ForegroundColor Red
        return $false
    }
    
    $renderYaml = Get-Content "./render.yaml" -Raw
    
    # Check for NODE_ENV configuration
    if ($renderYaml -match "- key: NODE_ENV\s+value: production") {
        Write-Host "✅ NODE_ENV is correctly set to production in render.yaml" -ForegroundColor Green
    } else {
        Write-Host "❌ NODE_ENV is not set to production in render.yaml" -ForegroundColor Red
        return $false
    }
    
    # Check for PORT configuration
    if ($renderYaml -match "- key: PORT\s+value: (\d+)") {
        $portValue = $matches[1]
        Write-Host "✅ PORT is set to $portValue in render.yaml" -ForegroundColor Green
        
        # Check if PORT matches server default
        $serverPath = "./server/index.js"
        if (Test-Path $serverPath) {
            $serverContent = Get-Content $serverPath -Raw
            if ($serverContent -match "const\s+PORT\s*=\s*process\.env\.PORT\s*\|\|\s*(\d+);") {
                $serverPort = $matches[1]
                if ($portValue -ne $serverPort) {
                    Write-Host "⚠️ PORT mismatch: render.yaml ($portValue) vs server default ($serverPort)" -ForegroundColor Yellow
                    
                    $updatePort = Read-Host "Do you want to update the PORT in render.yaml to match the server default? (y/n)"
                    if ($updatePort -eq "y") {
                        $newRenderYaml = $renderYaml -replace "- key: PORT\s+value: $portValue", "      - key: PORT`n        value: $serverPort"
                        Set-Content -Path "./render.yaml" -Value $newRenderYaml
                        Write-Host "✅ Updated PORT in render.yaml to $serverPort" -ForegroundColor Green
                    }
                }
            }
        }
    } else {
        Write-Host "❌ PORT is not configured in render.yaml" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Function to test server locally with Render environment
function Test-RenderEnvironment {
    Write-SectionHeader "Testing Server with Render Environment"
    
    $testScript = "./test-render-environment.js"
    if (-not (Test-Path $testScript)) {
        Write-Host "❌ test-render-environment.js not found!" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Starting server with Render environment variables..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server when you're done testing" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        node $testScript
        return $true
    } catch {
        Write-Host "❌ Error running test script: $_" -ForegroundColor Red
        return $false
    }
}

# Function to show deployment checklist
function Show-DeploymentChecklist {
    Write-SectionHeader "Deployment Checklist"
    
    Write-Host "Before deploying to Render, make sure you have:" -ForegroundColor White
    Write-Host "1. ✓ Updated server to bind to 0.0.0.0 on Render" -ForegroundColor Cyan
    Write-Host "2. ✓ Added debug logs to help troubleshoot environment variables" -ForegroundColor Cyan
    Write-Host "3. ✓ Verified render.yaml has correct NODE_ENV and PORT settings" -ForegroundColor Cyan
    Write-Host "4. ✓ Tested the server locally with Render environment variables" -ForegroundColor Cyan
    Write-Host "5. ✓ Committed and pushed all changes to your repository" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "After deploying to Render:" -ForegroundColor White
    Write-Host "1. Monitor the deployment logs for any errors" -ForegroundColor Cyan
    Write-Host "2. Check if the server is binding to 0.0.0.0 instead of localhost" -ForegroundColor Cyan
    Write-Host "3. Verify the health check endpoint is accessible" -ForegroundColor Cyan
    Write-Host "4. Run the check-render-deployment.js script to verify deployment" -ForegroundColor Cyan
}

# Main function
function Main {
    Write-Host "🚀 BoxCric Render Deployment Fix Script" -ForegroundColor Magenta
    Write-Host "This script will help you fix issues with your Render deployment" -ForegroundColor White
    Write-Host ""
    
    $serverBindingOk = Check-ServerBinding
    Add-DebugLogs
    $renderYamlOk = Check-RenderYaml
    
    $testServer = Read-Host "Do you want to test the server locally with Render environment variables? (y/n)"
    if ($testServer -eq "y") {
        Test-RenderEnvironment
    }
    
    Show-DeploymentChecklist
    
    Write-Host ""
    Write-Host "🎉 Your application should now be ready for deployment to Render!" -ForegroundColor Green
    Write-Host "Go to your Render dashboard and trigger a new deployment" -ForegroundColor Green
    Write-Host "After deploying, run 'node check-render-deployment.js' to verify the deployment" -ForegroundColor Green
}

# Run the main function
Main