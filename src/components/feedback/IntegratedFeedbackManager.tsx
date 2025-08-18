"use client";

import { useState, useMemo } from "react";
import { Feedback, ModificationTracker as ModificationTrackerType, ModificationRequestFormData } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { ModificationManager, ModificationUtils } from "@/lib/modificationManager";

import FeedbackForm from "./FeedbackForm";
import FeedbackList from "./FeedbackList";
import ModificationTracker from "./ModificationTracker";
import ModificationRequestForm from "./ModificationRequestForm";

interface IntegratedFeedbackManagerProps {
  projectId: string;
  reportId: string;
  feedbacks: Feedback[];
  isDesigner?: boolean;
  onFeedbackSubmit?: (feedback: Omit<Feedback, "id" | "submitted_at" | "updated_at" | "version">) => void;
  onFeedbackUpdate?: (feedback: Feedback) => void;
  onFeedbackDelete?: (feedbackId: string) => void;
  onFeedbackStatusChange?: (feedbackId: string, status: Feedback['status']) => void;
}

export default function IntegratedFeedbackManager({
  projectId,
  reportId,
  feedbacks,
  isDesigner = false,
  onFeedbackSubmit,
  onFeedbackUpdate,
  onFeedbackDelete,
  onFeedbackStatusChange
}: IntegratedFeedbackManagerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"feedbacks" | "modifications">("feedbacks");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showModificationForm, setShowModificationForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [selectedFeedbacksForModification, setSelectedFeedbacksForModification] = useState<Set<string>>(new Set());

  // 수정요청 현황 가져오기
  const modificationTracker = useMemo(() => {
    return ModificationManager.getModificationTracker(projectId);
  }, [projectId]);

  // 수정요청에 포함 가능한 피드백들
  const availableFeedbacks = useMemo(() => {
    return ModificationManager.getAvailableFeedbacksForModification(projectId, reportId);
  }, [projectId, reportId, feedbacks]);

  // 피드백별 수정요청 포함 여부 확인
  const feedbackModificationStatus = useMemo(() => {
    const statusMap = new Map<string, { isIncluded: boolean; requestNumber?: number; status?: string }>();
    
    modificationTracker.requests.forEach(request => {
      request.feedback_ids.forEach(feedbackId => {
        statusMap.set(feedbackId, {
          isIncluded: true,
          requestNumber: request.request_number,
          status: request.status
        });
      });
    });

    modificationTracker.additional_requests.forEach(request => {
      request.feedback_ids.forEach(feedbackId => {
        statusMap.set(feedbackId, {
          isIncluded: true,
          requestNumber: request.request_number,
          status: request.status
        });
      });
    });

    return statusMap;
  }, [modificationTracker]);

  const handleFeedbackFormSubmit = (feedbackData: Omit<Feedback, "id" | "submitted_at" | "updated_at" | "version">) => {
    onFeedbackSubmit?.(feedbackData);
    setShowFeedbackForm(false);
    setEditingFeedback(null);
  };

  const handleFeedbackEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setShowFeedbackForm(true);
  };

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
    setSelectedFeedbacksForModification(new Set());
  };

  const handleModificationApprove = (requestId: string) => {
    const updatedRequest = ModificationManager.approveModificationRequest(requestId, user?.id || "");
    if (updatedRequest) {
      // 상태 업데이트 후 리렌더링 트리거
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

  const handleCreateModificationFromSelected = () => {
    if (selectedFeedbacksForModification.size === 0) {
      alert("수정 요청에 포함할 피드백을 선택해주세요.");
      return;
    }

    // 선택된 피드백들로 수정요청 폼 초기화
    setShowModificationForm(true);
  };

  const toggleFeedbackSelection = (feedbackId: string) => {
    const newSelection = new Set(selectedFeedbacksForModification);
    if (newSelection.has(feedbackId)) {
      newSelection.delete(feedbackId);
    } else {
      newSelection.add(feedbackId);
    }
    setSelectedFeedbacksForModification(newSelection);
  };

  const getTabCounts = () => {
    const pendingFeedbacks = feedbacks.filter(f => f.status !== "resolved").length;
    const pendingModifications = modificationTracker.requests.filter(r => r.status === "pending").length;
    
    return {
      feedbacks: pendingFeedbacks,
      modifications: pendingModifications
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">피드백 & 수정요청 관리</h2>
          <p className="text-sm text-base-content/60">
            프로젝트 피드백과 수정요청을 통합 관리합니다
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isDesigner && modificationTracker.remaining > 0 && (
            <button
              onClick={() => setShowModificationForm(true)}
              className="btn btn-warning btn-sm"
            >
              ⚡ 빠른 수정요청
            </button>
          )}
          {!isDesigner && (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="btn btn-primary btn-sm"
            >
              ➕ 피드백 작성
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
          <div className="stat-title">미해결 피드백</div>
          <div className="stat-value text-2xl text-warning">{tabCounts.feedbacks}</div>
          <div className="stat-desc">처리 필요</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">추가 비용</div>
          <div className="stat-value text-2xl text-error">
            {ModificationUtils.formatCurrency(modificationTracker.total_additional_cost)}
          </div>
          <div className="stat-desc">{modificationTracker.additional_requests.length}건</div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tabs tabs-bordered mb-6">
        <button 
          className={`tab ${activeTab === "feedbacks" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("feedbacks")}
        >
          📝 피드백 관리
          {tabCounts.feedbacks > 0 && (
            <span className="badge badge-warning badge-sm ml-2">{tabCounts.feedbacks}</span>
          )}
        </button>
        <button 
          className={`tab ${activeTab === "modifications" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("modifications")}
        >
          📋 수정요청 현황
          {tabCounts.modifications > 0 && (
            <span className="badge badge-error badge-sm ml-2">{tabCounts.modifications}</span>
          )}
        </button>
      </div>

      {/* 탭 내용 */}
      {activeTab === "feedbacks" && (
        <div className="space-y-6">
          {/* 선택된 피드백으로 수정요청 생성 버튼 */}
          {selectedFeedbacksForModification.size > 0 && (
            <div className="alert alert-info">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h4 className="font-bold">피드백 {selectedFeedbacksForModification.size}개 선택됨</h4>
                  <div className="text-xs">선택된 피드백들로 수정요청을 생성할 수 있습니다.</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedFeedbacksForModification(new Set())}
                    className="btn btn-ghost btn-sm"
                  >
                    선택 해제
                  </button>
                  <button
                    onClick={handleCreateModificationFromSelected}
                    className="btn btn-primary btn-sm"
                  >
                    수정요청 생성
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 피드백 목록 */}
          <FeedbackList
            feedbacks={feedbacks}
            onEdit={handleFeedbackEdit}
            onDelete={onFeedbackDelete}
            onStatusChange={onFeedbackStatusChange}
            showActions={true}
            groupByStatus={false}
            renderExtraInfo={(feedback) => {
              const modStatus = feedbackModificationStatus.get(feedback.id);
              const isSelected = selectedFeedbacksForModification.has(feedback.id);
              const canSelect = !modStatus?.isIncluded && feedback.status !== "resolved";

              return (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-base-300">
                  <div className="flex items-center space-x-2">
                    {modStatus?.isIncluded && (
                      <span className="badge badge-info badge-sm">
                        📋 수정요청 #{modStatus.requestNumber} 포함
                        {modStatus.status && (
                          <span className="ml-1">({ModificationUtils.getStatusInfo(modStatus.status as any).label})</span>
                        )}
                      </span>
                    )}
                    
                    {!modStatus?.isIncluded && feedback.status !== "resolved" && (
                      <span className="text-xs text-base-content/60">수정요청 미포함</span>
                    )}
                  </div>
                  
                  {canSelect && !isDesigner && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={isSelected}
                        onChange={() => toggleFeedbackSelection(feedback.id)}
                      />
                      <span className="text-sm font-medium">수정요청에 포함</span>
                    </label>
                  )}
                </div>
              );
            }}
          />
        </div>
      )}

      {activeTab === "modifications" && (
        <ModificationTracker
          tracker={modificationTracker}
          onRequestModification={() => setShowModificationForm(true)}
          onApproveRequest={handleModificationApprove}
          onRejectRequest={handleModificationReject}
          onCompleteRequest={handleModificationComplete}
          showActions={true}
          isDesigner={isDesigner}
        />
      )}

      {/* 피드백 작성/수정 폼 모달 */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <FeedbackForm
              projectId={projectId}
              reportId={reportId}
              onSubmit={handleFeedbackFormSubmit}
              onCancel={() => {
                setShowFeedbackForm(false);
                setEditingFeedback(null);
              }}
              existingFeedback={editingFeedback || undefined}
            />
          </div>
        </div>
      )}

      {/* 수정요청 생성 폼 모달 */}
      {showModificationForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <ModificationRequestForm
              projectId={projectId}
              availableFeedbacks={availableFeedbacks}
              remainingModifications={modificationTracker.remaining}
              onSubmit={handleModificationRequestSubmit}
              onCancel={() => {
                setShowModificationForm(false);
                setSelectedFeedbacksForModification(new Set());
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}