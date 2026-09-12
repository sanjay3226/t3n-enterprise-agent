FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose health & metrics port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "--loader", "tsx", "src/agent.ts"]
