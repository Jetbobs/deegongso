"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { Project, UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectCardSkeleton } from "@/components/ui/Skeleton";

// 모의 프로젝트 데이터 (기본값)
const defaultProjects: Project[] = [
  {
    id: "1",
    name: "로고 디자인 프로젝트",
    description: "브랜드 아이덴티티를 위한 로고 디자인",
    status: "feedback_period",
    client_id: "1",
    designer_id: "2",
    start_date: "2024-01-15",
    end_date: "2024-02-15",
    draft_deadline: "2024-01-25",
    first_review_deadline: "2024-02-05",
    final_review_deadline: "2024-02-12",
    estimated_price: 2500000,
    budget_used: 1850000,
    total_modification_count: 3,
    remaining_modification_count: 1,
    requirements: "모던하고 미니멀한 스타일의 로고",
    attached_files: ["reference1.jpg"],
    contract_file: "contract_signed.pdf",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "웹사이트 UI/UX 디자인",
    description: "반응형 웹사이트 UI/UX 디자인 프로젝트",
    status: "in_progress",
    client_id: "1",
    designer_id: "2",
    start_date: "2024-01-10",
    end_date: "2024-02-20",
    draft_deadline: "2024-01-30",
    first_review_deadline: "2024-02-10",
    final_review_deadline: "2024-02-18",
    estimated_price: 4000000,
    budget_used: 1200000,
    total_modification_count: 3,
    remaining_modification_count: 3,
    requirements: "사용자 친화적인 웹사이트 디자인",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-18T16:00:00Z",
  },
  {
    id: "3",
    name: "브랜딩 패키지 디자인",
    description: "로고, 명함, 브로셔 등 통합 브랜딩 패키지",
    status: "completed",
    client_id: "1",
    designer_id: "2",
    start_date: "2023-12-01",
    end_date: "2024-01-15",
    draft_deadline: "2023-12-15",
    first_review_deadline: "2024-01-05",
    final_review_deadline: "2024-01-12",
    estimated_price: 3500000,
    budget_used: 3500000,
    total_modification_count: 3,
    remaining_modification_count: 1,
    requirements: "통일된 브랜드 아이덴티티",
    completed_at: "2024-01-15T14:00:00Z",
    created_at: "2023-12-01T09:00:00Z",
    updated_at: "2024-01-15T14:00:00Z",
  },
  {
    id: "4",
    name: "모바일 앱 UI 디자인",
    description: "iOS/Android 모바일 앱 UI 디자인",
    status: "archived",
    client_id: "1",
    designer_id: "2",
    start_date: "2023-11-01",
    end_date: "2023-12-31",
    draft_deadline: "2023-11-20",
    first_review_deadline: "2023-12-10",
    final_review_deadline: "2023-12-28",
    estimated_price: 5000000,
    budget_used: 5000000,
    total_modification_count: 3,
    remaining_modification_count: 0,
    requirements: "직관적이고 세련된 모바일 앱 UI",
    completed_at: "2023-12-31T18:00:00Z",
    archived_at: "2024-01-10T10:00:00Z",
    created_at: "2023-11-01T09:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
  },
  {
    id: "5",
    name: "새 브랜드 런칭 디자인",
    description: "로고/가이드/패키지 일괄 디자인",
    status: "creation_pending",
    client_id: "1",
    designer_id: "2",
    start_date: "2024-02-01",
    end_date: "2024-03-01",
    draft_deadline: "2024-02-10",
    first_review_deadline: "2024-02-18",
    final_review_deadline: "2024-02-25",
    estimated_price: 4800000,
    budget_used: 0,
    total_modification_count: 3,
    remaining_modification_count: 3,
    requirements: "신규 런칭 브랜드 전체 패키지",
    created_at: "2024-01-22T09:00:00Z",
    updated_at: "2024-01-22T09:00:00Z",
  },
  {
    id: "6",
    name: "이벤트 포스터 디자인",
    description: "온라인/오프라인 이벤트 포스터 시리즈",
    status: "review_requested",
    client_id: "1",
    designer_id: "2",
    start_date: "2024-01-20",
    end_date: "2024-02-05",
    draft_deadline: "2024-01-25",
    first_review_deadline: "2024-01-30",
    final_review_deadline: "2024-02-03",
    estimated_price: 1200000,
    budget_used: 600000,
    total_modification_count: 2,
    remaining_modification_count: 2,
    requirements: "밝고 주목성 높은 톤",
    created_at: "2024-01-20T09:00:00Z",
    updated_at: "2024-01-21T10:00:00Z",
  },
];

