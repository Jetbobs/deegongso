"use client";

import { useState, useMemo } from "react";
import { ModificationTracker as ModificationTrackerType, ModificationRequest } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface ModificationTrackerProps {
  tracker: ModificationTrackerType;
  onRequestModification?: () => void;
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string, reason: string) => void;
  onCompleteRequest?: (requestId: string) => void;
  showActions?: boolean;
  isDesigner?: boolean;
}

export default function ModificationTracker({
  tracker,
  onRequestModification,
  onApproveRequest,
  onRejectRequest,
  onCompleteRequest,
  showActions = true,
  isDesigner = false
}: ModificationTrackerProps) {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"overview" | "history">("overview");
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const sortedRequests = useMemo(() => {
    return [...tracker.requests].sort((a, b) => b.request_number - a.request_number);
  }, [tracker.requests]);

  const pendingRequests = useMemo(() => {
    return tracker.requests.filter(req => req.status === "pending");
  }, [tracker.requests]);

  const completedRequests = useMemo(() => {
    return tracker.requests.filter(req => req.status === "completed");
  }, [tracker.requests]);

  const getStatusInfo = (status: ModificationRequest["status"]) => {
    const info = {
      pending: { label: "승인 대기", color: "warning", icon: "⏳" },
      approved: { label: "승인됨", color: "info", icon: "✅" },
      in_progress: { label: "진행 중", color: "primary", icon: "🚧" },
      completed: { label: "완료", color: "success", icon: "✅" },
      rejected: { label: "거절됨", color: "error", icon: "❌" }
    };
    return info[status];
  };

  const getUrgencyInfo = (urgency: ModificationRequest["urgency"]) => {
    const info = {
      normal: { label: "일반", color: "neutral", icon: "📅" },
      urgent: { label: "긴급", color: "error", icon: "🔥" }
    };
    return info[urgency];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDatetime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRejectRequest = (requestId: string) => {
    if (rejectionReason.trim() && onRejectRequest) {
      onRejectRequest(requestId, rejectionReason);
      setRejectingRequestId(null);
      setRejectionReason("");
    }
  };

  const getProgressPercentage = () => {
    if (tracker.total_allowed === 0) return 0;
    return ((tracker.used + tracker.in_progress) / tracker.total_allowed) * 100;
  };

  const renderProgressBar = () => {
    const usedPercentage = (tracker.used / tracker.total_allowed) * 100;
    const inProgressPercentage = (tracker.in_progress / tracker.total_allowed) * 100;
    
    return (
      <div className="w-full bg-base-300 rounded-full h-6 relative overflow-hidden">
        {/* 완료된 수정 */}
        <div 
          className="bg-success h-full absolute left-0"
          style={{ width: `${usedPercentage}%` }}
        />
        {/* 진행중인 수정 */}
        <div 
          className="bg-primary h-full absolute"
          style={{ 
            left: `${usedPercentage}%`,
            width: `${inProgressPercentage}%` 
          }}
        />
        {/* 진행률 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {tracker.used + tracker.in_progress} / {tracker.total_allowed}
        </div>
      </div>
    );
  };

  const renderRequestCard = (request: ModificationRequest) => {
    const statusInfo = getStatusInfo(request.status);
    const urgencyInfo = getUrgencyInfo(request.urgency);
    
    return (
      <div key={request.id} className="card bg-base-100 shadow-sm border-l-4 border-l-primary">
        <div className="card-body p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">#{request.request_number}</span>
                <span className={`badge badge-${statusInfo.color} badge-sm`}>
                  {statusInfo.icon} {statusInfo.label}
                </span>
                <span className={`badge badge-${urgencyInfo.color} badge-sm`}>
                  {urgencyInfo.icon} {urgencyInfo.label}
                </span>
                {request.is_additional_cost && (
                  <span className="badge badge-warning badge-sm">💰 추가비용</span>
                )}
              </div>
            </div>
            
            <div className="text-sm text-base-content/60">
              {formatDate(request.requested_at)}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="font-medium mb-2">{request.description}</h4>
            {request.notes && (
              <p className="text-sm text-base-content/70">{request.notes}</p>
            )}
          </div>

          {/* 피드백 개수 */}
          <div className="flex items-center space-x-4 text-sm text-base-content/60 mb-3">
            <span>📝 관련 피드백: {request.feedback_ids.length}개</span>
            {request.estimated_completion_date && (
              <span>📅 예상 완료: {formatDate(request.estimated_completion_date)}</span>
            )}
            {request.additional_cost_amount && (
              <span className="text-warning font-medium">
                💰 추가비용: {request.additional_cost_amount.toLocaleString()}원
              </span>
            )}
          </div>

          {/* 액션 버튼들 */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-xs text-base-content/50">
                {request.completed_at && `완료: ${formatDatetime(request.completed_at)}`}
                {request.rejected && request.rejection_reason && `거절 사유: ${request.rejection_reason}`}
              </div>
              
              <div className="flex items-center space-x-2">
                {request.status === "pending" && !isDesigner && onApproveRequest && (
                  <>
                    <button
                      onClick={() => onApproveRequest(request.id)}
                      className="btn btn-success btn-sm"
                    >
                      ✅ 승인
                    </button>
                    <button
                      onClick={() => setRejectingRequestId(request.id)}
                      className="btn btn-error btn-sm"
                    >
                      ❌ 거절
                    </button>
                  </>
                )}
                
                {request.status === "approved" && isDesigner && onCompleteRequest && (
                  <button
                    onClick={() => onCompleteRequest(request.id)}
                    className="btn btn-primary btn-sm"
                  >
                    ✅ 완료 처리
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">수정 요청 현황</h3>
          <p className="text-sm text-base-content/60">
            마지막 업데이트: {formatDatetime(tracker.last_updated)}
          </p>
        </div>
        
        {/* 수정 요청하기 버튼 숨김 처리 */}
        {false && showActions && tracker.remaining > 0 && onRequestModification && (
          <button
            onClick={onRequestModification}
            className="btn btn-primary btn-sm"
          >
            ➕ 수정 요청하기
          </button>
        )}
      </div>

      {/* 탭 */}
      <div className="tabs tabs-bordered mb-6">
        <button 
          className={`tab ${selectedTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setSelectedTab("overview")}
        >
          📊 현황 개요
        </button>
        <button 
          className={`tab ${selectedTab === "history" ? "tab-active" : ""}`}
          onClick={() => setSelectedTab("history")}
        >
          📋 요청 이력
        </button>
      </div>

      {selectedTab === "overview" && (
        <div className="space-y-6">
          {/* 진행률 카드 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">수정 횟수 사용 현황</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {tracker.remaining}/{tracker.total_allowed}
                  </div>
                  <div className="text-sm text-base-content/60">남은 횟수</div>
                </div>
              </div>
              
              {renderProgressBar()}
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-success">{tracker.used}</div>
                  <div className="text-sm text-base-content/60">완료</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{tracker.in_progress}</div>
                  <div className="text-sm text-base-content/60">진행중</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{tracker.remaining}</div>
                  <div className="text-sm text-base-content/60">잔여</div>
                </div>
              </div>
            </div>
          </div>

          {/* 추가 비용 현황 */}
          {tracker.additional_requests.length > 0 && (
            <div className="card bg-warning/10 shadow-sm">
              <div className="card-body">
                <h4 className="font-semibold text-warning">📈 추가 비용 발생 현황</h4>
                <div className="flex items-center justify-between mt-2">
                  <span>추가 수정 요청: {tracker.additional_requests.length}건</span>
                  <span className="font-bold text-lg">
                    총 {tracker.total_additional_cost.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 대기중인 요청들 */}
          {pendingRequests.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">⏳ 승인 대기중인 요청 ({pendingRequests.length}건)</h4>
              <div className="space-y-3">
                {pendingRequests.map(renderRequestCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">전체 수정 요청 이력</h4>
            <span className="text-sm text-base-content/60">
              총 {tracker.requests.length}건
            </span>
          </div>
          
          {sortedRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">아직 수정 요청이 없습니다</h3>
              <p className="text-base-content/60">
                첫 번째 수정 요청을 만들어보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRequests.map(renderRequestCard)}
            </div>
          )}
        </div>
      )}

      {/* 거절 사유 입력 모달 */}
      {rejectingRequestId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-xl max-w-md w-full">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">수정 요청 거절</h3>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">거절 사유</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="거절 사유를 입력해주세요..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setRejectingRequestId(null);
                    setRejectionReason("");
                  }}
                  className="btn btn-ghost"
                >
                  취소
                </button>
                <button
                  onClick={() => handleRejectRequest(rejectingRequestId)}
                  className="btn btn-error"
                  disabled={!rejectionReason.trim()}
                >
                  거절하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}