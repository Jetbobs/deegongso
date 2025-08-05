# 🗄️ Supabase 데이터베이스 스키마

클라이언트-디자이너 외주 관리 SaaS의 MVP를 위한 완전한 PostgreSQL 스키마입니다.

## 📋 목차

1. [스키마 개요](#스키마-개요)
2. [테이블 구조](#테이블-구조)
3. [설치 방법](#설치-방법)
4. [사용 예제](#사용-예제)
5. [보안 정책](#보안-정책)

## 🏗️ 스키마 개요

### 핵심 기능

- ✅ **사용자 관리**: 클라이언트/디자이너 구분, 프로필 관리
- ✅ **프로젝트 관리**: 프로젝트 생성, 지원, 배정
- ✅ **계약 시스템**: 디지털 계약서, 마일스톤 관리
- ✅ **메시지 시스템**: 실시간 채팅, 파일 공유
- ✅ **결제 관리**: 마일스톤별 결제, 수수료 관리
- ✅ **리뷰 시스템**: 상호 평가, 평점 관리
- ✅ **알림 시스템**: 실시간 알림, 상태 변경 추적

### 보안 특징

- 🔒 **Row Level Security (RLS)**: 데이터 접근 제어
- 🔐 **역할 기반 접근**: 클라이언트/디자이너/관리자 권한 구분
- 🛡️ **데이터 무결성**: 외래키 제약조건, CHECK 제약조건

## 📊 테이블 구조

### 1. 사용자 관리

```sql
user_profiles        -- 사용자 프로필 (auth.users 확장)
├── id (UUID, FK)    -- Supabase Auth 사용자 ID
├── role (ENUM)      -- client | designer | admin
├── skills (TEXT[])  -- 디자이너 스킬 태그
└── rating (DECIMAL) -- 평점 (자동 계산)
```

### 2. 프로젝트 관리

```sql
projects                    -- 프로젝트 기본 정보
├── client_id (UUID, FK)    -- 클라이언트 ID
├── designer_id (UUID, FK)  -- 배정된 디자이너 ID
├── category (ENUM)         -- 프로젝트 카테고리
├── status (ENUM)           -- draft | published | in_progress | completed
└── budget (DECIMAL)        -- 예산 정보

project_applications        -- 프로젝트 지원
├── project_id (UUID, FK)   -- 프로젝트 ID
├── designer_id (UUID, FK)  -- 지원한 디자이너 ID
├── proposed_budget         -- 제안 금액
└── status                  -- pending | accepted | rejected
```

### 3. 계약 시스템

```sql
contracts                   -- 계약서
├── project_id (UUID, FK)   -- 연결된 프로젝트
├── client_id (UUID, FK)    -- 클라이언트
├── designer_id (UUID, FK)  -- 디자이너
├── payment_type (ENUM)     -- fixed | hourly | milestone
└── status (ENUM)           -- draft | signed | active | completed

contract_milestones         -- 마일스톤 (단계별 지급)
├── contract_id (UUID, FK)  -- 연결된 계약
├── amount (DECIMAL)        -- 마일스톤 금액
├── status                  -- pending | completed | approved | paid
└── deliverables (TEXT[])   -- 제출물 URL 배열
```

### 4. 커뮤니케이션

```sql
messages                    -- 메시지
├── project_id (UUID, FK)   -- 프로젝트별 메시지
├── sender_id (UUID, FK)    -- 발신자
├── recipient_id (UUID, FK) -- 수신자
├── content (TEXT)          -- 메시지 내용
└── message_type (ENUM)     -- text | file | system

files                       -- 파일 관리
├── project_id (UUID, FK)   -- 프로젝트 연결
├── uploaded_by (UUID, FK)  -- 업로더
├── file_url (TEXT)         -- Supabase Storage URL
└── is_final_deliverable    -- 최종 제출물 여부
```

### 5. 결제 & 리뷰

```sql
payments                    -- 결제 내역
├── contract_id (UUID, FK)  -- 연결된 계약
├── payer_id (UUID, FK)     -- 지불자
├── payee_id (UUID, FK)     -- 수취인
├── amount (DECIMAL)        -- 결제 금액
└── payment_status (ENUM)   -- pending | completed | failed

reviews                     -- 리뷰 시스템
├── project_id (UUID, FK)   -- 프로젝트
├── reviewer_id (UUID, FK)  -- 리뷰 작성자
├── reviewee_id (UUID, FK)  -- 리뷰 대상
├── rating (INTEGER)        -- 1~5 점수
└── is_public (BOOLEAN)     -- 공개 여부
```

## 🚀 설치 방법

### 1. Supabase 대시보드에서 실행

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **SQL Editor** 메뉴 클릭
4. `schema.sql` 파일 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭

### 2. CLI를 통한 실행 (권장)

```bash
# Supabase CLI 설치 (필요시)
npm install -g supabase

# 프로젝트 초기화
supabase init

# 로컬 개발 환경 시작
supabase start

# 마이그레이션 생성
supabase migration new initial_schema

# schema.sql 내용을 생성된 마이그레이션 파일에 복사
# supabase/migrations/[timestamp]_initial_schema.sql

# 마이그레이션 적용
supabase db push

# 프로덕션에 배포
supabase db push --project-ref your-project-ref
```

### 3. 환경변수 확인

스키마 적용 후 `.env.local`에 다음 값들이 설정되어 있는지 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 💡 사용 예제

### 1. 사용자 프로필 생성

```typescript
// 회원가입 후 프로필 생성
const { data, error } = await supabase.from("user_profiles").insert([
  {
    id: user.id, // Supabase Auth user ID
    email: user.email,
    full_name: "홍길동",
    role: "designer",
    skills: ["UI/UX", "웹디자인", "Figma"],
    hourly_rate: 50000,
  },
]);
```

### 2. 프로젝트 생성

```typescript
// 클라이언트가 프로젝트 생성
const { data, error } = await supabase.from("projects").insert([
  {
    title: "웹사이트 리디자인",
    description: "기존 웹사이트의 UI/UX 개선",
    category: "web_design",
    client_id: clientUserId,
    budget_min: 1000000,
    budget_max: 2000000,
    skills_required: ["UI/UX", "웹디자인"],
    deadline: "2024-03-01",
  },
]);
```

### 3. 프로젝트 지원

```typescript
// 디자이너가 프로젝트에 지원
const { data, error } = await supabase.from("project_applications").insert([
  {
    project_id: projectId,
    designer_id: designerUserId,
    cover_letter: "안녕하세요. 이 프로젝트에 관심이 있습니다...",
    proposed_budget: 1500000,
    estimated_duration: 14,
  },
]);
```

### 4. 계약 생성

```typescript
// 지원 수락 후 계약 생성
const { data, error } = await supabase.from("contracts").insert([
  {
    project_id: projectId,
    client_id: clientUserId,
    designer_id: designerUserId,
    title: "웹사이트 리디자인 계약",
    payment_type: "milestone",
    total_amount: 1500000,
  },
]);
```

### 5. 마일스톤 생성

```typescript
// 계약의 마일스톤들 생성
const milestones = [
  {
    contract_id: contractId,
    title: "1단계: 와이어프레임",
    amount: 500000,
    due_date: "2024-02-15",
    order_index: 1,
  },
  {
    contract_id: contractId,
    title: "2단계: 디자인 시안",
    amount: 700000,
    due_date: "2024-02-25",
    order_index: 2,
  },
  {
    contract_id: contractId,
    title: "3단계: 최종 완성",
    amount: 300000,
    due_date: "2024-03-01",
    order_index: 3,
  },
];

const { data, error } = await supabase
  .from("contract_milestones")
  .insert(milestones);
```

### 6. 메시지 전송

```typescript
// 프로젝트 내 메시지 전송
const { data, error } = await supabase.from("messages").insert([
  {
    project_id: projectId,
    sender_id: senderId,
    recipient_id: recipientId,
    content: "안녕하세요! 프로젝트 시작하겠습니다.",
    message_type: "text",
  },
]);
```

### 7. 실시간 구독 (메시지)

```typescript
// 실시간 메시지 수신
const subscription = supabase
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `project_id=eq.${projectId}`,
    },
    (payload) => {
      console.log("새 메시지:", payload.new);
      // UI 업데이트
    }
  )
  .subscribe();
```

## 🔒 보안 정책 (RLS)

### 주요 보안 규칙

1. **사용자 프로필**: 모든 사용자가 조회 가능, 본인만 수정 가능
2. **프로젝트**: 공개된 프로젝트는 모두 조회 가능, 본인 프로젝트만 관리 가능
3. **계약**: 계약 당사자만 조회/관리 가능
4. **메시지**: 프로젝트 참여자만 조회/전송 가능
5. **결제**: 당사자만 조회 가능
6. **알림**: 본인 알림만 조회/관리 가능

### RLS 정책 예제

```sql
-- 프로젝트 조회 정책
CREATE POLICY "Anyone can view published projects"
ON projects FOR SELECT
USING (status != 'draft');

-- 본인 프로젝트 관리 정책
CREATE POLICY "Clients can manage own projects"
ON projects FOR ALL
USING (auth.uid() = client_id);
```

## 🎯 다음 단계

1. **스키마 적용**: `schema.sql` 실행
2. **환경변수 설정**: Supabase 연결 정보 입력
3. **Storage 설정**: 파일 업로드를 위한 버킷 생성
4. **실시간 기능**: 필요한 테이블에 대한 실시간 구독 설정
5. **인덱스 최적화**: 실제 사용 패턴에 따른 추가 인덱스 생성

이 스키마는 MVP 기능을 포함하며, 필요에 따라 확장 가능한 구조로 설계되었습니다. 실제 서비스 론칭 후 사용자 피드백을 바탕으로 추가 기능을 확장해나갈 수 있습니다.
