"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Project, CompletionRequest, ProjectReview } from "@/types";

// 수정 요청 타입 정의
interface ModificationItem {
  id: string;
  content: string;
  attachments?: string[];
  status: "pending" | "in_progress" | "completed" | "needs_discussion";
  designerComment?: string;
  createdAt: string;
}

interface FeedbackBatch {
  id: string;
  reportId: string;
  items: ModificationItem[];
  submittedAt: string;
  status: "pending" | "in_progress" | "completed";
}

// 임시 데이터 (나중에 API로 대체)
const mockProject: Project = {
  id: "1",
  name: "로고 디자인 프로젝트",
  description: "브랜드 아이덴티티를 위한 로고 디자인 및 가이드라인 제작",
  status: "feedback_period",
  client_id: "client-1",
  designer_id: "designer-1",
  start_date: "2024-01-15",
  end_date: "2024-02-15",
  draft_deadline: "2024-01-25",
  first_review_deadline: "2024-02-05",
  final_review_deadline: "2024-02-12",
  estimated_price: 2500000,
  total_modification_count: 3,
  remaining_modification_count: 1,
  requirements:
    "모던하고 미니멀한 스타일의 로고를 원합니다. 브랜드 컬러는 블루 계열을 선호하며, 다양한 매체에서 활용 가능한 확장성을 고려해주세요.",
  attached_files: ["reference1.jpg", "brand_guidelines.pdf"],
  contract_file: "contract_signed.pdf",
  created_at: "2024-01-15T09:00:00Z",
  updated_at: "2024-01-20T14:30:00Z",
};

