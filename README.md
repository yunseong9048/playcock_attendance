# 콕콕 출석부

로그인 없이 이름을 검색해 출석하는 모바일 중심의 소규모 모임 출석부입니다. Next.js App Router, TypeScript, Tailwind CSS, Supabase(PostgreSQL)로 구성되어 있습니다.

## 주요 기능

- 서울 시간 기준 오늘 날짜, 출석 등록 및 오늘 출석자 목록
- 이름 검색과 신규 회원 등록, 정규화된 이름 중복 방지
- 회원별 일 1회 출석 보장 및 출석 시각 저장
- 전체 누적/이번 달 출석 랭킹
- 비밀번호 세션으로 보호된 회원 및 날짜별 출석 관리
- 모바일 우선 반응형 UI

## 프로젝트 구조

```text
app/
  actions.ts             서버 액션(출석, 회원, 관리자 작업)
  page.tsx               메인 출석 화면
  ranking/page.tsx       누적/월간 랭킹
  admin/                 관리자 로그인 및 관리 화면
components/              클라이언트 폼과 공통 버튼
lib/                     Supabase, 날짜, 관리자 세션, 타입
supabase/schema.sql      PostgreSQL 스키마 및 제약조건
```

## 로컬 실행

Node.js 18.17 이상(권장: Node.js 20)을 준비합니다.

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 관리자 화면은 `/admin`입니다.

## Supabase 설정

1. Supabase에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql)을 실행합니다.
3. Project Settings → API에서 Project URL과 `service_role` key를 확인합니다.
4. `.env.local`에 다음 값을 설정합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=long-random-admin-password
ADMIN_SESSION_SECRET=another-random-string-at-least-32-characters
```

`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`은 서버 전용 비밀값입니다. Git에 커밋하거나 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. 브라우저에서 직접 DB를 호출하지 않으며, RLS를 활성화한 채 Next.js 서버만 service role로 접근합니다.

## 검증

```bash
npm run typecheck
npm run lint
npm run build
```

## Vercel 배포

1. 프로젝트를 Git 저장소에 올리고 Vercel에서 Import합니다.
2. Framework Preset은 Next.js, Build Command는 `npm run build`를 사용합니다.
3. Vercel 프로젝트의 Settings → Environment Variables에 `.env.local`의 네 변수를 등록합니다. Preview/Production 환경에 필요한 값을 각각 지정하세요.
4. Deploy를 실행한 뒤 메인 출석, 랭킹, `/admin` 로그인을 확인합니다.

## 보안 및 운영 참고

- 관리자 로그인은 8시간 유효한 HTTP-only, SameSite=Lax 쿠키를 사용합니다. 운영 환경에서는 반드시 충분히 긴 무작위 비밀번호와 세션 시크릿을 설정하세요.
- 공개 출석은 로그인 없이 사용할 수 있으므로, 인터넷에 완전히 공개할 경우 요청 제한이나 CAPTCHA 추가를 고려하세요.
- 날짜는 서버에서 `Asia/Seoul` 기준 `YYYY-MM-DD`로 계산하고, 시각은 PostgreSQL `timestamptz`로 저장합니다.
- 회원 삭제 시 외래키의 `ON DELETE CASCADE` 설정에 따라 해당 회원의 출석 기록도 삭제됩니다.
