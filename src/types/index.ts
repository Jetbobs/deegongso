// 사용자 관련 타입
export type UserRole = "client" | "designer" | "admin";

// 기본 사용자 정보
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// 클라이언트 사용자 정보
export interface ClientUser extends BaseUser {
  role: "client";
  company?: string;
  department?: string;
  title?: string; // 직책
}

// 디자이너 사용자 정보
export interface DesignerUser extends BaseUser {
  role: "designer";
  phone: string;
  created_at: string;
  updated_at: string;
  experience?: string;
  specialization?: string[];
  portfolio_url?: string;
  strengths?: string[]; // 강점
  title?: string; // 직책/타이틀
  isVerified?: boolean; // 인증 여부
  bio?: string; // 자기소개
}

// 어드민 사용자 정보
export interface AdminUser extends BaseUser {
  role: "admin";
  admin_level: "super" | "moderator" | "support";
  permissions: AdminPermissions;
}

// 유니온 타입
export type User = ClientUser | DesignerUser | AdminUser;

// 임시 사용자 타입 (회원가입 플로우용)
export interface TempUser {
  id?: string;
  email: string;
  name: string;
  userType?: UserRole;
}

// 회원가입 폼 데이터 타입
export interface SignupFormData {
  email: string;
  name: string;
  phone: string;
  userType: "client" | "designer" | "";
  company?: string;
  department?: string;
  experience?: string;
  specialization?: string[];
  portfolio_url?: string;
}

// 이벤트 핸들러 타입들
export interface EventHandlerProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

// 파일 관련 타입
export interface FileWithPreview extends File {
  preview?: string;
}

// 검색 결과 타입
export interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'message' | 'user' | 'file';
  description?: string;
  url: string;
}

// 프로젝트 관련 타입
export type ProjectStatus =
  | "creation_pending" // 프로젝트 생성 승인 대기 중
  | "review_requested" // 검토 요청 중 (제출 후 승인/검토 대기)
  | "client_review_pending" // 클라이언트 검토 대기 중
  | "designer_review_pending" // 디자이너 검토 대기 중
  | "in_progress" // 진행 중
  | "feedback_period" // 피드백 정리 기간
  | "modification_in_progress" // 수정 작업 중
  | "completion_requested" // 완료 요청됨 (디자이너가 완료 요청, 클라이언트 승인 대기)
  | "completed" // 완료
  | "archived" // 아카이브됨
  | "cancelled"; // 취소

// 프로젝트 협업 상태
export type ProjectCollaborationStatus = 
  | "draft" // 디자이너 초안 작성중
  | "designer_review" // 디자이너 검토중
  | "client_input_required" // 클라이언트 정보 입력 대기
  | "client_reviewing" // 클라이언트 검토중  
  | "mutual_review" // 상호 검토중
  | "approved" // 양측 승인 완료
  | "rejected" // 거절됨
  | "revision_needed"; // 수정 필요

// 결제 조건 타입
export interface PaymentTerms {
  method: "lump_sum" | "installment" | "milestone";
  type?: "upfront" | "after" | "split"; // 호환성을 위해 유지
  upfrontPercentage?: number;
  installmentRatio?: number;
  installmentSchedule?: string;
  description?: string;
}

// 프로젝트 일정 타입
export interface ProjectSchedule {
  startDate: string;
  endDate: string;
  draftDeadline: string;
  firstReviewDeadline: string;
  finalReviewDeadline: string;
  finalDeadline?: string; // 호환성을 위한 추가
  [key: string]: unknown; // 인덱스 시그니처 추가
}

// 협업 기반 프로젝트 제안서
export interface ProjectProposal {
  id: string;
  name: string;
  description: string;
  category: string;
  collaboration_status: ProjectCollaborationStatus;
  
  // 디자이너 작성 부분
  designer_section: {
    service_scope: string; // 서비스 범위
    estimated_price: number;
    total_modification_count: number;
    additional_modification_fee: number; // 추가 수정 건당 요금
    suggested_timeline: {
      total_duration: number; // 총 소요기간 (일)
      draft_deadline: string;
      first_review_deadline: string;
      final_review_deadline: string;
    };
    payment_terms: { method: "upfront" | "after" | "split"; installmentRatio?: number; installmentSchedule?: string; };
    designer_notes: string; // 디자이너 전문 의견
    portfolio_references?: string[]; // 포트폴리오 참조
  };
  
