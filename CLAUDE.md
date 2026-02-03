- Always use a local connection to my devices rather than a cloud-based one.

## Server (10.10.10.10 Windows)

```
C:\SmartHome\
├── SmartHome-Backend (NSSM) → Bun :3001
├── SmartHome-Roborock (NSSM) → Python/uvicorn :3002
├── SmartHome-Frontend (NSSM) → nginx :80 (proxy /api → :3001)
├── data\smart-home.db (SQLite)
├── logs\ (service logs)
└── .env (Tuya, Roborock, Telegram credentials)
├── Jellyfin (NSSM) → :8096 (DLNA media server)
```

`SSH_PASS_WYSE` configured in `~/.claude/settings.json`

## Jellyfin Media Server

- **URL**: http://10.10.10.10:8096
- **Admin**: admin / marian
- **Data**: `C:\ProgramData\Jellyfin\Server\`
- **Locale**: pl-PL (24-hour time format)

Clients:
- Xbox: Jellyfin app from Microsoft Store
- Mac: Jellyfin Media Player (`brew install --cask jellyfin-media-player`)
- Web: http://10.10.10.10:8096

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

# Service status
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'powershell -Command "Get-Service SmartHome-*"'

# Logs
sshpass -p $SSH_PASS_WYSE ssh Administrator@10.10.10.10 'powershell -Command "Get-Content C:\SmartHome\logs\backend.log -Tail 50"'
```

## Backups

Daily 02:00 → `N:\backups\smart-home\` (28 days retention)

Restore:
```powershell
nssm stop SmartHome-Backend
copy N:\backups\smart-home\smart-home_YYYY-MM-DD.db C:\SmartHome\data\smart-home.db
nssm start SmartHome-Backend
```
