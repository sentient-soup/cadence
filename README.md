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
2. **ArgoCD Image Updater** (running on the cluster) polls GHCR, detects the new tag, and commits the update into the gitops repo automatically
3. ArgoCD syncs the new deployment

No `GITOPS_TOKEN` secret or gitops-commit step needed in CI — the cluster pulls changes rather than CI pushing them.

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

`GITHUB_TOKEN` is provided automatically by Actions for the GHCR push — no additional secrets needed.

### Kubernetes one-time setup

```bash
# Install ArgoCD Image Updater
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Give Image Updater a GHCR read credential
kubectl create secret generic ghcr-image-updater \
  --from-literal=username=sentient-soup \
  --from-literal=password='<PAT with read:packages scope>' \
  -n argocd

# Register the GHCR registry with Image Updater
kubectl patch configmap argocd-image-updater-config -n argocd --patch='
{"data":{"registries.conf":"registries:\n- name: GitHub Container Registry\n  prefix: ghcr.io\n  api_url: https://ghcr.io\n  credentials: secret:argocd/ghcr-image-updater#username:password\n"}}'

# App namespace, JWT secret, and GHCR pull secret
kubectl create ns cadence

kubectl create secret generic cadence-secrets \
  --from-literal=jwt-secret='<your-jwt-secret>' \
  -n cadence

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

ArgoCD syncs immediately, then Image Updater takes over — every new image pushed to GHCR is detected and deployed automatically.

## Android (future)

The frontend uses HashRouter and `base: './'` so it can be wrapped with Capacitor without any code changes:

```bash
npx cap add android
pnpm build && npx cap sync android
npx cap open android
```
