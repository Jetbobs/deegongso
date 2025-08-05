# 🚀 Supabase 테이블 생성 가이드 (CLI 설치 문제 해결)

CLI 설치가 안 되는 경우를 위한 대안 방법들을 안내합니다.

## ✅ 방법 1: Supabase 대시보드 사용 (가장 쉬움!)

### 1단계: Supabase 대시보드 접속

1. [https://app.supabase.com](https://app.supabase.com) 접속
2. 로그인 후 프로젝트 선택

### 2단계: SQL Editor 사용

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭
3. 아래 SQL을 복사해서 붙여넣기:

```sql
-- =====================================================
-- 🏗️ 클라이언트-디자이너 외주 관리 SaaS - 테이블 생성
-- =====================================================

-- 1. 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM 타입들 생성
CREATE TYPE user_role AS ENUM ('client', 'designer', 'admin');
CREATE TYPE project_status AS ENUM ('draft', 'published', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE project_category AS ENUM ('web_design', 'mobile_design', 'logo_design', 'branding', 'ui_ux', 'graphic_design', 'illustration', 'other');
CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'signed', 'active', 'completed', 'cancelled');
CREATE TYPE payment_type AS ENUM ('fixed', 'hourly', 'milestone');
CREATE TYPE message_type AS ENUM ('text', 'file', 'milestone_update', 'system');
CREATE TYPE file_type AS ENUM ('image', 'document', 'design', 'archive', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'escrow');
CREATE TYPE notification_type AS ENUM (
    'project_application', 'application_accepted', 'application_rejected',
    'contract_sent', 'contract_signed', 'milestone_completed', 'milestone_approved',
    'payment_received', 'message_received', 'review_received', 'project_deadline_reminder'
);

-- 3. 사용자 프로필 테이블
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

-- 4. 프로젝트 테이블
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

-- 5. 프로젝트 지원자 테이블
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

-- 6. 계약 테이블
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

-- 7. 마일스톤 테이블
CREATE TABLE contract_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'paid')),
    deliverables TEXT[],
    feedback TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. 메시지 테이블
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT,
    message_type message_type DEFAULT 'text',
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    replied_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. 파일 테이블
CREATE TABLE files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES contract_milestones(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type file_type,
    mime_type TEXT,
    description TEXT,
    is_final_deliverable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. 결제 테이블
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
    milestone_id UUID REFERENCES contract_milestones(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    payee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    transaction_id TEXT,
    description TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. 리뷰 테이블
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT,
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(project_id, reviewer_id, reviewee_id)
);

-- 12. 알림 테이블
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. 트리거 함수들
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_contract_milestones_updated_at BEFORE UPDATE ON contract_milestones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 14. RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 15. 기본 RLS 정책들
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view published projects" ON projects FOR SELECT USING (status != 'draft');
CREATE POLICY "Clients can manage own projects" ON projects FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 16. 인덱스 생성
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ✅ 테이블 생성 완료!
SELECT 'All tables created successfully!' as status;
```

### 3단계: SQL 실행

1. **Run** 버튼 클릭 (또는 Ctrl+Enter)
2. 성공 메시지 확인

---

## 🔧 방법 2: npx 사용 (CLI 설치 없이)

CLI를 설치하지 않고도 npx로 사용할 수 있습니다:

```bash
# 로그인
npx supabase login

# 프로젝트 연결
npx supabase link --project-ref your-project-ref

# SQL 파일 실행
npx supabase db reset
```

---

## 🛠️ 방법 3: 수동 CLI 설치 (고급 사용자용)

### Windows에서 직접 다운로드:

1. [Supabase CLI Releases](https://github.com/supabase/cli/releases) 페이지 방문
2. 최신 버전에서 `supabase_windows_amd64.zip` 다운로드
3. 압축 해제 후 `supabase.exe`를 PATH에 추가

### 또는 Chocolatey 사용:

```bash
# Chocolatey가 설치되어 있다면
choco install supabase
```

---

## ✅ 테이블 생성 확인

어떤 방법을 사용하든, 다음 SQL로 테이블이 잘 생성되었는지 확인하세요:

```sql
-- 생성된 테이블 목록 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 예상 결과: 12개 테이블
-- contract_milestones, contracts, files, messages, notifications,
-- payments, project_applications, projects, reviews, user_profiles
```

---

## 🎯 추천 방법

**👑 가장 쉬운 방법**: Supabase 대시보드 사용

- 설치 필요 없음
- 브라우저에서 바로 실행
- 실시간 결과 확인 가능

**⚡ 개발자용**: npx 사용

- 로컬 개발 시 유용
- 버전 관리 가능

어떤 방법을 선택하시겠나요? 🚀
