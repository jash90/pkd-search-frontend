# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build the prerendered SSG output ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* at build time. Set it as a Railway service variable
# (and add VITE_BASE_URL under "Build Variables" if your Railway project
# scopes them separately) so it propagates to this build arg.
ARG VITE_BASE_URL
ENV VITE_BASE_URL=${VITE_BASE_URL}

RUN npm run build

# ---------- Stage 2: serve with Caddy ----------
FROM caddy:2-alpine

COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
