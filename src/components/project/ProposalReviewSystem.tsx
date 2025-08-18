"use client";

import { useState } from "react";
import { ProjectProposal, ProjectCollaborationStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface ProposalReviewSystemProps {
  proposal: ProjectProposal;
  userRole: "designer" | "client";
  onApprove: (proposal: ProjectProposal) => void;
  onReject: (proposal: ProjectProposal, reason: string) => void;
  onRequestRevision: (proposal: ProjectProposal, revisionNotes: string) => void;
  onComment: (comment: string) => void;
}

export default function ProposalReviewSystem({
  proposal,
  userRole,
  onApprove,
  onReject,
  onRequestRevision,
  onComment
}: ProposalReviewSystemProps) {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "revision" | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [newComment, setNewComment] = useState("");

  const getStatusInfo = (status: ProjectCollaborationStatus) => {
    const statusMap = {
      draft: { label: "초안 작성중", color: "warning", icon: "📝", description: "디자이너가 제안서 초안을 작성하고 있습니다" },
      designer_review: { label: "디자이너 검토중", color: "info", icon: "👨‍🎨", description: "디자이너가 클라이언트 의견을 검토하고 있습니다" },
      client_input_required: { label: "클라이언트 정보 입력 대기", color: "warning", icon: "👤", description: "클라이언트의 추가 정보 입력이 필요합니다" },
      client_reviewing: { label: "클라이언트 검토중", color: "info", icon: "🔍", description: "클라이언트가 제안서를 검토하고 있습니다" },
      mutual_review: { label: "상호 검토중", color: "primary", icon: "🤝", description: "양측이 최종 검토를 진행하고 있습니다" },
      approved: { label: "승인 완료", color: "success", icon: "✅", description: "양측이 승인하여 프로젝트를 시작할 수 있습니다" },
      rejected: { label: "거절됨", color: "error", icon: "❌", description: "제안서가 거절되었습니다" },
      revision_needed: { label: "수정 필요", color: "warning", icon: "📝", description: "수정 후 재검토가 필요합니다" }
    };
    return statusMap[status];
  };

  const canTakeAction = () => {
    const status = proposal.collaboration_status;
    
    if (userRole === "designer") {
      return ["client_reviewing", "mutual_review"].includes(status) && !proposal.designer_approved;
    } else {
      return ["client_input_required", "designer_review", "mutual_review"].includes(status) && !proposal.client_approved;
    }
  };

  const getAvailableActions = () => {
    const status = proposal.collaboration_status;
    const actions = [];
    
    if (status === "client_input_required" && userRole === "client") {
      return []; // 클라이언트는 정보 입력만 가능
    }
    
    if (canTakeAction()) {
      actions.push(
        { id: "approve", label: "승인", color: "success", icon: "✅" },
        { id: "revision", label: "수정 요청", color: "warning", icon: "📝" },
        { id: "reject", label: "거절", color: "error", icon: "❌" }
      );
    }
    
    return actions;
  };

  const handleAction = (type: "approve" | "reject" | "revision") => {
    setActionType(type);
    setShowActions(true);
  };

  const confirmAction = () => {
    if (!actionType) return;

    const updatedProposal = { ...proposal };
    updatedProposal.last_modified_by = userRole;
    updatedProposal.updated_at = new Date().toISOString();

    switch (actionType) {
      case "approve":
        if (userRole === "designer") {
          updatedProposal.designer_approved = true;
        } else {
          updatedProposal.client_approved = true;
        }
        
        // 양측 모두 승인했는지 확인
        if (updatedProposal.designer_approved && updatedProposal.client_approved) {
          updatedProposal.collaboration_status = "approved";
        } else {
          updatedProposal.collaboration_status = "mutual_review";
        }
        
        onApprove(updatedProposal);
        break;

      case "reject":
        updatedProposal.collaboration_status = "rejected";
        onReject(updatedProposal, actionMessage);
        break;

      case "revision":
        updatedProposal.collaboration_status = "revision_needed";
        onRequestRevision(updatedProposal, actionMessage);
        break;
    }

    setShowActions(false);
    setActionType(null);
    setActionMessage("");
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onComment(newComment.trim());
      setNewComment("");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const statusInfo = getStatusInfo(proposal.collaboration_status);
  const availableActions = getAvailableActions();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 상태 헤더 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{proposal.name}</h1>
              <p className="text-base-content/70 mt-1">{proposal.description}</p>
            </div>
            
            <div className="text-right">
              <div className={`badge badge-${statusInfo.color} badge-lg`}>
                {statusInfo.icon} {statusInfo.label}
              </div>
              <div className="text-sm text-base-content/60 mt-1">
                {statusInfo.description}
              </div>
            </div>
          </div>

          {/* 진행률 표시 */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">진행 상황</span>
              <span className="text-sm">
                {proposal.designer_approved ? "👨‍🎨" : "⏳"} 디자이너 | 
                {proposal.client_approved ? " 👤" : " ⏳"} 클라이언트
              </span>
            </div>
            
            <div className="w-full bg-base-300 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${
                    proposal.collaboration_status === "approved" ? 100 :
                    proposal.collaboration_status === "mutual_review" ? 85 :
                    proposal.collaboration_status === "client_reviewing" || 
                    proposal.collaboration_status === "designer_review" ? 70 :
                    proposal.collaboration_status === "client_input_required" ? 40 : 20
                  }%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 제안서 상세 내용 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 디자이너 제안 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">👨‍🎨 디자이너 제안</h3>
              {proposal.designer_approved && <div className="badge badge-success badge-sm">승인됨</div>}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-base-content/70">예상 견적</div>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(proposal.designer_section.estimated_price)}원
                  </div>
                </div>
                <div>
                  <div className="font-medium text-base-content/70">작업 기간</div>
                  <div>{proposal.designer_section.suggested_timeline.total_duration}일</div>
                </div>
                <div>
                  <div className="font-medium text-base-content/70">수정 횟수</div>
                  <div>{proposal.designer_section.total_modification_count}회</div>
                </div>
                <div>
                  <div className="font-medium text-base-content/70">카테고리</div>
                  <div>{proposal.category}</div>
                </div>
              </div>

              <div>
                <div className="font-medium text-sm mb-2">서비스 범위</div>
                <div className="text-sm bg-base-50 p-3 rounded whitespace-pre-line">
                  {proposal.designer_section.service_scope}
                </div>
              </div>

              {proposal.designer_section.designer_notes && (
                <div>
                  <div className="font-medium text-sm mb-2">디자이너 메시지</div>
                  <div className="text-sm bg-info/10 p-3 rounded">
                    {proposal.designer_section.designer_notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 클라이언트 요청사항 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">👤 클라이언트 요청사항</h3>
              {proposal.client_approved && <div className="badge badge-success badge-sm">승인됨</div>}
            </div>

            {proposal.client_section ? (
              <div className="space-y-4">
                {proposal.client_section.detailed_requirements && (
                  <div>
                    <div className="font-medium text-sm mb-2">구체적 요구사항</div>
                    <div className="text-sm bg-base-50 p-3 rounded whitespace-pre-line">
                      {proposal.client_section.detailed_requirements}
                    </div>
                  </div>
                )}

                {proposal.client_section.preferred_timeline && (
                  <div>
                    <div className="font-medium text-sm mb-2">희망 일정</div>
                    <div className="text-sm space-y-1">
                      {proposal.client_section.preferred_timeline.start_date && (
                        <div>시작일: {new Date(proposal.client_section.preferred_timeline.start_date).toLocaleDateString('ko-KR')}</div>
                      )}
                      {proposal.client_section.preferred_timeline.end_date && (
                        <div>완료일: {new Date(proposal.client_section.preferred_timeline.end_date).toLocaleDateString('ko-KR')}</div>
                      )}
                      {proposal.client_section.preferred_timeline.special_deadlines && (
                        <div>특별 요청: {proposal.client_section.preferred_timeline.special_deadlines}</div>
                      )}
                    </div>
                  </div>
                )}

                {proposal.client_section.budget_feedback && (
                  <div>
                    <div className="font-medium text-sm mb-2">예산 피드백</div>
                    <div className={`text-sm p-3 rounded ${
                      proposal.client_section.budget_feedback.is_acceptable ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      {proposal.client_section.budget_feedback.is_acceptable ? (
                        "✅ 제안 견적에 동의합니다"
                      ) : (
                        <>
                          💭 희망 예산: {formatPrice(proposal.client_section.budget_feedback.counter_offer || 0)}원
                          {proposal.client_section.budget_feedback.budget_notes && (
                            <div className="mt-1 text-xs">{proposal.client_section.budget_feedback.budget_notes}</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {proposal.client_section.additional_requests && (
                  <div>
                    <div className="font-medium text-sm mb-2">추가 요청사항</div>
                    <div className="text-sm bg-base-50 p-3 rounded">
                      {proposal.client_section.additional_requests}
                    </div>
                  </div>
                )}

                {proposal.client_section.client_notes && (
                  <div>
                    <div className="font-medium text-sm mb-2">클라이언트 메시지</div>
                    <div className="text-sm bg-warning/10 p-3 rounded">
                      {proposal.client_section.client_notes}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <div className="text-4xl mb-2">📝</div>
                <div>클라이언트 정보 입력 대기중</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">💬 소통 내역</h3>
          
          <div className="space-y-3 mb-4">
            {proposal.comments.length === 0 ? (
              <div className="text-center py-6 text-base-content/60">
                아직 댓글이 없습니다. 첫 번째 메시지를 남겨보세요!
              </div>
            ) : (
              proposal.comments.map((comment, index) => (
                <div key={index} className={`chat ${comment.author_type === userRole ? 'chat-end' : 'chat-start'}`}>
                  <div className="chat-bubble">
                    <div className="text-xs opacity-70 mb-1">
                      {comment.author_type === 'designer' ? '👨‍🎨 디자이너' : '👤 클라이언트'}
                    </div>
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="메시지를 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              className="btn btn-primary"
              disabled={!newComment.trim()}
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      {availableActions.length > 0 && (
        <div className="flex justify-center space-x-4">
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id as "approve" | "reject" | "revision")}
              className={`btn btn-${action.color} btn-lg`}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      )}

      {/* 액션 확인 모달 */}
      {showActions && actionType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-xl max-w-md w-full">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">
                {actionType === "approve" && "승인 확인"}
                {actionType === "reject" && "거절 확인"}
                {actionType === "revision" && "수정 요청"}
              </h3>
              
              {actionType !== "approve" && (
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">
                      {actionType === "reject" ? "거절 사유" : "수정 요청 사항"}
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder={
                      actionType === "reject" 
                        ? "거절 사유를 입력해주세요..." 
                        : "어떤 부분을 수정했으면 하는지 구체적으로 작성해주세요..."
                    }
                    value={actionMessage}
                    onChange={(e) => setActionMessage(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowActions(false);
                    setActionType(null);
                    setActionMessage("");
                  }}
                  className="btn btn-ghost"
                >
                  취소
                </button>
                <button
                  onClick={confirmAction}
                  className={`btn btn-${
                    actionType === "approve" ? "success" : 
                    actionType === "reject" ? "error" : "warning"
                  }`}
                  disabled={actionType !== "approve" && !actionMessage.trim()}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}