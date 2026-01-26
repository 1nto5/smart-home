# Smart Home Health Check Script
# Run every 5 minutes via Windows Task Scheduler

$projectDir = "C:\SmartHome"
$logFile = "$projectDir\logs\health.log"
$envFile = "$projectDir\.env"

# Load env vars
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}

$telegramBotToken = $env:TELEGRAM_BOT_TOKEN
$telegramChatId = $env:TELEGRAM_CHAT_ID

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -Append $logFile
}

function Send-TelegramAlert($message) {
    if (-not $telegramBotToken -or -not $telegramChatId) { return }
    try {
        $uri = "https://api.telegram.org/bot$telegramBotToken/sendMessage"
        $body = @{ chat_id = $telegramChatId; text = "[SmartHome] $message"; parse_mode = "HTML" }
        Invoke-RestMethod -Uri $uri -Method Post -Body $body -TimeoutSec 10 | Out-Null
    } catch {
        Write-Log "Failed to send Telegram alert: $_"
    }
}

function Check-Endpoint($name, $url) {
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 10
        Write-Log "$name OK"
        return $true
    } catch {
        Write-Log "$name DOWN - $_"
        return $false
    }
}

function Restart-SmartHomeService($serviceName) {
    try {
        nssm restart $serviceName
        Write-Log "Restarted $serviceName"
        return $true
    } catch {
        Write-Log "Failed to restart $serviceName - $_"
        return $false
    }
}

# Check Windows services
$services = @(
    @{Name="SmartHome-Backend"; Url="http://localhost:3001/api/health"},
    @{Name="SmartHome-Roborock"; Url="http://localhost:3002/status"}
)

foreach ($svc in $services) {
    # Check if service is running
    $serviceStatus = (Get-Service $svc.Name -ErrorAction SilentlyContinue).Status
    if ($serviceStatus -ne "Running") {
        Write-Log "$($svc.Name) Windows service not running: $serviceStatus"
        Send-TelegramAlert "$($svc.Name) service is $serviceStatus"
        Restart-SmartHomeService $svc.Name
        continue
    }

    # Check HTTP endpoint
    $endpointOk = Check-Endpoint $svc.Name $svc.Url
    if (-not $endpointOk) {
        Send-TelegramAlert "$($svc.Name) endpoint not responding - restarting"
        Restart-SmartHomeService $svc.Name
    }
}

# Check frontend service
$frontendStatus = (Get-Service "SmartHome-Frontend" -ErrorAction SilentlyContinue).Status
if ($frontendStatus -ne "Running") {
    Write-Log "SmartHome-Frontend not running: $frontendStatus"
    Send-TelegramAlert "Frontend service is $frontendStatus"
    Restart-SmartHomeService "SmartHome-Frontend"
} else {
    Write-Log "SmartHome-Frontend OK"
}
