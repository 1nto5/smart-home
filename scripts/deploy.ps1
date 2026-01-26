# Smart Home Deployment Script (Native Windows Services)
# Updates and restarts services

param(
    [switch]$NoPull,
    [switch]$BackendOnly,
    [switch]$RoborockOnly,
    [switch]$FrontendOnly,
    [string]$BunPath = "$env:USERPROFILE\.bun\bin\bun.exe",
    [string]$PythonPath = "C:\Python311\python.exe"
)

$ErrorActionPreference = "Stop"
$projectDir = "C:\SmartHome"
$logFile = "$projectDir\logs\deploy.log"

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $msg = "$timestamp - $message"
    Write-Host $msg
    $msg | Out-File -Append $logFile
}

Set-Location $projectDir

# Pull latest code
if (-not $NoPull) {
    Write-Log "Pulling latest code..."
    git pull origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Git pull failed!"
        exit 1
    }
}

# Determine which services to update
$updateBackend = -not $RoborockOnly -and -not $FrontendOnly
$updateRoborock = -not $BackendOnly -and -not $FrontendOnly
$updateFrontend = -not $BackendOnly -and -not $RoborockOnly

# Update Backend
if ($updateBackend) {
    Write-Log "Stopping SmartHome-Backend..."
    nssm stop SmartHome-Backend 2>$null

    Write-Log "Installing backend dependencies..."
    Set-Location "$projectDir\backend"
    & $BunPath install
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Backend deps install failed!"
        exit 1
    }

    Write-Log "Starting SmartHome-Backend..."
    nssm start SmartHome-Backend
}

# Update Roborock
if ($updateRoborock) {
    Write-Log "Stopping SmartHome-Roborock..."
    nssm stop SmartHome-Roborock 2>$null

    Write-Log "Installing roborock dependencies..."
    Set-Location "$projectDir\roborock-bridge"
    & $PythonPath -m pip install -r requirements.txt --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Roborock deps install failed!"
        exit 1
    }

    Write-Log "Starting SmartHome-Roborock..."
    nssm start SmartHome-Roborock
}

# Update Frontend
if ($updateFrontend) {
    Write-Log "Stopping SmartHome-Frontend..."
    nssm stop SmartHome-Frontend 2>$null

    Write-Log "Building frontend..."
    Set-Location "$projectDir\frontend"
    & $BunPath install
    & $BunPath run build
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Frontend build failed!"
        exit 1
    }

    Write-Log "Starting SmartHome-Frontend..."
    nssm start SmartHome-Frontend
}

# Wait for services to start
Write-Log "Waiting for services..."
Start-Sleep -Seconds 5

# Verify services
Write-Log "Verifying services..."
$services = @()
if ($updateBackend) { $services += "SmartHome-Backend" }
if ($updateRoborock) { $services += "SmartHome-Roborock" }
if ($updateFrontend) { $services += "SmartHome-Frontend" }

$allOk = $true
foreach ($svc in $services) {
    $status = (Get-Service $svc -ErrorAction SilentlyContinue).Status
    if ($status -eq "Running") {
        Write-Log "$svc is running"
    } else {
        Write-Log "WARNING: $svc is $status"
        $allOk = $false
    }
}

# Health check endpoints
if ($updateBackend) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 10
        Write-Log "Backend health: OK"
    } catch {
        Write-Log "WARNING: Backend health check failed - $_"
        $allOk = $false
    }
}

if ($updateRoborock) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3002/status" -TimeoutSec 10
        Write-Log "Roborock health: OK"
    } catch {
        Write-Log "WARNING: Roborock health check failed - $_"
        $allOk = $false
    }
}

Set-Location $projectDir

if ($allOk) {
    Write-Log "Deployment complete!"
} else {
    Write-Log "Deployment complete with warnings"
    exit 1
}

# Show service status
Get-Service SmartHome-* | Format-Table Name, Status
