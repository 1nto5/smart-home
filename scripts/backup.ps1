# Smart Home Database Backup Script
# Run daily at 02:00 via Windows Task Scheduler

$backupDir = "N:\backups\smart-home"
$dbPath = "C:\SmartHome\data\smart-home.db"
$logFile = "C:\SmartHome\logs\backup.log"
$retentionDays = 28

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -Append $logFile
}

# Ensure backup directory exists
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$date = Get-Date -Format "yyyy-MM-dd"
$backupFile = "$backupDir\smart-home_$date.db"

try {
    # Checkpoint WAL to ensure all data is in main DB file
    Write-Log "Checkpointing WAL..."
    docker exec smarthome-backend-1 sqlite3 /app/data/smart-home.db "PRAGMA wal_checkpoint(TRUNCATE);" 2>&1 | Out-Null

    # Copy database
    Write-Log "Copying database to $backupFile..."
    Copy-Item $dbPath $backupFile -Force

    $size = (Get-Item $backupFile).Length / 1MB
    Write-Log "Backup complete: $([math]::Round($size, 2)) MB"

    # Cleanup old backups
    $deleted = 0
    Get-ChildItem "$backupDir\smart-home_*.db" | Where-Object {
        $_.LastWriteTime -lt (Get-Date).AddDays(-$retentionDays)
    } | ForEach-Object {
        Remove-Item $_.FullName -Force
        $deleted++
    }

    if ($deleted -gt 0) {
        Write-Log "Cleaned up $deleted old backups (retention: $retentionDays days)"
    }

} catch {
    Write-Log "Backup FAILED: $_"
    exit 1
}