  // 클라이언트 작성 부분
  client_section?: {
    detailed_requirements: string; // 구체적 요구사항
    reference_materials: string[]; // 참고자료 파일 경로
    preferred_timeline?: {
      start_date: string;
      end_date: string;
      special_deadlines?: string; // 특별한 마감일정
    };
    budget_feedback?: {
      is_acceptable: boolean;
      counter_offer?: number;
      budget_notes?: string;
    };
    additional_requests: string; // 추가 요청사항
    client_notes: string; // 클라이언트 메모
  };
  
  // 공통 정보
  client_email: string;
  client_company?: string;
  designer_id: string;
  
  // 승인 관련
  designer_approved: boolean;
  client_approved: boolean;
  
  // 메타데이터
  created_at: string;
  updated_at: string;
  last_modified_by: "designer" | "client";
  
  // 커뮤니케이션
  comments: ProjectComment[];
  notifications: ProjectNotification[];
}

// 프로젝트 댓글
export interface ProjectComment {
  id: string;
  proposal_id: string;
  author_id: string;
  author_type: "designer" | "client";
  content: string;
  created_at: string;
  edited: boolean;
}

// 프로젝트 알림
export interface ProjectNotification {
  id: string;
  proposal_id: string;
  recipient_id: string;
  type: "status_change" | "comment_added" | "approval_request" | "revision_request";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  client_id: string;
  designer_id: string;

  // 일정 관련
  start_date: string;
  end_date: string;
  draft_deadline: string;
  first_review_deadline: string;
  final_review_deadline: string;

  // 프로젝트 조건
  estimated_price: number;
  total_modification_count: number;
  remaining_modification_count: number;
  additional_modification_fee: number; // 추가 수정 건당 요금
  modification_history: ModificationRecord[]; // 수정 이력

  // 예산 관련
  budget_used: number; // 사용된 예산 (실제 작업 시간 * 시간당 요금 등)
  additional_costs?: ProjectCost[]; // 추가 비용 항목들

  // 요구사항 및 자료
  requirements: string;
  attached_files?: string[];
  contract_file?: string;

  // 완료 관련
  completion_requested_at?: string;
  completion_note?: string; // 디자이너의 완료 요청 메모
  final_deliverables?: string[]; // 최종 산출물 파일들
  completed_at?: string;
  archived_at?: string;

  // 메타데이터
  created_at: string;
  updated_at: string;
}

// 보고물 관련 타입
export type ReportType = "draft" | "first_review" | "final_review";

export interface Report {
  id: string;
  project_id: string;
  type: ReportType;
  title: string;
  description?: string;
  files: string[];
  submitted_at: string;
  deadline: string;
}

// 피드백 관련 타입
export interface Feedback {
  id: string;
  project_id: string;
  report_id: string;
  content: string;
  content_html: string; // 리치 텍스트 HTML
  attachments?: FeedbackAttachment[];
  annotations?: FeedbackAnnotation[];
  is_official: boolean; // 공식 피드백 여부 (수정 횟수 차감)
  priority: "low" | "medium" | "high" | "critical";
  category: "design" | "content" | "functionality" | "technical" | "other";
  status: "pending" | "acknowledged" | "in_progress" | "resolved" | "rejected";
  submitted_at: string;
  updated_at: string;
  resolved_at?: string;
  client_id: string;
  version: number; // 피드백 버전
  parent_feedback_id?: string; // 답글인 경우 부모 피드백 ID
  revision_request_count: number; // 이 피드백으로 인한 수정 요청 횟수
  comment_count?: number; // 댓글 수
  title?: string; // 피드백 제목
  created_at: string; // 생성 시간
  isArchived?: boolean; // 아카이브 상태
}

// 피드백 첨부파일
export interface FeedbackAttachment {
  id: string;
  feedback_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url?: string;
  uploaded_at: string;
}

