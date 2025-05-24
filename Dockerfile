FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm prisma generate
ENV PATH /app/node_modules/.bin:$PATH
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]