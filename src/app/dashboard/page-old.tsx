"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthWrapper from "@/components/auth/AuthWrapper";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingFeedback: number;
}

// Mock 프로젝트 데이터
interface MockProject {
  id: string;
  title: string;
  description: string;
  status:
    | "creation_pending"
    | "review_requested"
    | "active"
    | "pending"
    | "completed"
    | "feedback";
  progress: number;
  deadline: string;
  designer: string;
  designerInitial: string;
  client_id: string;
  designer_id: string;
}

const MOCK_PROJECTS: MockProject[] = [
  {
    id: "1",
    title: "로고 디자인 프로젝트",
    description: "브랜드 아이덴티티",
    status: "review_requested",
    progress: 70,
    deadline: "2024-01-20",
    designer: "김디자이너",
    designerInitial: "김",
    client_id: "1", // client@gmail.com
    designer_id: "2", // designer@gmail.com
  },
  {
    id: "2",
    title: "웹사이트 UI/UX",
    description: "반응형 웹 디자인",
    status: "active",
    progress: 45,
    deadline: "2024-01-25",
    designer: "이디자이너",
    designerInitial: "이",
    client_id: "1", // client@gmail.com
    designer_id: "2", // designer@gmail.com
  },
  {
    id: "3",
    title: "브랜딩 패키지",
    description: "로고, 명함, 브로셔",
    status: "completed",
    progress: 100,
    deadline: "2024-01-15",
    designer: "박디자이너",
    designerInitial: "박",
    client_id: "1", // client@gmail.com
    designer_id: "2", // designer@gmail.com
  },
  {
    id: "4",
    title: "캠페인 키비주얼",
    description: "SNS/온사이트 KV 제작",
    status: "creation_pending",
    progress: 0,
    deadline: "2024-02-01",
    designer: "정디자이너",
    designerInitial: "정",
    client_id: "1",
    designer_id: "2",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [stats] = useState<DashboardStats>({
    totalProjects: 3,
    activeProjects: 1,
    completedProjects: 1,
    pendingFeedback: 1,
  });

  useEffect(() => {
    // 목 로딩 지연으로 스켈레톤 표시
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const getStatusBadge = (status: MockProject["status"]) => {
    const statusConfig = {
      creation_pending: { class: "badge-neutral", text: "생성 대기중" },
      review_requested: { class: "badge-warning", text: "검토 요청 중" },
      pending: { class: "badge-warning", text: "대기 중" },
      active: { class: "badge-info", text: "진행 중" },
      feedback: { class: "badge-warning", text: "피드백 대기" },
      completed: { class: "badge-success", text: "완료" },
    } as const;

    const config = statusConfig[status];
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  // 프로젝트 상세 페이지로 이동
  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // 전체 프로젝트 페이지로 이동
  const handleViewAllProjects = () => {
    router.push("/projects");
  };

  return (
    <AuthWrapper requireAuth={true}>
      <DashboardLayout
        title="대시보드"
        userRole={(user?.role ?? user?.userType) || "client"}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="skeleton h-4 w-24 mb-2" />
                  <div className="skeleton h-8 w-16" />
                  <div className="skeleton h-3 w-20 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 사용자 환영 메시지 */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">
                안녕하세요, {user?.name || user?.email || "사용자"}님! 👋
              </h1>
              <p className="text-base-content/60">
                {(user?.role ?? user?.userType) === "client"
                  ? "오늘도 멋진 프로젝트를 만들어보세요."
                  : "창의적인 작업으로 클라이언트를 만족시켜보세요!"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 통계 카드들 */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title text-sm text-base-content/60">
                    진행 중인 프로젝트
                  </h2>
                  <div className="text-3xl font-bold text-primary">
                    {stats.activeProjects}
                  </div>
                  <div className="text-sm text-base-content/60">
                    전월 대비 +1
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title text-sm text-base-content/60">
                    피드백 대기
                  </h2>
                  <div className="text-3xl font-bold text-warning">
                    {stats.pendingFeedback}
                  </div>
                  <div className="text-sm text-base-content/60">
                    빠른 응답 필요
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title text-sm text-base-content/60">
                    완료된 프로젝트
                  </h2>
                  <div className="text-3xl font-bold text-success">
                    {stats.completedProjects}
                  </div>
                  <div className="text-sm text-base-content/60">이번 달</div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title text-sm text-base-content/60">
                    전체 프로젝트
                  </h2>
                  <div className="text-3xl font-bold text-info">
                    {stats.totalProjects}
                  </div>
                  <div className="text-sm text-base-content/60">총 개수</div>
                </div>
              </div>
            </div>

            {/* 최근 프로젝트 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title">최근 프로젝트</h2>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleViewAllProjects}
                  >
                    전체 보기
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>프로젝트명</th>
                        <th>상태</th>
                        <th>디자이너</th>
                        <th>진행률</th>
                        <th>마감일</th>
                        <th>액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td>
                            <div>
                              <div className="font-bold">{project.title}</div>
                              <div className="text-sm opacity-50">
                                {project.description}
                              </div>
                            </div>
                          </td>
                          <td>{getStatusBadge(project.status)}</td>
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className="avatar">
                                <div className="mask mask-squircle w-8 h-8">
                                  <div className="bg-primary text-primary-content w-8 h-8 flex items-center justify-center text-xs">
                                    {project.designerInitial}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">
                                  {project.designer}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <progress
                                className="progress progress-primary w-16"
                                value={project.progress}
                                max="100"
                              ></progress>
                              <span className="text-sm">
                                {project.progress}%
                              </span>
                            </div>
                          </td>
                          <td>{project.deadline}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleViewProject(project.id)}
                            >
                              보기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </AuthWrapper>
  );
}
