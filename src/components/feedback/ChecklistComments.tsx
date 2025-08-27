"use client";

import { useState, useEffect } from "react";
import { ChecklistComment } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface ChecklistCommentsProps {
  checklistItemId: string;
  onCommentCountChange?: (count: number) => void;
  onResolveStatusChange?: (hasUnresolved: boolean) => void;
  isDesigner?: boolean;
  projectId?: string;
}

export default function ChecklistComments({ 
  checklistItemId, 
  onCommentCountChange,
  onResolveStatusChange,
  isDesigner = false,
  projectId
}: ChecklistCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ChecklistComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // 댓글 목록 로드
  useEffect(() => {
    loadComments();
  }, [checklistItemId]);

  const loadComments = () => {
    const stored = localStorage.getItem(`checklist_comments_${checklistItemId}`);
    const loadedComments: ChecklistComment[] = stored ? JSON.parse(stored) : [];
    setComments(loadedComments);
    onCommentCountChange?.(loadedComments.length);
    
    // 미해결 댓글이 있는지 확인
    const hasUnresolved = loadedComments.some(c => !c.is_resolved);
    onResolveStatusChange?.(hasUnresolved);
  };

  const saveComments = (updatedComments: ChecklistComment[]) => {
    localStorage.setItem(`checklist_comments_${checklistItemId}`, JSON.stringify(updatedComments));
    setComments(updatedComments);
    onCommentCountChange?.(updatedComments.length);
    
    // 미해결 댓글이 있는지 확인
    const hasUnresolved = updatedComments.some(c => !c.is_resolved);
    onResolveStatusChange?.(hasUnresolved);
  };

  const handleAddComment = async (parentId?: string, content?: string) => {
    const commentText = content || newComment;
    if (!commentText.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    
    try {
      const comment: ChecklistComment = {
        id: `comment_${Date.now()}_${Math.random()}`,
        checklist_item_id: checklistItemId,
        author_id: user.id,
        author_name: user.name || "사용자",
        author_role: user.role as "client" | "designer",
        content: commentText.trim(),
        created_at: new Date().toISOString(),
        parent_id: parentId,
        is_resolved: false
      };

      const updatedComments = [...comments, comment];
      saveComments(updatedComments);
      
      if (!parentId) {
        setNewComment("");
      } else {
        setReplyContent("");
        setReplyingTo(null);
      }
      
      console.log(`💬 체크리스트 댓글 추가: ${comment.content}`);
    } catch (error) {
      console.error('댓글 추가 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    
    // 해당 댓글과 그 대댓글들을 모두 삭제
    const updatedComments = comments.filter(c => c.id !== commentId && c.parent_id !== commentId);
    saveComments(updatedComments);
  };

  const handleResolveComment = (commentId: string) => {
    if (!user || !isDesigner) return;
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          is_resolved: !comment.is_resolved,
          resolved_at: comment.is_resolved ? undefined : new Date().toISOString(),
          resolved_by: comment.is_resolved ? undefined : user.id
        };
      }
      return comment;
    });
    
    saveComments(updatedComments);
    console.log(`✅ 체크리스트 댓글 해결 상태 변경: ${commentId}`);
  };

  const handleStartReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const handleSubmitReply = () => {
    if (replyingTo && replyContent.trim()) {
      handleAddComment(replyingTo, replyContent);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  const getRoleColor = (role: string) => {
    return role === "designer" ? "badge-primary" : "badge-secondary";
  };

  const getRoleLabel = (role: string) => {
    return role === "designer" ? "디자이너" : "클라이언트";
  };

  // 댓글을 계층 구조로 구성
  const organizeComments = () => {
    const parentComments = comments.filter(c => !c.parent_id);
    const childComments = comments.filter(c => c.parent_id);
    
    return parentComments.map(parent => ({
      ...parent,
      replies: childComments.filter(child => child.parent_id === parent.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }));
  };

  const organizedComments = organizeComments();
  const unresolvedCount = comments.filter(c => !c.is_resolved).length;

  return (
    <div className="w-full">
      {/* 디버깅 정보 */}
      <div className="text-xs text-green-600 bg-green-50 p-1 mb-2 rounded">
        ChecklistComments 렌더됨 - ID: {checklistItemId}
      </div>
      
      {/* 댓글 토글 버튼 */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="btn btn-ghost btn-sm w-full justify-between"
      >
        <div className="flex items-center space-x-2">
          <span>💬 댓글 {comments.length}개</span>
          {unresolvedCount > 0 && (
            <span className="badge badge-error badge-xs">{unresolvedCount}</span>
          )}
        </div>
        <span>{showComments ? "▲" : "▼"}</span>
      </button>

      {/* 댓글 영역 */}
      {showComments && (
        <div className="mt-4 space-y-4">
          {/* 댓글 목록 */}
          <div className="space-y-3">
            {organizedComments.length === 0 ? (
              <div className="text-center py-6 text-base-content/60">
                <div className="text-4xl mb-2">💭</div>
                <p>아직 댓글이 없습니다</p>
                <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
              </div>
            ) : (
              organizedComments.map((comment) => (
                <div key={comment.id} className={`rounded-lg p-4 border ${
                  comment.is_resolved ? 'bg-success/5 border-success/20' : 'bg-base-50 border-base-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content w-8 h-8 rounded-full">
                          <span className="text-xs">
                            {comment.author_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{comment.author_name}</span>
                          <span className={`badge badge-xs ${getRoleColor(comment.author_role)}`}>
                            {getRoleLabel(comment.author_role)}
                          </span>
                        </div>
                        <span className="text-xs text-base-content/60">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {/* 해결 상태 표시 */}
                      {comment.is_resolved && (
                        <span className="badge badge-success badge-xs">해결됨</span>
                      )}
                      
                      {/* 해결/미해결 토글 (디자이너만) */}
                      {isDesigner && (
                        <button
                          onClick={() => handleResolveComment(comment.id)}
                          className={`btn btn-xs ${
                            comment.is_resolved 
                              ? 'btn-outline btn-success' 
                              : 'btn-success'
                          }`}
                          title={comment.is_resolved ? '미해결로 변경' : '해결됨으로 표시'}
                        >
                          {comment.is_resolved ? '↩️' : '✅'}
                        </button>
                      )}
                      
                      {/* 삭제 버튼 (본인 댓글만) */}
                      {user && comment.author_id === user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm whitespace-pre-wrap pl-10 mb-3">
                    {comment.content}
                  </div>
                  
                  {/* 댓글 액션 */}
                  <div className="flex items-center justify-between pl-10">
                    <button
                      onClick={() => handleStartReply(comment.id)}
                      className="btn btn-ghost btn-xs text-primary"
                      disabled={comment.is_resolved}
                    >
                      💬 답글
                    </button>
                    
                    {comment.is_resolved && comment.resolved_at && (
                      <span className="text-xs text-success">
                        {formatDate(comment.resolved_at)}에 해결됨
                      </span>
                    )}
                  </div>
                  
                  {/* 대댓글 목록 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-10 mt-3 space-y-2 border-l-2 border-base-300 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-base-100 rounded p-3 border border-base-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content w-6 h-6 rounded-full">
                                  <span className="text-xs">
                                    {reply.author_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-sm">{reply.author_name}</span>
                                <span className={`badge badge-xs ml-2 ${getRoleColor(reply.author_role)}`}>
                                  {getRoleLabel(reply.author_role)}
                                </span>
                                <div className="text-xs text-base-content/60">
                                  {formatDate(reply.created_at)}
                                </div>
                              </div>
                            </div>
                            
                            {user && reply.author_id === user.id && (
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                          
                          <div className="text-sm whitespace-pre-wrap pl-8">
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 답글 입력 폼 */}
                  {replyingTo === comment.id && user && (
                    <div className="ml-10 mt-3 bg-base-100 rounded p-3 border border-primary">
                      <div className="flex items-start space-x-2">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content w-6 h-6 rounded-full">
                            <span className="text-xs">{user.name?.charAt(0) || "U"}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <textarea
                            className="textarea textarea-bordered textarea-sm w-full h-16 text-sm resize-none"
                            placeholder="답글을 입력하세요..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            disabled={isSubmitting}
                          />
                          
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={handleCancelReply}
                              className="btn btn-ghost btn-xs"
                              disabled={isSubmitting}
                            >
                              취소
                            </button>
                            <button
                              onClick={handleSubmitReply}
                              disabled={!replyContent.trim() || isSubmitting}
                              className="btn btn-primary btn-xs"
                            >
                              {isSubmitting ? (
                                <div className="loading loading-spinner loading-sm" />
                              ) : (
                                "답글 작성"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 새 댓글 입력 */}
          {user && (
            <div className="bg-base-100 rounded-lg p-4 border border-base-200">
              <div className="flex items-start space-x-3">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content w-8 h-8 rounded-full">
                    <span className="text-xs">{user.name?.charAt(0) || "U"}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <textarea
                    className="textarea textarea-bordered w-full h-20 text-sm resize-none"
                    placeholder="댓글을 입력하세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleAddComment();
                      }
                    }}
                  />
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-base-content/60">
                      Ctrl+Enter로 빠른 입력
                    </span>
                    <button
                      onClick={() => handleAddComment()}
                      disabled={!newComment.trim() || isSubmitting}
                      className="btn btn-primary btn-sm"
                    >
                      {isSubmitting ? (
                        <div className="loading loading-spinner loading-sm" />
                      ) : (
                        "댓글 작성"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center py-4 text-base-content/60">
              <p>댓글을 작성하려면 로그인이 필요합니다</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}