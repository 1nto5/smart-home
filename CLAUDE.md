- Always use a local connection to my devices rather than a cloud-based one.

## After completing work

1. Build frontend if changed: `cd frontend && bun run build`
2. Commit and push changes to GitHub
3. Deploy to server (see DEPLOYMENT.md for SSH command):
   - `git pull origin main`
   - Restart affected services (backend, roborock)