// 피드백 주석 (이미지나 파일에 대한 주석)
export interface FeedbackAnnotation {
  id: string;
  feedback_id: string;
  target_file_id: string; // 주석 대상 파일 ID
  annotation_type: "point" | "area" | "text";
  position_x: number;
  position_y: number;
  width?: number;
  height?: number;
  content: string;
  created_at: string;
}

// 피드백 템플릿
export interface FeedbackTemplate {
  id: string;
  name: string;
  description: string;
  content_template: string;
  category: string;
  is_system: boolean;
  created_by: string;
  created_at: string;
}

// 댓글 관련 타입
export interface Comment {
  id: string;
  project_id: string;
  report_id?: string;
  user_id: string;
  content: string;
  created_at: string;
}

// 일정 수정 요청 타입
export interface ScheduleChangeRequest {
  id: string;
  project_id: string;
  requested_by: string;
  change_type: "draft" | "first_review" | "final_review" | "end_date";
  current_date: string;
  requested_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  response_reason?: string;
  created_at: string;
  responded_at?: string;
}

// 리뷰 및 평점 관련 타입
export interface ProjectReview {
  id: string;
  project_id: string;
  reviewer_id: string; // 리뷰를 작성한 사람
  reviewee_id: string; // 리뷰를 받는 사람
  overall_rating: number; // 1-5 전체 평점
  professionalism_rating: number; // 전문성
  communication_rating: number; // 소통 능력
  deadline_adherence_rating: number; // 마감일 준수
  satisfaction_rating: number; // 결과물 만족도
  review_text?: string; // 텍스트 리뷰
  is_anonymous: boolean; // 익명 여부
  created_at: string;
}

// 완료 요청 관련 타입
export interface CompletionRequest {
  id: string;
  project_id: string;
  requested_by: string; // 디자이너 ID
  completion_note: string; // 완료 요청 메모
  final_deliverables: string[]; // 최종 산출물 파일들
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  responded_at?: string;
  response_note?: string; // 클라이언트의 응답 메모
}

// 프로젝트 비용 항목
export interface ProjectCost {
  id: string;
  project_id: string;
  description: string;
  amount: number;
  cost_type: "base_fee" | "modification_fee" | "rush_fee" | "additional_work" | "other";
  created_at: string;
}

// 수정요청 관리 타입
export interface ModificationRequest {
  id: string;
  project_id: string;
  request_number: number; // 1, 2, 3...
  feedback_ids: string[]; // 이 수정요청에 포함된 피드백들
  status: "pending" | "clarification_needed" | "approved" | "in_progress" | "completed" | "rejected";
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  description: string; // 수정요청 요약
  urgency: "normal" | "urgent";
  requested_by: string; // 요청자 ID
  approved_by?: string; // 승인자 ID
  rejection_reason?: string; // 거절 사유
  clarification_requests?: ClarificationRequest[]; // 세부 설명 재요청 목록
  is_additional_cost: boolean; // 추가 비용 발생 여부
  additional_cost_amount?: number; // 추가 비용 금액
  notes?: string; // 추가 메모
  rejected_at?: string; // 거절 시간
  rejected?: boolean; // 거절 여부
  work_progress?: WorkProgress; // 작업 진행 상황
}

// 세부 설명 재요청 타입
export interface ClarificationRequest {
  id: string;
  modification_request_id: string;
  feedback_id: string; // 어떤 피드백에 대한 재요청인지
  question: string; // 디자이너의 질문
  response?: string; // 클라이언트의 답변
  status: "pending" | "answered" | "resolved";
  requested_by: string; // 디자이너 ID
  requested_at: string;
  answered_at?: string;
  resolved_at?: string;
}

// 작업 진행 상황 타입
export interface WorkProgress {
  modification_request_id: string;
  checklist_items: WorkChecklistItem[];
  overall_progress: number; // 0-100 전체 진행률
  estimated_completion: string; // 예상 완료일
  actual_start_date?: string; // 실제 시작일
  status: "not_started" | "in_progress" | "review_ready" | "completed";
  last_updated: string;
  notes?: string; // 진행 상황 메모
}

