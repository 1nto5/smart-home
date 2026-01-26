# Smart Home Database Backup Script
# Run daily at 02:00 via Windows Task Scheduler

$projectDir = "C:\SmartHome"
$backupDir = "N:\backups\smart-home"
$dbPath = "$projectDir\data\smart-home.db"
$logFile = "$projectDir\logs\backup.log"
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
    # Check if DB exists
    if (-not (Test-Path $dbPath)) {
        Write-Log "Database not found at $dbPath"
        exit 1
    }

    # Checkpoint WAL to ensure all data is in main DB file
    Write-Log "Checkpointing WAL..."
    $sqlite = Get-Command sqlite3 -ErrorAction SilentlyContinue
    if ($sqlite) {
        & sqlite3 $dbPath "PRAGMA wal_checkpoint(TRUNCATE);" 2>&1 | Out-Null
    } else {
        Write-Log "sqlite3 not found, skipping WAL checkpoint"
    }

    # Copy database
    Write-Log "Copying database to $backupFile..."
    Copy-Item $dbPath $backupFile -Force

    # Also copy WAL and SHM files if they exist (for safety)
    if (Test-Path "$dbPath-wal") {
        Copy-Item "$dbPath-wal" "$backupFile-wal" -Force
    }
    if (Test-Path "$dbPath-shm") {
        Copy-Item "$dbPath-shm" "$backupFile-shm" -Force
    }

    $size = (Get-Item $backupFile).Length / 1MB
    Write-Log "Backup complete: $([math]::Round($size, 2)) MB"

    # Cleanup old backups
    $deleted = 0
    Get-ChildItem "$backupDir\smart-home_*.db*" | Where-Object {
        $_.LastWriteTime -lt (Get-Date).AddDays(-$retentionDays)
    } | ForEach-Object {
        Remove-Item $_.FullName -Force
        $deleted++
    }

    if ($deleted -gt 0) {
        Write-Log "Cleaned up $deleted old backup files (retention: $retentionDays days)"
    }

} catch {
    Write-Log "Backup FAILED: $_"
    exit 1
}
