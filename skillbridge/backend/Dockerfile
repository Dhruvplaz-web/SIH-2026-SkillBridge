FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests and pre-built artifacts
COPY package*.json ./
COPY dist ./dist
COPY prisma ./prisma

# Install production dependencies and ensure linux-x64 native binary for libSQL
RUN npm install --omit=dev && npm install @libsql/linux-x64-gnu

EXPOSE 5000

CMD ["node", "dist/index.js"]
