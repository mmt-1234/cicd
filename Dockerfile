# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
# MVP 단계에서는 개발 의존성도 빌드 시 필요할 수 있으므로 전체 설치
RUN npm ci

COPY . .
# (필요 시) RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# 보안 설정
RUN chown -R node:node /usr/src/app
USER node

# 빌더에서 필요한 파일만 통째로 복사 (node_modules 포함)
# .dockerignore에 node_modules, .git 등을 등록했다면 안전함
COPY --chown=node:node --from=builder /usr/src/app ./

EXPOSE 3000


CMD ["node", "server.js"]