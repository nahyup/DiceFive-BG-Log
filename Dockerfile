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
# Copy the server script and server-side modules
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/bggInfoServer.mjs ./bggInfoServer.mjs
COPY --from=build /app/bggExtraInfo.json ./bggExtraInfo.json
# Note: data.json and public/uploads will be mounted via volumes

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
