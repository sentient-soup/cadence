# Cadence

A personal fitness tracking web app — calorie logging, exercise tracking (strength + cardio), daily health metrics, mood tracking, and progress charts.

Built as an offline-first PWA with a self-hosted backend. Runs as a single Docker container.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Backend | Express 5 + better-sqlite3 |
| Auth | JWT + bcrypt |
| Monorepo | pnpm workspaces |
| Sync | Offline-first (localStorage → server) |

## Development

```bash
pnpm install

# Terminal 1 — backend
pnpm dev:server

# Terminal 2 — frontend (proxies /api to :3001)
pnpm dev
```

## Production build

```bash
pnpm build
```

## Docker

```bash
# Set a real secret before running
JWT_SECRET=your-secret docker compose up -d
```

The app listens on port 3000. SQLite data is stored in the `cadence-data` named volume.

## CI/CD — GitHub Actions + GHCR + ArgoCD

Every push to `main` triggers the workflow in `.github/workflows/build.yml`:

1. Builds the Docker image and pushes `ghcr.io/sentient-soup/cadence:{sha}` + `:latest` to GHCR
2. Commits the new SHA tag into `apps/cadence/kustomization.yaml` in the gitops repo
3. ArgoCD detects the commit and syncs the new deployment automatically

### Gitops repo setup

Copy the manifests from `k8s/` into your gitops repo and update the two placeholders:

```bash
mkdir -p apps/cadence
cp k8s/* apps/cadence/
```

| File | Placeholder | Replace with |
|---|---|---|
| `apps/cadence/ingress.yaml` | `cadence.example.com` | Your actual hostname |
| `apps/cadence/argocd-app.yaml` | `sentient-soup/gitops` | Your gitops repo |

### GitHub Actions secret

Add one secret to this repo (Settings → Secrets → Actions):

| Secret | Value |
|---|---|
| `GITOPS_TOKEN` | Fine-grained PAT with **Contents: read+write** on the gitops repo |

`GITHUB_TOKEN` is provided automatically by Actions and is used for the GHCR push — no setup needed.

### Kubernetes one-time setup

```bash
# Create the namespace and JWT secret
kubectl create ns cadence
kubectl create secret generic cadence-secrets \
  --from-literal=jwt-secret='<your-jwt-secret>' \
  -n cadence

# GHCR pull secret (required if the package visibility is private)
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=sentient-soup \
  --docker-password='<PAT with read:packages scope>' \
  -n cadence
```

### Apply the ArgoCD Application

```bash
kubectl apply -f k8s/argocd-app.yaml
```

ArgoCD will immediately sync from the gitops repo and keep itself in sync on every subsequent commit the workflow makes.

## Android (future)

The frontend uses HashRouter and `base: './'` so it can be wrapped with Capacitor without any code changes:

```bash
npx cap add android
pnpm build && npx cap sync android
npx cap open android
```
