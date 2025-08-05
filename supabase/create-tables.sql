-- =====================================================
-- 🚀 Supabase 테이블 생성 SQL 명령어
-- =====================================================

-- 이 파일을 Supabase 대시보드의 SQL Editor에서 실행하세요.
-- 한 번에 모두 실행하거나, 단계별로 나누어 실행할 수 있습니다.

-- 1단계: 확장 기능 및 ENUM 타입 생성
-- =====================================================

-- UUID 확장 활성화
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
    'project_application', 
    'application_accepted', 
    'application_rejected',
    'contract_sent',
    'contract_signed',
    'milestone_completed',
    'milestone_approved',
    'payment_received',
    'message_received',
    'review_received',
    'project_deadline_reminder'
);

-- 2단계: 기본 테이블 생성
-- =====================================================

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

-- 3단계: 계약 관련 테이블
-- =====================================================

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

-- 마일스톤 테이블
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

-- 4단계: 커뮤니케이션 테이블
-- =====================================================

-- 메시지 테이블
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

-- 파일 테이블
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

-- 5단계: 결제 및 리뷰 테이블
-- =====================================================

-- 결제 테이블
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

-- 리뷰 테이블
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

-- 알림 테이블
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

-- 6단계: 트리거 함수 및 트리거 생성
-- =====================================================

-- updated_at 자동 업데이트 함수
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

-- 사용자 평점 업데이트 함수
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles 
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews 
        WHERE reviewee_id = NEW.reviewee_id
    )
    WHERE id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 리뷰 생성 시 평점 업데이트 트리거
CREATE TRIGGER update_rating_on_review AFTER INSERT ON reviews FOR EACH ROW EXECUTE PROCEDURE update_user_rating();

-- 7단계: RLS 활성화
-- =====================================================

-- RLS 활성화
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

-- 8단계: RLS 정책 생성
-- =====================================================

-- 사용자 프로필 정책
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 프로젝트 정책
CREATE POLICY "Anyone can view published projects" ON projects FOR SELECT USING (status != 'draft');
CREATE POLICY "Clients can view own projects" ON projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Designers can view assigned projects" ON projects FOR SELECT USING (auth.uid() = designer_id);
CREATE POLICY "Clients can manage own projects" ON projects FOR ALL USING (auth.uid() = client_id);

-- 프로젝트 지원 정책
CREATE POLICY "Designers can view own applications" ON project_applications FOR SELECT USING (auth.uid() = designer_id);
CREATE POLICY "Clients can view applications for own projects" ON project_applications FOR SELECT USING (
    auth.uid() IN (SELECT client_id FROM projects WHERE id = project_id)
);
CREATE POLICY "Designers can create applications" ON project_applications FOR INSERT WITH CHECK (auth.uid() = designer_id);
CREATE POLICY "Clients can update application status" ON project_applications FOR UPDATE USING (
    auth.uid() IN (SELECT client_id FROM projects WHERE id = project_id)
);

-- 계약 정책
CREATE POLICY "Contract parties can view contracts" ON contracts FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = designer_id
);
CREATE POLICY "Contract parties can manage contracts" ON contracts FOR ALL USING (
    auth.uid() = client_id OR auth.uid() = designer_id
);

-- 마일스톤 정책
CREATE POLICY "Contract parties can view milestones" ON contract_milestones FOR SELECT USING (
    auth.uid() IN (SELECT client_id FROM contracts WHERE id = contract_id) OR
    auth.uid() IN (SELECT designer_id FROM contracts WHERE id = contract_id)
);
CREATE POLICY "Contract parties can manage milestones" ON contract_milestones FOR ALL USING (
    auth.uid() IN (SELECT client_id FROM contracts WHERE id = contract_id) OR
    auth.uid() IN (SELECT designer_id FROM contracts WHERE id = contract_id)
);

-- 메시지 정책
CREATE POLICY "Project members can view messages" ON messages FOR SELECT USING (
    auth.uid() IN (SELECT client_id FROM projects WHERE id = project_id) OR
    auth.uid() IN (SELECT designer_id FROM projects WHERE id = project_id) OR
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
);
CREATE POLICY "Project members can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT client_id FROM projects WHERE id = project_id) OR
    auth.uid() IN (SELECT designer_id FROM projects WHERE id = project_id)
);

-- 파일 정책
CREATE POLICY "Project members can view files" ON files FOR SELECT USING (
    project_id IS NULL OR
    auth.uid() IN (SELECT client_id FROM projects WHERE id = project_id) OR
    auth.uid() IN (SELECT designer_id FROM projects WHERE id = project_id) OR
    auth.uid() = uploaded_by
);
CREATE POLICY "Users can upload files" ON files FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- 결제 정책
CREATE POLICY "Payment parties can view payments" ON payments FOR SELECT USING (
    auth.uid() = payer_id OR auth.uid() = payee_id
);
CREATE POLICY "Payers can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = payer_id);

-- 리뷰 정책
CREATE POLICY "Anyone can view public reviews" ON reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (
    auth.uid() = reviewer_id OR auth.uid() = reviewee_id
);
CREATE POLICY "Contract parties can create reviews" ON reviews FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT client_id FROM contracts WHERE id = contract_id) OR
    auth.uid() IN (SELECT designer_id FROM contracts WHERE id = contract_id)
);

-- 알림 정책
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 9단계: 인덱스 생성 (성능 최적화)
-- =====================================================

-- 사용자 프로필 인덱스
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_skills ON user_profiles USING GIN(skills);
CREATE INDEX idx_user_profiles_rating ON user_profiles(rating DESC);

-- 프로젝트 인덱스
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_designer_id ON projects(designer_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_skills ON projects USING GIN(skills_required);

-- 프로젝트 지원 인덱스
CREATE INDEX idx_project_applications_project_id ON project_applications(project_id);
CREATE INDEX idx_project_applications_designer_id ON project_applications(designer_id);
CREATE INDEX idx_project_applications_status ON project_applications(status);

-- 계약 인덱스
CREATE INDEX idx_contracts_project_id ON contracts(project_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_designer_id ON contracts(designer_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- 메시지 인덱스
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- 알림 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ✅ 테이블 생성 완료!
-- =====================================================

-- 생성된 테이블 확인
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 