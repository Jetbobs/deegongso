-- =====================================================
-- 🎯 샘플 데이터 (개발/테스트용)
-- =====================================================

-- 주의: 이 파일은 개발 환경에서만 사용하세요!
-- 프로덕션 환경에서는 실행하지 마세요.

-- =====================================================
-- 1. 테스트 사용자 프로필 생성
-- =====================================================

-- 실제 사용 시에는 Supabase Auth를 통해 사용자를 먼저 생성해야 합니다.
-- 여기서는 예시 UUID를 사용합니다.

-- 클라이언트 사용자들
INSERT INTO user_profiles (id, email, full_name, role, company_name, bio, location) VALUES
('11111111-1111-1111-1111-111111111111', 'client1@example.com', '김철수', 'client', '(주)테크스타트업', 'IT 스타트업 대표입니다.', '서울'),
('22222222-2222-2222-2222-222222222222', 'client2@example.com', '박영희', 'client', '글로벌코퍼레이션', '대기업 마케팅팀장입니다.', '부산'),
('33333333-3333-3333-3333-333333333333', 'client3@example.com', '이민수', 'client', '로컬비즈니스', '로컬 비즈니스를 운영하고 있습니다.', '대구');

-- 디자이너 사용자들
INSERT INTO user_profiles (id, email, full_name, role, bio, portfolio_url, hourly_rate, skills, location, rating, total_projects) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'designer1@example.com', '정지훈', 'designer', '5년차 UI/UX 디자이너입니다. 사용자 중심의 디자인을 추구합니다.', 'https://portfolio1.com', 80000, ARRAY['UI/UX', '웹디자인', 'Figma', 'Adobe XD'], '서울', 4.8, 15),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'designer2@example.com', '최수영', 'designer', '브랜딩과 로고 디자인 전문가입니다.', 'https://portfolio2.com', 60000, ARRAY['브랜딩', '로고디자인', 'Illustrator', 'Photoshop'], '인천', 4.6, 22),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'designer3@example.com', '한승우', 'designer', '모바일 앱 디자인에 특화된 디자이너입니다.', 'https://portfolio3.com', 70000, ARRAY['모바일디자인', 'UI/UX', 'Sketch', 'Framer'], '서울', 4.9, 8),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'designer4@example.com', '송미래', 'designer', '그래픽 디자인과 일러스트레이션 전문가입니다.', 'https://portfolio4.com', 50000, ARRAY['그래픽디자인', '일러스트', 'Illustrator', 'Photoshop'], '대전', 4.7, 12);

-- =====================================================
-- 2. 샘플 프로젝트 생성
-- =====================================================

INSERT INTO projects (id, title, description, category, status, priority, client_id, designer_id, fixed_budget, deadline, skills_required, is_remote) VALUES
-- 진행중인 프로젝트
('p1111111-1111-1111-1111-111111111111', '커머스 웹사이트 리디자인', '기존 쇼핑몰 웹사이트의 전체적인 UI/UX 개선이 필요합니다. 모바일 최적화와 사용자 경험 향상에 중점을 둡니다.', 'web_design', 'in_progress', 'high', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3000000, '2024-04-15', ARRAY['UI/UX', '웹디자인', '반응형'], true),

-- 모집중인 프로젝트들
('p2222222-2222-2222-2222-222222222222', '브랜드 로고 및 아이덴티티 디자인', '새로운 브랜드 론칭을 위한 로고 및 브랜드 아이덴티티 전체 디자인이 필요합니다.', 'branding', 'published', 'medium', '22222222-2222-2222-2222-222222222222', NULL, 1500000, '2024-03-30', ARRAY['브랜딩', '로고디자인', 'Adobe Creative Suite'], true),

('p3333333-3333-3333-3333-333333333333', '모바일 앱 UI 디자인', '헬스케어 관련 모바일 앱의 전체 UI 디자인을 의뢰합니다. 사용자 친화적인 인터페이스가 중요합니다.', 'mobile_design', 'published', 'high', '33333333-3333-3333-3333-333333333333', NULL, 2500000, '2024-04-20', ARRAY['모바일디자인', 'UI/UX', 'Figma'], true),

('p4444444-4444-4444-4444-444444444444', '회사 브로셔 디자인', '회사 소개 브로셔 및 마케팅 자료 디자인이 필요합니다.', 'graphic_design', 'published', 'low', '11111111-1111-1111-1111-111111111111', NULL, 800000, '2024-03-25', ARRAY['그래픽디자인', 'InDesign', 'Illustrator'], false),

-- 완료된 프로젝트
('p5555555-5555-5555-5555-555555555555', '웹사이트 랜딩페이지 디자인', '제품 홍보를 위한 랜딩페이지 디자인 프로젝트였습니다.', 'web_design', 'completed', 'medium', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1200000, '2024-02-28', ARRAY['웹디자인', 'UI/UX'], true);