export interface WorkChecklistItem {
  id: string;
  title: string; // 작업 제목
  description?: string; // 상세 설명
  category: "design" | "development" | "review" | "delivery" | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "blocked" | "skipped";
  progress_percentage: number; // 0-100 개별 진행률
  estimated_hours?: number; // 예상 소요 시간
  actual_hours?: number; // 실제 소요 시간
  assigned_to?: string; // 담당자 (대개 디자이너)
  dependencies?: string[]; // 의존성 있는 다른 체크리스트 아이템
  started_at?: string;
  completed_at?: string;
  blocked_reason?: string; // 차단 사유
  notes?: string; // 작업 메모
  attachments?: WorkAttachment[]; // 체크리스트 항목 관련 파일
  time_logs?: WorkTimeLog[]; // 시간 기록
  comment_count?: number; // 댓글 수
  has_unresolved_comments?: boolean; // 미해결 댓글이 있는지
}

export interface WorkAttachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  description?: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface WorkTimeLog {
  id: string;
  checklist_item_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  description?: string;
  work_type: "design" | "development" | "review" | "communication" | "other";
  logged_by: string;
  logged_at: string;
}

// 진행 상황 업데이트 이벤트
export interface ProgressUpdateEvent {
  id: string;
  modification_request_id: string;
  checklist_item_id?: string;
  event_type: "started" | "progress_updated" | "completed" | "blocked" | "note_added" | "file_attached";
  description: string;
  old_value?: string | number | boolean;
  new_value?: string | number | boolean;
  created_by: string;
  created_at: string;
}

// 피드백 명확성 평가 타입
export interface FeedbackClarityAssessment {
  feedback_id: string;
  is_clear: boolean;
  clarity_score: number; // 1-5 점
  issues: ClarityIssue[];
  suggestions?: string; // 개선 제안
  assessed_by: string; // 디자이너 ID
  assessed_at: string;
}

export interface ClarityIssue {
  type: "vague" | "missing_details" | "conflicting" | "technical_unclear" | "reference_needed";
  description: string;
  suggestion?: string;
}

// 수정 기록 타입
export interface ModificationRecord {
  id: string;
  project_id: string;
  modification_number: number; // 1, 2, 3...
  description: string;
  is_additional: boolean; // 추가 수정 여부
  additional_fee?: number; // 추가 수정 시 부과된 요금
  requested_at: string;
  completed_at?: string;
  requested_by: string; // 요청자 ID
  approved_by?: string; // 승인자 ID
}

// 수정횟수 현황 타입
export interface ModificationTracker {
  project_id: string;
  total_allowed: number; // 계약된 총 수정횟수
  used: number; // 사용된 횟수 (완료된 수정요청 수)
  in_progress: number; // 진행중인 수정요청 수
  remaining: number; // 남은 횟수
  requests: ModificationRequest[]; // 모든 수정요청들
  additional_requests: ModificationRequest[]; // 추가 비용 발생 요청들
  total_additional_cost: number; // 총 추가 비용
  last_updated: string;
}

// 수정요청 생성 폼 데이터
export interface ModificationRequestFormData {
  description: string;
  feedback_ids: string[];
  urgency: "normal" | "urgent";
  estimated_completion_date?: string;
  notes?: string;
}

// 시안 버전 관리 타입
export interface DesignVersion {
  id: string;
  project_id: string;
  version_number: number; // v1, v2, v3...
  title?: string; // 사용자 정의 제목
  description?: string; // 버전 설명
  files: DesignFile[]; // 시안 파일들
  thumbnail_url?: string; // 썸네일 이미지
  created_by: string; // 업로더 ID (디자이너)
  created_at: string;
  is_current: boolean; // 현재 작업 중인 버전
  is_approved: boolean; // 클라이언트 승인 여부
  approved_at?: string;
  approved_by?: string; // 승인자 ID
}

