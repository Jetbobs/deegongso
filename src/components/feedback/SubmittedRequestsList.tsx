"use client";

import { useState, useEffect } from "react";
import { ModificationRequest } from "@/types";
import { ModificationManager, ModificationUtils } from "@/lib/modificationManager";
import { useAuth } from "@/hooks/useAuth";

interface SubmittedRequestsListProps {
  projectId: string;
  isDesigner?: boolean;
}

export default function SubmittedRequestsList({
  projectId,
  isDesigner = false
}: SubmittedRequestsListProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ModificationRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, [projectId]);

  const loadRequests = () => {
    const tracker = ModificationManager.getModificationTracker(projectId);
    setRequests(tracker.requests);
  };

  const handleApprove = (requestId: string) => {
    if (!confirm('이 수정 요청을 승인하시겠습니까?')) return;
    
    const updatedRequest = ModificationManager.approveModificationRequest(requestId, user?.id || "");
    if (updatedRequest) {
      console.log("수정 요청 승인:", updatedRequest);
      loadRequests();
    }
  };

  const handleReject = (requestId: string) => {
    const reason = prompt('거절 사유를 입력해주세요:');
    if (!reason) return;
    
    const updatedRequest = ModificationManager.rejectModificationRequest(requestId, reason);
    if (updatedRequest) {
      console.log("수정 요청 거절:", updatedRequest);
      loadRequests();
    }
  };

  const handleComplete = (requestId: string) => {
    if (!confirm('모든 수정 작업이 완료되었습니까?')) return;
    
    const updatedRequest = ModificationManager.completeModificationRequest(requestId);
    if (updatedRequest) {
      console.log("수정 작업 완료:", updatedRequest);
      loadRequests();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-info';
      case 'in_progress': return 'badge-primary';
      case 'completed': return 'badge-success';
      case 'rejected': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '검토 대기';
      case 'approved': return '승인됨';
      case 'in_progress': return '작업 중';
      case 'completed': return '완료됨';
      case 'rejected': return '거절됨';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">📋 제출된 수정 요청</h2>
          <p className="text-sm text-base-content/60">
            클라이언트가 제출한 모든 수정 요청을 관리합니다
          </p>
        </div>
      </div>

      {/* 요청 목록 */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">아직 제출된 수정 요청이 없습니다</h3>
            <p className="text-base-content/60">
              클라이언트가 마크업 피드백이나 수정사항을 제출하면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="card bg-base-100 border border-base-300 shadow-sm"
            >
              <div className="card-body p-6">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        #{request.request_number}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{request.description}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                        {request.urgency === 'urgent' && (
                          <span className="badge badge-error">🔥 긴급</span>
                        )}
                        {request.is_additional_cost && (
                          <span className="badge badge-warning">💰 추가비용</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    {request.status === 'pending' && isDesigner && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="btn btn-success btn-sm"
                        >
                          ✅ 승인
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="btn btn-error btn-sm"
                        >
                          ❌ 거절
                        </button>
                      </>
                    )}
                    
                    {request.status === 'approved' && isDesigner && (
                      <button
                        onClick={() => handleComplete(request.id)}
                        className="btn btn-primary btn-sm"
                      >
                        ✅ 완료
                      </button>
                    )}
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-base-200">
                  <div>
                    <div className="text-sm font-medium text-base-content/70">요청일시</div>
                    <div className="text-sm">
                      {ModificationUtils.formatDate(request.requested_at)}
                    </div>
                  </div>
                  
                  {request.approved_at && (
                    <div>
                      <div className="text-sm font-medium text-base-content/70">승인일시</div>
                      <div className="text-sm">
                        {ModificationUtils.formatDate(request.approved_at)}
                      </div>
                    </div>
                  )}
                  
                  {request.completed_at && (
                    <div>
                      <div className="text-sm font-medium text-base-content/70">완료일시</div>
                      <div className="text-sm">
                        {ModificationUtils.formatDate(request.completed_at)}
                      </div>
                    </div>
                  )}
                </div>

                {/* 메모 */}
                {request.notes && (
                  <div className="mt-4 p-3 bg-base-50 rounded-lg border">
                    <div className="text-sm font-medium text-base-content/70 mb-1">메모</div>
                    <div className="text-sm">{request.notes}</div>
                  </div>
                )}

                {/* 거절 사유 */}
                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="mt-4 p-3 bg-error/5 border border-error/20 rounded-lg">
                    <div className="text-sm font-medium text-error mb-1">거절 사유</div>
                    <div className="text-sm text-error">{request.rejection_reason}</div>
                  </div>
                )}

                {/* 피드백 관련 정보 */}
                {request.feedback_ids && request.feedback_ids.length > 0 && (
                  <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg">
                    <div className="text-sm font-medium text-info mb-1">
                      관련 피드백 {request.feedback_ids.length}개
                    </div>
                    <div className="text-xs text-info">
                      마크업 피드백과 연동된 수정 요청입니다
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}