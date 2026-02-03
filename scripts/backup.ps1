# Smart Home Database Backup Script
# Run daily at 02:00 via Windows Task Scheduler
# Single backup - overwrites previous

$projectDir = "C:\SmartHome"
$backupDir = "N:\backups\smart-home"
$dbPath = "$projectDir\data\smart-home.db"
$logFile = "$projectDir\logs\backup.log"
$backupFile = "$backupDir\smart-home.db"

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -Append $logFile
}

# Ensure backup directory exists
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

try {
    # Check if DB exists
    if (-not (Test-Path $dbPath)) {
        Write-Log "Database not found at $dbPath"
        exit 1
    }

    # Checkpoint WAL to ensure all data is in main DB file
    Write-Log "Checkpointing WAL..."
    $sqlite = "C:\Tools\sqlite\sqlite3.exe"
    if (Test-Path $sqlite) {
        & $sqlite $dbPath "PRAGMA wal_checkpoint(TRUNCATE);" 2>&1 | Out-Null
    } else {
        Write-Log "sqlite3 not found at $sqlite, skipping WAL checkpoint"
    }

    # Copy database (overwrites previous backup)
    Write-Log "Copying database to $backupFile..."
    Copy-Item $dbPath $backupFile -Force

    # Also copy WAL and SHM files if they exist
    if (Test-Path "$dbPath-wal") {
        Copy-Item "$dbPath-wal" "$backupFile-wal" -Force
    }
    if (Test-Path "$dbPath-shm") {
        Copy-Item "$dbPath-shm" "$backupFile-shm" -Force
    }

    $size = (Get-Item $backupFile).Length / 1MB
    Write-Log "Backup complete: $([math]::Round($size, 2)) MB"

} catch {
    Write-Log "Backup FAILED: $_"
    exit 1
}