const designerNames: Record<string, string> = {
  "1": "김디자이너",
  "2": "이디자이너",
  "3": "박디자이너",
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const userRole: UserRole = user?.role ?? user?.userType ?? "client";
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [designerFilter, setDesignerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_desc");
  const [showArchived, setShowArchived] = useState(false);

  // localStorage에서 프로젝트 불러오기
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      // 기존 기본 프로젝트와 새로 생성된 프로젝트 합치기
      const combinedProjects = [...parsedProjects, ...defaultProjects];
      // 중복 제거 (id 기준)
      const uniqueProjects = combinedProjects.filter((project, index, self) =>
        index === self.findIndex(p => p.id === project.id)
      );
      setProjects(uniqueProjects);
    }
    setLoading(false);
  }, []);

  // 1) 쿼리스트링 → 상태 초기화 (최초 1회)
  useEffect(() => {
    if (initializedRef.current) return;
    const q = searchParams.get("q");
    const status = searchParams.get("status");
    const designer = searchParams.get("designer");
    const sort = searchParams.get("sort");
    const archived = searchParams.get("archived");

    if (q) setSearchTerm(q);
    if (status) setStatusFilter(status);
    if (designer) setDesignerFilter(designer);
    if (sort) setSortBy(sort);
    if (archived === "1") setShowArchived(true);

    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 초기 로딩 스켈레톤 표시 (mock 환경)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // 2) 상태 → 쿼리스트링 동기화
  useEffect(() => {
    if (!initializedRef.current) return;
    const next = new URLSearchParams();
    if (searchTerm) next.set("q", searchTerm);
    if (statusFilter !== "all") next.set("status", statusFilter);
    if (designerFilter !== "all") next.set("designer", designerFilter);
    if (sortBy !== "updated_desc") next.set("sort", sortBy);
    if (showArchived) next.set("archived", "1");

    const query = next.toString();
    router.replace(query ? `/projects?${query}` : "/projects");
  }, [searchTerm, statusFilter, designerFilter, sortBy, showArchived, router]);

  // 필터링 및 정렬된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      // 아카이브 필터
      if (showArchived) {
        return project.status === "archived";
      } else {
        if (project.status === "archived") return false;
      }

      // 검색어 필터
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          designerNames[project.designer_id]
            ?.toLowerCase()
            .includes(searchLower);
        if (!matchesSearch) return false;
      }

      // 상태 필터
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }

      // 디자이너 필터
      if (designerFilter !== "all" && project.designer_id !== designerFilter) {
        return false;
      }

      return true;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "created_asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "created_desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "updated_asc":
          return (
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          );
        case "updated_desc":
        default:
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, designerFilter, sortBy, showArchived]);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      creation_pending: "생성 대기중",
      review_requested: "검토 요청 중",
      client_review_pending: "클라이언트 검토 대기",
      designer_review_pending: "디자이너 검토 대기",
      in_progress: "진행 중",
      feedback_period: "피드백 정리 기간",
      modification_in_progress: "수정 작업 중",
      completion_requested: "완료 승인 대기",
      completed: "완료",
      archived: "아카이브됨",
      cancelled: "취소",
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      creation_pending: "badge-neutral",
      review_requested: "badge-warning",
      client_review_pending: "badge-warning",
      designer_review_pending: "badge-info",
      in_progress: "badge-primary",
      feedback_period: "badge-accent",
      modification_in_progress: "badge-secondary",
      completion_requested: "badge-warning",
      completed: "badge-success",
      archived: "badge-neutral",
      cancelled: "badge-error",
    };
    return statusMap[status] || "badge-neutral";
  };

  const calculateProgress = (project: Project) => {
    switch (project.status) {
      case "creation_pending":
        return 0;
      case "review_requested":
        return 10;
      case "client_review_pending":
      case "designer_review_pending":
        return 10;
      case "in_progress":
        return 30;
      case "feedback_period":
        return 70;
      case "modification_in_progress":
        return 75;
      case "completion_requested":
        return 90;
      case "completed":
      case "archived":
        return 100;
      default:
        return 0;
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDesignerFilter("all");
    setSortBy("updated_desc");
    setShowArchived(false);
  };

  const renderLoading = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="skeleton h-6 w-40 mb-2" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-10 w-32" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex space-x-2 mb-6">
        <div className="skeleton h-10 w-32 rounded-lg" />
        <div className="skeleton h-10 w-28 rounded-lg" />
      </div>

      {/* 아카이브 토글 스켈레톤 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <div className="skeleton h-10 w-40 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* 필터 카드 스켈레톤 */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <div className="skeleton h-4 w-16 mb-2" />
              <div className="skeleton h-10 w-full" />
            </div>
            <div className="lg:col-span-3">
              <div className="skeleton h-4 w-12 mb-2" />
              <div className="skeleton h-10 w-full" />
            </div>
            <div className="lg:col-span-3">
              <div className="skeleton h-4 w-20 mb-2" />
              <div className="skeleton h-10 w-full" />
            </div>
            <div className="lg:col-span-2">
              <div className="skeleton h-4 w-12 mb-2" />
              <div className="skeleton h-10 w-full" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="skeleton h-3 w-64" />
          </div>
        </div>
      </div>

      {/* 프로젝트 카드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </>
  );

  const renderContent = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">프로젝트 관리</h1>
          <p className="text-base-content/60">
            진행 중인 프로젝트와 완료된 프로젝트를 관리하세요.
          </p>
        </div>
        <Link href="/projects/create" className="btn btn-primary">
          새 프로젝트 생성
        </Link>
      </div>

      {/* 상단 서브 탭: 내 프로젝트 / 계약 관리 */}
      <div className="tabs tabs-boxed mb-6">
        <Link href="/projects" className={`tab tab-lg tab-active`}>
          📁 내 프로젝트
        </Link>
        <Link href="/contracts" className="tab tab-lg">
          📋 계약 관리
        </Link>
      </div>

      {/* 아카이브 토글 */}
      <div className="flex items-center justify-between mb-4">
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${!showArchived ? "tab-active" : ""}`}
            onClick={() => setShowArchived(false)}
          >
            활성 프로젝트 (
            {projects.filter((p) => p.status !== "archived").length})
          </button>
          <button
            className={`tab ${showArchived ? "tab-active" : ""}`}
            onClick={() => setShowArchived(true)}
          >
            아카이브 (
            {projects.filter((p) => p.status === "archived").length})
          </button>
        </div>

        {(searchTerm || statusFilter !== "all" || designerFilter !== "all") && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            🗑️ 필터 초기화
          </button>
        )}
      </div>

      {/* 고급 필터 및 검색 */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 검색 */}
            <div className="lg:col-span-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">검색</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="프로젝트명, 설명, 디자이너명..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSearchTerm("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 상태 필터 */}
            <div className="lg:col-span-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">상태</span>
                </label>
                <select
                  className="select select-bordered"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">모든 상태</option>
                  <option value="creation_pending">생성 대기중</option>
                  <option value="review_requested">검토 요청 중</option>
                  <option value="in_progress">진행 중</option>
                  <option value="feedback_period">피드백 정리 기간</option>
                  <option value="modification_in_progress">수정 작업 중</option>
                  <option value="completion_requested">완료 승인 대기</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>

            {/* 디자이너 필터 */}
            <div className="lg:col-span-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">디자이너</span>
                </label>
                <select
                  className="select select-bordered"
                  value={designerFilter}
                  onChange={(e) => setDesignerFilter(e.target.value)}
                >
                  <option value="all">모든 디자이너</option>
                  <option value="1">김디자이너</option>
                  <option value="2">이디자이너</option>
                  <option value="3">박디자이너</option>
                </select>
              </div>
            </div>

            {/* 정렬 */}
            <div className="lg:col-span-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">정렬</span>
                </label>
                <select
                  className="select select-bordered"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="updated_desc">최근 업데이트순</option>
                  <option value="updated_asc">오래된 업데이트순</option>
                  <option value="created_desc">최근 생성순</option>
                  <option value="created_asc">오래된 생성순</option>
                  <option value="name_asc">이름 오름차순</option>
                  <option value="name_desc">이름 내림차순</option>
                </select>
              </div>
            </div>
          </div>

          {/* 검색 결과 요약 */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-base-content/60">
              <span>
                총 {filteredProjects.length}개의 프로젝트
                {searchTerm && ` · "${searchTerm}" 검색 결과`}
                {statusFilter !== "all" &&
                  ` · ${getStatusText(statusFilter)} 필터`}
                {designerFilter !== "all" &&
                  ` · ${designerNames[designerFilter]} 필터`}
              </span>
              <span>
                {showArchived ? "아카이브된 프로젝트" : "활성 프로젝트"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 프로젝트 카드 그리드 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {showArchived ? "📦" : searchTerm ? "🔍" : "📋"}
          </div>
          <h3 className="text-xl font-bold mb-2">
            {showArchived
              ? "아카이브된 프로젝트가 없습니다"
              : searchTerm
              ? "검색 결과가 없습니다"
              : "프로젝트가 없습니다"}
          </h3>
          <p className="text-base-content/60 mb-6">
            {showArchived
              ? "완료된 프로젝트를 아카이브하면 여기에 표시됩니다."
              : searchTerm
              ? "다른 검색어로 시도해보거나 필터를 조정해보세요."
              : "새로운 프로젝트를 시작해보세요!"}
          </p>
          {!showArchived && (
            <Link href="/projects/create" className="btn btn-primary">
              새 프로젝트 생성
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const progress = calculateProgress(project);
            const designerName =
              designerNames[project.designer_id] || "알 수 없음";
            const daysRemaining = getDaysRemaining(project.end_date);

            return (
              <div
                key={project.id}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {(project.status === "creation_pending" ||
                  project.status === "review_requested") && (
                  <div
                    className={`absolute -top-2 -left-2 px-3 py-1 rounded-md text-xs font-semibold shadow ${
                      project.status === "creation_pending"
                        ? "bg-base-200 text-base-content"
                        : "bg-warning text-warning-content"
                    }`}
                  >
                    {getStatusText(project.status)}
                  </div>
                )}
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="card-title text-lg">{project.name}</h3>
                      <p className="text-sm text-base-content/60">
                        {project.description}
                      </p>
                    </div>
                    <span
                      className={`badge ${getStatusBadgeClass(project.status)}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="avatar">
                      <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                        <span className="text-xs">
                          {designerName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{designerName}</p>
                      <p className="text-xs text-base-content/60">
                        {project.estimated_price.toLocaleString()}원
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-base-content/60">
                        예산 사용률
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          project.budget_used / project.estimated_price > 0.9
                            ? "text-warning"
                            : project.budget_used / project.estimated_price >
                              0.8
                            ? "text-info"
                            : "text-success"
                        }`}
                      >
                        {Math.round(
                          (project.budget_used / project.estimated_price) * 100
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>진행률</span>
                      <span>{progress}%</span>
                    </div>
                    <progress
                      className={`progress ${
                        project.status === "completed" ||
                        project.status === "archived"
                          ? "progress-success"
                          : project.status === "in_progress"
                          ? "progress-primary"
                          : "progress-warning"
                      }`}
                      value={progress}
                      max="100"
                    ></progress>
                  </div>

                  <div className="flex justify-between items-center text-sm mb-4">
                    <span>
                      {project.status === "completed" ||
                      project.status === "archived"
                        ? "완료일"
                        : "마감일"}
                    </span>
                    <span
                      className={`font-medium ${
                        project.status === "completed" ||
                        project.status === "archived"
                          ? "text-success"
                          : daysRemaining < 0
                          ? "text-error"
                          : daysRemaining <= 3
                          ? "text-warning"
                          : "text-base-content"
                      }`}
                    >
                      {project.status === "completed" ||
                      project.status === "archived"
                        ? new Date(
                            project.completed_at || project.end_date
                          ).toLocaleDateString()
                        : daysRemaining < 0
                        ? `${Math.abs(daysRemaining)}일 지남`
                        : daysRemaining === 0
                        ? "오늘 마감"
                        : `${daysRemaining}일 남음`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm mb-4">
                    <span>수정 횟수</span>
                    <span
                      className={
                        project.remaining_modification_count === 0
                          ? "text-error"
                          : project.remaining_modification_count === 1
                          ? "text-warning"
                          : "text-success"
                      }
                    >
                      {project.status === "completed" ||
                      project.status === "archived"
                        ? `${
                            project.total_modification_count -
                            project.remaining_modification_count
                          }/${project.total_modification_count} 사용`
                        : `${project.remaining_modification_count}/${project.total_modification_count} 남음`}
                    </span>
                  </div>

                  <div className="card-actions justify-end">
                    <Link
                      href={`/projects/${project.id}${
                        project.status === "feedback_period"
                          ? "?tab=reports"
                          : ""
                      }`}
                      className="btn btn-sm btn-outline"
                    >
                      상세보기
                    </Link>
                    {project.status === "feedback_period" && (
                      <Link
                        href={`/projects/${project.id}?tab=reports`}
                        className="btn btn-sm btn-warning"
                      >
                        피드백 작성
                      </Link>
                    )}
                    {project.status === "in_progress" && (
                      <Link
                        href={`/messages`}
                        className="btn btn-sm btn-primary"
                      >
                        메시지
                      </Link>
                    )}
                    {project.status === "completed" && (
                      <Link
                        href={`/projects/${project.id}?action=review`}
                        className="btn btn-sm btn-primary"
                      >
                        리뷰 작성
                      </Link>
                    )}
                    {project.status === "completion_requested" && (
                      <Link
                        href={`/projects/${project.id}?action=deliverables`}
                        className="btn btn-sm btn-success"
                      >
                        승인 대기
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 새 프로젝트 생성 카드 - 활성 프로젝트 탭에서만 표시 */}
          {!showArchived && (
            <div className="card bg-base-100 shadow-sm border-2 border-dashed border-base-300 hover:border-primary transition-colors">
              <div className="card-body items-center text-center">
                <div className="text-6xl text-base-content/30 mb-4">+</div>
                <h3 className="card-title text-base-content/60">
                  새 프로젝트 시작
                </h3>
                <p className="text-sm text-base-content/40">
                  디자이너와 함께 새로운 프로젝트를 시작하세요
                </p>
                <div className="card-actions">
                  <Link href="/projects/create" className="btn btn-primary">
                    프로젝트 생성
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <AuthWrapper requireAuth>
      <DashboardLayout title="내 프로젝트" userRole={userRole}>
        {loading ? renderLoading() : renderContent()}
      </DashboardLayout>
    </AuthWrapper>
  );
}
