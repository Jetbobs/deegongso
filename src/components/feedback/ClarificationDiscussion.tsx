"use client";

import { useState, useEffect } from "react";
import { ClarificationRequest, User } from "@/types";
import { ModificationManager } from "@/lib/modificationManager";
import { useAuth } from "@/hooks/useAuth";

interface ClarificationComment {
  id: string;
  clarification_id: string;
  author_id: string;
  author_role: "client" | "designer";
  author_name: string;
  content: string;
  created_at: string;
  is_system?: boolean; // 시스템 메시지 여부
}

interface ClarificationDiscussionProps {
  clarificationRequest: ClarificationRequest;
  onUpdate: (updatedRequest: ClarificationRequest) => void;
  onResolve?: (clarificationId: string) => void;
  isDesigner?: boolean;
}

export default function ClarificationDiscussion({
  clarificationRequest,
  onUpdate,
  onResolve,
  isDesigner = false
}: ClarificationDiscussionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ClarificationComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 목록 로드
  useEffect(() => {
    loadComments();
  }, [clarificationRequest.id]);

  const loadComments = () => {
    // 시스템 메시지들 (초기 질문, 답변 등)
    const systemComments: ClarificationComment[] = [
      {
        id: `system-question-${clarificationRequest.id}`,
        clarification_id: clarificationRequest.id,
        author_id: clarificationRequest.requested_by,
        author_role: "designer",
        author_name: "디자이너",
        content: clarificationRequest.question,
        created_at: clarificationRequest.requested_at,
        is_system: true
      }
    ];

    // 클라이언트 답변이 있는 경우
    if (clarificationRequest.response && clarificationRequest.answered_at) {
      systemComments.push({
        id: `system-response-${clarificationRequest.id}`,
        clarification_id: clarificationRequest.id,
        author_id: "client", // 실제로는 프로젝트의 클라이언트 ID
        author_role: "client",
        author_name: "클라이언트",
        content: clarificationRequest.response,
        created_at: clarificationRequest.answered_at,
        is_system: true
      });
    }

    // 추가 댓글들 로드 (실제로는 API에서)
    const additionalComments = loadAdditionalComments(clarificationRequest.id);
    
    const allComments = [...systemComments, ...additionalComments]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    setComments(allComments);
  };

  const loadAdditionalComments = (clarificationId: string): ClarificationComment[] => {
    const stored = localStorage.getItem(`clarification_comments_${clarificationId}`);
    return stored ? JSON.parse(stored) : [];
  };

  const saveAdditionalComments = (clarificationId: string, comments: ClarificationComment[]) => {
    const systemComments = comments.filter(c => c.is_system);
    const additionalComments = comments.filter(c => !c.is_system);
    localStorage.setItem(`clarification_comments_${clarificationId}`, JSON.stringify(additionalComments));
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const comment: ClarificationComment = {
        id: generateId(),
        clarification_id: clarificationRequest.id,
        author_id: user?.id || "",
        author_role: isDesigner ? "designer" : "client",
        author_name: isDesigner ? "디자이너" : "클라이언트",
        content: newComment.trim(),
        created_at: new Date().toISOString()
      };

      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      saveAdditionalComments(clarificationRequest.id, updatedComments);
      setNewComment("");

      console.log(`💬 새 댓글 추가: ${comment.content}`);
    } catch (error) {
      console.error('댓글 추가 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitialResponse = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // 초기 답변을 ModificationManager에 저장
      const updatedRequest = ModificationManager.respondToClarification(
        clarificationRequest.id,
        newComment.trim()
      );

      if (updatedRequest) {
        onUpdate(updatedRequest);
        loadComments(); // 댓글 목록 새로고침
      }
      
      setNewComment("");
      console.log(`✅ 초기 답변 완료: ${newComment.trim()}`);
    } catch (error) {
      console.error('초기 답변 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = () => {
    if (onResolve) {
      onResolve(clarificationRequest.id);
    }
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const getStatusInfo = () => {
    const statusInfo = {
      pending: { 
        label: "답변 대기", 
        color: "warning", 
        icon: "⏳", 
        description: "클라이언트의 답변을 기다리고 있습니다" 
      },
      answered: { 
        label: "답변 완료", 
        color: "info", 
        icon: "💬", 
        description: "클라이언트가 답변했습니다. 추가 논의가 가능합니다" 
      },
      resolved: { 
        label: "해결 완료", 
        color: "success", 
        icon: "✅", 
        description: "세부 설명이 충분히 명확해졌습니다" 
      }
    };
    return statusInfo[clarificationRequest.status];
  };

  const statusInfo = getStatusInfo();
  const canAddComments = clarificationRequest.status !== "resolved";
  const needsInitialResponse = clarificationRequest.status === "pending" && !isDesigner;
  const canResolve = clarificationRequest.status === "answered" && isDesigner;

  return (
    <div className="border border-base-300 rounded-lg">
      {/* 헤더 */}
      <div className="bg-base-50 px-4 py-3 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">🤔 세부 설명 요청</h4>
            <p className="text-xs text-base-content/60 mt-1">{statusInfo.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`badge badge-${statusInfo.color} badge-sm gap-1`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
            {canResolve && (
              <button
                onClick={handleResolve}
                className="btn btn-success btn-xs"
                title="이 세부 설명 요청을 해결 완료로 처리"
              >
                ✅ 해결
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 댓글 스레드 */}
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-3 p-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex ${comment.author_role === "designer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${
                  comment.is_system 
                    ? comment.author_role === "designer"
                      ? "bg-primary/10 border-primary/30"
                      : "bg-secondary/10 border-secondary/30"
                    : comment.author_role === "designer" 
                    ? "bg-accent text-accent-content"
                    : "bg-base-200"
                } border rounded-lg p-3`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-medium">
                    {comment.author_role === "designer" ? "🎨" : "👤"} {comment.author_name}
                  </span>
                  {comment.is_system && (
                    <span className="badge badge-xs">
                      {comment.author_role === "designer" ? "질문" : "답변"}
                    </span>
                  )}
                  <span className="text-xs text-base-content/50">
                    {new Date(comment.created_at).toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 새 댓글/답변 입력 */}
      {canAddComments && (
        <div className="border-t border-base-300 p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                className="textarea textarea-bordered w-full h-20 text-sm resize-none"
                placeholder={
                  needsInitialResponse 
                    ? "세부 설명에 대한 답변을 작성해주세요..." 
                    : "추가 질문이나 의견을 작성해주세요..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    needsInitialResponse ? handleInitialResponse() : handleAddComment();
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <button
              onClick={needsInitialResponse ? handleInitialResponse : handleAddComment}
              className={`btn btn-sm ${needsInitialResponse ? "btn-primary" : "btn-ghost"} self-end`}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading loading-spinner loading-xs" />
              ) : needsInitialResponse ? (
                "📝 답변하기"
              ) : (
                "💬 댓글"
              )}
            </button>
          </div>
          <div className="text-xs text-base-content/50 mt-2">
            {needsInitialResponse 
              ? "💡 답변 후 추가 댓글로 소통할 수 있습니다" 
              : "💡 Shift + Enter로 줄바꿈, Enter로 전송"}
          </div>
        </div>
      )}

      {/* 해결된 경우 메시지 */}
      {clarificationRequest.status === "resolved" && (
        <div className="border-t border-base-300 bg-success/5 px-4 py-3">
          <div className="flex items-center space-x-2 text-success">
            <span>✅</span>
            <span className="text-sm font-medium">이 세부 설명 요청이 해결되었습니다.</span>
          </div>
          <div className="text-xs text-base-content/60 mt-1">
            {clarificationRequest.resolved_at && 
              `해결 시간: ${new Date(clarificationRequest.resolved_at).toLocaleString("ko-KR")}`}
          </div>
        </div>
      )}
    </div>
  );
}