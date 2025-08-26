"use client";

import { useState, useMemo } from "react";
import { Feedback, ModificationTracker as ModificationTrackerType, ModificationRequestFormData } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { ModificationManager, ModificationUtils } from "@/lib/modificationManager";

import ModificationRequestForm from "./ModificationRequestForm";
import ModificationTracker from "./ModificationTracker";

interface ModificationRequestManagerProps {
  projectId: string;
  reportId: string;
  isDesigner?: boolean;
  onModificationRequestSubmit?: (data: ModificationRequestFormData) => void;
}

export default function ModificationRequestManager({
  projectId,
  reportId,
  isDesigner = false,
  onModificationRequestSubmit
}: ModificationRequestManagerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [showModificationForm, setShowModificationForm] = useState(false);

  // 수정요청 현황 가져오기
  const modificationTracker = useMemo(() => {
    return ModificationManager.getModificationTracker(projectId);
  }, [projectId]);

  // 수정요청에 포함 가능한 피드백들 (기존 피드백은 이제 수정사항으로 취급)
  const availableModificationItems = useMemo(() => {
    return ModificationManager.getAvailableFeedbacksForModification(projectId, reportId);
  }, [projectId, reportId]);

  const handleModificationRequestSubmit = (formData: ModificationRequestFormData) => {
    const costInfo = ModificationManager.calculateAdditionalCost(projectId, formData.urgency);
    
    const newRequest = ModificationManager.createModificationRequest(
      projectId,
      formData,
      user?.id || "",
      costInfo.isAdditionalCost,
      costInfo.amount
    );

    // 실제로는 API 호출하여 서버에 저장
    console.log("Created modification request:", newRequest);
    
    // 알림 생성
    ModificationManager.createModificationNotification(
      newRequest,
      "created",
      "designer_id" // 실제로는 프로젝트의 디자이너 ID
    );

    setShowModificationForm(false);
    
    // 상위 컴포넌트에 알림
    onModificationRequestSubmit?.(formData);
  };

  const handleModificationApprove = (requestId: string) => {
    const updatedRequest = ModificationManager.approveModificationRequest(requestId, user?.id || "");
    if (updatedRequest) {
      console.log("Approved modification request:", updatedRequest);
    }
  };

  const handleModificationReject = (requestId: string, reason: string) => {
    const updatedRequest = ModificationManager.rejectModificationRequest(requestId, reason);
    if (updatedRequest) {
      console.log("Rejected modification request:", updatedRequest);
    }
  };

  const handleModificationComplete = (requestId: string) => {
    const updatedRequest = ModificationManager.completeModificationRequest(requestId);
    if (updatedRequest) {
      console.log("Completed modification request:", updatedRequest);
    }
  };

  const getTabCounts = () => {
    const pendingModifications = modificationTracker.requests.filter(r => r.status === "pending").length;
    const inProgressModifications = modificationTracker.requests.filter(r => r.status === "in_progress").length;
    
    return {
      current: pendingModifications + inProgressModifications,
      total: modificationTracker.requests.length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">수정요청 관리</h2>
          <p className="text-sm text-base-content/60">
            프로젝트의 모든 수정요청을 체크리스트 방식으로 관리합니다
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* 수정요청 버튼 숨김 처리 */}
          {false && !isDesigner && modificationTracker.remaining > 0 && (
            <button
              onClick={() => setShowModificationForm(true)}
              className="btn btn-primary btn-sm"
            >
              ➕ 새 수정요청
            </button>
          )}
        </div>
      </div>

      {/* 수정요청 현황 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">잔여 수정횟수</div>
          <div className={`stat-value text-2xl ${modificationTracker.remaining > 0 ? 'text-success' : 'text-error'}`}>
            {modificationTracker.remaining}
          </div>
          <div className="stat-desc">/ {modificationTracker.total_allowed}회</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">진행중 수정</div>
          <div className="stat-value text-2xl text-primary">{modificationTracker.in_progress}</div>
          <div className="stat-desc">작업중인 요청</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">대기중 수정</div>
          <div className="stat-value text-2xl text-warning">
            {modificationTracker.requests.filter(r => r.status === "pending").length}
          </div>
          <div className="stat-desc">승인 대기</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">추가 비용</div>
          <div className="stat-value text-2xl text-error">
            {ModificationUtils.formatCurrency(modificationTracker.total_additional_cost)}
          </div>
          <div className="stat-desc">{modificationTracker.additional_requests.length}건</div>
        </div>
      </div>

      {/* 수정요청 체크리스트 */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">📋 수정요청 체크리스트</h3>
          
          {modificationTracker.requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">아직 수정요청이 없습니다</h3>
              <p className="text-base-content/60 mb-4">
                첫 번째 수정요청을 만들어보세요!
              </p>
              {/* 첫 수정요청 버튼 숨김 처리 */}
              {false && !isDesigner && (
                <button
                  onClick={() => setShowModificationForm(true)}
                  className="btn btn-primary"
                >
                  ➕ 첫 수정요청 만들기
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: modificationTracker.total_allowed }, (_, i) => {
                const requestNumber = i + 1;
                const request = modificationTracker.requests.find(r => r.request_number === requestNumber);
                const isUsed = modificationTracker.used >= requestNumber;
                const isInProgress = modificationTracker.in_progress > 0 && 
                  modificationTracker.used < requestNumber && 
                  modificationTracker.used + modificationTracker.in_progress >= requestNumber;
                
                return (
                  <div 
                    key={requestNumber} 
                    className={`flex items-center space-x-4 p-4 border rounded-lg ${
                      isUsed ? 'bg-success/10 border-success' : 
                      isInProgress ? 'bg-primary/10 border-primary' : 
                      'bg-base-200 border-base-300'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isUsed ? (
                        <div className="w-8 h-8 bg-success text-success-content rounded-full flex items-center justify-center">
                          ✓
                        </div>
                      ) : isInProgress ? (
                        <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center">
                          {requestNumber}
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-base-300 text-base-content rounded-full flex items-center justify-center">
                          {requestNumber}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {request ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{request.description}</h4>
                            <span className={`badge badge-sm ${
                              ModificationUtils.getStatusInfo(request.status).color === 'success' ? 'badge-success' :
                              ModificationUtils.getStatusInfo(request.status).color === 'primary' ? 'badge-primary' :
                              ModificationUtils.getStatusInfo(request.status).color === 'warning' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {ModificationUtils.getStatusInfo(request.status).label}
                            </span>
                            {request.urgency === "urgent" && (
                              <span className="badge badge-error badge-sm">🔥 긴급</span>
                            )}
                          </div>
                          <div className="text-sm text-base-content/60">
                            요청일: {ModificationUtils.formatDate(request.requested_at)}
                            {request.completed_at && (
                              <span> • 완료일: {ModificationUtils.formatDate(request.completed_at)}</span>
                            )}
                            {request.feedback_ids.length > 0 && (
                              <span> • 수정사항 {request.feedback_ids.length}개</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-base-content/60">
                            {requestNumber}차 수정 {isInProgress ? '(사용 가능)' : '(잔여)'}
                          </h4>
                          <p className="text-sm text-base-content/40">
                            {isInProgress ? '현재 사용할 수 있는 수정요청입니다' : '아직 사용하지 않은 수정요청입니다'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {request && request.status === "pending" && !isDesigner && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleModificationApprove(request.id)}
                            className="btn btn-success btn-xs"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleModificationReject(request.id, "관리자에 의해 거절됨")}
                            className="btn btn-error btn-xs"
                          >
                            거절
                          </button>
                        </div>
                      )}
                      
                      {request && request.status === "approved" && isDesigner && (
                        <button
                          onClick={() => handleModificationComplete(request.id)}
                          className="btn btn-primary btn-xs"
                        >
                          완료 처리
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* 추가 비용 발생 요청들 */}
              {modificationTracker.additional_requests.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-warning mb-3">💰 추가 비용 발생 수정요청</h4>
                  <div className="space-y-2">
                    {modificationTracker.additional_requests.map((request, index) => (
                      <div key={request.id} className="flex items-center space-x-4 p-3 border border-warning/30 bg-warning/5 rounded-lg">
                        <div className="w-6 h-6 bg-warning text-warning-content rounded-full flex items-center justify-center text-xs">
                          +{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-medium">{request.description}</h5>
                            <span className="badge badge-warning badge-sm">
                              {ModificationUtils.formatCurrency(request.additional_cost_amount || 0)}
                            </span>
                          </div>
                          <div className="text-sm text-base-content/60">
                            요청일: {ModificationUtils.formatDate(request.requested_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 상세 현황 */}
      <ModificationTracker
        tracker={modificationTracker}
        onRequestModification={() => setShowModificationForm(true)}
        onApproveRequest={handleModificationApprove}
        onRejectRequest={handleModificationReject}
        onCompleteRequest={handleModificationComplete}
        showActions={true}
        isDesigner={isDesigner}
      />

      {/* 수정요청 생성 폼 모달 */}
      {showModificationForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <ModificationRequestForm
              projectId={projectId}
              availableFeedbacks={availableModificationItems}
              remainingModifications={modificationTracker.remaining}
              onSubmit={handleModificationRequestSubmit}
              onCancel={() => setShowModificationForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}