-- =====================================================
-- 3. 프로젝트 지원 내역
-- =====================================================

INSERT INTO project_applications (project_id, designer_id, cover_letter, proposed_budget, estimated_duration, status) VALUES
-- 브랜드 로고 프로젝트 지원들
('p2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '안녕하세요! 브랜딩 전문 디자이너 최수영입니다. 귀하의 브랜드에 맞는 독창적이고 기억에 남는 로고를 디자인해드리겠습니다.', 1400000, 10, 'pending'),
('p2222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '그래픽 디자인 전문가로서 브랜드의 가치를 시각적으로 표현하는 것에 자신 있습니다.', 1300000, 12, 'pending'),

-- 모바일 앱 디자인 프로젝트 지원들
('p3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '모바일 앱 디자인 전문가 한승우입니다. 헬스케어 앱 디자인 경험이 많습니다.', 2300000, 15, 'pending'),
('p3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UI/UX 관점에서 사용자가 쉽게 사용할 수 있는 헬스케어 앱을 디자인하겠습니다.', 2400000, 18, 'pending'),

-- 브로셔 디자인 프로젝트 지원들
('p4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '그래픽 디자인과 인쇄물 디자인에 특화되어 있습니다.', 750000, 7, 'pending');

-- =====================================================
-- 4. 진행중인 프로젝트의 계약 및 마일스톤
-- =====================================================

-- 커머스 웹사이트 프로젝트 계약
INSERT INTO contracts (id, project_id, client_id, designer_id, title, description, payment_type, total_amount, status, terms_and_conditions, client_signature_date, designer_signature_date) VALUES
('c1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '커머스 웹사이트 리디자인 계약', '쇼핑몰 웹사이트의 전체적인 UI/UX 개선 작업', 'milestone', 3000000, 'active', '프로젝트는 3단계로 나누어 진행되며, 각 단계별로 검토 및 승인 과정을 거칩니다.', '2024-02-01 09:00:00+00', '2024-02-01 14:30:00+00');

-- 완료된 프로젝트 계약
INSERT INTO contracts (id, project_id, client_id, designer_id, title, description, payment_type, total_amount, status, terms_and_conditions, client_signature_date, designer_signature_date) VALUES
('c2222222-2222-2222-2222-222222222222', 'p5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '랜딩페이지 디자인 계약', '제품 홍보용 랜딩페이지 디자인', 'fixed', 1200000, 'completed', '단일 페이지 디자인으로 모바일/데스크톱 반응형 디자인 포함', '2024-01-15 10:00:00+00', '2024-01-15 11:00:00+00');

-- 진행중 프로젝트 마일스톤들
INSERT INTO contract_milestones (contract_id, title, description, amount, due_date, status, order_index, completed_at, approved_at) VALUES
('c1111111-1111-1111-1111-111111111111', '1단계: 사용자 리서치 및 와이어프레임', '기존 사이트 분석, 사용자 리서치, 와이어프레임 제작', 800000, '2024-03-01', 'approved', 1, '2024-02-28 15:00:00+00', '2024-03-01 09:00:00+00'),
('c1111111-1111-1111-1111-111111111111', '2단계: 디자인 시안 및 프로토타입', '메인 페이지 및 주요 페이지 디자인, 프로토타입 제작', 1500000, '2024-03-20', 'in_progress', 2, NULL, NULL),
('c1111111-1111-1111-1111-111111111111', '3단계: 최종 디자인 및 가이드라인', '전체 페이지 디자인 완성, 디자인 시스템 및 가이드라인 제작', 700000, '2024-04-15', 'pending', 3, NULL, NULL);

-- 완료된 프로젝트 마일스톤
INSERT INTO contract_milestones (contract_id, title, description, amount, due_date, status, order_index, completed_at, approved_at, paid_at) VALUES
('c2222222-2222-2222-2222-222222222222', '랜딩페이지 디자인 완성', '제품 홍보용 랜딩페이지 전체 디자인', 1200000, '2024-02-28', 'paid', 1, '2024-02-25 16:00:00+00', '2024-02-26 10:00:00+00', '2024-02-27 14:00:00+00');

-- =====================================================
-- 5. 메시지 샘플
-- =====================================================

INSERT INTO messages (project_id, sender_id, recipient_id, content, message_type, created_at) VALUES
-- 진행중 프로젝트 메시지들
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '안녕하세요! 프로젝트 시작을 환영합니다. 기대하고 있습니다.', 'text', '2024-02-01 15:00:00+00'),
('p1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '안녕하세요! 먼저 현재 웹사이트의 문제점과 개선하고 싶은 부분에 대해 더 자세히 알려주실 수 있나요?', 'text', '2024-02-01 15:30:00+00'),
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '주요 문제점은 모바일에서의 사용성이 떨어지는 것과 결제 프로세스가 복잡한 점입니다.', 'text', '2024-02-01 16:00:00+00'),
('p1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '1단계 와이어프레임 작업이 완료되었습니다. 검토해 주시기 바랍니다.', 'text', '2024-02-28 15:00:00+00'),
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '와이어프레임 확인했습니다. 훌륭한 작업이네요! 승인하겠습니다.', 'text', '2024-03-01 09:00:00+00');

-- =====================================================
-- 6. 결제 내역
-- =====================================================

INSERT INTO payments (contract_id, milestone_id, payer_id, payee_id, amount, fee, net_amount, payment_method, payment_status, processed_at) VALUES
-- 완료된 결제
('c2222222-2222-2222-2222-222222222222', (SELECT id FROM contract_milestones WHERE contract_id = 'c2222222-2222-2222-2222-222222222222' LIMIT 1), '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1200000, 60000, 1140000, 'credit_card', 'completed', '2024-02-27 14:00:00+00'),

-- 1단계 결제 (진행중 프로젝트)
('c1111111-1111-1111-1111-111111111111', (SELECT id FROM contract_milestones WHERE contract_id = 'c1111111-1111-1111-1111-111111111111' AND order_index = 1), '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 800000, 40000, 760000, 'credit_card', 'completed', '2024-03-01 10:00:00+00');

-- =====================================================
-- 7. 리뷰 데이터
-- =====================================================

INSERT INTO reviews (project_id, contract_id, reviewer_id, reviewee_id, rating, title, comment) VALUES
-- 완료된 프로젝트 상호 리뷰
('p5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '완벽한 작업!', '기대했던 것보다 훨씬 좋은 결과물을 받았습니다. 소통도 원활했고 일정도 잘 지켜주셨어요.'),
('p5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 5, '좋은 클라이언트', '요구사항이 명확했고 빠른 피드백을 주셔서 작업하기 좋았습니다.');

-- =====================================================
-- 8. 알림 데이터
-- =====================================================

INSERT INTO notifications (user_id, type, title, message, data, is_read) VALUES
-- 클라이언트 알림들
('11111111-1111-1111-1111-111111111111', 'milestone_completed', '마일스톤 완료', '1단계: 사용자 리서치 및 와이어프레임이 완료되었습니다.', '{"project_id": "p1111111-1111-1111-1111-111111111111", "milestone_id": "1"}', true),
('11111111-1111-1111-1111-111111111111', 'project_application', '새로운 지원자', '브로셔 디자인 프로젝트에 새로운 지원자가 있습니다.', '{"project_id": "p4444444-4444-4444-4444-444444444444"}', false),

-- 디자이너 알림들
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'milestone_approved', '마일스톤 승인', '1단계 작업이 승인되었습니다. 결제가 처리되었습니다.', '{"project_id": "p1111111-1111-1111-1111-111111111111"}', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'payment_received', '결제 완료', '랜딩페이지 디자인 프로젝트 결제가 완료되었습니다.', '{"project_id": "p5555555-5555-5555-5555-555555555555", "amount": 1140000}', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'message_received', '새 메시지', '모바일 앱 디자인 프로젝트와 관련된 새 메시지가 있습니다.', '{"project_id": "p3333333-3333-3333-3333-333333333333"}', false);

-- =====================================================
-- 9. 파일 업로드 샘플 (Supabase Storage URL 예시)
-- =====================================================

INSERT INTO files (project_id, uploaded_by, file_name, file_url, file_size, file_type, description, is_final_deliverable) VALUES
('p1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'wireframe_v1.pdf', 'https://your-project.supabase.co/storage/v1/object/public/project-files/wireframe_v1.pdf', 2048576, 'document', '1단계 와이어프레임 문서', false),
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'reference_images.zip', 'https://your-project.supabase.co/storage/v1/object/public/project-files/reference_images.zip', 5242880, 'archive', '참고 이미지 모음', false),
('p5555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'landing_page_final.fig', 'https://your-project.supabase.co/storage/v1/object/public/project-files/landing_page_final.fig', 15728640, 'design', '최종 랜딩페이지 디자인 파일', true);

-- =====================================================
-- ✅ 샘플 데이터 생성 완료
-- =====================================================

-- 생성된 데이터 확인 쿼리들:
-- SELECT COUNT(*) FROM user_profiles;
-- SELECT COUNT(*) FROM projects;
-- SELECT COUNT(*) FROM project_applications;
-- SELECT COUNT(*) FROM contracts;
-- SELECT COUNT(*) FROM contract_milestones;
-- SELECT COUNT(*) FROM messages;
-- SELECT COUNT(*) FROM payments;
-- SELECT COUNT(*) FROM reviews;
-- SELECT COUNT(*) FROM notifications;
-- SELECT COUNT(*) FROM files; 