export interface DesignFile {
  id: string;
  version_id: string;
  filename: string;
  original_filename: string;
  file_type: string; // 'image/jpeg', 'image/png', 'application/x-psd' 등
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  is_primary: boolean; // 대표 이미지 여부
  uploaded_at: string;
}

export interface VersionComparison {
  version_a: DesignVersion;
  version_b: DesignVersion;
  comparison_mode: 'side-by-side' | 'overlay' | 'slider';
}

// 마크업 시스템 타입
export interface ImageMarkup {
  id: string;
  version_id: string;
  x: number; // 백분율 (0-100)
  y: number; // 백분율 (0-100)
  type: MarkupType;
  number: number; // 마크업 순서 번호
  feedback_id?: string; // 연결된 피드백 ID
  created_at: string;
  created_by: string;
  color?: string; // 마크업 색상
  size?: number; // 마크업 크기
  comment_count?: number; // 댓글 수
  has_unresolved_comments?: boolean; // 미해결 댓글이 있는지
}

export type MarkupType = 'point' | 'circle' | 'arrow' | 'rectangle' | 'text' | 'freehand';

export interface MarkupFeedback {
  id: string;
  markup_id: string;
  version_id: string;
  project_id: string;
  title: string;
  description: string;
  additionalText?: string;
  referenceUrls?: string[]; // 레퍼런스 URL 목록
  referenceFiles?: FeedbackFile[]; // 첨부 파일 목록
  category: FeedbackCategory;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  suggested_changes?: SuggestedChange[];
  created_at: string;
  created_by: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface FeedbackFile {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface ChecklistItem {
  id: string;
  content: string;
  description?: string; // 상세 설명
  referenceUrls?: string[]; // 레퍼런스 URL 목록
  referenceFiles?: FeedbackFile[]; // 첨부 파일 목록
  isCompleted: boolean;
  completed: boolean; // 호환성을 위한 필드
  createdAt: string;
  updatedAt: string;
  completedAt?: string; // 완료 시간
  priority: 'low' | 'medium' | 'high';
  type: 'markup' | 'general' | 'manual'; // 마크업 피드백에서 자동 생성 vs 직접 추가
  markupFeedbackId?: string; // 마크업 피드백과 연결된 경우
  markupId?: string; // 마크업 자체와 연결된 경우 (피드백 없음)
  generalFeedbackId?: string; // 일반 피드백과 연결된 경우
  isRevisionHeader?: boolean; // 차수 구분 헤더인지 여부
  revisionNumber?: number; // 몇 차수인지
}

export type FeedbackCategory = 
  | 'color' 
  | 'typography' 
  | 'layout' 
  | 'content' 
  | 'size' 
  | 'positioning' 
  | 'style' 
  | 'general';

export interface SuggestedChange {
  property: string; // 'color', 'fontSize', 'position' 등
  current_value?: string;
  suggested_value: string;
  description?: string;
}

export interface MarkupTool {
  type: MarkupType;
  icon: string;
  label: string;
  description: string;
  color: string;
}

// 마크업 댓글 타입
export interface MarkupComment {
  id: string;
  markup_id: string;          // 어떤 마크업에 대한 댓글인지
  author_id: string;
  author_name: string;
  author_role: "client" | "designer";
  content: string;
  created_at: string;
  parent_id?: string;         // 대댓글의 경우 부모 댓글 ID
  is_resolved?: boolean;      // 댓글이 해결되었는지 여부
  resolved_at?: string;       // 해결된 시간
  resolved_by?: string;       // 해결한 사람
}

// 체크리스트 댓글 타입 (마크업 댓글과 동일하지만 다른 대상)
export interface ChecklistComment {
  id: string;
  checklist_item_id: string;  // 어떤 체크리스트 항목에 대한 댓글인지
  author_id: string;
  author_name: string;
  author_role: "client" | "designer";
  content: string;
  created_at: string;
  parent_id?: string;         // 대댓글의 경우 부모 댓글 ID
  is_resolved?: boolean;      // 댓글이 해결되었는지 여부
  resolved_at?: string;       // 해결된 시간
  resolved_by?: string;       // 해결한 사람
}

// API 응답 타입
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}


// 네비게이션 관련 타입
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  isActive?: boolean;
}

