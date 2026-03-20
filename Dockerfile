# Build Stage
FROM node:22-slim AS build

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# Production Stage
FROM node:22-slim

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the build output from the build stage
COPY --from=build /app/dist ./dist
# Copy the server script
COPY --from=build /app/server.js ./server.js
# Note: data.json and public/uploads will be mounted via volumes

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
