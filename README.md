# 할 일 관리 시스템 (Todo Management System)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2+-blue.svg)](https://expressjs.com/)
[![Jest](https://img.shields.io/badge/Jest-29+-red.svg)](https://jestjs.io/)
[![CI/CD](https://img.shields.io/badge/CI/CD-GitHub%20Actions-orange.svg)](https://github.com/features/actions)

풀스택 할 일 관리 시스템으로, Node.js + Express 백엔드와 Vanilla JavaScript 프론트엔드를 활용한 현대적인 웹 애플리케이션입니다. CI/CD 파이프라인을 통한 자동화된 배포 프로세스를 보여주는 대표적인 예시 프로젝트입니다.

현재 이 앱은 GCP에서 배포되어 있으며, 외부 접속 주소는 `http://34.27.31.182` 입니다. 추가된 기능으로 검색, 태그 관리, 내보내기/가져오기, 다크 모드, 키보드 단축키, 카테고리 분류 기능이 포함되어 있습니다.

## 🚀 주요 특징

- **풀스택 아키텍처**: 백엔드 API + 프론트엔드 SPA
- **RESTful API**: 표준 REST API 설계
- **실시간 UI**: AJAX를 활용한 동적 사용자 경험
- **검색 및 태그 관리**: 할 일 검색, 태그 추가/삭제 기능
- **데이터 내보내기/가져오기**: JSON/CSV 형식으로 내보내기 및 가져오기 지원
- **키보드 단축키**: 빠른 작업을 위한 키보드 단축키 지원
- **다크 모드**: 다크 모드 토글 및 로컬 스토리지 상태 유지
- **카테고리 분류**: work/personal/urgent/완료/대기 카테고리별 분류
- **반응형 디자인**: 모바일 친화적 인터페이스
- **완전한 테스트 커버리지**: 21개의 자동화 테스트
- **CI/CD 준비**: GitHub Actions를 통한 자동화된 배포

## 📁 프로젝트 구조

```
todo-management-system/
├── app.js                 # Express 애플리케이션 및 API 라우트
├── server.js              # 서버 시작점
├── package.json           # 프로젝트 설정 및 의존성
├── public/
│   └── index.html         # 프론트엔드 SPA
└── __tests__/
    └── app.test.js        # API 테스트 스위트
```

## 🛠 기술 스택

### 백엔드
- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 프레임워크
- **REST API**: 표준 HTTP 메서드 기반 API 설계

### 프론트엔드
- **Vanilla JavaScript**: 순수 JavaScript (프레임워크 미사용)
- **Fetch API**: AJAX 통신
- **CSS3**: 현대적인 스타일링
- **Font Awesome**: 아이콘 라이브러리

### 개발 도구
- **Jest**: 단위 및 통합 테스트
- **Supertest**: API 테스트 유틸리티
- **ESLint**: 코드 품질 관리

## 📋 API 엔드포인트

### 헬스 체크
- `GET /api/health` - 서버 상태 확인

### 할 일 관리
- `GET /api/todos` - 모든 할 일 조회 (필터링 지원)
- `GET /api/todos/:id` - 특정 할 일 조회
- `POST /api/todos` - 새 할 일 생성
- `PUT /api/todos/:id` - 할 일 수정
- `DELETE /api/todos/:id` - 할 일 삭제

### 통계
- `GET /api/stats` - 할 일 통계 정보

### 쿼리 파라미터 (필터링)
- `status`: `all`, `pending`, `completed`
- `priority`: `all`, `high`, `medium`, `low`

## 🚀 시작하기

### 필수 요구사항
- Node.js 14.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 프로젝트 클론
git clone <repository-url>
cd todo-management-system

# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 🧪 테스트

프로젝트는 Jest를 사용하여 21개의 자동화 테스트를 포함합니다:

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### 테스트 커버리지
- API 엔드포인트 검증
- 입력 유효성 검사
- 에러 처리
- 데이터 필터링 및 정렬

## 🔧 API 사용 예시

### 할 일 생성
```javascript
fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: '새 할 일',
        description: '할 일 설명',
        priority: 'high'
    })
});
```

### 할 일 목록 조회 (필터링)
```javascript
// 완료된 할 일만 조회
fetch('/api/todos?status=completed');

// 높은 우선순위 할 일만 조회
fetch('/api/todos?priority=high');
```

### 할 일 수정
```javascript
fetch('/api/todos/1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: '수정된 제목',
        completed: true
    })
});
```

## 🎨 프론트엔드 기능

- **실시간 할 일 관리**: 추가, 수정, 삭제, 완료 토글
- **검색 기능**: 제목 및 설명 기반 즉시 검색
- **태그 관리**: 할 일에 태그 추가 및 삭제
- **내보내기/가져오기**: JSON/CSV 파일로 할 일 데이터 가져오기 및 내보내기
- **다크 모드**: 다크 모드 토글과 상태 저장
- **키보드 단축키**: Ctrl/Cmd + N, Ctrl/Cmd + K, Ctrl/Cmd + D 등 지원
- **카테고리 대시보드**: work, personal, urgent, completed, pending 카테고리
- **우선순위 시스템**: 높음/보통/낮음 우선순위
- **필터링 및 검색**: 상태 및 우선순위 기반 필터링
- **통계 대시보드**: 완료율 및 우선순위 분포
- **반응형 디자인**: 데스크톱 및 모바일 지원
- **직관적인 UI**: 사용자 친화적 인터페이스

## 🔄 CI/CD 파이프라인

이 프로젝트는 GitHub Actions를 활용한 CI/CD 파이프라인의 예시로 설계되었습니다:

### 자동화된 프로세스
1. **코드 품질 검사**: ESLint를 통한 코드 스타일 검증
2. **자동 테스트**: 모든 테스트 케이스 실행
3. **빌드 검증**: 프로덕션 빌드 테스트
4. **배포 자동화**: Docker 컨테이너 기반 배포

### GitHub Actions 워크플로우 예시
```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## 📊 데이터 모델

### 할 일 (Todo)
```javascript
{
    id: 1,                    // 고유 식별자
    title: "할 일 제목",       // 필수
    description: "상세 설명",   // 선택
    priority: "medium",       // low | medium | high
    completed: false,         // 완료 상태
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🎯 학습 목표

이 프로젝트는 다음과 같은 개발 개념을 학습하는 데 적합합니다:

- **풀스택 개발**: 백엔드와 프론트엔드 통합
- **REST API 설계**: 표준 API 패턴
- **테스트 주도 개발**: TDD 방법론 적용
- **CI/CD 파이프라인**: 자동화된 배포 프로세스
- **모던 JavaScript**: ES6+ 기능 활용
- **반응형 웹 디자인**: 모바일 우선 접근

---

<parameter name="filePath">/Users/parkjunhyoung/project/web/cicd/README.md