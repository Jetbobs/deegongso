"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";

// 디자이너가 관리하는 협상 중인 프로젝트 타입
interface NegotiatingProject {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  clientAvatar: string;
  projectTitle: string;
  originalProposal: {
    description: string;
    estimatedPrice: number;
    totalModifications: number;
    timeline: string;
  };
  clientFeedback: {
    requestedPrice?: number;
    requestedModifications?: number;
    additionalRequirements?: string;
    timeline?: string;
  };
  negotiationRound: number;
  lastUpdated: string;
  status: "pending_designer_response" | "pending_client_response" | "agreement_reached";
  urgency: "low" | "medium" | "high";
}

// 협상 중인 프로젝트 Mock 데이터
const mockNegotiatingProjects: NegotiatingProject[] = [
  {
    id: "nego-001",
    clientId: "client-1",
    clientName: "김클라이언트",
    clientCompany: "스타트업 A",
    clientAvatar: "김",
    projectTitle: "브랜드 로고 디자인",
    originalProposal: {
      description: "스타트업을 위한 심플하고 모던한 로고 디자인",
      estimatedPrice: 500000,
      totalModifications: 3,
      timeline: "2024-01-25 ~ 2024-02-10"
    },
    clientFeedback: {
      requestedPrice: 400000,
      requestedModifications: 5,
      additionalRequirements: "명함과 레터헤드 디자인도 포함해주세요. 그리고 컬러 버전과 흑백 버전 모두 필요합니다.",
      timeline: "마감일을 2024-02-05로 앞당길 수 있나요?"
    },
    negotiationRound: 2,
    lastUpdated: "2024-01-21T14:30:00Z",
    status: "pending_designer_response",
    urgency: "high"
  },
  {
    id: "nego-002",
    clientId: "client-2",
    clientName: "이클라이언트", 
    clientCompany: "쇼핑몰 B",
    clientAvatar: "이",
    projectTitle: "웹사이트 UI/UX 리뉴얼",
    originalProposal: {
      description: "E-commerce 웹사이트의 전체적인 UI/UX 개선",
      estimatedPrice: 1200000,
      totalModifications: 5,
      timeline: "2024-01-30 ~ 2024-03-30"
    },
    clientFeedback: {
      requestedPrice: 1200000, // 가격은 동의
      requestedModifications: 3, // 수정 횟수 줄임
      additionalRequirements: "모바일 앱 버전도 함께 고려해서 디자인해주세요. 통일성이 중요합니다.",
    },
    negotiationRound: 1,
    lastUpdated: "2024-01-20T16:45:00Z",
    status: "pending_client_response",
    urgency: "medium"
  },
  {
    id: "nego-003",
    clientId: "client-3",
    clientName: "박클라이언트",
    clientCompany: "카페 체인 C", 
    clientAvatar: "박",
    projectTitle: "카페 브랜드 패키지 디자인",
    originalProposal: {
      description: "카페 로고와 패키지 디자인 일괄 작업",
      estimatedPrice: 2000000,
      totalModifications: 2,
      timeline: "2024-01-30 ~ 2024-02-28"
    },
    clientFeedback: {
      requestedPrice: 1800000,
      requestedModifications: 3,
      additionalRequirements: "매장 간판과 쇼핑백 디자인도 추가로 부탁드립니다."
    },
    negotiationRound: 3,
    lastUpdated: "2024-01-19T11:20:00Z", 
    status: "agreement_reached",
    urgency: "low"
  }
];

