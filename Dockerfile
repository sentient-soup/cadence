FROM node:20-slim AS builder
WORKDIR /app

# Build tools required to compile better-sqlite3 from source.
# prebuild-install cannot detect libc inside Docker containers, so prebuilt
# binaries are never matched and it always falls back to source compilation.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/server/package.json ./packages/server/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY packages/ ./packages/
RUN pnpm build

# Production image — no pnpm or build tools needed; node_modules with the
# compiled .node binaries are copied directly from the builder stage.
FROM node:20-slim
WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

VOLUME ["/app/data"]

CMD ["node", "packages/server/dist/index.js"]
