# Smart Home - Deployment

## Server

- **Host:** 10.10.10.10 (Windows + WSL Ubuntu)
- **SSH:** `sshpass -p '@dria^522' ssh administrator@10.10.10.10 'wsl -e bash -c "COMMAND"'`
- **Location:** `~/smart-home/`

## Services

| Service | Port | Tech | Systemd |
|---------|------|------|---------|
| Nginx | 80 | reverse proxy | `nginx` |
| Backend | 3001 | Bun + Hono | `smart-home-backend` |
| Roborock | 3002 | Python + FastAPI | `smart-home-roborock` |

## Updating the App

```bash
cd ~/smart-home
git pull origin main

# Restart backend (new DB tables auto-created on startup):
sudo systemctl restart smart-home-backend
```

Note: Frontend dist is pre-built and committed - no build needed on server.

## Service Management

```bash
# Status
systemctl status smart-home-backend smart-home-roborock nginx

# Restart
sudo systemctl restart smart-home-backend smart-home-roborock

# Logs
journalctl -u smart-home-backend -f
journalctl -u smart-home-roborock -f
```

## Troubleshooting

### API not responding
```bash
sudo systemctl restart smart-home-backend
journalctl -u smart-home-backend -n 50
```

### Roborock offline
Check if bridge works:
```bash
curl http://localhost:3002/status
```
If not - restart: `sudo systemctl restart smart-home-roborock`

### Frontend 500/403
```bash
chmod 755 /home/adrian
chmod -R 755 /home/adrian/smart-home/frontend/dist
sudo systemctl restart nginx
```

### Database empty
Before copying from backup:
```bash
sqlite3 smart-home.db "PRAGMA wal_checkpoint(TRUNCATE);"
```

### Port forwarding broken (after WSL restart)
WSL IP may change:
```powershell
wsl hostname -I  # check new IP
netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=<NEW_IP>
```

## Config Files

| File | Description |
|------|-------------|
| `~/smart-home/.env` | Credentials (Tuya, Roborock) |
| `/etc/nginx/sites-available/smart-home` | Nginx config |
| `/etc/systemd/system/smart-home-backend.service` | Backend service |
| `/etc/systemd/system/smart-home-roborock.service` | Roborock service |

## Required .env Variables (WSL)

```
DB_PATH=../data/smart-home.db
ROBOROCK_BRIDGE_URL=http://localhost:3002
```
