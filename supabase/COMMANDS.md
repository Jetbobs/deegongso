# 🚀 Supabase 테이블 생성 명령어 가이드

Supabase에 테이블을 생성하는 다양한 방법을 안내합니다.

## 📋 목차

1. [Supabase 대시보드에서 실행](#supabase-대시보드에서-실행)
2. [Supabase CLI 사용](#supabase-cli-사용)
3. [단계별 실행](#단계별-실행)
4. [실행 확인](#실행-확인)

## 🖥️ Supabase 대시보드에서 실행

### 방법 1: 전체 스키마 한 번에 실행

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭
5. `create-tables.sql` 파일의 모든 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭 (Ctrl/Cmd + Enter)

### 방법 2: 기존 schema.sql 파일 사용

```sql
-- supabase/schema.sql 파일의 모든 내용을 복사하여 SQL Editor에서 실행
```

## 💻 Supabase CLI 사용

### 1. CLI 설치 및 설정

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# Supabase 로그인
supabase login
```

### 2. 마이그레이션으로 실행

```bash
# 새 마이그레이션 생성
supabase migration new initial_schema

# 생성된 마이그레이션 파일에 create-tables.sql 내용 복사
# 파일 위치: supabase/migrations/[timestamp]_initial_schema.sql

# 로컬 Supabase 시작 (개발용)
supabase start

# 마이그레이션 적용 (로컬)
supabase db reset

# 또는 원격 데이터베이스에 직접 적용
supabase db push --project-ref your-project-ref
```

### 3. SQL 파일 직접 실행

```bash
# create-tables.sql 파일을 원격 데이터베이스에 직접 실행
supabase db reset --project-ref your-project-ref
```

## 📝 단계별 실행

큰 스키마를 단계별로 나누어 실행하고 싶다면:

### 1단계: ENUM 타입 생성

```sql
-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 사용자 역할 ENUM
CREATE TYPE user_role AS ENUM ('client', 'designer', 'admin');

-- 프로젝트 관련 ENUM
CREATE TYPE project_status AS ENUM ('draft', 'published', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE project_category AS ENUM ('web_design', 'mobile_design', 'logo_design', 'branding', 'ui_ux', 'graphic_design', 'illustration', 'other');

-- 계약 관련 ENUM
CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'signed', 'active', 'completed', 'cancelled');
CREATE TYPE payment_type AS ENUM ('fixed', 'hourly', 'milestone');

-- 메시지 및 파일 관련 ENUM
CREATE TYPE message_type AS ENUM ('text', 'file', 'milestone_update', 'system');
CREATE TYPE file_type AS ENUM ('image', 'document', 'design', 'archive', 'other');

-- 결제 관련 ENUM
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'escrow');

-- 알림 관련 ENUM
CREATE TYPE notification_type AS ENUM (
    'project_application', 'application_accepted', 'application_rejected',
    'contract_sent', 'contract_signed', 'milestone_completed', 'milestone_approved',
    'payment_received', 'message_received', 'review_received', 'project_deadline_reminder'
);
```

### 2단계: 기본 테이블 생성

```sql
-- 사용자 프로필 테이블
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'client',
    company_name TEXT,
    bio TEXT,
    portfolio_url TEXT,
    phone TEXT,
    location TEXT,
    hourly_rate DECIMAL(10,2),
    skills TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_projects INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 프로젝트 테이블
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category project_category NOT NULL,
    status project_status DEFAULT 'draft',
    priority project_priority DEFAULT 'medium',
    client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    designer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    fixed_budget DECIMAL(10,2),
    deadline DATE,
    requirements JSONB,
    attachments TEXT[],
    skills_required TEXT[],
    is_remote BOOLEAN DEFAULT TRUE,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 3단계: 관계 테이블 생성

```sql
-- 프로젝트 지원자 테이블
CREATE TABLE project_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    designer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    cover_letter TEXT,
    proposed_budget DECIMAL(10,2),
    estimated_duration INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(project_id, designer_id)
);

-- 계약 테이블
CREATE TABLE contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    designer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    payment_type payment_type NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    hourly_rate DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    status contract_status DEFAULT 'draft',
    terms_and_conditions TEXT,
    client_signature_date TIMESTAMP WITH TIME ZONE,
    designer_signature_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 4단계: RLS 활성화

```sql
-- RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 기본 정책 생성
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view published projects" ON projects FOR SELECT USING (status != 'draft');
CREATE POLICY "Clients can manage own projects" ON projects FOR ALL USING (auth.uid() = client_id);
```

## ✅ 실행 확인

### 1. 테이블 생성 확인

```sql
-- 생성된 테이블 목록 확인
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2. ENUM 타입 확인

```sql
-- 생성된 ENUM 타입 확인
SELECT typname
FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;
```

### 3. RLS 정책 확인

```sql
-- RLS 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public';
```

### 4. 테이블 구조 확인

```sql
-- 특정 테이블의 컬럼 정보 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

## 🔧 문제 해결

### 오류 발생 시

1. **권한 오류**: Supabase 프로젝트 소유자 권한 확인
2. **ENUM 중복 오류**: 기존 ENUM 타입 삭제 후 재생성
3. **테이블 존재 오류**: `DROP TABLE IF EXISTS` 사용

### 테이블 삭제 (필요시)

```sql
-- 주의: 데이터가 모두 삭제됩니다!
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS contract_milestones CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ENUM 타입 삭제
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS file_type CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS contract_status CASCADE;
DROP TYPE IF EXISTS project_category CASCADE;
DROP TYPE IF EXISTS project_priority CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

## 🎯 다음 단계

테이블 생성 완료 후:

1. **샘플 데이터 삽입**: `sample-data.sql` 실행
2. **Storage 버킷 생성**: 파일 업로드용
3. **실시간 구독 설정**: 메시지, 알림 등
4. **환경변수 설정**: Next.js 프로젝트 연결

```bash
# 환경변수 확인
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

이제 Supabase 프로젝트와 Next.js 애플리케이션을 연결하여 개발을 시작할 수 있습니다! 🚀
