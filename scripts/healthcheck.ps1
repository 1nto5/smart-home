# Smart Home Health Check Script
# Run every 5 minutes via Windows Task Scheduler

$logFile = "C:\SmartHome\logs\health.log"
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

function Check-Service($name, $url) {
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 10
        Write-Log "$name OK"
        return $true
    } catch {
        Write-Log "$name DOWN - $_"
        return $false
    }
}

# Check services
$backendOk = Check-Service "Backend" "http://localhost:3001/api/health"
$roborockOk = Check-Service "Roborock" "http://localhost:3002/status"

# Alert if any service is down
if (-not $backendOk) {
    Send-TelegramAlert "Backend service is DOWN"
}
if (-not $roborockOk) {
    Send-TelegramAlert "Roborock service is DOWN"
}

# Check Docker containers
$containers = docker compose ps --format json 2>$null | ConvertFrom-Json
if ($containers) {
    foreach ($container in $containers) {
        if ($container.State -ne "running") {
            Write-Log "Container $($container.Name) not running: $($container.State)"
            Send-TelegramAlert "Container $($container.Name) is $($container.State)"
        }
    }
}
