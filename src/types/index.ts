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
  experience?: string;
  specialization?: string[];
  portfolio_url?: string;
  strengths?: string[]; // 강점
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
    suggested_timeline: {
      total_duration: number; // 총 소요기간 (일)
      draft_deadline: string;
      first_review_deadline: string;
      final_review_deadline: string;
    };
    payment_terms: any; // PaymentTerms 타입 참조
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
  status: "pending" | "approved" | "in_progress" | "completed" | "rejected";
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
  is_additional_cost: boolean; // 추가 비용 발생 여부
  additional_cost_amount?: number; // 추가 비용 금액
  notes?: string; // 추가 메모
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

// API 응답 타입
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 알림 타입
export interface NotificationItem {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string; // ISO string
  url: string;
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
  setting_value: any;
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
