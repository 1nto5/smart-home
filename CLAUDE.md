- Always use a local connection to my devices rather than a cloud-based one.

## Server (10.10.10.10 Windows - headless)

Hardware: Intel Pentium J5005 (4C/4T 1.5GHz), 16GB RAM
Disks: C: 465GB (system), M: 11TB, N: 13TB, O: 11TB
Access: SSH or RDP (no autologon - all services run as Windows services)

```
C:\SmartHome\
├── SmartHome-Backend (NSSM) -> Bun :3001
├── SmartHome-Roborock (NSSM) -> Python/uvicorn :3002
├── SmartHome-Frontend (NSSM) -> nginx :80 (proxy /api -> :3001)
├── data\smart-home.db (SQLite)
├── logs\ (service logs for all NSSM services)
└── .env (Tuya, Roborock, Telegram credentials)
```

Other services:
- Chia-Farmer (NSSM) -> daemon + scheduled task "Chia Farmer Start" starts farmer-no-wallet (node :8444, farmer :8447, harvester :8560)
  - DB: `N:\.chia\mainnet\db\` (junction from `C:\Users\Administrator\.chia\mainnet\db`)
  - Backup: `C:\Scripts\chia-db-backup.ps1` -> monthly (every 4 weeks, Sunday 3am) -> `M:\Backups\chia_YYYY-MM-DD.sqlite` (plain copy, stops/starts Chia, retention: 1)
- Serviio (Windows service) -> DLNA :8895, console :23423
- qBittorrent (NSSM) -> WebUI :8080
- Tailscale (Windows service) -> VPN overlay

`SSH_PASS_WYSE` configured in `~/.claude/settings.json`

## Serviio DLNA Server

- **DLNA port**: 8895 (TCP), 1900 (UDP/UPnP discovery)
- **Web console**: http://10.10.10.10:23423/console/
- **Install**: `C:\Program Files\Serviio\`
- **Media folder**: `C:\Users\Administrator\Downloads` (metadata disabled - raw filenames)

Clients:
- Xbox: DLNA (Media Player app, browse network)
- Any DLNA client on LAN

## After completing work

1. Build frontend if changed: `cd frontend && bun run build`
2. Commit and push to GitHub
3. Deploy:

```bash
# Frontend (dist/ gitignored - must rebuild on server)
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'cd C:\SmartHome && git pull origin main && cd frontend && bun run build && cd .. && nssm restart SmartHome-Frontend'

# Backend
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'cd C:\SmartHome && git pull origin main && nssm restart SmartHome-Backend'

# Roborock
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'cd C:\SmartHome && git pull origin main && nssm restart SmartHome-Roborock'
```

## Diagnostics

```bash
# Health
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'curl -s http://localhost:3001/api/health'
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'curl -s http://localhost:3002/status'

# Service status (all NSSM + system services)
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'powershell -Command "Get-Service SmartHome-*,Chia-Farmer,qBittorrent,Serviio"'

# Logs
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'powershell -Command "Get-Content C:\SmartHome\logs\backend.log -Tail 50"'
```

## Backups

- SmartHome DB: Daily 02:00 -> `N:\backups\smart-home\` (28 days retention)
- Chia DB: Monthly (every 4 weeks, Sunday 03:00) -> `M:\Backups\chia_YYYY-MM-DD.sqlite` (plain copy ~212 GB, stops/starts Chia, retention: 1)

Restore:
```powershell
nssm stop SmartHome-Backend
copy N:\backups\smart-home\smart-home_YYYY-MM-DD.db C:\SmartHome\data\smart-home.db
nssm start SmartHome-Backend
```
