"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Feedback, FeedbackAttachment } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackListProps {
  feedbacks: Feedback[];
  onReply?: (parentFeedbackId: string) => void;
  onEdit?: (feedback: Feedback) => void;
  onStatusChange?: (feedbackId: string, status: Feedback['status']) => void;
  onDelete?: (feedbackId: string) => void;
  showActions?: boolean;
  groupByStatus?: boolean;
}

export default function FeedbackList({
  feedbacks,
  onReply,
  onEdit,
  onStatusChange,
  onDelete,
  showActions = true,
  groupByStatus = false
}: FeedbackListProps) {
  const { user } = useAuth();
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<{
    status: Feedback['status'] | 'all';
    priority: Feedback['priority'] | 'all';
    category: Feedback['category'] | 'all';
  }>({
    status: 'all',
    priority: 'all', 
    category: 'all'
  });

  const toggleExpanded = (feedbackId: string) => {
    setExpandedFeedbacks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId);
      } else {
        newSet.add(feedbackId);
      }
      return newSet;
    });
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      if (filter.status !== 'all' && feedback.status !== filter.status) return false;
      if (filter.priority !== 'all' && feedback.priority !== filter.priority) return false;
      if (filter.category !== 'all' && feedback.category !== filter.category) return false;
      return true;
    });
  }, [feedbacks, filter]);

  const groupedFeedbacks = useMemo(() => {
    if (!groupByStatus) return { all: filteredFeedbacks };
    
    return filteredFeedbacks.reduce((groups, feedback) => {
      const status = feedback.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(feedback);
      return groups;
    }, {} as Record<string, Feedback[]>);
  }, [filteredFeedbacks, groupByStatus]);

  const getPriorityInfo = (priority: Feedback['priority']) => {
    const info = {
      low: { label: "낮음", color: "success", bgColor: "bg-success/10", icon: "⬇️" },
      medium: { label: "보통", color: "warning", bgColor: "bg-warning/10", icon: "➡️" },
      high: { label: "높음", color: "error", bgColor: "bg-error/10", icon: "⬆️" },
      critical: { label: "긴급", color: "error", bgColor: "bg-error/20", icon: "🔥" }
    };
    return info[priority];
  };

  const getStatusInfo = (status: Feedback['status']) => {
    const info = {
      pending: { label: "검토 대기", color: "warning", icon: "⏳" },
      acknowledged: { label: "확인됨", color: "info", icon: "👁️" },
      in_progress: { label: "진행 중", color: "primary", icon: "🚧" },
      resolved: { label: "해결됨", color: "success", icon: "✅" },
      rejected: { label: "거절됨", color: "error", icon: "❌" }
    };
    return info[status];
  };

  const getCategoryInfo = (category: Feedback['category']) => {
    const info = {
      design: { label: "디자인", icon: "🎨" },
      content: { label: "콘텐츠", icon: "📝" },
      functionality: { label: "기능", icon: "⚙️" },
      technical: { label: "기술", icon: "🔧" },
      other: { label: "기타", icon: "💬" }
    };
    return info[category];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderAttachment = (attachment: FeedbackAttachment) => (
    <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-base-200 rounded">
      {attachment.thumbnail_url ? (
        <Image
          src={attachment.thumbnail_url}
          alt={attachment.file_name}
          width={32}
          height={32}
          className="w-8 h-8 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open(attachment.file_url, '_blank')}
        />
      ) : (
        <div className="w-8 h-8 bg-base-300 rounded flex items-center justify-center text-xs">
          📄
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.file_name}</p>
        <p className="text-xs text-base-content/60">{formatFileSize(attachment.file_size)}</p>
      </div>
      <button
        onClick={() => window.open(attachment.file_url, '_blank')}
        className="btn btn-ghost btn-xs"
      >
        📥
      </button>
    </div>
  );

  const renderFeedback = (feedback: Feedback, isChild = false) => {
    const priorityInfo = getPriorityInfo(feedback.priority);
    const statusInfo = getStatusInfo(feedback.status);
    const categoryInfo = getCategoryInfo(feedback.category);
    const isExpanded = expandedFeedbacks.has(feedback.id);
    const isOwner = user?.id === feedback.client_id;

    return (
      <div 
        key={feedback.id} 
        className={`card bg-base-100 shadow-sm ${isChild ? 'ml-8 mt-2' : ''} ${priorityInfo.bgColor}`}
      >
        <div className="card-body p-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className={`badge badge-${priorityInfo.color} badge-sm`}>
                  {priorityInfo.icon} {priorityInfo.label}
                </span>
                <span className={`badge badge-${statusInfo.color} badge-sm`}>
                  {statusInfo.icon} {statusInfo.label}
                </span>
                <span className="badge badge-ghost badge-sm">
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
                {feedback.is_official && (
                  <span className="badge badge-warning badge-sm">공식</span>
                )}
                {feedback.revision_request_count > 0 && (
                  <span className="badge badge-info badge-sm">
                    수정요청 {feedback.revision_request_count}회
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-base-content/60">
                {formatDate(feedback.submitted_at)}
              </span>
              {showActions && (
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                    ⋮
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {isOwner && onEdit && (
                      <li>
                        <button onClick={() => onEdit(feedback)}>
                          ✏️ 수정
                        </button>
                      </li>
                    )}
                    {onReply && (
                      <li>
                        <button onClick={() => onReply(feedback.id)}>
                          💬 답글
                        </button>
                      </li>
                    )}
                    {onStatusChange && feedback.status !== 'resolved' && (
                      <li>
                        <button onClick={() => onStatusChange(feedback.id, 'resolved')}>
                          ✅ 해결됨으로 변경
                        </button>
                      </li>
                    )}
                    {onStatusChange && feedback.status === 'pending' && (
                      <li>
                        <button onClick={() => onStatusChange(feedback.id, 'acknowledged')}>
                          👁️ 확인됨으로 변경
                        </button>
                      </li>
                    )}
                    {isOwner && onDelete && (
                      <li>
                        <button 
                          onClick={() => {
                            if (confirm('정말로 이 피드백을 삭제하시겠습니까?')) {
                              onDelete(feedback.id);
                            }
                          }}
                          className="text-error"
                        >
                          🗑️ 삭제
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 내용 미리보기 */}
          <div className="mb-3">
            {feedback.content_html.length > 200 && !isExpanded ? (
              <div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: feedback.content_html.slice(0, 200) + '...' 
                  }}
                />
                <button
                  onClick={() => toggleExpanded(feedback.id)}
                  className="btn btn-ghost btn-sm mt-2"
                >
                  더보기 ↓
                </button>
              </div>
            ) : (
              <div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: feedback.content_html }}
                />
                {feedback.content_html.length > 200 && (
                  <button
                    onClick={() => toggleExpanded(feedback.id)}
                    className="btn btn-ghost btn-sm mt-2"
                  >
                    접기 ↑
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 첨부파일 */}
          {feedback.attachments && feedback.attachments.length > 0 && (
            <div className="mb-3">
              <div className="label">
                <span className="label-text font-medium">첨부파일 ({feedback.attachments.length})</span>
              </div>
              <div className="space-y-2">
                {feedback.attachments.map(renderAttachment)}
              </div>
            </div>
          )}

          {/* 메타데이터 */}
          <div className="flex items-center justify-between text-sm text-base-content/60 pt-2 border-t">
            <div className="flex items-center space-x-4">
              <span>버전 {feedback.version}</span>
              {feedback.resolved_at && (
                <span>해결일: {formatDate(feedback.resolved_at)}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {feedback.parent_feedback_id && (
                <span className="badge badge-ghost badge-xs">답글</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGroup = (status: string, groupFeedbacks: Feedback[]) => {
    const statusInfo = getStatusInfo(status as Feedback['status']);
    
    return (
      <div key={status} className="mb-6">
        {groupByStatus && (
          <div className="flex items-center space-x-2 mb-3">
            <h3 className="text-lg font-semibold">
              {statusInfo?.icon} {statusInfo?.label || '전체'}
            </h3>
            <span className="badge badge-neutral badge-sm">
              {groupFeedbacks.length}
            </span>
          </div>
        )}
        
        <div className="space-y-3">
          {groupFeedbacks.map(feedback => (
            <div key={feedback.id}>
              {renderFeedback(feedback)}
              {/* 답글들 */}
              {feedbacks
                .filter(f => f.parent_feedback_id === feedback.id)
                .map(reply => renderFeedback(reply, true))
              }
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-bold mb-2">피드백이 없습니다</h3>
        <p className="text-base-content/60">
          첫 번째 피드백을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 필터 */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <select
                className="select select-bordered select-sm"
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as "all" | "pending" | "acknowledged" | "in_progress" | "resolved" | "rejected" }))}
              >
                <option value="all">모든 상태</option>
                <option value="pending">검토 대기</option>
                <option value="acknowledged">확인됨</option>
                <option value="in_progress">진행 중</option>
                <option value="resolved">해결됨</option>
                <option value="rejected">거절됨</option>
              </select>
            </div>

            <div className="form-control">
              <select
                className="select select-bordered select-sm"
                value={filter.priority}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as "all" | "low" | "medium" | "high" | "critical" }))}
              >
                <option value="all">모든 우선순위</option>
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
                <option value="critical">긴급</option>
              </select>
            </div>

            <div className="form-control">
              <select
                className="select select-bordered select-sm"
                value={filter.category}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value as "all" | "design" | "content" | "functionality" | "technical" | "other" }))}
              >
                <option value="all">모든 카테고리</option>
                <option value="design">디자인</option>
                <option value="content">콘텐츠</option>
                <option value="functionality">기능</option>
                <option value="technical">기술</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>
          
          {/* 요약 정보 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-base-content/60">
              총 {filteredFeedbacks.length}개의 피드백
            </span>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-error">
                긴급: {filteredFeedbacks.filter(f => f.priority === 'critical').length}
              </span>
              <span className="text-warning">
                미해결: {filteredFeedbacks.filter(f => f.status !== 'resolved').length}
              </span>
              <span className="text-success">
                해결: {filteredFeedbacks.filter(f => f.status === 'resolved').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 피드백 목록 */}
      <div>
        {Object.entries(groupedFeedbacks).map(([status, groupFeedbacks]) => 
          renderGroup(status, groupFeedbacks.filter(f => !f.parent_feedback_id))
        )}
      </div>
    </div>
  );
}