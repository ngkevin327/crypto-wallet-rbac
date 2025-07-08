FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/policy-engine/package.json packages/policy-engine/
RUN pnpm install --frozen-lockfile --filter @wtp/api...

FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @wtp/shared build && pnpm --filter @wtp/policy-engine build
RUN pnpm --filter @wtp/api exec prisma generate
RUN pnpm --filter @wtp/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
