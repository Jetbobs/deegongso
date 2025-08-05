"use client";

import { useState } from "react";
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
  status: "active" | "pending" | "completed" | "feedback";
  progress: number;
  deadline: string;
  designer: string;
  designerInitial: string;
}

const MOCK_PROJECTS: MockProject[] = [
  {
    id: "1",
    title: "로고 디자인 프로젝트",
    description: "브랜드 아이덴티티",
    status: "feedback",
    progress: 70,
    deadline: "2024-01-20",
    designer: "김디자이너",
    designerInitial: "김",
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
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [stats] = useState<DashboardStats>({
    totalProjects: 3,
    activeProjects: 1,
    completedProjects: 1,
    pendingFeedback: 1,
  });

  const getStatusBadge = (status: MockProject["status"]) => {
    const statusConfig = {
      pending: { class: "badge-warning", text: "대기 중" },
      active: { class: "badge-info", text: "진행 중" },
      feedback: { class: "badge-warning", text: "피드백 대기" },
      completed: { class: "badge-success", text: "완료" },
    };

    const config = statusConfig[status];
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <AuthWrapper requireAuth={true}>
      <DashboardLayout title="대시보드" userRole={user?.userType || "client"}>
        {/* 사용자 환영 메시지 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            안녕하세요, {user?.name || user?.email || "사용자"}님! 👋
          </h1>
          <p className="text-base-content/60">
            {user?.userType === "client"
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
              <div className="text-sm text-base-content/60">전월 대비 +1</div>
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
              <div className="text-sm text-base-content/60">빠른 응답 필요</div>
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
              <button className="btn btn-sm btn-primary">전체 보기</button>
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
                            <div className="font-bold">{project.designer}</div>
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
                          <span className="text-sm">{project.progress}%</span>
                        </div>
                      </td>
                      <td>{project.deadline}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthWrapper>
  );
}
