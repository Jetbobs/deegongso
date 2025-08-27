"use client";

import { useState, useEffect, useCallback } from "react";
import { DesignVersion, ImageMarkup, MarkupFeedback, MarkupType, UserRole } from "@/types";
import { MarkupManager } from "@/lib/markupManager";
import ImageMarkupCanvasWrapper from "./ImageMarkupCanvasWrapper";
import MarkupToolbar from "./MarkupToolbar";
import FeedbackModal from "./FeedbackModal";
import MarkupComments from "./MarkupComments";

interface MarkupFeedbackSystemProps {
  version: DesignVersion;
  projectId: string;
  userRole: UserRole;
  currentUserId: string;
  onFeedbackChange?: () => void;
}

export default function MarkupFeedbackSystem({
  version,
  projectId,
  userRole,
  currentUserId,
  onFeedbackChange
}: MarkupFeedbackSystemProps) {
  const [selectedTool, setSelectedTool] = useState<MarkupType | null>(null);
  const [isMarkupMode, setIsMarkupMode] = useState(false);
  const [markups, setMarkups] = useState<ImageMarkup[]>([]);
  const [feedbacks, setFeedbacks] = useState<MarkupFeedback[]>([]);
  const [selectedMarkup, setSelectedMarkup] = useState<ImageMarkup | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<MarkupFeedback | null>(null);
  const [commentStats, setCommentStats] = useState(MarkupManager.getVersionCommentStats(version.id));

  // 데이터 로드
  const loadData = useCallback(() => {
    const versionMarkups = MarkupManager.getVersionMarkups(version.id);
    const versionFeedbacks = MarkupManager.getVersionMarkupFeedbacks(version.id);
    const versionCommentStats = MarkupManager.getVersionCommentStats(version.id);
    
    setMarkups(versionMarkups);
    setFeedbacks(versionFeedbacks);
    setCommentStats(versionCommentStats);
  }, [version.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 마크업 생성 핸들러
  const handleMarkupCreate = (markup: ImageMarkup) => {
    setMarkups(prev => [...prev, markup]);
    setSelectedMarkup(markup);
    setEditingFeedback(null);
    setShowFeedbackModal(true);
  };

  // 마크업 클릭 핸들러
  const handleMarkupClick = (markup: ImageMarkup) => {
    setSelectedMarkup(markup);
    
    // 연결된 피드백이 있으면 편집 모드로
    if (markup.feedback_id) {
      const feedback = MarkupManager.getMarkupFeedback(markup.feedback_id);
      setEditingFeedback(feedback);
    } else {
      setEditingFeedback(null);
    }
    
    setShowFeedbackModal(true);
  };

  // 피드백 저장 핸들러
  const handleFeedbackSave = (feedback: MarkupFeedback) => {
    setFeedbacks(prev => {
      const existingIndex = prev.findIndex(f => f.id === feedback.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = feedback;
        return updated;
      } else {
        return [...prev, feedback];
      }
    });

    // 마크업 목록 새로고침 (feedback_id 연결을 위해)
    loadData();
    onFeedbackChange?.();
    setShowFeedbackModal(false);
  };

  // 피드백 삭제 핸들러
  const handleFeedbackDelete = (feedbackId: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
    loadData();
    onFeedbackChange?.();
    setShowFeedbackModal(false);
  };

  // 모든 마크업 삭제
  const handleClearAll = () => {
    if (!confirm('모든 마크업과 피드백을 삭제하시겠습니까?')) return;

    markups.forEach(markup => {
      MarkupManager.deleteMarkup(markup.id);
    });

    setMarkups([]);
    setFeedbacks([]);
    onFeedbackChange?.();
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // 입력 필드에서는 단축키 비활성화
      }

      switch (e.key) {
        case 'm':
        case 'M':
          setIsMarkupMode(prev => !prev);
          break;
        case '1':
          setSelectedTool('point');
          setIsMarkupMode(true);
          break;
        case '2':
          setSelectedTool('circle');
          setIsMarkupMode(true);
          break;
        case '3':
          setSelectedTool('arrow');
          setIsMarkupMode(true);
          break;
        case '4':
          setSelectedTool('rectangle');
          setIsMarkupMode(true);
          break;
        case '5':
          setSelectedTool('text');
          setIsMarkupMode(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const stats = MarkupManager.getMarkupStats(version.id);
  
  const handleCommentChange = useCallback(() => {
    loadData(); // 댓글 변경 시 전체 데이터 다시 로드
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">마크업 피드백</h3>
          <p className="text-base-content/70">
            이미지에 직접 마크업을 추가하고 상세한 피드백을 남겨보세요
          </p>
        </div>
        
        {/* 통계 */}
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">마크업</div>
            <div className="stat-value text-primary">{stats.total_markups}</div>
          </div>
          <div className="stat">
            <div className="stat-title">피드백</div>
            <div className="stat-value text-secondary">{stats.total_feedbacks}</div>
          </div>
          <div className="stat">
            <div className="stat-title">댓글</div>
            <div className="stat-value text-accent">{commentStats.total_comments}</div>
          </div>
          <div className="stat">
            <div className="stat-title">미해결</div>
            <div className="stat-value text-warning">{stats.pending_feedbacks + stats.in_progress_feedbacks + commentStats.unresolved_comments}</div>
          </div>
        </div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 도구 바 */}
        <div className="xl:col-span-1">
          <MarkupToolbar
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            isMarkupMode={isMarkupMode}
            onToggleMarkupMode={() => setIsMarkupMode(prev => !prev)}
            onClearAll={handleClearAll}
            disabled={userRole !== 'client'} // 클라이언트만 마크업 가능
          />
        </div>

        {/* 캔버스 */}
        <div className="xl:col-span-3">
          <ImageMarkupCanvasWrapper
            version={version}
            selectedTool={selectedTool}
            isMarkupMode={isMarkupMode}
            onMarkupClick={handleMarkupClick}
            onMarkupCreate={handleMarkupCreate}
            currentUserId={currentUserId}
            className="w-full"
          />
        </div>
      </div>

      {/* 피드백 목록 */}
      {feedbacks.length > 0 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title">피드백 목록 ({feedbacks.length}개)</h4>
            
            <div className="space-y-3">
              {feedbacks.map((feedback) => {
                const markup = markups.find(m => m.id === feedback.markup_id);
                
                return (
                  <div 
                    key={feedback.id} 
                    className="border border-base-300 rounded-lg p-4 hover:bg-base-50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (markup) {
                        handleMarkupClick(markup);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-sm">
                            #{markup?.number || '?'}
                          </span>
                          
                          <span className={`badge badge-sm ${
                            feedback.priority === 'high' ? 'badge-error' :
                            feedback.priority === 'medium' ? 'badge-warning' : 'badge-success'
                          }`}>
                            {feedback.priority === 'high' ? '🔴 높음' :
                             feedback.priority === 'medium' ? '🟡 보통' : '🟢 낮음'}
                          </span>
                          
                          <span className="text-xs text-base-content/60">
                            {new Date(feedback.created_at).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        
                        <h5 className="font-medium">{feedback.title}</h5>
                        <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                          {feedback.description}
                        </p>
                        
                        {/* 댓글 표시 */}
                        {markup && (
                          <div className="mt-2">
                            <span className="text-xs text-base-content/60 flex items-center gap-1">
                              💬 {markup.comment_count || 0}개 댓글
                              {markup.has_unresolved_comments && (
                                <span className="badge badge-error badge-xs">미해결</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className={`badge ${
                          feedback.status === 'resolved' ? 'badge-success' :
                          feedback.status === 'in_progress' ? 'badge-warning' :
                          feedback.status === 'rejected' ? 'badge-error' : 'badge-info'
                        }`}>
                          {feedback.status === 'resolved' ? '✅ 해결' :
                           feedback.status === 'in_progress' ? '⏳ 진행중' :
                           feedback.status === 'rejected' ? '❌ 거절' : '⏸️ 대기'}
                        </div>
                      </div>
                    </div>
                    
                    {/* 마크업별 댓글 섹션 */}
                    {markup && (
                      <div className="mt-4 border-t border-base-200 pt-4">
                        <MarkupComments 
                          markupId={markup.id}
                          onCommentCountChange={handleCommentChange}
                          onResolveStatusChange={handleCommentChange}
                          isDesigner={userRole === 'designer'}
                          projectId={projectId}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 사용법 안내 (피드백이 없을 때) */}
      {feedbacks.length === 0 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-lg font-semibold mb-2">마크업 피드백 시작하기</h4>
            <div className="text-base-content/70 space-y-2">
              <p>1. 왼쪽 도구 바에서 '마크업 모드'를 활성화하세요</p>
              <p>2. 원하는 마크업 도구를 선택하세요</p>
              <p>3. 이미지에서 피드백을 남기고 싶은 부분을 클릭하세요</p>
              <p>4. 팝업에서 상세한 피드백 내용을 작성하세요</p>
            </div>
          </div>
        </div>
      )}

      {/* 피드백 모달 */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        markup={selectedMarkup}
        existingFeedback={editingFeedback}
        projectId={projectId}
        currentUserId={currentUserId}
        onFeedbackSave={handleFeedbackSave}
        onFeedbackDelete={handleFeedbackDelete}
      />
    </div>
  );
}