"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthWrapper from "@/components/auth/AuthWrapper";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { useToastActions } from "@/components/ui/Toast";
import { ProjectNotifications } from "@/lib/pushNotifications";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingFeedback: number;
  totalRevenue: number;
  averageRating: number;
  responseTime: number; // hours
  thisMonthCompleted: number;
}

interface RecentActivity {
  id: string;
  type: "project_update" | "feedback_received" | "payment" | "message";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface UpcomingDeadline {
  id: string;
  projectName: string;
  type: "draft" | "review" | "final";
  deadline: string;
  daysLeft: number;
  priority: "high" | "medium" | "low";
}

// Mock 데이터
const MOCK_STATS: DashboardStats = {
  totalProjects: 12,
  activeProjects: 5,
  completedProjects: 7,
  pendingFeedback: 2,
  totalRevenue: 15600000,
  averageRating: 4.8,
  responseTime: 2.3,
  thisMonthCompleted: 3,
};

const MOCK_RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: "1",
    type: "feedback_received",
    title: "새로운 피드백 도착",
    description: "로고 디자인 프로젝트에서 클라이언트 피드백을 받았습니다.",
    timestamp: "2024-01-23T10:30:00Z",
    icon: "💬",
    color: "primary",
  },
  {
    id: "2",
    type: "project_update",
    title: "프로젝트 상태 변경",
    description: "웹사이트 UI/UX 프로젝트가 피드백 정리 단계로 진행되었습니다.",
    timestamp: "2024-01-23T09:15:00Z",
    icon: "🔄",
    color: "info",
  },
  {
    id: "3",
    type: "payment",
    title: "결제 완료",
    description: "브랜딩 패키지 프로젝트 결제가 완료되었습니다.",
    timestamp: "2024-01-22T16:45:00Z",
    icon: "💰",
    color: "success",
  },
  {
    id: "4",
    type: "message",
    title: "새 메시지",
    description: "박디자이너님으로부터 메시지가 도착했습니다.",
    timestamp: "2024-01-22T14:20:00Z",
    icon: "✉️",
    color: "warning",
  },
];

const MOCK_UPCOMING_DEADLINES: UpcomingDeadline[] = [
  {
    id: "1",
    projectName: "로고 디자인 프로젝트",
    type: "review",
    deadline: "2024-01-25T23:59:59Z",
    daysLeft: 2,
    priority: "high",
  },
  {
    id: "2",
    projectName: "웹사이트 UI/UX",
    type: "draft",
    deadline: "2024-01-28T23:59:59Z",
    daysLeft: 5,
    priority: "medium",
  },
  {
    id: "3",
    projectName: "캠페인 키비주얼",
    type: "final",
    deadline: "2024-02-01T23:59:59Z",
    daysLeft: 9,
    priority: "low",
  },
];

const MONTHLY_REVENUE = [
  { month: "10월", revenue: 4200000, projects: 3 },
  { month: "11월", revenue: 6800000, projects: 4 },
  { month: "12월", revenue: 3200000, projects: 2 },
  { month: "1월", revenue: 7500000, projects: 5 },
  { month: "2월", revenue: 5100000, projects: 3 },
  { month: "3월", revenue: 8200000, projects: 6 },
];

