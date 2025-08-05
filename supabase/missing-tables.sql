-- =====================================================
-- 🔧 누락된 테이블 생성 SQL
-- =====================================================
-- 이미 생성된 테이블: user_profiles, projects, contracts, messages, notifications
-- 누락된 테이블: project_applications, contract_milestones, files, payments, reviews

-- 필요한 ENUM 타입들 (이미 존재할 수도 있음 - 오류 무시)
DO $$ 
BEGIN
    -- application_status ENUM 생성 (존재하지 않는 경우만)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
    END IF;
    
    -- milestone_status ENUM 생성 (존재하지 않는 경우만)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_status') THEN
        CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'approved', 'rejected');
    END IF;
END $$;

-- 1. project_applications (프로젝트 지원서)
CREATE TABLE IF NOT EXISTS project_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    designer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    status application_status DEFAULT 'pending',
    cover_letter TEXT,
    portfolio_links TEXT[],
    proposed_timeline INTEGER, -- 일 단위
    proposed_budget DECIMAL(10,2),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 중복 지원 방지
    UNIQUE(project_id, designer_id)
);

-- 2. contract_milestones (계약 마일스톤)
CREATE TABLE IF NOT EXISTS contract_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    status milestone_status DEFAULT 'pending',
    deliverables TEXT[],
    completed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. files (파일 관리)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES contract_milestones(id) ON DELETE CASCADE,
    
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL, -- bytes
    file_type file_type NOT NULL,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL, -- Supabase Storage 경로
    
    -- 메타데이터
    title VARCHAR(255),
    description TEXT,
    tags TEXT[],
    
    -- 파일 상태
    is_public BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 적어도 하나의 연결은 있어야 함
    CONSTRAINT files_connection_check CHECK (
        project_id IS NOT NULL OR 
        message_id IS NOT NULL OR 
        milestone_id IS NOT NULL
    )
);

-- 4. payments (결제 관리)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES contract_milestones(id) ON DELETE SET NULL,
    
    payer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    payee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    status payment_status DEFAULT 'pending',
    payment_method payment_method,
    
    -- 결제 프로세서 정보
    transaction_id VARCHAR(255), -- 외부 결제 시스템 ID
    processor_response JSONB, -- 결제 프로세서 응답 데이터
    
    -- 결제 일정
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- 수수료
    platform_fee DECIMAL(10,2),
    processing_fee DECIMAL(10,2),
    
    -- 메모
    description TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. reviews (리뷰/평가)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- 평가 점수
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    
    -- 세부 평가 (선택사항)
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    
    -- 리뷰 내용
    title VARCHAR(255),
    content TEXT,
    
    -- 추천 여부
    would_recommend BOOLEAN,
    
    -- 공개 설정
    is_public BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 한 계약당 한 번만 리뷰 가능
    UNIQUE(contract_id, reviewer_id)
);

-- =====================================================
-- 인덱스 생성
-- =====================================================

-- project_applications 인덱스
CREATE INDEX IF NOT EXISTS idx_project_applications_project_id ON project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_designer_id ON project_applications(designer_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_status ON project_applications(status);

-- contract_milestones 인덱스
CREATE INDEX IF NOT EXISTS idx_contract_milestones_contract_id ON contract_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_milestones_status ON contract_milestones(status);
CREATE INDEX IF NOT EXISTS idx_contract_milestones_due_date ON contract_milestones(due_date);

-- files 인덱스
CREATE INDEX IF NOT EXISTS idx_files_uploader_id ON files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type);

-- payments 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee_id ON payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- reviews 인덱스
CREATE INDEX IF NOT EXISTS idx_reviews_contract_id ON reviews(contract_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================

-- project_applications RLS
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_applications_select_policy" ON project_applications
    FOR SELECT USING (
        designer_id = auth.uid() OR 
        project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
    );

CREATE POLICY "project_applications_insert_policy" ON project_applications
    FOR INSERT WITH CHECK (designer_id = auth.uid());

CREATE POLICY "project_applications_update_policy" ON project_applications
    FOR UPDATE USING (
        designer_id = auth.uid() OR 
        project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
    );

-- contract_milestones RLS
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contract_milestones_policy" ON contract_milestones
    FOR ALL USING (
        contract_id IN (
            SELECT id FROM contracts 
            WHERE client_id = auth.uid() OR designer_id = auth.uid()
        )
    );

-- files RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_policy" ON files
    FOR ALL USING (
        uploader_id = auth.uid() OR
        project_id IN (
            SELECT id FROM projects 
            WHERE client_id = auth.uid() OR designer_id = auth.uid()
        )
    );

-- payments RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_policy" ON payments
    FOR ALL USING (
        payer_id = auth.uid() OR 
        payee_id = auth.uid()
    );

-- reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_policy" ON reviews
    FOR SELECT USING (
        is_public = TRUE OR 
        reviewer_id = auth.uid() OR 
        reviewee_id = auth.uid()
    );

CREATE POLICY "reviews_insert_update_policy" ON reviews
    FOR ALL USING (reviewer_id = auth.uid());

-- =====================================================
-- 트리거 함수 및 트리거 생성
-- =====================================================

-- updated_at 트리거 (이미 존재할 수 있음)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 추가
CREATE TRIGGER update_project_applications_updated_at
    BEFORE UPDATE ON project_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_milestones_updated_at
    BEFORE UPDATE ON contract_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 완료 메시지
-- =====================================================

-- 성공 메시지를 위한 간단한 SELECT
SELECT 
    '✅ 누락된 테이블 생성 완료!' as status,
    '다음 테이블들이 생성되었습니다:' as message;

SELECT 
    'project_applications' as table_name,
    '프로젝트 지원서 관리' as description
UNION ALL
SELECT 
    'contract_milestones',
    '계약 마일스톤 관리'
UNION ALL
SELECT 
    'files',
    '파일 업로드 및 관리'
UNION ALL
SELECT 
    'payments',
    '결제 내역 관리'
UNION ALL
SELECT 
    'reviews',
    '리뷰 및 평가 시스템'; 