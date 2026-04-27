# ==========================================
# Stage 1: Builder 환경 (의존성 다운로드 및 빌드)
# ==========================================
# 알파인(Alpine) 리눅스 기반의 경량화된 Node.js 공식 이미지를 사용하여 기초 용량 절감
FROM node:20-alpine AS builder

# 컨테이너 내부의 기본 작업 디렉토리를 지정
WORKDIR /usr/src/app

# 의존성 패키지 매니저 파일 복사 
# 전체 소스 코드를 복사하기 전에 package.json만 먼저 복사하여 Docker 레이어 캐시 메커니즘을 극대화
COPY package*.json ./

# npm ci 명령어를 사용하여 package-lock.json에 명시된 버전을 1바이트의 오차 없이 정확하게 설치
# 이는 npm install과 달리 무작위 버전 업데이트를 방지하여 결정론적 빌드(Deterministic Build)를 보장 
RUN npm ci

# 의존성 설치가 끝난 후, 실제 비즈니스 애플리케이션 소스 코드 복사
COPY . .

# (선택 사항) TypeScript를 사용하거나 프론트엔드 빌드가 필요한 경우 여기서 npm run build를 실행 
# RUN npm run build

# ==========================================
# Stage 2: Production 런타임 환경 (최종 경량 이미지)
# ==========================================
# 빌더 스테이지와 완전히 분리된 새로운 베이스 이미지를 선언하여 깨끗한 상태에서 시작
FROM node:20-alpine AS production

# Node.js 런타임 환경 변수를 production으로 명시하여, 프레임워크 자체의 디버깅 로그를 제한하고 성능을 최적화
ENV NODE_ENV=production

WORKDIR /usr/src/app

# 보안 모범 사례: 기본 root 관리자 권한 대신 권한이 극도로 제한된 내부 node 사용자를 할당
# 해커가 웹 취약점을 통해 컨테이너 내부 셸을 탈취하더라도, 호스트 시스템으로의 권한 상승(Privilege Escalation)을 물리적으로 차단
RUN chown -R node:node /usr/src/app
USER node

# 패키지 명세서 파일만 다시 복사
COPY --chown=node:node package*.json ./

# 프로덕션 운영에 필수적인 핵심 모듈만 선별 설치 (--only=production)
# 개발 및 테스트 전용 도구(Jest, Supertest, ESLint 등)는 배제하여 이미지 크기와 취약점 노출 위험을 원천 제거 
RUN npm ci --only=production && npm cache clean --force

# builder 스테이지에서 생성된 최종 애플리케이션 파일만 선별적으로 가져오기
COPY --chown=node:node --from=builder /usr/src/app/app.js ./
COPY --chown=node:node --from=builder /usr/src/app/server.js ./
COPY --chown=node:node --from=builder /usr/src/app/new-backend-features.js ./
COPY --chown=node:node --from=builder /usr/src/app/public ./public

# 서비스가 통신할 네트워크 포트를 문서화 및 개방
EXPOSE 3000

# 컨테이너 헬스체크(Healthcheck) 지시어 내장
# Docker 데몬이나 Kubernetes 오케스트레이터가 애플리케이션의 실제 구동 상태를 30초 단위로 능동 모니터링
# 무한 루프나 교착 상태(Deadlock)에 빠진 좀비 컨테이너를 탐지하고 트래픽 인입을 차단 
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 서버를 포어그라운드(Foreground) 프로세스로 지속 실행
CMD ["node", "server.js"]