export default function ProposalsPage() {
  const { user } = useAuth();
  const userRole: UserRole = user?.role ?? user?.userType ?? "designer";
  const router = useRouter();
  
  const [negotiations, setNegotiations] = useState<NegotiatingProject[]>(mockNegotiatingProjects);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNegotiation, setSelectedNegotiation] = useState<string | null>(null);

  // 디자이너만 접근 가능
  useEffect(() => {
    if (user && userRole !== "designer") {
      alert("이 페이지는 디자이너만 접근할 수 있습니다.");
      router.replace("/dashboard");
    }
  }, [user, userRole, router]);

  // 필터링된 협상 목록
  const filteredNegotiations = negotiations.filter(negotiation => {
    const matchesStatus = filterStatus === "all" || negotiation.status === filterStatus;
    const matchesUrgency = filterUrgency === "all" || negotiation.urgency === filterUrgency;
    const matchesSearch = !searchTerm || 
      negotiation.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      negotiation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      negotiation.originalProposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesUrgency && matchesSearch;
  });

  // 상태별 색상
  const getStatusColor = (status: string) => {
    const colors = {
      pending_designer_response: "badge-warning",
      pending_client_response: "badge-info",
      agreement_reached: "badge-success"
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

  // 협상 상태 변경
  const updateNegotiationStatus = (negotiationId: string, newStatus: NegotiatingProject['status']) => {
    setNegotiations(prev => prev.map(negotiation => 
      negotiation.id === negotiationId ? { ...negotiation, status: newStatus } : negotiation
    ));
  };

  // 워크플로우로 이동 (재협상)
  const handleRenegotiate = (negotiation: NegotiatingProject) => {
    router.push(`/projects/create?negotiation=${negotiation.id}&step=2`);
  };

  const selectedNegotiationData = negotiations.find(n => n.id === selectedNegotiation);

  return (
    <AuthWrapper requireAuth>
      <DashboardLayout title="협상 관리" userRole={userRole}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* 제안 목록 */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-sm h-full">
              <div className="card-body p-0">
                <div className="p-4 border-b border-base-300">
                  <h2 className="card-title mb-4">
                    협상 중인 프로젝트
                    <span className="badge badge-primary">
                      {filteredNegotiations.length}
                    </span>
                  </h2>

                  {/* 검색 */}
                  <div className="form-control mb-3">
                    <input
                      type="text"
                      placeholder="프로젝트명, 클라이언트명 검색..."
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
                      <option value="pending_designer_response">내 응답 대기</option>
                      <option value="pending_client_response">클라이언트 응답 대기</option>
                      <option value="agreement_reached">합의 완료</option>
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
                  {filteredNegotiations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-sm text-base-content/60">
                        협상 중인 프로젝트가 없습니다
                      </p>
                    </div>
                  ) : (
                    filteredNegotiations.map((negotiation) => (
                      <div
                        key={negotiation.id}
                        className={`p-4 hover:bg-base-200 cursor-pointer border-b border-base-300 ${
                          selectedNegotiation === negotiation.id ? "bg-base-200 border-l-4 border-l-primary" : ""
                        }`}
                        onClick={() => setSelectedNegotiation(negotiation.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="avatar">
                              <div className="w-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                                <span className="text-xs">{negotiation.clientAvatar}</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{negotiation.clientName}</p>
                              {negotiation.clientCompany && (
                                <p className="text-xs text-base-content/60">{negotiation.clientCompany}</p>
                              )}
                              <p className="text-xs text-base-content/60">{formatTime(negotiation.lastUpdated)}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`badge badge-xs ${getStatusColor(negotiation.status)}`}>
                              {negotiation.status === "pending_designer_response" && "내 응답 대기"}
                              {negotiation.status === "pending_client_response" && "클라이언트 응답 대기"}
                              {negotiation.status === "agreement_reached" && "합의 완료"}
                            </span>
                            <span className={`text-xs font-medium ${getUrgencyColor(negotiation.urgency)}`}>
                              {negotiation.urgency === "high" && "🔴 긴급"}
                              {negotiation.urgency === "medium" && "🟡 보통"}
                              {negotiation.urgency === "low" && "🟢 낮음"}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-sm mb-1">{negotiation.projectTitle}</h3>
                        <p className="text-xs text-base-content/70 line-clamp-2 mb-2">
                          {negotiation.originalProposal.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="badge badge-outline badge-xs">협상 라운드 {negotiation.negotiationRound}</span>
                          <span className="font-semibold text-primary">
                            {negotiation.originalProposal.estimatedPrice.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 제안 상세 */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-sm h-full">
              <div className="card-body">
                {!selectedNegotiationData ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-bold mb-2">의뢰를 선택해주세요</h3>
                    <p className="text-base-content/60">
                      왼쪽에서 의뢰를 선택하면 상세 정보를 확인할 수 있습니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="avatar">
                          <div className="w-12 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                            <span className="text-sm">{selectedNegotiationData.clientAvatar}</span>
                          </div>
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold">{selectedNegotiationData.projectTitle}</h1>
                          <p className="text-base-content/70">
                            {selectedNegotiationData.clientName}
                            {selectedNegotiationData.clientCompany && ` · ${selectedNegotiationData.clientCompany}`}
                            {' · '}{formatTime(selectedNegotiationData.lastUpdated)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`badge ${getStatusColor(selectedNegotiationData.status)}`}>
                          {selectedNegotiationData.status === "pending_designer_response" && "내 응답 대기"}
                          {selectedNegotiationData.status === "pending_client_response" && "클라이언트 응답 대기"}
                          {selectedNegotiationData.status === "agreement_reached" && "합의 완료"}
                        </span>
                        <span className={`text-sm font-medium ${getUrgencyColor(selectedNegotiationData.urgency)}`}>
                          {selectedNegotiationData.urgency === "high" && "🔴 긴급"}
                          {selectedNegotiationData.urgency === "medium" && "🟡 보통"}
                          {selectedNegotiationData.urgency === "low" && "🟢 낮음"}
                        </span>
                      </div>
                    </div>

                    {/* 프로젝트 정보 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">원래 제안</h3>
                          <div className="bg-base-200 p-4 rounded-lg">
                            <p className="text-sm">{selectedNegotiationData.originalProposal.description}</p>
                            <div className="mt-2 space-y-1 text-xs">
                              <div>💰 예상 가격: {selectedNegotiationData.originalProposal.estimatedPrice.toLocaleString()}원</div>
                              <div>🔄 수정 횟수: {selectedNegotiationData.originalProposal.totalModifications}회</div>
                              <div>📅 일정: {selectedNegotiationData.originalProposal.timeline}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">클라이언트 피드백</h3>
                          <div className="bg-warning/10 p-4 rounded-lg">
                            {selectedNegotiationData.clientFeedback.requestedPrice && (
                              <div className="text-sm mb-2">
                                💰 요청 가격: <span className="font-semibold">{selectedNegotiationData.clientFeedback.requestedPrice.toLocaleString()}원</span>
                              </div>
                            )}
                            {selectedNegotiationData.clientFeedback.requestedModifications && (
                              <div className="text-sm mb-2">
                                🔄 요청 수정 횟수: <span className="font-semibold">{selectedNegotiationData.clientFeedback.requestedModifications}회</span>
                              </div>
                            )}
                            {selectedNegotiationData.clientFeedback.additionalRequirements && (
                              <div className="text-sm mb-2">
                                📝 추가 요구사항:
                                <p className="mt-1 text-xs">{selectedNegotiationData.clientFeedback.additionalRequirements}</p>
                              </div>
                            )}
                            {selectedNegotiationData.clientFeedback.timeline && (
                              <div className="text-sm">
                                📅 일정 조정: <span className="font-semibold">{selectedNegotiationData.clientFeedback.timeline}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">협상 현황</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>협상 라운드:</span>
                              <span className="font-semibold text-primary">
                                {selectedNegotiationData.negotiationRound}라운드
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>원래 가격:</span>
                              <span className="font-semibold">
                                {selectedNegotiationData.originalProposal.estimatedPrice.toLocaleString()}원
                              </span>
                            </div>
                            {selectedNegotiationData.clientFeedback.requestedPrice && (
                              <div className="flex justify-between">
                                <span>클라이언트 요청 가격:</span>
                                <span className="font-semibold text-warning">
                                  {selectedNegotiationData.clientFeedback.requestedPrice.toLocaleString()}원
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>긴급도:</span>
                              <span className={`capitalize font-semibold ${getUrgencyColor(selectedNegotiationData.urgency)}`}>
                                {selectedNegotiationData.urgency === "high" && "높음"}
                                {selectedNegotiationData.urgency === "medium" && "보통"}
                                {selectedNegotiationData.urgency === "low" && "낮음"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">수정 횟수 비교</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>원래 제안:</span>
                              <span>{selectedNegotiationData.originalProposal.totalModifications}회</span>
                            </div>
                            {selectedNegotiationData.clientFeedback.requestedModifications && (
                              <div className="flex justify-between">
                                <span>클라이언트 요청:</span>
                                <span className="font-semibold text-warning">
                                  {selectedNegotiationData.clientFeedback.requestedModifications}회
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>마지막 업데이트:</span>
                              <span>{formatTime(selectedNegotiationData.lastUpdated)}</span>
                            </div>
                          </div>
                        </div>


                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    {selectedNegotiationData.status === "pending_designer_response" && (
                      <div className="flex gap-3 pt-4 border-t border-base-300">
                        <button
                          className="btn btn-success flex-1"
                          onClick={() => handleRenegotiate(selectedNegotiationData)}
                        >
                          ✅ 수정 제안서 작성
                        </button>
                        <button
                          className="btn btn-primary flex-1"
                          onClick={() => updateNegotiationStatus(selectedNegotiationData.id, "agreement_reached")}
                        >
                          🤝 현재 조건으로 합의
                        </button>
                      </div>
                    )}

                    {selectedNegotiationData.status === "pending_client_response" && (
                      <div className="alert alert-info">
                        <span>📤 수정 제안서를 발송했습니다. 클라이언트의 응답을 기다리고 있습니다.</span>
                      </div>
                    )}

                    {selectedNegotiationData.status === "agreement_reached" && (
                      <div className="alert alert-success">
                        <span>✅ 합의가 완료되었습니다! 프로젝트를 시작할 수 있습니다.</span>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => router.push(`/projects/create?from=negotiation&id=${selectedNegotiationData.id}`)}
                        >
                          프로젝트 생성하기
                        </button>
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