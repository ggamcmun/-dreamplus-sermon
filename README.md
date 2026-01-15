# 설교노트 주보 웹앱 📖

교회가 매주 발행하는 디지털 설교노트 서비스입니다. 성도들이 예배 중 QR을 스캔해 접속하고, 설교 구간별로 개인 메모를 작성할 수 있습니다.

## ✨ 주요 기능

### 성도 (일반 사용자)
- QR 코드 스캔으로 즉시 설교노트 접속
- 로그인 없이 설교 내용 열람 가능
- Google 로그인으로 개인 메모 저장
- 구간별 메모 작성 (800ms 자동 저장)
- 모바일 최적화 UI

### 관리자 (교회)
- 설교 생성/수정/삭제
- 설교 구간(대지) 관리
- 공개/비공개 전환
- QR 코드 생성 및 다운로드

## 🛠 기술 스택

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **UI**: TailwindCSS (모바일 퍼스트)
- **Auth & DB**: Supabase
- **배포**: Vercel

## 📁 프로젝트 구조

```
sermon-note-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # 홈 (설교 목록)
│   │   ├── layout.tsx               # 루트 레이아웃
│   │   ├── globals.css              # 글로벌 스타일
│   │   ├── not-found.tsx            # 404 페이지
│   │   ├── sermon/[slug]/           # 설교노트 페이지
│   │   │   ├── page.tsx
│   │   │   └── SermonNoteClient.tsx
│   │   ├── auth/callback/           # OAuth 콜백
│   │   │   └── route.ts
│   │   └── admin/                   # 관리자 페이지
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── login/
│   │       ├── unauthorized/
│   │       └── sermons/
│   ├── components/
│   │   ├── LoginPrompt.tsx          # 로그인 유도 모달
│   │   ├── QRModal.tsx              # QR 코드 모달
│   │   ├── SermonForm.tsx           # 설교 폼
│   │   └── AdminLogout.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # 브라우저 클라이언트
│   │   │   ├── server.ts            # 서버 클라이언트
│   │   │   └── middleware.ts
│   │   └── utils.ts                 # 유틸리티 함수
│   ├── types/
│   │   └── index.ts                 # TypeScript 타입 정의
│   └── middleware.ts                # Next.js 미들웨어
├── public/
│   └── manifest.json                # PWA 매니페스트
├── supabase-schema.sql              # DB 스키마 및 RLS
├── .env.local.example               # 환경변수 예시
└── package.json
```

## 🚀 로컬 실행 방법

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd sermon-note-app
npm install
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. **SQL Editor**에서 `supabase-schema.sql` 전체 실행
3. **Authentication > Providers**에서 Google OAuth 활성화:
   - [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 2.0 클라이언트 생성
   - Authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
   - Client ID와 Client Secret을 Supabase에 입력

### 3. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 수정:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 첫 번째 관리자 설정

1. 앱 실행 후 Google 로그인 진행
2. Supabase Dashboard > Table Editor > `auth.users`에서 본인의 `id` 확인
3. SQL Editor에서 실행:
```sql
UPDATE profiles SET role = 'admin' WHERE id = '본인-UUID';
```

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## ☁️ Vercel 배포 방법

### 1. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에서 "Import Project"
2. GitHub 저장소 연결

### 2. 환경변수 설정

Vercel 프로젝트 Settings > Environment Variables에 추가:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (배포 URL, 예: `https://your-app.vercel.app`)

### 3. Google OAuth Redirect URI 업데이트

Google Cloud Console에서 배포 도메인 추가:
- `https://your-app.vercel.app/auth/callback`

### 4. 배포

```bash
git push origin main
```

자동으로 배포됩니다.

## 📋 예배 현장 사용 체크리스트

### 예배 전 (토요일)
- [ ] 설교 제목, 날짜, 설교자 입력
- [ ] 설교 구간(대지) 3~5개 작성
- [ ] 각 구간의 핵심 성경구절 입력
- [ ] 각 구간의 내용 요약 작성
- [ ] 설교를 "공개"로 전환
- [ ] QR 코드 다운로드

### 예배 당일 (주일 아침)
- [ ] QR 코드 주보에 인쇄 또는 화면에 표시
- [ ] 본인 스마트폰으로 접속 테스트
- [ ] WiFi 연결 상태 확인
- [ ] 로그인 후 메모 저장 테스트

### 예배 중
- [ ] 설교 시작 전 QR 안내
- [ ] "설교 중 메모를 남겨보세요" 안내

### 예배 후
- [ ] 다음 주 설교 준비 (비공개로 미리 작성)

## 🔐 보안 설정

모든 데이터는 Supabase RLS(Row Level Security)로 보호됩니다:

| 테이블 | 읽기 | 쓰기/수정/삭제 |
|--------|------|----------------|
| `sermons` | 공개된 설교: 모두 / 전체: 관리자만 | 관리자만 |
| `sections` | 공개된 설교의 구간: 모두 | 관리자만 |
| `notes` | 본인 메모만 | 본인 메모만 |
| `profiles` | 본인만 | 본인만 |

## 🎨 커스터마이징

### 색상 변경
`tailwind.config.ts`에서 `church` 색상 팔레트 수정:
```typescript
church: {
  cream: '#fdfbf7',   // 배경색
  gold: '#c9a227',    // 포인트색
  brown: '#5c4033',   // 텍스트색
  sage: '#9caf88',    // 보조색
  navy: '#2c3e50',    // 관리자 UI
}
```

### 폰트 변경
`src/app/globals.css`에서 Google Fonts 변경

### 로고/아이콘
`public/` 폴더에 `icon-192.png`, `icon-512.png`, `favicon.ico` 추가

## 🐛 문제 해결

### "로그인이 작동하지 않아요"
- Supabase에서 Google OAuth Provider가 활성화되어 있는지 확인
- Redirect URI가 올바른지 확인

### "관리자 페이지에 접속할 수 없어요"
- `profiles` 테이블에서 본인의 `role`이 `admin`인지 확인
- 로그아웃 후 다시 로그인

### "메모가 저장되지 않아요"
- 로그인 상태인지 확인
- 브라우저 콘솔에서 에러 확인
- Supabase RLS 정책 확인

## 📄 라이선스

MIT License

---

Made with ❤️ for Korean Churches
