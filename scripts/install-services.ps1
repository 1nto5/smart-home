# Smart Home - Native Windows Services Installation
# Uses NSSM (Non-Sucking Service Manager) for service management

param(
    [switch]$Uninstall,
    [switch]$SkipDeps,
    [string]$BunPath = "$env:USERPROFILE\.bun\bin\bun.exe",
    [string]$PythonPath = "C:\Python311\python.exe"
)

$ErrorActionPreference = "Stop"
$projectDir = "C:\SmartHome"
$logDir = "$projectDir\logs"
$dataDir = "$projectDir\data"

function Write-Status($message) {
    Write-Host "[*] $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "[+] $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "[!] $message" -ForegroundColor Red
}

# Check NSSM installed
if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) {
    Write-Error "NSSM not found. Install with: winget install nssm"
    exit 1
}

# Stop and remove existing services
Write-Status "Stopping existing services..."
$services = @("SmartHome-Backend", "SmartHome-Roborock", "SmartHome-Frontend")
foreach ($svc in $services) {
    nssm stop $svc 2>$null
    if ($Uninstall) {
        nssm remove $svc confirm 2>$null
    }
}

if ($Uninstall) {
    Write-Success "Services uninstalled"
    exit 0
}

# Create directories
Write-Status "Creating directories..."
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

# Install dependencies
if (-not $SkipDeps) {
    Write-Status "Installing backend dependencies..."
    Set-Location "$projectDir\backend"
    & $BunPath install
    if ($LASTEXITCODE -ne 0) { throw "Backend deps install failed" }

    Write-Status "Installing roborock dependencies..."
    Set-Location "$projectDir\roborock-bridge"
    & $PythonPath -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw "Roborock deps install failed" }

    Write-Status "Building frontend..."
    Set-Location "$projectDir\frontend"
    & $BunPath install
    & $BunPath run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }

    Write-Status "Installing serve..."
    & $BunPath install -g serve
}

# Remove existing services before reinstall
foreach ($svc in $services) {
    nssm remove $svc confirm 2>$null
}

# === Backend Service ===
Write-Status "Installing SmartHome-Backend..."
nssm install SmartHome-Backend $BunPath
nssm set SmartHome-Backend AppParameters "run src/index.ts"
nssm set SmartHome-Backend AppDirectory "$projectDir\backend"
nssm set SmartHome-Backend AppEnvironmentExtra "DB_PATH=$dataDir\smart-home.db"
nssm set SmartHome-Backend AppStdout "$logDir\backend.log"
nssm set SmartHome-Backend AppStderr "$logDir\backend.log"
nssm set SmartHome-Backend AppRotateFiles 1
nssm set SmartHome-Backend AppRotateBytes 10485760
nssm set SmartHome-Backend Start SERVICE_AUTO_START
nssm set SmartHome-Backend AppRestartDelay 5000
nssm set SmartHome-Backend Description "Smart Home Backend API (Bun)"

# === Roborock Service ===
Write-Status "Installing SmartHome-Roborock..."
nssm install SmartHome-Roborock $PythonPath
nssm set SmartHome-Roborock AppParameters "-m uvicorn main:app --host 0.0.0.0 --port 3002"
nssm set SmartHome-Roborock AppDirectory "$projectDir\roborock-bridge"
nssm set SmartHome-Roborock AppStdout "$logDir\roborock.log"
nssm set SmartHome-Roborock AppStderr "$logDir\roborock.log"
nssm set SmartHome-Roborock AppRotateFiles 1
nssm set SmartHome-Roborock AppRotateBytes 10485760
nssm set SmartHome-Roborock Start SERVICE_AUTO_START
nssm set SmartHome-Roborock AppRestartDelay 5000
nssm set SmartHome-Roborock Description "Smart Home Roborock Bridge (Python)"

# === Frontend Service ===
Write-Status "Installing SmartHome-Frontend..."
nssm install SmartHome-Frontend $BunPath
nssm set SmartHome-Frontend AppParameters "x serve $projectDir\frontend\dist -l 80 -s"
nssm set SmartHome-Frontend AppDirectory $projectDir
nssm set SmartHome-Frontend AppStdout "$logDir\frontend.log"
nssm set SmartHome-Frontend AppStderr "$logDir\frontend.log"
nssm set SmartHome-Frontend AppRotateFiles 1
nssm set SmartHome-Frontend Start SERVICE_AUTO_START
nssm set SmartHome-Frontend Description "Smart Home Frontend (Static Server)"

# Start services
Write-Status "Starting services..."
nssm start SmartHome-Backend
Start-Sleep -Seconds 2
nssm start SmartHome-Roborock
Start-Sleep -Seconds 2
nssm start SmartHome-Frontend

# Verify
Write-Status "Verifying services..."
Start-Sleep -Seconds 5

$allOk = $true
foreach ($svc in $services) {
    $status = (Get-Service $svc -ErrorAction SilentlyContinue).Status
    if ($status -eq "Running") {
        Write-Success "$svc is running"
    } else {
        Write-Error "$svc is $status"
        $allOk = $false
    }
}

if ($allOk) {
    Write-Success "All services installed and running"
    Write-Host ""
    Write-Host "Service Management:" -ForegroundColor Yellow
    Write-Host "  Status:  Get-Service SmartHome-*"
    Write-Host "  Start:   nssm start SmartHome-Backend"
    Write-Host "  Stop:    nssm stop SmartHome-Backend"
    Write-Host "  Restart: nssm restart SmartHome-Backend"
    Write-Host "  Logs:    Get-Content $logDir\backend.log -Tail 50 -Wait"
} else {
    Write-Error "Some services failed to start - check logs in $logDir"
    exit 1
}
