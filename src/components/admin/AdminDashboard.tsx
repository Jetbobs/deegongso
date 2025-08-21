"use client";

import { AdminStats, AdminActivity } from "@/types";

export default function AdminDashboard() {
  // Mock 데이터
  const mockStats: AdminStats = {
    total_users: 1247,
    total_projects: 389,
    active_disputes: 7,
    monthly_revenue: 12450000,
    user_growth_rate: 15.3,
    project_completion_rate: 87.2,
    recent_activities: [
      {
        id: "1",
        type: "dispute_opened",
        description: "새로운 분쟁이 접수되었습니다: 프로젝트 #PRJ-001",
        timestamp: "2025-08-20T10:30:00Z",
        project_id: "PRJ-001"
      },
      {
        id: "2", 
        type: "user_registered",
        description: "새 디자이너가 가입했습니다: 김디자인",
        timestamp: "2025-08-20T09:15:00Z",
        user_id: "USR-123"
      },
      {
        id: "3",
        type: "project_created",
        description: "신규 프로젝트가 생성되었습니다: 브랜드 로고 디자인",
        timestamp: "2025-08-20T08:45:00Z",
        project_id: "PRJ-002"
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {formatDateTime(new Date().toISOString())}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 사용자</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.total_users.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+{mockStats.user_growth_rate}%</span>
            <span className="text-sm text-gray-500 ml-1">전월 대비</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.total_projects.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">{mockStats.project_completion_rate}%</span>
            <span className="text-sm text-gray-500 ml-1">완료율</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 분쟁</p>
              <p className="text-2xl font-bold text-red-600">{mockStats.active_disputes}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600">즉시 처리 필요</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">월 매출</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockStats.monthly_revenue)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+23.1%</span>
            <span className="text-sm text-gray-500 ml-1">전월 대비</span>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h2>
          <div className="space-y-4">
            {mockStats.recent_activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'dispute_opened' && '⚖️'}
                  {activity.type === 'user_registered' && '👤'}
                  {activity.type === 'project_created' && '📁'}
                  {activity.type === 'payment_completed' && '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🚨</span>
                <div>
                  <p className="text-sm font-medium">긴급 분쟁 처리</p>
                  <p className="text-xs text-gray-500">우선순위 높은 분쟁 7건</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-lg">👥</span>
                <div>
                  <p className="text-sm font-medium">신규 사용자 승인</p>
                  <p className="text-xs text-gray-500">디자이너 승인 대기 12명</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📊</span>
                <div>
                  <p className="text-sm font-medium">월간 리포트 생성</p>
                  <p className="text-xs text-gray-500">8월 성과 리포트 다운로드</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}