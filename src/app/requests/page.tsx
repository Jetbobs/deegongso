"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";

// 프로젝트 요청 타입
interface ProjectRequest {
  id: string;
  designerId: string;
  designerName: string;
  designerAvatar: string;
  projectName: string;
  description: string;
  category: string;
  estimatedPrice: number;
  totalModifications: number;
  schedule: {
    startDate: string;
    draftDeadline: string;
    firstReviewDeadline: string;
    finalDeadline: string;
  };
  paymentTerms: {
    method: "lump_sum" | "installment";
    details?: string;
  };
  requestedAt: string;
  status: "pending" | "reviewing" | "accepted" | "rejected" | "negotiating";
  urgency: "low" | "medium" | "high";
  attachments?: {
    name: string;
    type: string;
    size: string;
  }[];
}

// Mock 데이터
const mockRequests: ProjectRequest[] = [
  {
    id: "req-001",
    designerId: "designer-1",
    designerName: "김디자이너",
    designerAvatar: "김",
    projectName: "브랜드 로고 디자인",
    description: "스타트업을 위한 심플하고 모던한 로고 디자인 작업입니다. 브랜드 아이덴티티를 잘 표현할 수 있는 로고를 제작하고자 합니다.",
    category: "로고 디자인",
    estimatedPrice: 500000,
    totalModifications: 3,
    schedule: {
      startDate: "2024-01-25",
      draftDeadline: "2024-02-01",
      firstReviewDeadline: "2024-02-05",
      finalDeadline: "2024-02-10"
    },
    paymentTerms: {
      method: "installment",
      details: "계약금 50%, 완료 후 50%"
    },
    requestedAt: "2024-01-20T14:30:00Z",
    status: "pending",
    urgency: "high",
    attachments: [
      { name: "브랜드_가이드라인.pdf", type: "pdf", size: "2.1 MB" },
      { name: "참고_이미지.jpg", type: "image", size: "1.5 MB" }
    ]
  },
  {
    id: "req-002",
    designerId: "designer-2", 
    designerName: "이디자이너",
    designerAvatar: "이",
    projectName: "웹사이트 UI/UX 디자인",
    description: "E-commerce 웹사이트의 전체적인 UI/UX 리뉴얼 작업입니다. 사용자 경험을 개선하고 전환율을 높이는 것이 목표입니다.",
    category: "웹 디자인",
    estimatedPrice: 1200000,
    totalModifications: 5,
    schedule: {
      startDate: "2024-01-30",
      draftDeadline: "2024-02-15",
      firstReviewDeadline: "2024-02-20",
      finalDeadline: "2024-03-01"
    },
    paymentTerms: {
      method: "installment",
      details: "착수금 30%, 중간 40%, 완료 30%"
    },
    requestedAt: "2024-01-19T10:15:00Z",
    status: "negotiating",
    urgency: "medium"
  },
  {
    id: "req-003",
    designerId: "designer-3",
    designerName: "박디자이너", 
    designerAvatar: "박",
    projectName: "모바일 앱 아이콘 세트",
    description: "iOS/Android 앱을 위한 아이콘 세트 제작입니다. 총 30개의 아이콘이 필요하며, 일관된 스타일을 유지해야 합니다.",
    category: "앱 디자인",
    estimatedPrice: 300000,
    totalModifications: 2,
    schedule: {
      startDate: "2024-01-22",
      draftDeadline: "2024-01-28",
      firstReviewDeadline: "2024-01-30",
      finalDeadline: "2024-02-02"
    },
    paymentTerms: {
      method: "lump_sum",
      details: "완료 후 일시불"
    },
    requestedAt: "2024-01-18T16:45:00Z",
    status: "accepted",
    urgency: "low"
  }
];

