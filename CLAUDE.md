- Always use a local connection to my devices rather than a cloud-based one.

## Deployment

Server: Windows at `10.10.10.10`, SSH user `Administrator`, password in `$SSH_PASS_WYSE` env var.

Services (nssm): `SmartHome-Backend` (port 3001), `SmartHome-Frontend` (port 80), `SmartHome-Roborock` (port 3002).

Deploy steps:
```bash
# 1. Push to GitHub
git push origin main

# 2. Pull on server
sshpass -p "$SSH_PASS_WYSE" ssh -o StrictHostKeyChecking=no Administrator@10.10.10.10 'cd C:\SmartHome && git pull origin main'

# 3. Restart affected service (e.g. backend-only)
sshpass -p "$SSH_PASS_WYSE" ssh -o StrictHostKeyChecking=no Administrator@10.10.10.10 'nssm restart SmartHome-Backend'

# 4. Health check (wait ~5s for startup)
sshpass -p "$SSH_PASS_WYSE" ssh -o StrictHostKeyChecking=no Administrator@10.10.10.10 'curl -s http://localhost:3001/api/health'
```

Full deploy script: `scripts/deploy.ps1` (run on server, does git pull + dependency install + restart all services).

Frontend is static (SvelteKit adapter-static) - requires `bun run build` in `frontend/` after changes, then restart `SmartHome-Frontend`.