type TabType = "overview" | "reports" | "timeline";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // 임시로 클라이언트 역할 (실제로는 인증된 사용자 정보에서 가져올 것)
  const userRole = "client" as "client" | "designer";

  // 실제로는 projectId로 API 호출하여 프로젝트 데이터를 가져올 것
  const project = mockProject;

  // 진행률 계산
  const calculateProgress = () => {
    const total = 100;
    switch (project.status) {
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

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
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

  const progress = calculateProgress();

  return (
    <DashboardLayout title={`프로젝트: ${project.name}`} userRole={userRole}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 상단 요약 섹션 (Header Summary) */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* 좌측: 프로젝트 기본 정보 */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-base-content">
                    {project.name}
                  </h1>
                  <span
                    className={`badge badge-lg ${getStatusBadgeClass(
                      project.status
                    )}`}
                  >
                    {getStatusText(project.status)}
                  </span>
                </div>

                {/* 전체 진행률 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">전체 진행률</span>
                    <span className="text-sm font-bold">{progress}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full h-3"
                    value={progress}
                    max="100"
                  ></progress>
                </div>

                {/* 핵심 지표들 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-base-content/60">다음 마감일</span>
                    <div className="font-bold text-error">
                      1월 25일 (5일 남음)
                    </div>
                  </div>
                  <div>
                    <span className="text-base-content/60">수정 횟수</span>
                    <div className="font-bold text-warning">
                      사용:{" "}
                      {project.total_modification_count -
                        project.remaining_modification_count}
                      /{project.total_modification_count}
                    </div>
                  </div>
                  <div>
                    <span className="text-base-content/60">예상 견적</span>
                    <div className="font-bold">
                      {project.estimated_price.toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <span className="text-base-content/60">프로젝트 기간</span>
                    <div className="font-bold">
                      {project.start_date} ~ {project.end_date}
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측: 주요 액션 버튼들 */}
              <div className="flex flex-col gap-3 lg:min-w-[200px]">
                {project.status === "feedback_period" &&
                  userRole === "client" && (
                    <button className="btn btn-outline">📋 보고물 확인</button>
                  )}
                {project.status === "in_progress" &&
                  userRole === "designer" && (
                    <>
                      <button className="btn btn-primary btn-lg">
                        📤 보고물 업로드
                      </button>
                      <button className="btn btn-outline">
                        📅 일정 수정 요청
                      </button>
                    </>
                  )}

                {/* 완료 요청 버튼 (디자이너) */}
                {(project.status === "feedback_period" ||
                  project.status === "modification_in_progress") &&
                  userRole === "designer" && (
                    <button
                      className="btn btn-success btn-lg"
                      onClick={() => setShowCompletionModal(true)}
                    >
                      ✅ 프로젝트 완료 요청
                    </button>
                  )}

                {/* 최종 승인 버튼 (클라이언트) */}
                {project.status === "completion_requested" &&
                  userRole === "client" && (
                    <>
                      <button
                        className="btn btn-warning btn-lg"
                        onClick={() => setShowDeliverableModal(true)}
                      >
                        📋 최종 산출물 확인
                      </button>
                      <button className="btn btn-success btn-lg">
                        ✅ 최종 승인 및 완료
                      </button>
                    </>
                  )}

                {/* 완료된 프로젝트 액션들 */}
                {project.status === "completed" && (
                  <>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => setShowDeliverableModal(true)}
                    >
                      📁 최종 산출물 다운로드
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setShowReviewModal(true)}
                    >
                      ⭐ 리뷰 작성
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      📦 아카이브
                    </button>
                  </>
                )}

                <button className="btn btn-ghost">💬 메시지 보내기</button>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="tabs tabs-bordered bg-base-100 rounded-lg p-2">
          <button
            className={`tab tab-lg flex-1 ${
              activeTab === "overview" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            📋 개요
          </button>
          <button
            className={`tab tab-lg flex-1 ${
              activeTab === "reports" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("reports")}
          >
            📝 보고 및 피드백
          </button>
          <button
            className={`tab tab-lg flex-1 ${
              activeTab === "timeline" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("timeline")}
          >
            📅 타임라인
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="min-h-[600px]">
          {activeTab === "overview" && <OverviewTab project={project} />}
          {activeTab === "reports" && (
            <ReportsAndFeedbackTab
              project={project}
              userRole={userRole}
              onOpenModal={() => setShowModificationModal(true)}
            />
          )}
          {activeTab === "timeline" && <TimelineTab project={project} />}
        </div>
      </div>

      {/* 수정 체크리스트 모달 */}
      {showModificationModal && (
        <ModificationChecklistModal
          project={project}
          userRole={userRole}
          onClose={() => setShowModificationModal(false)}
        />
      )}

      {/* 프로젝트 완료 요청 모달 */}
      {showCompletionModal && (
        <CompletionRequestModal
          project={project}
          onClose={() => setShowCompletionModal(false)}
        />
      )}

      {/* 최종 산출물 확인/다운로드 모달 */}
      {showDeliverableModal && (
        <FinalDeliverableModal
          project={project}
          userRole={userRole}
          onClose={() => setShowDeliverableModal(false)}
        />
      )}

      {/* 리뷰 작성 모달 */}
      {showReviewModal && (
        <ReviewModal
          project={project}
          userRole={userRole}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </DashboardLayout>
  );
}

// 개요 탭 컴포넌트
function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 프로젝트 정보 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">프로젝트 정보</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">프로젝트 목표 및 요구사항</h4>
              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">
                  상세 요구사항 보기
                </div>
                <div className="collapse-content">
                  <p className="text-sm">{project.requirements}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">전달 자료</h4>
              <div className="space-y-2">
                {project.attached_files?.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-base-200 rounded"
                  >
                    <span className="text-sm">📎 {file}</span>
                    <button className="btn btn-xs btn-outline">다운로드</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">담당자 정보</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-base-content/60">클라이언트</div>
                  <div className="font-medium">홍길동</div>
                  <div className="text-xs">hong@company.com</div>
                </div>
                <div>
                  <div className="text-base-content/60">디자이너</div>
                  <div className="font-medium">김디자이너</div>
                  <div className="text-xs">designer@studio.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 계약서 및 결제 정보 */}
      <div className="space-y-6">
        {/* 계약서 섹션 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">계약서</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">계약서 상태</div>
                  <span className="badge badge-success">서명 완료</span>
                </div>
                <button className="btn btn-outline btn-sm">
                  📄 계약서 다운로드
                </button>
              </div>

              <div className="divider"></div>

              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span>서명일:</span>
                  <span>2024-01-15</span>
                </div>
                <div className="flex justify-between">
                  <span>계약 기간:</span>
                  <span>
                    {project.start_date} ~ {project.end_date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 현황 섹션 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">결제 현황</h3>

            <div className="space-y-4">
              <div className="bg-base-200 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">총 견적</span>
                  <span className="text-lg font-bold">
                    {project.estimated_price.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">계약금 (50%)</div>
                    <div className="text-sm text-base-content/60">
                      프로젝트 시작 시
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-success">
                      {(project.estimated_price * 0.5).toLocaleString()}원
                    </div>
                    <span className="badge badge-success badge-sm">완료</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">잔금 (50%)</div>
                    <div className="text-sm text-base-content/60">
                      프로젝트 완료 시
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {(project.estimated_price * 0.5).toLocaleString()}원
                    </div>
                    <span className="badge badge-warning badge-sm">
                      대기 중
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 보고 및 피드백 탭 컴포넌트 (개선된 버전)
function ReportsAndFeedbackTab({
  project,
  userRole,
  onOpenModal,
}: {
  project: Project;
  userRole: "client" | "designer";
  onOpenModal: () => void;
}) {
  const [selectedReport, setSelectedReport] = useState<string>("draft");

  const reports = [
    {
      id: "draft",
      name: "초안",
      submitted: true,
      date: "2024-01-20",
      version: "v1.0",
    },
    {
      id: "first_review",
      name: "1차 디테일 시안",
      submitted: false,
      date: "2024-02-05",
    },
    {
      id: "final_review",
      name: "최종 검토 시안",
      submitted: false,
      date: "2024-02-12",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 수정 횟수 카드 */}
      <ModificationStatusCard
        project={project}
        userRole={userRole}
        onOpenModal={onOpenModal}
      />

      {/* 깔끔한 보고물 뷰어 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 좌측: 보고물 목록 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-0">
              <div className="p-4 border-b">
                <h3 className="font-bold">보고물 목록</h3>
                {project.status === "feedback_period" && (
                  <div className="text-sm text-accent mt-2">
                    ⏰ 피드백 수집 중: 23시간 45분 남음
                  </div>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border-b cursor-pointer hover:bg-base-200 transition-colors ${
                      selectedReport === report.id
                        ? "bg-primary/10 border-l-4 border-l-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{report.name}</h4>
                      {report.submitted ? (
                        <span className="badge badge-success badge-sm">
                          제출됨
                        </span>
                      ) : (
                        <span className="badge badge-outline badge-sm">
                          대기 중
                        </span>
                      )}
                    </div>

                    {report.submitted && (
                      <div className="text-xs text-base-content/60">
                        <div>제출일: {report.date}</div>
                        <div>버전: {report.version}</div>
                      </div>
                    )}

                    {!report.submitted && (
                      <div className="text-xs text-base-content/60">
                        마감일: {report.date}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 피드백 제출 버튼 영역 */}
              {reports.find((r) => r.id === selectedReport)?.submitted &&
                userRole === "client" &&
                project.remaining_modification_count > 0 && (
                  <div className="p-4 border-t bg-base-50">
                    <button
                      className="btn btn-warning w-full"
                      onClick={onOpenModal}
                    >
                      📝 수정 요청 작성
                    </button>
                    <div className="text-xs text-center mt-2 text-base-content/60">
                      남은 수정 횟수: {project.remaining_modification_count}회
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* 공식 피드백 히스토리 */}
          <div className="card bg-base-100 shadow-sm mt-4">
            <div className="card-body">
              <h3 className="font-bold mb-4">공식 피드백 히스토리</h3>
              <div className="space-y-2">
                <div
                  className="p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
                  onClick={onOpenModal}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">피드백 #1</span>
                    <span className="badge badge-warning badge-sm">처리중</span>
                  </div>
                  <div className="text-xs text-base-content/60">
                    제출일: 2024-01-18 | 3개 항목
                  </div>
                </div>
                <div className="text-center text-sm text-base-content/40 py-4">
                  이전 피드백이 없습니다
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 보고물 뷰어 (더 넓은 공간) */}
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-sm h-[600px]">
            <div className="card-body p-0 flex flex-col">
              {/* 보고물 뷰어 헤더 */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">
                      {reports.find((r) => r.id === selectedReport)?.name}
                    </h3>
                    {reports.find((r) => r.id === selectedReport)
                      ?.submitted && (
                      <p className="text-sm text-base-content/60">
                        버전:{" "}
                        {reports.find((r) => r.id === selectedReport)?.version}
                      </p>
                    )}
                  </div>
                  {reports.find((r) => r.id === selectedReport)?.submitted && (
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-outline">
                        🖊️ 마크업 도구
                      </button>
                      <button className="btn btn-sm btn-outline">
                        💾 다운로드
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 보고물 뷰어 (전체 공간 활용) */}
              <div className="flex-1 p-6">
                {reports.find((r) => r.id === selectedReport)?.submitted ? (
                  <div className="w-full h-full bg-gradient-to-br from-base-200 to-base-300 rounded-lg flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <div className="text-8xl mb-6">🎨</div>
                      <p className="text-2xl font-medium mb-2">디자인 시안</p>
                      <p className="text-base text-base-content/60 mb-4">
                        실제 환경에서는 이미지/PDF 뷰어가 표시됩니다
                      </p>
                      <div className="flex gap-2 justify-center">
                        <span className="badge badge-outline">1920×1080</span>
                        <span className="badge badge-outline">PNG</span>
                        <span className="badge badge-outline">2.3MB</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-base-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-6">⏳</div>
                      <p className="text-2xl font-medium mb-2">
                        보고물 대기 중
                      </p>
                      <p className="text-base text-base-content/60">
                        마감일:{" "}
                        {reports.find((r) => r.id === selectedReport)?.date}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 타임라인 탭 컴포넌트
function TimelineTab({ project }: { project: Project }) {
  const activities = [
    {
      type: "project_created",
      title: "프로젝트 생성",
      description: "김디자이너가 프로젝트를 생성했습니다.",
      user: "김디자이너",
      avatar: "👨‍🎨",
      time: "2024-01-15 09:00",
      icon: "🚀",
    },
    {
      type: "contract_signed",
      title: "계약서 서명 완료",
      description: "클라이언트가 계약서에 서명했습니다.",
      user: "홍길동",
      avatar: "👤",
      time: "2024-01-15 14:30",
      icon: "✍️",
    },
    {
      type: "report_uploaded",
      title: "초안 업로드",
      description: "초안 디자인이 업로드되었습니다.",
      user: "김디자이너",
      avatar: "👨‍🎨",
      time: "2024-01-20 11:00",
      icon: "📎",
    },
    {
      type: "feedback_period_started",
      title: "피드백 정리 기간 시작",
      description: "클라이언트 피드백 수집이 시작되었습니다.",
      user: "System",
      avatar: "🤖",
      time: "2024-01-20 11:01",
      icon: "💬",
    },
  ];

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title mb-6">프로젝트 활동 타임라인</h3>

        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg">
                  {activity.icon}
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-12 bg-base-300 mt-2"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold">{activity.title}</h4>
                  <span className="text-sm text-base-content/60">
                    {activity.time}
                  </span>
                </div>
                <p className="text-sm text-base-content/80 mb-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{activity.avatar}</span>
                  <span className="text-xs font-medium">{activity.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 수정 현황 카드 컴포넌트
function ModificationStatusCard({
  project,
  userRole,
  onOpenModal,
}: {
  project: Project;
  userRole: "client" | "designer";
  onOpenModal: () => void;
}) {
  const usedModifications =
    project.total_modification_count - project.remaining_modification_count;

  return (
    <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg border-l-4 border-l-primary">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title text-lg mb-2">수정 현황</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {project.total_modification_count}
                </div>
                <div className="text-base-content/60">총 수정 횟수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {usedModifications}
                </div>
                <div className="text-base-content/60">사용된 횟수</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">
                  {project.remaining_modification_count}
                </div>
                <div className="text-base-content/60">남은 횟수</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button className="btn btn-outline btn-sm" onClick={onOpenModal}>
              📋 수정 체크리스트 보기
            </button>
            {userRole === "client" &&
              project.remaining_modification_count > 0 && (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={onOpenModal}
                >
                  📝 피드백 제출
                </button>
              )}
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>수정 사용률</span>
            <span>
              {Math.round(
                (usedModifications / project.total_modification_count) * 100
              )}
              %
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={usedModifications}
            max={project.total_modification_count}
          ></progress>
        </div>
      </div>
    </div>
  );
}

// 수정 체크리스트 모달 컴포넌트
function ModificationChecklistModal({
  project,
  userRole,
  onClose,
}: {
  project: Project;
  userRole: "client" | "designer";
  onClose: () => void;
}) {
  const [modificationItems, setModificationItems] = useState<
    ModificationItem[]
  >([]);
  const [newItemContent, setNewItemContent] = useState("");

  // 모의 기존 피드백 데이터
  const existingFeedback: FeedbackBatch[] = [
    {
      id: "1",
      reportId: "draft",
      submittedAt: "2024-01-18T10:00:00Z",
      status: "in_progress",
      items: [
        {
          id: "1-1",
          content: "로고 색상을 더 진한 파란색으로 변경해주세요",
          status: "completed",
          designerComment: "변경 완료했습니다.",
          createdAt: "2024-01-18T10:00:00Z",
        },
        {
          id: "1-2",
          content: "텍스트 폰트를 좀 더 굵게 만들어주세요",
          status: "in_progress",
          designerComment: "작업 중입니다.",
          createdAt: "2024-01-18T10:00:00Z",
        },
      ],
    },
  ];

  const addModificationItem = () => {
    if (newItemContent.trim()) {
      const newItem: ModificationItem = {
        id: Date.now().toString(),
        content: newItemContent,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setModificationItems([...modificationItems, newItem]);
      setNewItemContent("");
    }
  };

  const removeModificationItem = (id: string) => {
    setModificationItems(modificationItems.filter((item) => item.id !== id));
  };

  const submitFeedback = () => {
    if (modificationItems.length === 0) {
      alert("수정 요청을 하나 이상 추가해주세요.");
      return;
    }

    if (
      confirm(
        `${modificationItems.length}개의 수정 요청을 제출하시겠습니까? 수정 횟수 1회가 차감됩니다.`
      )
    ) {
      // 실제로는 API 호출
      alert("피드백이 성공적으로 제출되었습니다!");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">수정 체크리스트</h2>
              <p className="text-sm text-base-content/60">
                초안 관련 수정 요청
              </p>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 모달 컨텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {userRole === "client" ? (
            // 클라이언트 뷰: 새 피드백 작성
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-6">새 수정 요청 작성</h3>

                {/* 현재 작성 중인 수정 요청들 */}
                <div className="space-y-4 mb-6">
                  {modificationItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-base-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium mb-2">
                          수정 요청 {index + 1}
                        </div>
                        <div className="text-sm bg-base-100 p-3 rounded">
                          {item.content}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => removeModificationItem(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* 새 항목 추가 */}
                <div className="bg-base-100 p-6 rounded-lg border-2 border-dashed border-base-300">
                  <h4 className="font-medium mb-4">새 수정 요청 추가</h4>
                  <div className="flex gap-3">
                    <textarea
                      className="textarea textarea-bordered flex-1 h-20"
                      placeholder="구체적인 수정 요청을 입력하세요... (예: 로고 색상을 #0066CC로 변경)"
                      value={newItemContent}
                      onChange={(e) => setNewItemContent(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={addModificationItem}
                      disabled={!newItemContent.trim()}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>

              {/* 기존 피드백 이력 */}
              <div>
                <h3 className="text-xl font-bold mb-6">이전 피드백 이력</h3>
                {existingFeedback.map((batch) => (
                  <div key={batch.id} className="card bg-base-200 mb-4">
                    <div className="card-body p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-lg">
                          피드백 #{batch.id}
                        </span>
                        <span className="text-sm text-base-content/60">
                          제출일:{" "}
                          {new Date(batch.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {batch.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-4 p-3 bg-base-100 rounded-lg"
                          >
                            <div
                              className={`w-4 h-4 rounded-full mt-1 ${
                                item.status === "completed"
                                  ? "bg-success"
                                  : item.status === "in_progress"
                                  ? "bg-warning"
                                  : "bg-base-300"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <span className="font-medium">
                                {item.content}
                              </span>
                              {item.designerComment && (
                                <div className="text-sm text-info mt-2">
                                  💬 디자이너: {item.designerComment}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // 디자이너 뷰: 피드백 처리
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-6">클라이언트 피드백 처리</h3>
              {existingFeedback.map((batch) => (
                <div key={batch.id} className="card bg-base-200">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold">피드백 #{batch.id}</h4>
                      <span className="badge badge-warning badge-lg">
                        처리 중
                      </span>
                    </div>
                    <div className="space-y-4">
                      {batch.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-base-100 rounded-lg"
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary mt-1"
                              checked={item.status === "completed"}
                            />
                            <div className="flex-1">
                              <div className="font-medium mb-2">
                                {item.content}
                              </div>
                              <div className="text-sm text-base-content/60">
                                상태:{" "}
                                {item.status === "completed"
                                  ? "완료"
                                  : item.status === "in_progress"
                                  ? "진행 중"
                                  : "대기"}
                              </div>
                            </div>
                          </div>
                          <textarea
                            className="textarea textarea-bordered w-full text-sm"
                            placeholder="디자이너 코멘트를 입력하세요..."
                            value={item.designerComment || ""}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="p-6 border-t bg-base-50">
          <div className="flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={onClose}>
              닫기
            </button>
            {userRole === "client" && (
              <>
                <button className="btn btn-outline">임시저장</button>
                <button
                  className="btn btn-warning btn-lg"
                  onClick={submitFeedback}
                  disabled={modificationItems.length === 0}
                >
                  📝 피드백 확정 및 제출 (수정 횟수 차감)
                </button>
              </>
            )}
            {userRole === "designer" && (
              <button className="btn btn-success btn-lg">
                ✅ 수정 완료 알림
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 프로젝트 완료 요청 모달 컴포넌트
function CompletionRequestModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [completionNote, setCompletionNote] = useState("");
  const [finalFiles, setFinalFiles] = useState<File[]>([]);

  const handleSubmit = () => {
    if (!completionNote.trim()) {
      alert("완료 요청 메모를 입력해주세요.");
      return;
    }

    if (finalFiles.length === 0) {
      alert("최종 산출물을 하나 이상 업로드해주세요.");
      return;
    }

    if (confirm("프로젝트 완료를 요청하시겠습니까?")) {
      // 실제로는 API 호출
      alert("완료 요청이 전송되었습니다. 클라이언트의 승인을 기다려주세요.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">프로젝트 완료 요청</h2>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4">완료 요청 메모</h3>
              <textarea
                className="textarea textarea-bordered w-full h-32"
                placeholder="프로젝트 완료와 함께 클라이언트에게 전달할 메시지를 작성해주세요..."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
              />
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">최종 산출물 업로드</h3>
              <div className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-lg font-medium mb-2">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-base-content/60 mb-4">
                  최종 원본 파일 (PSD, AI, FIG) 및 결과물 (PNG, JPG, PDF) 등
                </p>
                <input
                  type="file"
                  multiple
                  className="file-input file-input-bordered"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFinalFiles(Array.from(e.target.files));
                    }
                  }}
                />
              </div>

              {finalFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-medium">선택된 파일:</p>
                  {finalFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-base-200 rounded"
                    >
                      <span className="text-sm">📎 {file.name}</span>
                      <span className="text-xs text-base-content/60">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-base-50">
          <div className="flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={onClose}>
              취소
            </button>
            <button className="btn btn-success btn-lg" onClick={handleSubmit}>
              ✅ 완료 요청 전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 최종 산출물 확인/다운로드 모달 컴포넌트
function FinalDeliverableModal({
  project,
  userRole,
  onClose,
}: {
  project: Project;
  userRole: "client" | "designer";
  onClose: () => void;
}) {
  // 모의 최종 산출물 데이터
  const finalDeliverables = [
    {
      name: "로고_최종_원본.ai",
      size: "15.2 MB",
      type: "원본 파일",
      downloadUrl: "#",
    },
    {
      name: "로고_최종_고해상도.png",
      size: "8.7 MB",
      type: "결과물",
      downloadUrl: "#",
    },
    {
      name: "브랜드_가이드라인.pdf",
      size: "12.1 MB",
      type: "가이드라인",
      downloadUrl: "#",
    },
  ];

  const handleApproveCompletion = () => {
    if (
      confirm(
        "프로젝트를 최종 완료하시겠습니까? 완료 후에는 수정이 불가능합니다."
      )
    ) {
      // 실제로는 API 호출
      alert("프로젝트가 완료되었습니다!");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">최종 산출물</h2>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {project.status === "completion_requested" &&
              userRole === "client" && (
                <div className="alert alert-warning">
                  <span>
                    ⚠️ 디자이너가 프로젝트 완료를 요청했습니다. 최종 산출물을
                    확인하시고 승인해주세요.
                  </span>
                </div>
              )}

            <div>
              <h3 className="text-lg font-bold mb-4">완료 요청 메모</h3>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-sm">
                  안녕하세요! 로고 디자인 작업이 완료되었습니다. 요청하신 모든
                  요구사항을 반영하여 최종 결과물을 준비했습니다. 원본 파일과
                  다양한 포맷의 결과물을 함께 전달드리니 확인 부탁드립니다.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">다운로드 가능한 파일</h3>
              <div className="grid gap-3">
                {finalDeliverables.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {file.type === "원본 파일"
                          ? "🎨"
                          : file.type === "결과물"
                          ? "🖼️"
                          : "📄"}
                      </div>
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-base-content/60">
                          {file.type} • {file.size}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">
                      📥 다운로드
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button className="btn btn-outline btn-lg">
                  📦 전체 파일 일괄 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-base-50">
          <div className="flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={onClose}>
              닫기
            </button>
            {project.status === "completion_requested" &&
              userRole === "client" && (
                <>
                  <button className="btn btn-warning">↩️ 수정 요청</button>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={handleApproveCompletion}
                  >
                    ✅ 최종 승인 및 완료
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 리뷰 작성 모달 컴포넌트
function ReviewModal({
  project,
  userRole,
  onClose,
}: {
  project: Project;
  userRole: "client" | "designer";
  onClose: () => void;
}) {
  const [ratings, setRatings] = useState({
    overall: 0,
    professionalism: 0,
    communication: 0,
    deadline: 0,
    satisfaction: 0,
  });
  const [reviewText, setReviewText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const ratingLabels = {
    overall: "전체 평점",
    professionalism: "전문성",
    communication: "소통 능력",
    deadline: "마감일 준수",
    satisfaction: userRole === "client" ? "결과물 만족도" : "협업 만족도",
  };

  const handleRatingChange = (
    category: keyof typeof ratings,
    value: number
  ) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = () => {
    const unratedCategories = Object.entries(ratings).filter(
      ([_, rating]) => rating === 0
    );

    if (unratedCategories.length > 0) {
      alert("모든 항목에 평점을 매겨주세요.");
      return;
    }

    if (confirm("리뷰를 제출하시겠습니까?")) {
      // 실제로는 API 호출
      alert("리뷰가 성공적으로 제출되었습니다!");
      onClose();
    }
  };

  const StarRating = ({
    rating,
    onRatingChange,
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`text-2xl transition-colors ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => onRatingChange(star)}
        >
          ⭐
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {userRole === "client" ? "디자이너" : "클라이언트"} 리뷰 작성
            </h2>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4">평점 매기기</h3>
              <div className="space-y-4">
                {Object.entries(ratingLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-medium">{label}</span>
                    <StarRating
                      rating={ratings[key as keyof typeof ratings]}
                      onRatingChange={(rating) =>
                        handleRatingChange(key as keyof typeof ratings, rating)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">상세 리뷰 (선택사항)</h3>
              <textarea
                className="textarea textarea-bordered w-full h-32"
                placeholder="이번 프로젝트에 대한 구체적인 의견을 남겨주세요..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div className="text-sm text-base-content/60 mt-2">
                {reviewText.length}/500자
              </div>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">익명으로 리뷰 작성</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-base-50">
          <div className="flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={onClose}>
              취소
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
              ⭐ 리뷰 제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