export default function RequestsPage() {
  const { user } = useAuth();
  const userRole: UserRole = user?.role ?? user?.userType ?? "client";
  const router = useRouter();
  
  const [requests, setRequests] = useState<ProjectRequest[]>(mockRequests);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // 클라이언트만 접근 가능
  useEffect(() => {
    if (user && userRole !== "client") {
      alert("이 페이지는 클라이언트만 접근할 수 있습니다.");
      router.replace("/dashboard");
    }
  }, [user, userRole, router]);

  // 필터링된 요청 목록
  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesUrgency = filterUrgency === "all" || request.urgency === filterUrgency;
    const matchesSearch = !searchTerm || 
      request.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.designerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesUrgency && matchesSearch;
  });

  // 상태별 색상
  const getStatusColor = (status: string) => {
    const colors = {
      pending: "badge-warning",
      reviewing: "badge-info", 
      accepted: "badge-success",
      rejected: "badge-error",
      negotiating: "badge-secondary"
    };
    return colors[status as keyof typeof colors] || "badge-neutral";
  };

  // 긴급도별 색상
  const getUrgencyColor = (urgency: string) => {
    const colors = {
      high: "text-error",
      medium: "text-warning",
      low: "text-success"
    };
    return colors[urgency as keyof typeof colors] || "text-neutral";
  };

  // 시간 포맷팅
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 0 ? "방금 전" : `${diffMinutes}분 전`;
    }
  };

  // 요청 상태 변경
  const updateRequestStatus = (requestId: string, newStatus: ProjectRequest['status']) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
  };

  // 프로젝트 승인 후 워크플로우로 이동
  const handleAcceptRequest = (request: ProjectRequest) => {
    updateRequestStatus(request.id, "accepted");
    // 클라이언트 검토 단계(2단계)로 이동
    router.push(`/projects/create?request=${request.id}&step=2`);
  };

  const selectedRequestData = requests.find(req => req.id === selectedRequest);

  return (
    <AuthWrapper requireAuth>
      <DashboardLayout title="프로젝트 요청" userRole={userRole}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* 요청 목록 */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-sm h-full">
              <div className="card-body p-0">
                <div className="p-4 border-b border-base-300">
                  <h2 className="card-title mb-4">
                    프로젝트 요청
                    <span className="badge badge-primary">
                      {filteredRequests.length}
                    </span>
                  </h2>

                  {/* 검색 */}
                  <div className="form-control mb-3">
                    <input
                      type="text"
                      placeholder="프로젝트명, 디자이너명 검색..."
                      className="input input-bordered input-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* 필터 */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="select select-bordered select-xs"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">모든 상태</option>
                      <option value="pending">대기 중</option>
                      <option value="reviewing">검토 중</option>
                      <option value="accepted">승인됨</option>
                      <option value="rejected">거절됨</option>
                      <option value="negotiating">협상 중</option>
                    </select>

                    <select
                      className="select select-bordered select-xs"
                      value={filterUrgency}
                      onChange={(e) => setFilterUrgency(e.target.value)}
                    >
                      <option value="all">모든 긴급도</option>
                      <option value="high">높음</option>
                      <option value="medium">보통</option>
                      <option value="low">낮음</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-sm text-base-content/60">
                        조건에 맞는 요청이 없습니다
                      </p>
                    </div>
                  ) : (
                    filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 hover:bg-base-200 cursor-pointer border-b border-base-300 ${
                          selectedRequest === request.id ? "bg-base-200 border-l-4 border-l-primary" : ""
                        }`}
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="avatar">
                              <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                <span className="text-xs">{request.designerAvatar}</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{request.designerName}</p>
                              <p className="text-xs text-base-content/60">{formatTime(request.requestedAt)}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`badge badge-xs ${getStatusColor(request.status)}`}>
                              {request.status === "pending" && "대기"}
                              {request.status === "reviewing" && "검토중"}
                              {request.status === "accepted" && "승인"}
                              {request.status === "rejected" && "거절"}
                              {request.status === "negotiating" && "협상중"}
                            </span>
                            <span className={`text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                              {request.urgency === "high" && "🔴 긴급"}
                              {request.urgency === "medium" && "🟡 보통"}
                              {request.urgency === "low" && "🟢 낮음"}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-sm mb-1">{request.projectName}</h3>
                        <p className="text-xs text-base-content/70 line-clamp-2 mb-2">
                          {request.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="badge badge-outline badge-xs">{request.category}</span>
                          <span className="font-semibold text-primary">
                            {request.estimatedPrice.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 요청 상세 */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-sm h-full">
              <div className="card-body">
                {!selectedRequestData ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-bold mb-2">프로젝트 요청을 선택해주세요</h3>
                    <p className="text-base-content/60">
                      왼쪽에서 요청을 선택하면 상세 정보를 확인할 수 있습니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="avatar">
                          <div className="w-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                            <span className="text-sm">{selectedRequestData.designerAvatar}</span>
                          </div>
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold">{selectedRequestData.projectName}</h1>
                          <p className="text-base-content/70">
                            {selectedRequestData.designerName} • {formatTime(selectedRequestData.requestedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`badge ${getStatusColor(selectedRequestData.status)}`}>
                          {selectedRequestData.status === "pending" && "승인 대기"}
                          {selectedRequestData.status === "reviewing" && "검토 중"}
                          {selectedRequestData.status === "accepted" && "승인됨"}
                          {selectedRequestData.status === "rejected" && "거절됨"}
                          {selectedRequestData.status === "negotiating" && "협상 중"}
                        </span>
                        <span className={`text-sm font-medium ${getUrgencyColor(selectedRequestData.urgency)}`}>
                          {selectedRequestData.urgency === "high" && "🔴 긴급"}
                          {selectedRequestData.urgency === "medium" && "🟡 보통"}
                          {selectedRequestData.urgency === "low" && "🟢 낮음"}
                        </span>
                      </div>
                    </div>

                    {/* 프로젝트 정보 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">프로젝트 개요</h3>
                          <div className="bg-base-200 p-4 rounded-lg">
                            <p className="text-sm">{selectedRequestData.description}</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">기본 정보</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>카테고리:</span>
                              <span>{selectedRequestData.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>예상 견적:</span>
                              <span className="font-semibold text-primary">
                                {selectedRequestData.estimatedPrice.toLocaleString()}원
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>수정 횟수:</span>
                              <span>{selectedRequestData.totalModifications}회</span>
                            </div>
                            <div className="flex justify-between">
                              <span>결제 방식:</span>
                              <span>
                                {selectedRequestData.paymentTerms.method === "lump_sum" ? "일시불" : "분할결제"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">프로젝트 일정</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>시작일:</span>
                              <span>{selectedRequestData.schedule.startDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>초안 제출:</span>
                              <span>{selectedRequestData.schedule.draftDeadline}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>중간 검토:</span>
                              <span>{selectedRequestData.schedule.firstReviewDeadline}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>최종 완료:</span>
                              <span>{selectedRequestData.schedule.finalDeadline}</span>
                            </div>
                          </div>
                        </div>

                        {selectedRequestData.attachments && selectedRequestData.attachments.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">첨부 파일</h3>
                            <div className="space-y-2">
                              {selectedRequestData.attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg">
                                      {file.type === "pdf" ? "📄" : "🖼️"}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium">{file.name}</p>
                                      <p className="text-xs text-base-content/60">{file.size}</p>
                                    </div>
                                  </div>
                                  <button className="btn btn-ghost btn-xs">다운로드</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    {selectedRequestData.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t border-base-300">
                        <button
                          className="btn btn-success flex-1"
                          onClick={() => handleAcceptRequest(selectedRequestData)}
                        >
                          ✅ 프로젝트 승인
                        </button>
                        <button
                          className="btn btn-warning flex-1"
                          onClick={() => updateRequestStatus(selectedRequestData.id, "negotiating")}
                        >
                          💬 협상 요청
                        </button>
                        <button
                          className="btn btn-error flex-1"
                          onClick={() => updateRequestStatus(selectedRequestData.id, "rejected")}
                        >
                          ❌ 거절
                        </button>
                      </div>
                    )}

                    {selectedRequestData.status === "reviewing" && (
                      <div className="alert alert-info">
                        <span>이 요청을 검토 중입니다. 곧 결정해 주세요.</span>
                      </div>
                    )}

                    {selectedRequestData.status === "negotiating" && (
                      <div className="space-y-3 pt-4 border-t border-base-300">
                        <div className="alert alert-warning">
                          <span>⚠️ 디자이너가 재협상을 요청했습니다. 조건을 수정해서 다시 제안해주세요.</span>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            className="btn btn-primary flex-1"
                            onClick={() => router.push(`/projects/create?request=${selectedRequestData.id}&step=2`)}
                          >
                            📝 조건 수정하기
                          </button>
                          <button
                            className="btn btn-error flex-1"
                            onClick={() => updateRequestStatus(selectedRequestData.id, "rejected")}
                          >
                            ❌ 프로젝트 포기
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedRequestData.status === "accepted" && (
                      <div className="alert alert-success">
                        <span>✅ 승인된 프로젝트입니다. 워크플로우를 진행하세요.</span>
                        <button className="btn btn-success btn-sm">프로젝트 보기</button>
                      </div>
                    )}

                    {selectedRequestData.status === "rejected" && (
                      <div className="alert alert-error">
                        <span>❌ 거절된 프로젝트입니다.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthWrapper>
  );
}