// Admin 관련 타입들
export interface AdminPermissions {
  user_management: boolean;
  dispute_resolution: boolean;
  payment_management: boolean;
  platform_settings: boolean;
  analytics_access: boolean;
  content_moderation: boolean;
  announcement_management: boolean;
}

// 분쟁 관리 타입
export interface Dispute {
  id: string;
  project_id: string;
  reporter_id: string;
  reported_id: string;
  dispute_type: "payment" | "quality" | "deadline" | "communication" | "other";
  status: "open" | "investigating" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  evidence_files: string[];
  admin_notes?: string;
  resolution?: string;
  assigned_admin_id?: string;
  created_at: string;
  resolved_at?: string;
}

// 사용자 제재 타입
export interface UserSanction {
  id: string;
  user_id: string;
  sanction_type: "warning" | "suspension" | "ban" | "restriction";
  reason: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  issued_by: string;
  notes?: string;
}

// Admin 대시보드 통계 타입
export interface AdminStats {
  total_users: number;
  total_projects: number;
  active_disputes: number;
  monthly_revenue: number;
  user_growth_rate: number;
  project_completion_rate: number;
  recent_activities: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  type: "user_registered" | "project_created" | "dispute_opened" | "payment_completed";
  description: string;
  timestamp: string;
  user_id?: string;
  project_id?: string;
}

// 플랫폼 설정 타입
export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: string | number | boolean | Record<string, unknown>;
  description: string;
  updated_by: string;
  updated_at: string;
}

// 공지사항 관리 타입
export interface Announcement {
  id: string;
  title: string;
  content: string;
  content_html: string;
  status: "draft" | "published" | "scheduled" | "deleted";
  priority: "normal" | "important" | "urgent";
  target_audience: "all" | "client" | "designer";
  
  // 발송 관련
  publish_at?: string; // 예약 발송일
  expires_at?: string; // 만료일
  
  // 통계
  total_recipients: number;
  read_count: number;
  read_rate: number;
  
  // 메타데이터
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // 추가 옵션
  is_pinned: boolean; // 상단 고정
  allow_comments: boolean; // 댓글 허용
  send_push: boolean; // 푸시 알림 발송
  send_email: boolean; // 이메일 발송
}

// 공지사항 읽음 상태
export interface AnnouncementReadStatus {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
  user_role: UserRole;
}

// 공지사항 작성/수정 폼 데이터
export interface AnnouncementFormData {
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  target_audience: "all" | "client" | "designer";
  publish_at?: string;
  expires_at?: string;
  is_pinned: boolean;
  allow_comments: boolean;
  send_push: boolean;
  send_email: boolean;
}

// 일반 사용자용 공지사항 타입 (간소화된 버전)
export interface UserAnnouncement {
  id: string;
  title: string;
  content: string;
  content_html: string;
  category: AnnouncementCategory;
  priority: "normal" | "important" | "urgent";
  
  // 메타데이터
  created_at: string;
  updated_at: string;
  published_at: string;
  
  // 사용자 관련
  is_read: boolean;
  read_at?: string;
  
  // 표시 옵션
  is_pinned: boolean;
}

// 공지사항 카테고리
export type AnnouncementCategory = 
  | "general" // 일반 공지사항
  | "update" // 업데이트/점검
  | "policy" // 정책/약관 변경
  | "event"; // 이벤트/프로모션

// 공지사항 필터 타입
export interface AnnouncementFilter {
  category?: AnnouncementCategory;
  priority?: "normal" | "important" | "urgent";
  read_status?: "all" | "read" | "unread";
  date_range?: {
    start: string;
    end: string;
  };
}

// 사용자 개인 마크업 통계 타입
export interface UserMarkupStats {
  // 기본 통계
  totalMarkups: number;           // 내가 생성한 총 마크업 수
  totalFeedbacks: number;         // 내가 작성한 총 피드백 수
  receivedFeedbacks: number;      // 내가 받은 피드백 수
  
  // 상태별 통계
  pendingFeedbacks: number;       // 처리 대기 중인 피드백
  resolvedFeedbacks: number;      // 해결된 피드백
  
