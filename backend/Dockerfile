# Simple backend Dockerfile for GHCR demo
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || npm install --only=production --legacy-peer-deps
COPY src ./src
EXPOSE 3000
CMD ["node", "src/server.js"]
