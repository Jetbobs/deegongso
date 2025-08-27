"use client";

import { useState, useEffect, useMemo } from "react";
import { ModificationRequest, ClarificationRequest, Feedback } from "@/types";
import { ModificationManager } from "@/lib/modificationManager";
import { useAuth } from "@/hooks/useAuth";
import ClarificationDiscussion from "./ClarificationDiscussion";

interface ClarificationManagerProps {
  modificationRequest: ModificationRequest;
  feedbacks: Feedback[];
  isDesigner?: boolean;
  onUpdate?: (updatedRequest: ModificationRequest) => void;
}

export default function ClarificationManager({
  modificationRequest,
  feedbacks,
  isDesigner = false,
  onUpdate
}: ClarificationManagerProps) {
  const { user } = useAuth();
  const [clarificationRequests, setClarificationRequests] = useState<ClarificationRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState<"pending" | "answered" | "resolved">("pending");

  // 세부 설명 재요청 목록 로드
  useEffect(() => {
    if (modificationRequest.clarification_requests) {
      setClarificationRequests(modificationRequest.clarification_requests);
    }
  }, [modificationRequest.clarification_requests]);

  // 탭별 요청 필터링
  const filteredRequests = useMemo(() => {
    return clarificationRequests.filter(req => req.status === selectedTab);
  }, [clarificationRequests, selectedTab]);

  // 각 탭의 개수
  const tabCounts = useMemo(() => {
    return {
      pending: clarificationRequests.filter(req => req.status === "pending").length,
      answered: clarificationRequests.filter(req => req.status === "answered").length,
      resolved: clarificationRequests.filter(req => req.status === "resolved").length
    };
  }, [clarificationRequests]);

  // 피드백 ID로 피드백 찾기
  const getFeedbackById = (feedbackId: string) => {
    return feedbacks.find(feedback => feedback.id === feedbackId);
  };

  // 세부 설명 재요청 업데이트
  const handleClarificationUpdate = (updatedRequest: ClarificationRequest) => {
    setClarificationRequests(prev => 
      prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
    );

    // 상위 컴포넌트에 알림
    if (onUpdate) {
      const updatedModificationRequest = {
        ...modificationRequest,
        clarification_requests: clarificationRequests.map(req => 
          req.id === updatedRequest.id ? updatedRequest : req
        )
      };
      onUpdate(updatedModificationRequest);
    }

    console.log(`🔄 세부 설명 재요청 업데이트: ${updatedRequest.status}`);
  };

  // 세부 설명 재요청 해결 처리
  const handleResolve = (clarificationId: string) => {
    const resolvedRequest = ModificationManager.resolveClarification(clarificationId, user?.id || "");
    if (resolvedRequest) {
      handleClarificationUpdate(resolvedRequest);
      
      // 모든 세부 설명이 해결되었는지 확인
      const updatedRequests = clarificationRequests.map(req => 
        req.id === clarificationId ? resolvedRequest : req
      );
      
      const allResolved = updatedRequests.every(req => req.status === "resolved");
      if (allResolved) {
        // 수정 요청 상태를 다시 pending으로 변경
        const finalModificationRequest = ModificationManager.checkAndUpdateClarificationStatus(modificationRequest.id);
        if (finalModificationRequest && onUpdate) {
          onUpdate(finalModificationRequest);
        }
        console.log(`✅ 모든 세부 설명이 해결되어 수정 요청이 승인 대기 상태로 전환되었습니다.`);
      }
    }
  };

  // 전체 진행상황 계산
  const overallProgress = useMemo(() => {
    const total = clarificationRequests.length;
    if (total === 0) return { percentage: 0, status: "none" };

    const resolved = tabCounts.resolved;
    const answered = tabCounts.answered;
    const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

    let status: "pending" | "in-progress" | "completed" = "pending";
    if (resolved === total) status = "completed";
    else if (answered > 0 || resolved > 0) status = "in-progress";

    return { percentage, status, resolved, total };
  }, [clarificationRequests.length, tabCounts]);

  if (!clarificationRequests || clarificationRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">🤔 세부 설명 재요청</h3>
          <p className="text-sm text-base-content/60">
            디자이너가 요청한 세부 설명에 답변해주세요
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {overallProgress.resolved}/{overallProgress.total}
          </div>
          <div className="text-sm text-base-content/60">해결 완료</div>
        </div>
      </div>

      {/* 전체 진행률 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">전체 진행상황</h4>
            <span className={`badge ${
              overallProgress.status === "completed" ? "badge-success" :
              overallProgress.status === "in-progress" ? "badge-primary" :
              "badge-warning"
            }`}>
              {overallProgress.status === "completed" ? "✅ 완료" :
               overallProgress.status === "in-progress" ? "🚧 진행중" :
               "⏳ 대기중"}
            </span>
          </div>
          
          <div className="w-full bg-base-300 rounded-full h-4 relative overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                overallProgress.status === "completed" ? "bg-success" : "bg-primary"
              }`}
              style={{ width: `${overallProgress.percentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              {overallProgress.percentage}%
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <div className="text-lg font-bold text-warning">{tabCounts.pending}</div>
              <div className="text-xs text-base-content/60">답변 대기</div>
            </div>
            <div>
              <div className="text-lg font-bold text-info">{tabCounts.answered}</div>
              <div className="text-xs text-base-content/60">답변 완료</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">{tabCounts.resolved}</div>
              <div className="text-xs text-base-content/60">해결 완료</div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="tabs tabs-bordered">
        <button 
          className={`tab ${selectedTab === "pending" ? "tab-active" : ""}`}
          onClick={() => setSelectedTab("pending")}
        >
          ⏳ 답변 대기 ({tabCounts.pending})
        </button>
        <button 
          className={`tab ${selectedTab === "answered" ? "tab-active" : ""}`}
          onClick={() => setSelectedTab("answered")}
        >
          💬 답변 완료 ({tabCounts.answered})
        </button>
        <button 
          className={`tab ${selectedTab === "resolved" ? "tab-active" : ""}`}
          onClick={() => setSelectedTab("resolved")}
        >
          ✅ 해결 완료 ({tabCounts.resolved})
        </button>
      </div>

      {/* 세부 설명 재요청 목록 */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {selectedTab === "pending" ? "⏳" : 
               selectedTab === "answered" ? "💬" : "✅"}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {selectedTab === "pending" ? "답변 대기 중인 요청이 없습니다" :
               selectedTab === "answered" ? "답변 완료된 요청이 없습니다" :
               "해결 완료된 요청이 없습니다"}
            </h3>
            <p className="text-base-content/60">
              {selectedTab === "pending" && "디자이너의 질문에 답변해주세요"}
              {selectedTab === "answered" && "추가 논의가 필요한 경우 댓글을 남겨보세요"}
              {selectedTab === "resolved" && "모든 세부 설명이 명확해졌습니다"}
            </p>
          </div>
        ) : (
          filteredRequests.map((clarificationRequest) => {
            const relatedFeedback = getFeedbackById(clarificationRequest.feedback_id);
            
            return (
              <div key={clarificationRequest.id} className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  {/* 관련 피드백 표시 */}
                  {relatedFeedback && (
                    <div className="bg-base-50 p-3 rounded-lg mb-4">
                      <h5 className="font-semibold text-sm mb-2">📝 관련 피드백</h5>
                      <div 
                        className="text-sm text-base-content/80"
                        dangerouslySetInnerHTML={{ __html: relatedFeedback.content_html }}
                      />
                      {relatedFeedback.attachments && relatedFeedback.attachments.length > 0 && (
                        <div className="text-xs text-base-content/50 mt-2">
                          📎 첨부파일 {relatedFeedback.attachments.length}개
                        </div>
                      )}
                    </div>
                  )}

                  {/* 세부 설명 재요청 논의 */}
                  <ClarificationDiscussion
                    clarificationRequest={clarificationRequest}
                    onUpdate={handleClarificationUpdate}
                    onResolve={handleResolve}
                    isDesigner={isDesigner}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 모든 해결 완료 시 안내 */}
      {overallProgress.status === "completed" && (
        <div className="alert alert-success">
          <div className="flex items-center space-x-2">
            <span>🎉</span>
            <div>
              <h3 className="font-bold">모든 세부 설명 요청이 해결되었습니다!</h3>
              <div className="text-sm">
                디자이너가 이제 수정 요청을 최종 검토하여 승인/거절을 결정합니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}