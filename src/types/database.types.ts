// =====================================================
// 🔷 데이터베이스 타입 정의
// =====================================================

// ENUM 타입들
export type UserRole = "client" | "designer" | "admin";

export type ProjectStatus =
  | "draft"
  | "published"
  | "in_progress"
  | "review"
  | "completed"
  | "cancelled";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type ProjectCategory =
  | "web_design"
  | "mobile_design"
  | "logo_design"
  | "branding"
  | "ui_ux"
  | "graphic_design"
  | "illustration"
  | "other";

export type ContractStatus =
  | "draft"
  | "sent"
  | "signed"
  | "active"
  | "completed"
  | "cancelled";

export type PaymentType = "fixed" | "hourly" | "milestone";

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "approved"
  | "paid";

export type MessageType = "text" | "file" | "milestone_update" | "system";

export type FileType = "image" | "document" | "design" | "archive" | "other";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export type PaymentMethod =
  | "credit_card"
  | "paypal"
  | "bank_transfer"
  | "escrow";

export type NotificationType =
  | "project_application"
  | "application_accepted"
  | "application_rejected"
  | "contract_sent"
  | "contract_signed"
  | "milestone_completed"
  | "milestone_approved"
  | "payment_received"
  | "message_received"
  | "review_received"
  | "project_deadline_reminder";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

// =====================================================
// 📊 테이블 인터페이스들
// =====================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  company_name?: string;
  bio?: string;
  portfolio_url?: string;
  phone?: string;
  location?: string;
  hourly_rate?: number;
  skills?: string[];
  is_verified: boolean;
  rating: number;
  total_projects: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  client_id: string;
  designer_id?: string;
  budget_min?: number;
  budget_max?: number;
  fixed_budget?: number;
  deadline?: string;
  requirements?: Record<string, any>;
  attachments?: string[];
  skills_required?: string[];
  is_remote: boolean;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  designer_id: string;
  cover_letter?: string;
  proposed_budget?: number;
  estimated_duration?: number;
  status: ApplicationStatus;
  created_at: string;
}

