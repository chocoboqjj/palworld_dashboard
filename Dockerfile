# ---- 构建阶段 ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- 运行阶段 ----
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/.output /app/.output

ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
