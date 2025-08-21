"use client";

import { useState } from "react";

interface Activity {
  id: string;
  type: "project_created" | "project_completed" | "message_sent" | "file_uploaded" | "payment_received" | "review_left" | "milestone_reached";
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  metadata?: {
    projectId?: string;
    amount?: number;
    rating?: number;
    fileName?: string;
  };
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "project_completed",
    title: "브랜드 로고 디자인 프로젝트 완료",
    description: "클라이언트 김민수님과의 프로젝트가 성공적으로 완료되었습니다.",
    timestamp: "2025-01-20T14:30:00Z",
    status: "success",
    metadata: { projectId: "proj-123", amount: 500000 }
  },
  {
    id: "2",
    type: "payment_received",
    title: "결제 완료",
    description: "프로젝트 최종 결제 500,000원이 처리되었습니다.",
    timestamp: "2025-01-20T14:25:00Z",
    status: "success",
    metadata: { amount: 500000 }
  },
  {
    id: "3",
    type: "review_left",
    title: "리뷰 작성",
    description: "디자이너 박지혜님에게 5점 리뷰를 남겼습니다.",
    timestamp: "2025-01-20T14:20:00Z",
    status: "info",
    metadata: { rating: 5 }
  },
  {
    id: "4",
    type: "file_uploaded",
    title: "파일 업로드",
    description: "최종 로고 파일이 업로드되었습니다.",
    timestamp: "2025-01-20T10:15:00Z",
    status: "info",
    metadata: { fileName: "final_logo_v3.ai" }
  },
  {
    id: "5",
    type: "milestone_reached",
    title: "마일스톤 달성",
    description: "초안 디자인 단계가 완료되었습니다.",
    timestamp: "2025-01-18T16:45:00Z",
    status: "success"
  },
  {
    id: "6",
    type: "message_sent",
    title: "메시지 전송",
    description: "디자이너에게 수정 요청사항을 전달했습니다.",
    timestamp: "2025-01-17T11:30:00Z",
    status: "info"
  },
  {
    id: "7",
    type: "project_created",
    title: "새 프로젝트 시작",
    description: "브랜드 로고 디자인 프로젝트를 시작했습니다.",
    timestamp: "2025-01-15T09:00:00Z",
    status: "info"
  }
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "project_created": return "🚀";
    case "project_completed": return "✅";
    case "message_sent": return "💬";
    case "file_uploaded": return "📎";
    case "payment_received": return "💳";
    case "review_left": return "⭐";
    case "milestone_reached": return "🎯";
    default: return "📋";
  }
};

const getStatusColor = (status?: Activity["status"]) => {
  switch (status) {
    case "success": return "border-green-200 bg-green-50";
    case "warning": return "border-yellow-200 bg-yellow-50";
    case "error": return "border-red-200 bg-red-50";
    case "info": return "border-blue-200 bg-blue-50";
    default: return "border-gray-200 bg-gray-50";
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return `${minutes}분 전`;
  } else if (hours < 24) {
    return `${hours}시간 전`;
  } else if (days < 7) {
    return `${days}일 전`;
  } else {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
};

export default function ActivityHistory() {
  const [filter, setFilter] = useState<"all" | Activity["type"]>("all");
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredActivities = filter === "all" 
    ? mockActivities 
    : mockActivities.filter(activity => activity.type === filter);

  const filterOptions = [
    { value: "all", label: "전체" },
    { value: "project_created", label: "프로젝트 생성" },
    { value: "project_completed", label: "프로젝트 완료" },
    { value: "payment_received", label: "결제" },
    { value: "file_uploaded", label: "파일 업로드" },
    { value: "message_sent", label: "메시지" },
    { value: "review_left", label: "리뷰" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">활동 내역</h2>
        
        <div className="flex items-center gap-2">
          <select 
            className="select select-bordered select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button className="btn btn-outline btn-sm">
            📊 내보내기
          </button>
        </div>
      </div>

      {/* 활동 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-figure text-primary">
            <div className="text-2xl">📈</div>
          </div>
          <div className="stat-title text-xs">이번 주</div>
          <div className="stat-value text-lg">24</div>
          <div className="stat-desc">+12% 증가</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <div className="text-2xl">✅</div>
          </div>
          <div className="stat-title text-xs">완료된 작업</div>
          <div className="stat-value text-lg">8</div>
          <div className="stat-desc">이번 달</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-figure text-accent">
            <div className="text-2xl">💬</div>
          </div>
          <div className="stat-title text-xs">메시지</div>
          <div className="stat-value text-lg">156</div>
          <div className="stat-desc">+8 오늘</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-figure text-warning">
            <div className="text-2xl">⏱️</div>
          </div>
          <div className="stat-title text-xs">평균 응답</div>
          <div className="stat-value text-lg">2.3h</div>
          <div className="stat-desc">-15분 개선</div>
        </div>
      </div>

      {/* 활동 타임라인 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-4">
                {/* 타임라인 연결선 */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getStatusColor(activity.status)} border-2`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < filteredActivities.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>

                {/* 활동 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      
                      {/* 메타데이터 */}
                      {activity.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activity.metadata.amount && (
                            <span className="badge badge-success badge-sm">
                              {activity.metadata.amount.toLocaleString()}원
                            </span>
                          )}
                          {activity.metadata.rating && (
                            <span className="badge badge-warning badge-sm">
                              ⭐ {activity.metadata.rating}점
                            </span>
                          )}
                          {activity.metadata.fileName && (
                            <span className="badge badge-info badge-sm">
                              📎 {activity.metadata.fileName}
                            </span>
                          )}
                          {activity.metadata.projectId && (
                            <span className="badge badge-outline badge-sm">
                              {activity.metadata.projectId}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => setShowDetails(
                          showDetails === activity.id ? null : activity.id
                        )}
                      >
                        {showDetails === activity.id ? "📖" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {/* 상세 정보 */}
                  {showDetails === activity.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm space-y-2">
                        <div><strong>활동 ID:</strong> {activity.id}</div>
                        <div><strong>타입:</strong> {activity.type}</div>
                        <div><strong>시간:</strong> {new Date(activity.timestamp).toLocaleString("ko-KR")}</div>
                        {activity.metadata && (
                          <div><strong>추가 정보:</strong> {JSON.stringify(activity.metadata, null, 2)}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">활동 내역이 없습니다</h3>
              <p className="text-gray-600">선택한 필터에 해당하는 활동이 없습니다.</p>
            </div>
          )}

          {/* 더 보기 버튼 */}
          {filteredActivities.length > 0 && (
            <div className="text-center mt-6">
              <button className="btn btn-outline">
                더 많은 활동 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}