export interface Contract {
  id: string;
  project_id: string;
  client_id: string;
  designer_id: string;
  title: string;
  description?: string;
  payment_type: PaymentType;
  total_amount: number;
  hourly_rate?: number;
  start_date?: string;
  end_date?: string;
  status: ContractStatus;
  terms_and_conditions?: string;
  client_signature_date?: string;
  designer_signature_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractMilestone {
  id: string;
  contract_id: string;
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
  status: MilestoneStatus;
  deliverables?: string[];
  feedback?: string;
  completed_at?: string;
  approved_at?: string;
  paid_at?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  recipient_id?: string;
  content?: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  replied_to?: string;
  created_at: string;
}

export interface File {
  id: string;
  project_id?: string;
  contract_id?: string;
  milestone_id?: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: FileType;
  mime_type?: string;
  description?: string;
  is_final_deliverable: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  contract_id: string;
  milestone_id?: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  description?: string;
  processed_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  project_id: string;
  contract_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_public: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// =====================================================
// 🔗 관계형 인터페이스들 (JOIN 결과)
// =====================================================

export interface ProjectWithClient extends Project {
  client: UserProfile;
}

export interface ProjectWithDesigner extends Project {
  designer?: UserProfile;
}

export interface ProjectWithBoth extends Project {
  client: UserProfile;
  designer?: UserProfile;
}

export interface ProjectApplicationWithDesigner extends ProjectApplication {
  designer: UserProfile;
}

export interface ProjectApplicationWithProject extends ProjectApplication {
  project: Project;
}

export interface ContractWithProject extends Contract {
  project: Project;
}

export interface ContractWithUsers extends Contract {
  client: UserProfile;
  designer: UserProfile;
  project: Project;
}

export interface ContractMilestoneWithContract extends ContractMilestone {
  contract: Contract;
}

export interface MessageWithSender extends Message {
  sender: UserProfile;
}

export interface MessageWithUsers extends Message {
  sender: UserProfile;
  recipient?: UserProfile;
}

export interface ReviewWithUsers extends Review {
  reviewer: UserProfile;
  reviewee: UserProfile;
  project: Project;
}

export interface PaymentWithUsers extends Payment {
  payer: UserProfile;
  payee: UserProfile;
  contract: Contract;
}

// =====================================================
// 📝 폼 및 입력 타입들
// =====================================================

export interface CreateProjectInput {
  title: string;
  description: string;
  category: ProjectCategory;
  priority?: ProjectPriority;
  budget_min?: number;
  budget_max?: number;
  fixed_budget?: number;
  deadline?: string;
  requirements?: Record<string, any>;
  skills_required?: string[];
  is_remote?: boolean;
  location?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  status?: ProjectStatus;
  designer_id?: string;
}

export interface CreateProjectApplicationInput {
  project_id: string;
  cover_letter?: string;
  proposed_budget?: number;
  estimated_duration?: number;
}

export interface CreateContractInput {
  project_id: string;
  client_id: string;
  designer_id: string;
  title: string;
  description?: string;
  payment_type: PaymentType;
  total_amount: number;
  hourly_rate?: number;
  start_date?: string;
  end_date?: string;
  terms_and_conditions?: string;
}

export interface CreateMilestoneInput {
  contract_id: string;
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
  order_index: number;
}

export interface SendMessageInput {
  project_id: string;
  recipient_id?: string;
  content?: string;
  message_type?: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface CreateReviewInput {
  project_id: string;
  contract_id: string;
  reviewee_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_public?: boolean;
}

export interface UpdateUserProfileInput {
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  company_name?: string;
  bio?: string;
  portfolio_url?: string;
  phone?: string;
  location?: string;
  hourly_rate?: number;
  skills?: string[];
}

// =====================================================
// 📊 통계 및 대시보드 타입들
// =====================================================

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings?: number;
  totalSpending?: number;
  avgRating: number;
  unreadMessages: number;
  pendingApplications?: number;
  upcomingDeadlines: number;
}

export interface ProjectStats {
  totalApplications: number;
  averageRating: number;
  completionRate: number;
  onTimeDelivery: number;
}

export interface UserStats {
  totalProjects: number;
  completedProjects: number;
  avgRating: number;
  totalEarnings?: number;
  totalSpending?: number;
  successRate: number;
}

// =====================================================
// 🔍 검색 및 필터링 타입들
// =====================================================

export interface ProjectFilters {
  category?: ProjectCategory[];
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  skills?: string[];
  budget_min?: number;
  budget_max?: number;
  is_remote?: boolean;
  location?: string;
  client_rating_min?: number;
}

export interface DesignerFilters {
  skills?: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  rating_min?: number;
  location?: string;
  is_verified?: boolean;
}

export interface ProjectSearchParams extends ProjectFilters {
  search?: string;
  sort_by?: "created_at" | "deadline" | "budget" | "title";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface DesignerSearchParams extends DesignerFilters {
  search?: string;
  sort_by?: "rating" | "hourly_rate" | "total_projects" | "created_at";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// =====================================================
// 🎯 API 응답 타입들
// =====================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  filters_applied: Record<string, any>;
  search_term?: string;
}

// =====================================================
// 🔄 실시간 업데이트 타입들
// =====================================================

export interface RealtimeMessage {
  type: "message" | "milestone_update" | "status_change" | "notification";
  payload: any;
  timestamp: string;
}

export interface ProjectUpdate {
  project_id: string;
  field: keyof Project;
  old_value: any;
  new_value: any;
  updated_by: string;
  timestamp: string;
}

// =====================================================
// 📱 UI 상태 타입들
// =====================================================

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}

// =====================================================
// 🌐 Supabase 타입 확장
// =====================================================

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<
          UserProfile,
          | "created_at"
          | "updated_at"
          | "rating"
          | "total_projects"
          | "is_verified"
        >;
        Update: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Project, "id" | "created_at" | "updated_at">>;
      };
      project_applications: {
        Row: ProjectApplication;
        Insert: Omit<ProjectApplication, "id" | "created_at">;
        Update: Partial<Omit<ProjectApplication, "id" | "created_at">>;
      };
      contracts: {
        Row: Contract;
        Insert: Omit<Contract, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Contract, "id" | "created_at" | "updated_at">>;
      };
      contract_milestones: {
        Row: ContractMilestone;
        Insert: Omit<ContractMilestone, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<ContractMilestone, "id" | "created_at" | "updated_at">
        >;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: Partial<Omit<Message, "id" | "created_at">>;
      };
      files: {
        Row: File;
        Insert: Omit<File, "id" | "created_at">;
        Update: Partial<Omit<File, "id" | "created_at">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at">;
        Update: Partial<Omit<Payment, "id" | "created_at">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at">;
        Update: Partial<Omit<Review, "id" | "created_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "created_at">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      project_status: ProjectStatus;
      project_priority: ProjectPriority;
      project_category: ProjectCategory;
      contract_status: ContractStatus;
      payment_type: PaymentType;
      message_type: MessageType;
      file_type: FileType;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      notification_type: NotificationType;
    };
  };
}
