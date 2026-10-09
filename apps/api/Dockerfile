FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace=apps/api --workspace=apps/web

COPY apps/api apps/api
RUN npm run build --workspace=apps/api

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
