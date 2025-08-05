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
}

// 디자이너 사용자 정보
export interface DesignerUser extends BaseUser {
  role: "designer";
  experience?: string;
  specialization?: string[];
  portfolio_url?: string;
}

// 유니온 타입
export type User = ClientUser | DesignerUser;

// 프로젝트 관련 타입
export type ProjectStatus =
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
  attachments?: string[];
  is_official: boolean; // 공식 피드백 여부 (수정 횟수 차감)
  submitted_at: string;
  client_id: string;
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
