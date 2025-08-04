# Netlify Deployment Script for Windows
Write-Host "🚀 Starting Netlify deployment preparation..." -ForegroundColor Green

# Step 1: Clean previous build
Write-Host "`n1. Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Cleaned previous build" -ForegroundColor Green
}

# Step 2: Install dependencies
Write-Host "`n2. Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Build the project
Write-Host "`n3. Building the project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 4: Copy public files
Write-Host "`n4. Copying public files..." -ForegroundColor Yellow
if (Test-Path "public") {
    Copy-Item -Path "public\*" -Destination "dist\" -Recurse -Force
    Write-Host "✅ Public files copied" -ForegroundColor Green
} else {
    Write-Host "⚠️ No public folder found" -ForegroundColor Yellow
}

# Step 5: Create _redirects file
Write-Host "`n5. Creating _redirects file..." -ForegroundColor Yellow
$redirectsContent = "/*    /index.html   200"
$redirectsContent | Out-File -FilePath "dist\_redirects" -Encoding UTF8
Write-Host "✅ _redirects file created" -ForegroundColor Green

# Step 6: Create _headers file
Write-Host "`n6. Creating _headers file..." -ForegroundColor Yellow
$headersContent = @"
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable
"@
$headersContent | Out-File -FilePath "dist\_headers" -Encoding UTF8
Write-Host "✅ _headers file created" -ForegroundColor Green

# Step 7: Verify build output
Write-Host "`n7. Verifying build output..." -ForegroundColor Yellow
if (Test-Path "dist") {
    $distContents = Get-ChildItem "dist" -Name
    Write-Host "📁 Files in dist folder: $($distContents -join ', ')" -ForegroundColor Cyan
    
    if (Test-Path "dist\index.html") {
        Write-Host "✅ index.html found" -ForegroundColor Green
    } else {
        Write-Host "❌ index.html missing" -ForegroundColor Red
        exit 1
    }
    
    if (Test-Path "dist\assets") {
        $assetsContents = Get-ChildItem "dist\assets" -Name
        Write-Host "📁 Files in assets folder: $($assetsContents -join ', ')" -ForegroundColor Cyan
        Write-Host "✅ Assets folder found with files" -ForegroundColor Green
    } else {
        Write-Host "❌ Assets folder missing" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ dist folder not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Netlify deployment preparation completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Fix Netlify deployment'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host "`n2. In Netlify dashboard:" -ForegroundColor White
Write-Host "   - Connect your GitHub repository" -ForegroundColor Gray
Write-Host "   - Set build command: npm run build" -ForegroundColor Gray
Write-Host "   - Set publish directory: dist" -ForegroundColor Gray
Write-Host "   - Set environment variable: VITE_API_URL=https://box-host-1.onrender.com/api" -ForegroundColor Gray
Write-Host "`n3. Deploy!" -ForegroundColor White
Write-Host "`n🔗 Your site will be available at: https://boxcric.netlify.app" -ForegroundColor Green 