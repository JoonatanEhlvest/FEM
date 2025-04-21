FROM node:22-slim AS base

# Set working directory
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Copy package.json files
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/parser/package.json ./packages/parser/
COPY packages/types/package.json ./packages/types/

# Copy Prisma schema files first
COPY packages/server/prisma ./packages/server/prisma

# Install dependencies
RUN yarn install --frozen-lockfile

RUN cd packages/server && yarn prisma generate

# Copy all files
COPY . .

# Build the application
RUN yarn build

# Remove development dependencies
RUN yarn install --production --prefer-offline

# Start the application
CMD ["yarn", "start"] 