export default function EnhancedDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats] = useState<DashboardStats>(MOCK_STATS);
  const [recentActivities] = useState<RecentActivity[]>(MOCK_RECENT_ACTIVITIES);
  const [upcomingDeadlines] = useState<UpcomingDeadline[]>(
    MOCK_UPCOMING_DEADLINES
  );
  const [showCharts, setShowCharts] = useState(false);
  const { info } = useToastActions();

  const userRole = user?.role ?? user?.userType ?? "client";

  useEffect(() => {
    // 목 로딩 지연으로 스켈레톤 표시
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // 컴포넌트 마운트 후 차트 표시 (Recharts SSR 이슈 방지)
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowCharts(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // 데드라인 알림 체크
  useEffect(() => {
    if (!loading) {
      const criticalDeadlines = upcomingDeadlines.filter(
        (d) => d.daysLeft <= 3
      );
      criticalDeadlines.forEach((deadline) => {
        ProjectNotifications.deadlineApproaching(
          deadline.projectName,
          deadline.daysLeft,
          () => router.push(`/projects`)
        );
      });
    }
  }, [loading, upcomingDeadlines, router]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const getDeadlineTypeLabel = (type: UpcomingDeadline["type"]) => {
    const labels = {
      draft: "초안 제출",
      review: "검토 완료",
      final: "최종 제출",
    };
    return labels[type];
  };

  const getPriorityColor = (priority: UpcomingDeadline["priority"]) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "success",
    };
    return colors[priority];
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "new_project":
        router.push("/projects/create");
        break;
      case "view_messages":
        router.push("/messages");
        break;
      case "find_designers":
        router.push("/designers");
        break;
      case "settings":
        router.push("/settings");
        break;
      default:
        info(`${action} 기능은 준비 중입니다.`);
    }
  };

  if (loading) {
    return (
      <AuthWrapper requireAuth={true}>
        <DashboardLayout title="대시보드" userRole={userRole}>
          <div className="space-y-6">
            {/* 헤더 스켈레톤 */}
            <div className="skeleton h-16 w-full" />

            {/* 통계 카드 스켈레톤 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-32 w-full" />
              ))}
            </div>

            {/* 차트 스켈레톤 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="skeleton h-96 w-full" />
              <div className="skeleton h-96 w-full" />
            </div>
          </div>
        </DashboardLayout>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <DashboardLayout title="대시보드" userRole={userRole}>
        <div className="space-y-8">
          {/* 환영 헤더 */}
          <div className="card bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    안녕하세요, {user?.name || user?.email || "사용자"}님! 👋
                  </h1>
                  <p className="text-primary-content/90">
                    {userRole === "client"
                      ? "오늘도 멋진 프로젝트를 만들어보세요."
                      : "창의적인 작업으로 클라이언트를 만족시켜보세요!"}
                  </p>
                </div>

                <div className="hidden lg:block">
                  <div className="stats bg-primary-content/10 text-primary-content">
                    <div className="stat">
                      <div className="stat-value text-2xl">
                        {stats.activeProjects}
                      </div>
                      <div className="stat-title text-primary-content/90">
                        진행 중
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 주요 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-sm border border-primary/20">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title text-sm">진행 중인 프로젝트</h2>
                    <div className="text-3xl font-bold text-primary">
                      {stats.activeProjects}
                    </div>
                    <div className="text-sm text-success">
                      +{stats.thisMonthCompleted}개 이번 달 완료
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">📊</div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm border border-warning/20">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
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
                  <div className="text-4xl opacity-20">💬</div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm border border-success/20">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title text-sm text-base-content/60">
                      평균 만족도
                    </h2>
                    <div className="text-3xl font-bold text-success">
                      {stats.averageRating}★
                    </div>
                    <div className="text-sm text-base-content/60">5점 만점</div>
                  </div>
                  <div className="text-4xl opacity-20">⭐</div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm border border-info/20">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title text-sm text-base-content/60">
                      {userRole === "client" ? "평균 응답시간" : "총 수익"}
                    </h2>
                    <div className="text-3xl font-bold text-info">
                      {userRole === "client"
                        ? `${stats.responseTime}h`
                        : `${Math.round(stats.totalRevenue / 1000000)}M`}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {userRole === "client" ? "평균 응답" : "원 (총 수익)"}
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">
                    {userRole === "client" ? "⚡" : "💰"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 활동 & 예정된 마감일 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 최근 활동 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">최근 활동</h3>
                  <button
                    onClick={() => router.push("/activities")}
                    className="btn btn-ghost btn-sm"
                  >
                    전체 보기
                  </button>
                </div>

                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm
                        bg-${activity.color}/10 text-${activity.color}
                      `}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-base-content/60 mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-base-content/40">
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 예정된 마감일 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">예정된 마감일</h3>
                  <button
                    onClick={() => router.push("/projects")}
                    className="btn btn-ghost btn-sm"
                  >
                    전체 보기
                  </button>
                </div>

                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {deadline.projectName}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {getDeadlineTypeLabel(deadline.type)} 마감
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`badge badge-${getPriorityColor(
                            deadline.priority
                          )} badge-sm`}
                        >
                          {deadline.daysLeft}일 남음
                        </span>
                        <p className="text-xs text-base-content/60 mt-1">
                          {new Date(deadline.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 월별 수익 추이 (디자이너용) */}
          {userRole === "designer" && (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="text-lg font-semibold mb-4">월별 수익 추이</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MONTHLY_REVENUE}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-base-300"
                      />
                      <XAxis dataKey="month" className="text-base-content" />
                      <YAxis
                        className="text-base-content"
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toLocaleString()}원`,
                          "수익",
                        ]}
                        labelStyle={{ color: "inherit" }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--b1))",
                          border: "1px solid hsl(var(--b3))",
                          borderRadius: "0.5rem",
                          color: "hsl(var(--bc))",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 6, fill: "#3b82f6" }}
                        activeDot={{ r: 8 }}
                        name="월별 수익"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 수익 요약 */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {MONTHLY_REVENUE[
                        MONTHLY_REVENUE.length - 1
                      ].revenue.toLocaleString()}
                      원
                    </p>
                    <p className="text-sm text-base-content/60">이번 달 수익</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {Math.round(
                        MONTHLY_REVENUE.reduce(
                          (sum, item) => sum + item.revenue,
                          0
                        ) / MONTHLY_REVENUE.length
                      ).toLocaleString()}
                      원
                    </p>
                    <p className="text-sm text-base-content/60">평균 월 수익</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">
                      {MONTHLY_REVENUE.reduce(
                        (sum, item) => sum + item.projects,
                        0
                      )}
                      개
                    </p>
                    <p className="text-sm text-base-content/60">총 프로젝트</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 차트 섹션 */}
          {showCharts && <DashboardCharts userRole={userRole} />}

          {/* 빠른 액션 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">빠른 작업</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleQuickAction("new_project")}
                  className="btn btn-outline btn-lg"
                >
                  새 프로젝트
                </button>

                <button
                  onClick={() => handleQuickAction("view_messages")}
                  className="btn btn-outline btn-lg"
                >
                  메시지 확인
                </button>

                {userRole === "client" && (
                  <button
                    onClick={() => handleQuickAction("find_designers")}
                    className="btn btn-outline btn-lg"
                  >
                    디자이너 찾기
                  </button>
                )}

                <button
                  onClick={() => handleQuickAction("settings")}
                  className="btn btn-outline btn-lg"
                >
                  설정
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthWrapper>
  );
}