  // 프로젝트별 통계
  projectsWithMarkups: number;    // 마크업을 사용한 프로젝트 수
  activeProjects: number;         // 현재 활성 프로젝트 수
  
  // 타입별 사용 통계
  markupTypeUsage: {
    [key in MarkupType]: number;
  };
  
  // 시간별 통계
  thisWeekMarkups: number;        // 이번 주 마크업 수
  thisMonthMarkups: number;       // 이번 달 마크업 수
  avgResponseTime?: number;       // 평균 응답 시간 (시간 단위)
}

// 사용자 최근 마크업 활동
export interface UserMarkupActivity {
  id: string;
  type: 'markup_created' | 'feedback_created' | 'feedback_received' | 'feedback_resolved';
  projectId: string;
  projectName: string;
  description: string;
  createdAt: string;
  markupId?: string;
  feedbackId?: string;
}

// 설정 관련 타입들
export interface PaymentSettings {
  escrow_enabled: boolean;
  auto_release_days: number;
  refund_period_days: number;
  minimum_project_amount: number;
  payment_methods: string[];
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  admin_alerts: boolean;
  dispute_notifications: boolean;
  maintenance_notifications: boolean;
}

export interface SecuritySettings {
  session_timeout: number;
  max_login_attempts: number;
  password_min_length: number;
  require_2fa_admin: boolean;
  ip_whitelist_enabled: boolean;
  audit_log_retention_days: number;
}

// 분석 차트 타입들
export interface UserGrowthData {
  month: string;
  clients: number;
  designers: number;
  total: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  projects: number;
}

export interface ProjectStatusData {
  name: string;
  value: number;
  color: string;
}

export interface TopDesignerData {
  name: string;
  projects: number;
  revenue: number;
  rating: number;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

export interface ChartTooltipPayload {
  dataKey: string;
  value: number;
  color: string;
}

export type TimeRange = "week" | "month" | "quarter" | "year";
export type AdminSettingsTab = "platform" | "payment" | "notifications" | "security";

// 관리 탭 정의
export interface AdminTab {
  id: string;
  label: string;
  icon: string;
}

// 알림 관련 타입들
export interface NotificationItem {
  id: string;
  user_id: string;
  message: string;
  url: string;
  created_at: string;
  is_read: boolean;
  priority?: "low" | "medium" | "high";
}

export interface ArchiveData {
  versionId: string;
  revisionNumber: number;
  archivedAt: string;
  markups: ImageMarkup[];
  feedbacks: MarkupFeedback[];
  generalFeedbacks: Feedback[];
}

// 프로젝트 기본 정보 (Project 인터페이스에서 필요한 필드만)
export interface ProjectInfo {
  id: string;
  name?: string;
  client_id: string;
  designer_id: string;
  total_modification_count?: number;
  remaining_modification_count: number;
  additional_modification_fee?: number;
  modification_history?: ModificationRecord[];
  updated_at?: string;
}

// Konva Stage 타입 정의
export interface KonvaStage {
  getPointerPosition(): { x: number; y: number } | null;
  container(): HTMLDivElement;
}

// 수정 횟수 현황 타입
export interface ModificationCountStatus {
  total_allowed: number;
  used: number;
  in_progress: number;
  remaining: number;
  additional_used: number;
  total_additional_cost: number;
  is_limit_exceeded: boolean;
  next_modification_cost: number;
  warning_threshold: number;
  should_warn: boolean;
  status_color: 'error' | 'warning' | 'info' | 'success';
  status_message: string;
}

// 제출된 수정요청 타입
export interface SubmittedModificationRequestData {
  id: string;
  revisionNumber: number;
  submittedAt: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  title?: string; // 수정요청 제목
  description?: string; // 수정요청 설명
  approvedAt?: string; // 승인 시간
  items: {
    generalFeedbacks: Feedback[];
    markupFeedbacks: MarkupFeedback[];
    checklistItems: ChecklistItem[];
  };
  totalItems: number;
  approvedItems: number;
  rejectedItems: number;
  pendingItems: number;
}
