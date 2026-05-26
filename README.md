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

## Android (future)

The frontend uses HashRouter and `base: './'` so it can be wrapped with Capacitor without any code changes:

```bash
npx cap add android
pnpm build && npx cap sync android
npx cap open android
```
