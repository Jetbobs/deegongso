# 🚀 Supabase 설정 가이드

이 프로젝트에서 Next.js App Router와 Supabase를 함께 사용하는 방법을 설명합니다.

## 📋 목차

1. [환경 설정](#환경-설정)
2. [Supabase 클라이언트 종류](#supabase-클라이언트-종류)
3. [사용 예제](#사용-예제)
4. [보안 고려사항](#보안-고려사항)
5. [트러블슈팅](#트러블슈팅)

## 🔧 환경 설정

### 1. 환경변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 선택사항: 서비스 롤 키 (서버 전용)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Supabase 프로젝트에서 값 가져오기

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. Settings → API에서 다음 값들을 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API Keys → `anon` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Project API Keys → `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (선택사항)

## 🔧 Supabase 클라이언트 종류

이 프로젝트는 3가지 타입의 Supabase 클라이언트를 제공합니다:

### 1. 브라우저 클라이언트 (`client.ts`)

- **사용 위치**: Client Components
- **특징**: 브라우저에서 실행, 자동 토큰 갱신

```typescript
import { createClientComponentClient } from "@/lib/supabase/client";

const supabase = createClientComponentClient();
```

### 2. 서버 클라이언트 (`server.ts`)

- **사용 위치**: Server Components, API Routes, Server Actions
- **특징**: 서버에서 실행, 쿠키 기반 인증

```typescript
import { createServerComponentClient } from "@/lib/supabase/server";

const supabase = await createServerComponentClient();
```

### 3. 미들웨어 클라이언트 (`middleware.ts`)

- **사용 위치**: Next.js 미들웨어
- **특징**: 라우트 보호, 인증 확인

```typescript
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const supabase = createMiddlewareClient(request, response);
```

## 💡 사용 예제

### Client Component 예제

```typescript
"use client";

import { createClientComponentClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return <div>로그인이 필요합니다</div>;

  return (
    <div>
      <h1>안녕하세요, {user.email}님!</h1>
      <button onClick={signOut}>로그아웃</button>
    </div>
  );
}
```

### Server Component 예제

```typescript
import { createServerComponentClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>인증이 필요합니다</div>;
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1>대시보드</h1>
      <p>사용자: {user.email}</p>
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### API Route 예제

```typescript
// app/api/posts/route.ts
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createRouteHandlerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts });
}
```

## 🔒 보안 고려사항

### 1. 환경변수 보안

- `NEXT_PUBLIC_*` 변수는 클라이언트에 노출됩니다
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출하지 마세요

### 2. Row Level Security (RLS)

- Supabase 테이블에서 RLS를 활성화하세요
- 적절한 보안 정책을 설정하세요

```sql
-- 예: 사용자가 본인 데이터만 조회할 수 있도록 설정
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);
```

### 3. 인증 체크

- 민감한 작업 전에 항상 사용자 인증을 확인하세요
- 미들웨어를 통해 라우트를 보호하세요

## 🔄 미들웨어 라우트 보호

`middleware.ts` 파일이 자동으로 인증이 필요한 페이지를 보호합니다:

- **보호되는 경로**: `/dashboard`, `/profile`, `/settings`, `/projects`, `/contracts`, `/messages`
- **인증되지 않은 사용자**: 홈페이지(`/`)로 리다이렉트
- **인증된 사용자가 홈에 접근**: 대시보드로 리다이렉트

## 🔧 트러블슈팅

### 1. 인증 문제

```typescript
// 현재 세션 확인
const {
  data: { session },
  error,
} = await supabase.auth.getSession();
console.log("세션:", session, "에러:", error);
```

### 2. 쿠키 문제

- 브라우저 개발자 도구에서 쿠키를 확인하세요
- 로컬호스트에서 HTTPS 설정이 필요할 수 있습니다

### 3. 타입 에러

```typescript
// Database 타입 생성 (선택사항)
supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

### 4. 실시간 구독 문제

```typescript
// 구독 상태 확인
const channel = supabase.channel("test");
console.log("채널 상태:", channel.state);
```

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js App Router 가이드](https://nextjs.org/docs/app)
- [Supabase Auth 헬퍼](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

더 자세한 사용 예제는 `src/lib/supabase/examples.ts` 파일을 참고하세요!
