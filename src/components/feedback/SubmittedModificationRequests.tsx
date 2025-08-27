'use client';

import React, { useState } from 'react';
import { ChecklistItem } from '@/types';

interface SubmittedModificationRequestsProps {
  projectId: string;
  versionId: string;
  checklistItems: ChecklistItem[];
  generalFeedbacks: any[];
  markups: any[];
  feedbacks: any[];
  userRole: 'client' | 'designer';
  currentRevisionNumber: number;
  totalRevisions: number;
  remainingRevisions: number;
  onChecklistItemToggle?: (itemId: string, completed: boolean) => void;
}

export default function SubmittedModificationRequests({
  projectId,
  versionId,
  checklistItems,
  generalFeedbacks,
  markups,
  feedbacks,
  userRole,
  currentRevisionNumber,
  totalRevisions,
  remainingRevisions,
  onChecklistItemToggle
}: SubmittedModificationRequestsProps) {
  const [expandedRevisions, setExpandedRevisions] = useState<Set<number>>(new Set([currentRevisionNumber]));
  
  // 디버깅: userRole 확인
  console.log('SubmittedModificationRequests userRole:', userRole);

  // 차수별로 체크리스트 그룹화
  const groupedByRevision = React.useMemo(() => {
    const groups: { [key: number]: ChecklistItem[] } = {};
    
    checklistItems.forEach(item => {
      if (item.isRevisionHeader) {
        if (!groups[item.revisionNumber!]) {
          groups[item.revisionNumber!] = [];
        }
      } else {
        // 완료된 항목들은 해당 차수에 속함 (revisionNumber가 있으면 그 차수, 없으면 현재 차수)
        const targetRevision = item.revisionNumber || currentRevisionNumber;
        if (!groups[targetRevision]) {
          groups[targetRevision] = [];
        }
        groups[targetRevision].push(item);
      }
    });

    return groups;
  }, [checklistItems, currentRevisionNumber]);

  const toggleRevisionExpansion = (revisionNumber: number) => {
    setExpandedRevisions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(revisionNumber)) {
        newSet.delete(revisionNumber);
      } else {
        newSet.add(revisionNumber);
      }
      return newSet;
    });
  };

  const getRevisionStatus = (revisionNumber: number) => {
    const items = groupedByRevision[revisionNumber] || [];
    const completedItems = items.filter(item => item.completed || item.isCompleted);
    const totalItems = items.length;
    
    if (totalItems === 0) return { status: 'empty', label: '항목 없음', progress: 0 };
    if (completedItems.length === totalItems) return { status: 'completed', label: '완료', progress: 100 };
    if (completedItems.length > 0) return { status: 'in_progress', label: '진행 중', progress: Math.round((completedItems.length / totalItems) * 100) };
    return { status: 'pending', label: '대기 중', progress: 0 };
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in_progress': return 'badge-warning';
      case 'pending': return 'badge-info';
      case 'empty': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  // 마크업 피드백 정보 가져오기
  const getMarkupFeedbackInfo = (markupFeedbackId?: string) => {
    if (!markupFeedbackId) return null;
    const feedback = feedbacks.find(f => f.id === markupFeedbackId);
    const markup = markups.find(m => m.feedback_id === markupFeedbackId);
    return { feedback, markup };
  };

  // 피드백 타입 정보 가져오기
  const getFeedbackTypeInfo = (item: ChecklistItem) => {
    if (item.type === 'markup') {
      const markupInfo = getMarkupFeedbackInfo(item.markupFeedbackId);
      return {
        type: 'markup',
        icon: '🎯',
        label: '마크업 피드백',
        badge: 'badge-primary',
        markupNumber: markupInfo?.markup?.number,
        feedback: markupInfo?.feedback
      };
    } else if (item.type === 'general') {
      const generalFeedback = generalFeedbacks.find(f => f.id === item.content || f.content === item.content);
      return {
        type: 'general',
        icon: '💬',
        label: '일반 피드백',
        badge: 'badge-info',
        feedback: generalFeedback
      };
    } else {
      return {
        type: 'manual',
        icon: '📝',
        label: '수동 추가',
        badge: 'badge-secondary',
        feedback: null
      };
    }
  };

  // 체크리스트 항목 토글
  const handleItemToggle = (itemId: string, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted;
    onChecklistItemToggle?.(itemId, newCompleted);
  };

  if (checklistItems.length === 0 && generalFeedbacks.length === 0 && markups.length === 0) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <h4 className="font-medium mb-4">📋 제출된 수정요청</h4>
          <div className="text-center py-8 text-base-content/60">
            <div className="text-4xl mb-2">📝</div>
            <p>아직 제출된 수정요청이 없습니다</p>
            <p className="text-sm mt-1">
              {userRole === 'client' 
                ? '마크업이나 피드백을 추가한 후 체크리스트를 생성해보세요' 
                : '클라이언트가 수정요청을 제출할 때까지 기다려주세요'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">📋 제출된 수정요청</h4>
          <div className="flex items-center gap-2">
            <div className="badge badge-info badge-sm">
              총 {checklistItems.filter(item => !item.isRevisionHeader).length}개 항목
            </div>
            <div className={`badge badge-sm ${remainingRevisions > 0 ? 'badge-success' : 'badge-error'}`}>
              수정 {remainingRevisions}/{totalRevisions}회 남음
            </div>
          </div>
        </div>

        {/* 차수별 수정요청 목록 */}
        <div className="space-y-4">
          {Object.keys(groupedByRevision)
            .map(Number)
            .sort((a, b) => a - b)
            .map(revisionNumber => {
              const items = groupedByRevision[revisionNumber];
              const isExpanded = expandedRevisions.has(revisionNumber);
              const revisionStatus = getRevisionStatus(revisionNumber);
              const isCurrentRevision = revisionNumber === currentRevisionNumber;

              return (
                <div key={revisionNumber} className="border rounded-lg overflow-hidden">
                  {/* 차수 헤더 */}
                  <div 
                    className={`p-4 cursor-pointer transition-colors ${
                      isCurrentRevision 
                        ? 'bg-primary/10 border-l-4 border-l-primary' 
                        : 'bg-base-50 hover:bg-base-100'
                    }`}
                    onClick={() => toggleRevisionExpansion(revisionNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">
                          {isCurrentRevision ? '📋' : revisionStatus.status === 'completed' ? '✅' : '📄'}
                        </div>
                        <div>
                          <h5 className={`font-bold ${isCurrentRevision ? 'text-primary' : 'text-base-content'}`}>
                            {revisionNumber}회차 수정요청
                            {isCurrentRevision && <span className="text-sm font-normal ml-2">(현재 진행중)</span>}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`badge badge-xs ${getStatusBadgeClass(revisionStatus.status)}`}>
                              {revisionStatus.label}
                            </span>
                            <span className="text-xs text-base-content/60">
                              {items.length}개 항목 중 {items.filter(item => item.completed || item.isCompleted).length}개 완료
                            </span>
                            {revisionStatus.progress > 0 && (
                              <span className="text-xs text-base-content/60">
                                ({revisionStatus.progress}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="badge badge-primary badge-sm">
                          {revisionNumber}회차
                        </div>
                        <div className={`text-base-content/50 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : 'rotate-0'
                        }`}>
                          ▶
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 차수별 상세 내용 */}
                  {isExpanded && (
                    <div className="border-t border-base-200">
                      <div className="p-4 space-y-3">
                        {items.length === 0 ? (
                          <div className="text-center py-4 text-base-content/60">
                            <p className="text-sm">이 차수에는 아직 항목이 없습니다</p>
                          </div>
                        ) : (
                          items.map(item => {
                            const typeInfo = getFeedbackTypeInfo(item);
                            const isCompleted = item.completed || item.isCompleted;
                            const isCurrentRevision = revisionNumber === currentRevisionNumber;
                            
                            // 디버깅: 항목별 정보 확인
                            console.log(`Item ${item.id}:`, {
                              userRole,
                              isCompleted,
                              isCurrentRevision,
                              revisionNumber,
                              currentRevisionNumber
                            });
                            
                            return (
                              <div key={item.id} className={`p-3 rounded border transition-all ${
                                isCompleted 
                                  ? 'bg-success/10 border-success/30' 
                                  : 'bg-base-50 border-base-300'
                              }`}>
                                <div className="flex items-start gap-3">
                                  {/* 체크박스 */}
                                  <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-sm mt-1" 
                                    checked={isCompleted}
                                    onChange={() => handleItemToggle(item.id, isCompleted)}
                                    disabled={userRole !== 'designer'}
                                  />
                                  
                                  {/* 내용 */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      {/* 타입 아이콘과 라벨 */}
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm">{typeInfo.icon}</span>
                                        <span className={`badge badge-xs ${typeInfo.badge}`}>
                                          {typeInfo.label}
                                        </span>
                                      </div>
                                      
                                      {/* 마크업 번호 */}
                                      {typeInfo.markupNumber && (
                                        <span className="badge badge-neutral badge-xs">
                                          #{typeInfo.markupNumber}
                                        </span>
                                      )}
                                      
                                      {/* 우선순위 */}
                                      <span className={`badge badge-xs ${
                                        item.priority === 'high' ? 'badge-error' :
                                        item.priority === 'medium' ? 'badge-warning' :
                                        'badge-success'
                                      }`}>
                                        {item.priority === 'high' ? '높음' :
                                         item.priority === 'medium' ? '보통' : '낮음'}
                                      </span>
                                      
                                      {/* 완료 상태 */}
                                      {isCompleted && (
                                        <span className="badge badge-success badge-xs">
                                          ✓ 완료됨
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* 제목/내용 */}
                                    <h6 className={`font-medium text-sm mb-1 ${
                                      isCompleted ? 'line-through text-base-content/60' : 'text-base-content'
                                    }`}>
                                      {item.content}
                                    </h6>
                                    
                                    {/* 설명 */}
                                    {item.description && (
                                      <p className="text-xs text-base-content/70 mb-2">
                                        {item.description}
                                      </p>
                                    )}
                                    
                                    {/* 레퍼런스 URL */}
                                    {item.referenceUrls && item.referenceUrls.length > 0 && (
                                      <div className="mb-2">
                                        <span className="text-xs text-base-content/60">레퍼런스:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {item.referenceUrls.map((url, index) => (
                                            <a 
                                              key={index}
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="link link-primary text-xs"
                                            >
                                              🔗 링크 {index + 1}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between mt-2">
                                      {/* 생성일 */}
                                      <div className="text-xs text-base-content/50">
                                        생성: {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                                        {item.completedAt && (
                                          <span className="ml-2">
                                            완료: {new Date(item.completedAt).toLocaleDateString('ko-KR')}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* 개별 완료 버튼 (디자이너만) */}
                                      {userRole === 'designer' && (
                                        <div className="flex gap-1">
                                          {!isCompleted ? (
                                            <button
                                              className="btn btn-success btn-xs"
                                              onClick={() => handleItemToggle(item.id, false)}
                                            >
                                              ✓ 완료 처리
                                            </button>
                                          ) : (
                                            <button
                                              className="btn btn-warning btn-xs"
                                              onClick={() => handleItemToggle(item.id, true)}
                                            >
                                              ↶ 미완료로 변경
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* 하단 요약 정보 */}
        <div className="mt-4 pt-4 border-t border-base-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{currentRevisionNumber}</div>
              <div className="text-xs text-base-content/60">현재 회차</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">
                {checklistItems.filter(item => !item.isRevisionHeader && (item.completed || item.isCompleted)).length}
              </div>
              <div className="text-xs text-base-content/60">완료된 항목</div>
            </div>
            <div>
              <div className="text-lg font-bold text-warning">
                {checklistItems.filter(item => !item.isRevisionHeader && !(item.completed || item.isCompleted)).length}
              </div>
              <div className="text-xs text-base-content/60">대기 중 항목</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${remainingRevisions > 0 ? 'text-success' : 'text-error'}`}>
                {remainingRevisions}
              </div>
              <div className="text-xs text-base-content/60">남은 수정 횟수</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
