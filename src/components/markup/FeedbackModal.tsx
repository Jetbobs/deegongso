"use client";

import { useState, useEffect } from "react";
import { ImageMarkup, MarkupFeedback, FeedbackCategory } from "@/types";
import { MarkupManager, FEEDBACK_CATEGORIES } from "@/lib/markupManager";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  markup: ImageMarkup | null;
  existingFeedback?: MarkupFeedback | null;
  projectId: string;
  currentUserId: string;
  onFeedbackSave: (feedback: MarkupFeedback) => void;
  onFeedbackDelete?: (feedbackId: string) => void;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  markup,
  existingFeedback,
  projectId,
  currentUserId,
  onFeedbackSave,
  onFeedbackDelete
}: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' as FeedbackCategory,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (isOpen) {
      if (existingFeedback) {
        // 기존 피드백 편집 모드
        setFormData({
          title: existingFeedback.title,
          description: existingFeedback.description,
          category: existingFeedback.category,
          priority: existingFeedback.priority,
        });
        setIsEditMode(true);
      } else {
        // 새 피드백 작성 모드
        setFormData({
          title: '',
          description: '',
          category: 'general',
          priority: 'medium',
        });
        setIsEditMode(false);
      }
    }
  }, [isOpen, existingFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!markup || !formData.title.trim() || !formData.description.trim()) {
      alert('제목과 설명을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      let feedback: MarkupFeedback;

      if (isEditMode && existingFeedback) {
        // 기존 피드백 업데이트
        feedback = MarkupManager.updateMarkupFeedback(existingFeedback.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
        })!;
      } else {
        // 새 피드백 생성
        feedback = MarkupManager.createMarkupFeedback(
          markup.id,
          markup.version_id,
          projectId,
          formData.title,
          formData.description,
          formData.category,
          formData.priority,
          currentUserId
        );
      }

      onFeedbackSave(feedback);
      handleClose();
    } catch (error) {
      console.error('피드백 저장 실패:', error);
      alert('피드백 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingFeedback || !onFeedbackDelete) return;

    if (!confirm('이 피드백을 삭제하시겠습니까?')) return;

    setIsLoading(true);

    try {
      MarkupManager.deleteMarkupFeedback(existingFeedback.id);
      onFeedbackDelete(existingFeedback.id);
      handleClose();
    } catch (error) {
      console.error('피드백 삭제 실패:', error);
      alert('피드백 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
    });
    setIsEditMode(false);
    onClose();
  };

  if (!isOpen || !markup) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-base-content';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">
              {isEditMode ? '피드백 수정' : '새 피드백 추가'}
            </h3>
            <p className="text-sm text-base-content/70 mt-1">
              마크업 #{markup.number} • {markup.type} 도구
            </p>
          </div>
          <button 
            className="btn btn-sm btn-circle btn-ghost" 
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">제목 *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="피드백 제목을 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          {/* 카테고리와 우선순위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">카테고리 *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as FeedbackCategory }))}
                required
                disabled={isLoading}
              >
                {FEEDBACK_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">우선순위 *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                required
                disabled={isLoading}
              >
                <option value="high">🔴 높음 - 즉시 수정 필요</option>
                <option value="medium">🟡 보통 - 검토 후 수정</option>
                <option value="low">🟢 낮음 - 여유 있을 때 수정</option>
              </select>
            </div>
          </div>

          {/* 설명 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">상세 설명 *</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="구체적인 수정 요청사항을 작성해주세요&#10;&#10;예시:&#10;- 로고 색상을 현재 파란색(#3B82F6)에서 빨간색(#EF4444)으로 변경&#10;- 폰트 크기를 24px에서 28px로 확대&#10;- 텍스트 위치를 왼쪽에서 중앙으로 이동"
              required
              disabled={isLoading}
            />
          </div>

          {/* 기존 피드백 정보 (편집 모드일 때) */}
          {isEditMode && existingFeedback && (
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h4 className="font-medium text-sm mb-2">기존 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-base-content/60">생성일:</span>
                    <p>{new Date(existingFeedback.created_at).toLocaleString('ko-KR')}</p>
                  </div>
                  <div>
                    <span className="text-base-content/60">상태:</span>
                    <p className={`font-medium ${
                      existingFeedback.status === 'resolved' ? 'text-success' :
                      existingFeedback.status === 'in_progress' ? 'text-warning' :
                      existingFeedback.status === 'rejected' ? 'text-error' : 'text-info'
                    }`}>
                      {existingFeedback.status === 'resolved' ? '✅ 해결됨' :
                       existingFeedback.status === 'in_progress' ? '⏳ 진행중' :
                       existingFeedback.status === 'rejected' ? '❌ 거절됨' : '⏸️ 대기중'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-between">
            <div>
              {isEditMode && onFeedbackDelete && (
                <button
                  type="button"
                  className="btn btn-error btn-outline"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  🗑️ 삭제
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {isEditMode ? '수정중...' : '저장중...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? '✏️ 수정' : '💾 저장'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose} />
    </div>
  );
}