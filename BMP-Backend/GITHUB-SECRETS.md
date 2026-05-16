# GitHub Actions Secrets — BMP Monorepo

**Monorepo:** `pentasoftwareconsultancy/book-my-parcel`

All secrets are set in ONE place:
**GitHub → repo → Settings → Secrets and variables → Actions**

Since this is a monorepo, both backend and frontend workflows share the same secrets.
There are no separate repos — ignore any old references to `book-my-parcel-backend`
or `book-my-parcel-frontend`.

---

## Repository-Level Secrets (shared by all workflows)

| Secret | Value | Notes |
|--------|-------|-------|
| `VPS_HOST` | `<your VPS IP>` | Hostinger KVM 4 IP |
| `VPS_USER` | `bmp` | App user created by vps-setup.sh |
| `VPS_SSH_KEY` | `<private key content>` | See "Generate SSH Key" below |
| `VPS_PORT` | `22` | Change if you moved SSH port |
| `VPS_HEALTH_URL` | `https://api.yourdomain.com/api/health` | Production health check URL |
| `VITE_GEOAPIFY_KEY` | `<your geoapify key>` | Same across all environments |

---

## Environment: `production`

Set at: **Settings → Environments → production → Add secret**

Also enable: **Required reviewers** (add at least 1 team member)

| Secret | Value |
|--------|-------|
| `VITE_API_URL_PRODUCTION` | `https://api.yourdomain.com/api` |
| `VITE_WS_URL_PRODUCTION` | `https://api.yourdomain.com` |
| `VITE_BASE_URL_PRODUCTION` | `https://api.yourdomain.com` |

---

## Environment: `stage`

| Secret | Value |
|--------|-------|
| `VITE_API_URL_STAGE` | `https://api.yourdomain.com/api` |
| `VITE_WS_URL_STAGE` | `https://api.yourdomain.com` |
| `VITE_BASE_URL_STAGE` | `https://api.yourdomain.com` |

---

## Environment: `testing`

| Secret | Value |
|--------|-------|
| `VITE_API_URL_TESTING` | `http://<VPS_IP>:3000/api` |
| `VITE_WS_URL_TESTING` | `http://<VPS_IP>:3000` |
| `VITE_BASE_URL_TESTING` | `http://<VPS_IP>:3000` |

---

## How to Generate the Deploy SSH Key

Run this on your **local machine** (not the VPS):

```bash
# Generate a dedicated deploy key
ssh-keygen -t ed25519 -C "github-actions-bmp" -f ~/.ssh/bmp_deploy -N ""

# Copy the PUBLIC key to the VPS
ssh-copy-id -i ~/.ssh/bmp_deploy.pub bmp@<VPS_IP>

# Print the PRIVATE key — paste the full output as the VPS_SSH_KEY secret
cat ~/.ssh/bmp_deploy
```

The private key starts with `-----BEGIN OPENSSH PRIVATE KEY-----`.
Copy the entire content including the header and footer lines.

---

## Complete Checklist

```
Repository secrets (Settings → Secrets → Actions):
  [ ] VPS_HOST
  [ ] VPS_USER
  [ ] VPS_SSH_KEY
  [ ] VPS_PORT
  [ ] VPS_HEALTH_URL
  [ ] VITE_GEOAPIFY_KEY

Environment: production (Settings → Environments → production):
  [ ] Required reviewers: enabled
  [ ] VITE_API_URL_PRODUCTION
  [ ] VITE_WS_URL_PRODUCTION
  [ ] VITE_BASE_URL_PRODUCTION

Environment: stage:
  [ ] VITE_API_URL_STAGE
  [ ] VITE_WS_URL_STAGE
  [ ] VITE_BASE_URL_STAGE

Environment: testing:
  [ ] VITE_API_URL_TESTING
  [ ] VITE_WS_URL_TESTING
  [ ] VITE_BASE_URL_TESTING
```
