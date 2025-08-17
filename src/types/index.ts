// 사용자 관련 타입
export type UserRole = "client" | "designer";

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

// 유니온 타입
export type User = ClientUser | DesignerUser;

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
