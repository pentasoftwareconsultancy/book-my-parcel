# GitHub Actions Secrets — BMP Monorepo

All secrets are set at: **GitHub → Settings → Secrets and variables → Actions**

Since this is a monorepo (`pentasoftwareconsultancy/book-my-parcel`), all secrets
are set once at the repository level and shared by both backend and frontend workflows.

---

## VPS SSH Secrets (required for all deploy workflows)

| Secret | Value | Notes |
|--------|-------|-------|
| `VPS_HOST` | `<your VPS IP>` | Hostinger KVM 4 IP address |
| `VPS_USER` | `bmp` | The app user created by vps-setup.sh |
| `VPS_SSH_KEY` | `<private key content>` | Full content of `~/.ssh/id_rsa` (private key) |
| `VPS_PORT` | `22` | SSH port (change if you moved SSH to a custom port) |
| `VPS_HEALTH_URL` | `https://api.bookmyparcel.co.in/api/health` | Used by production health check |

**Generate SSH key pair:**
```bash
ssh-keygen -t ed25519 -C "github-actions-bmp" -f ~/.ssh/bmp_deploy
# Add public key to VPS:
ssh-copy-id -i ~/.ssh/bmp_deploy.pub bmp@<VPS_IP>
# Use private key content as VPS_SSH_KEY secret
cat ~/.ssh/bmp_deploy
```

---

## Backend Environment Secrets (injected into .env on VPS)

These are NOT injected by CI/CD — they live in `/var/www/bmp/BMP-Backend/.env` on the VPS.
Set them manually on the VPS after running `vps-setup.sh`.

---

## Frontend Build Secrets (injected at build time by Vite)

| Secret | Production Value | Stage Value | Testing Value |
|--------|-----------------|-------------|---------------|
| `VITE_API_URL_PRODUCTION` | `https://api.bookmyparcel.co.in/api` | — | — |
| `VITE_API_URL_STAGE` | — | `https://api.bookmyparcel.co.in/api` | — |
| `VITE_API_URL_TESTING` | — | — | `http://<VPS_IP>:3000/api` |
| `VITE_WS_URL_PRODUCTION` | `https://api.bookmyparcel.co.in` | — | — |
| `VITE_WS_URL_STAGE` | — | `https://api.bookmyparcel.co.in` | — |
| `VITE_WS_URL_TESTING` | — | — | `http://<VPS_IP>:3000` |
| `VITE_BASE_URL_PRODUCTION` | `https://api.bookmyparcel.co.in` | — | — |
| `VITE_BASE_URL_STAGE` | — | `https://api.bookmyparcel.co.in` | — |
| `VITE_BASE_URL_TESTING` | — | — | `http://<VPS_IP>:3000` |
| `VITE_GEOAPIFY_KEY` | `<your geoapify key>` | same | same |

---

## GitHub Environment Protection Rules

Set these at: **GitHub → Settings → Environments**

### `production` environment
- ✅ Required reviewers: add at least 1 team member
- ✅ Wait timer: 0 minutes (reviewer approval is the gate)
- ✅ Deployment branches: `main` only

### `stage` environment
- ✅ Required reviewers: optional (staging can auto-deploy)
- ✅ Deployment branches: `stage` only

### `testing` environment
- No protection rules needed
- ✅ Deployment branches: `testing` only

---

## Complete Secrets Checklist

```
VPS
  [ ] VPS_HOST
  [ ] VPS_USER
  [ ] VPS_SSH_KEY
  [ ] VPS_PORT
  [ ] VPS_HEALTH_URL

Frontend — Production
  [ ] VITE_API_URL_PRODUCTION
  [ ] VITE_WS_URL_PRODUCTION
  [ ] VITE_BASE_URL_PRODUCTION

Frontend — Stage
  [ ] VITE_API_URL_STAGE
  [ ] VITE_WS_URL_STAGE
  [ ] VITE_BASE_URL_STAGE

Frontend — Testing
  [ ] VITE_API_URL_TESTING
  [ ] VITE_WS_URL_TESTING
  [ ] VITE_BASE_URL_TESTING

Shared
  [ ] VITE_GEOAPIFY_KEY
```
