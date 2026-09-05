# Self Care - 개인 건강 관리 대시보드

개인용 건강 관리 웹 대시보드입니다. 체중, 러닝, 식단을 기록하고 한눈에 확인할 수 있습니다.

## 사용 기술

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 데이터베이스 | SQLite |
| ORM | Prisma 6 |
| 스타일링 | Tailwind CSS 4 |
| 차트 | Recharts |
| 검증 | Zod |
| 테스트 | Vitest |

## 요구사항

- Node.js 20 이상
- npm 10 이상

## 설치 방법

```bash
# 저장소 클론 후
cd self-care

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

## DB 초기화 방법

```bash
# 스키마 적용 및 Prisma Client 생성
npm run db:push

# 또는 마이그레이션 사용
npm run db:migrate
```

## Seed 데이터 생성 방법

```bash
# 개발용 샘플 데이터 생성 (기존 데이터 초기화 후 재생성)
npm run db:seed

# DB 완전 초기화 + seed
npm run db:reset

# 스키마 적용 + seed 한번에
npm run db:setup
```

Seed 데이터에는 다음이 포함됩니다:
- 최근 30일 체중 기록
- 러닝 기록 7건 (구간별 기록 포함)
- 음식 DB 8종
- 오늘 식단 (아침/점심/간식)
- 목표 체중 및 영양 목표

## 개발 서버 실행 방법

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 빌드 방법

```bash
npm run build
npm start
```

## 테스트

```bash
npm test
```

## 프로젝트 구조

```text
self-care/
├── prisma/
│   ├── schema.prisma      # DB 스키마 정의
│   ├── seed.ts            # 개발용 seed 데이터
│   └── dev.db             # SQLite DB 파일 (생성 후)
├── src/
│   ├── app/
│   │   ├── api/           # REST API 라우트
│   │   ├── page.tsx       # Dashboard
│   │   ├── weight/        # 체중 관리
│   │   ├── running/       # 러닝 기록
│   │   ├── diet/          # 식단 관리
│   │   └── settings/      # 설정
│   ├── components/
│   │   ├── charts/        # 차트 컴포넌트
│   │   ├── layout/        # 레이아웃, 사이드바
│   │   └── ui/            # 공통 UI 컴포넌트
│   └── lib/
│       ├── calculations/  # 계산 로직 (체중, 러닝, 식단)
│       ├── services/      # 비즈니스 로직
│       ├── validations/   # Zod 스키마
│       ├── db.ts          # Prisma 클라이언트
│       └── utils.ts       # 유틸리티
├── .env.example
├── vitest.config.ts
└── README.md
```

## 주요 기능

### 체중 관리
- 날짜별 체중, 걸음수, 수분, 수면, 컨디션, 배변 기록
- 최근 체중, 목표 대비, 7일/30일 변화 표시
- 체중 변화 그래프

### 러닝 기록
- 이지런, 회복주, LSD, 휴식, 지속주 분류
- 거리/시간 입력 시 평균 페이스 자동 계산
- 구간별 기록 (스플릿)
- 주별/월별 거리 합계, 기간별 그래프

### 식단 관리
- 아침/점심/저녁/간식별 음식 기록
- 영양소 자동 합산 (칼로리, 탄수화물, 단백질, 지방)
- 음식 DB에서 빠른 입력
- 목표 대비 진행률 표시

### 대시보드
- 오늘의 요약 (체중, 칼로리, 러닝)
- 체중/러닝 그래프
- 영양소 진행률
- 최근 기록 목록

### 설정
- 목표 체중
- 하루 목표 칼로리, 탄수화물, 단백질, 지방

## 라이선스

개인 사용 목적의 프로젝트입니다.
