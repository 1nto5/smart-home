# Smart Home Deployment Script
# Updates and restarts all services

param(
    [switch]$NoPull,
    [switch]$NoBuild,
    [switch]$BackendOnly,
    [switch]$RoborockOnly
)

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

# Determine which services to rebuild
$services = @()
if ($BackendOnly) {
    $services = @("backend")
} elseif ($RoborockOnly) {
    $services = @("roborock")
} else {
    $services = @("frontend", "backend", "roborock")
}

# Build containers
if (-not $NoBuild) {
    Write-Log "Building containers: $($services -join ', ')..."
    docker compose build $services
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Build failed!"
        exit 1
    }
}

# Restart services
Write-Log "Restarting services: $($services -join ', ')..."
docker compose up -d $services
if ($LASTEXITCODE -ne 0) {
    Write-Log "Restart failed!"
    exit 1
}

# Wait for health checks
Write-Log "Waiting for services to be healthy..."
Start-Sleep -Seconds 10

# Verify services
$healthy = $true
foreach ($service in $services) {
    $status = docker compose ps $service --format json | ConvertFrom-Json
    if ($status.Health -ne "healthy" -and $status.State -ne "running") {
        Write-Log "WARNING: $service is not healthy: $($status.Health)"
        $healthy = $false
    } else {
        Write-Log "$service is running"
    }
}

if ($healthy) {
    Write-Log "Deployment complete!"
} else {
    Write-Log "Deployment complete with warnings - check service health"
}

# Show container status
docker compose ps
