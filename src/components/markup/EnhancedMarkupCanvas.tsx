"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { MarkupManager, MARKUP_TOOLS, FEEDBACK_CATEGORIES } from '@/lib/markupManager';
import { ImageMarkup, MarkupFeedback, MarkupType, FeedbackCategory, DesignVersion, UserRole, ChecklistItem } from '@/types';

interface EnhancedMarkupCanvasProps {
  version: DesignVersion;
  projectId: string;
  userRole: UserRole;
  currentUserId: string;
  generalFeedbacks?: any[]; // 일반 피드백 목록
  onFeedbackCreate?: (feedback: MarkupFeedback) => void;
  onFeedbackUpdate?: (feedback: MarkupFeedback) => void;
  onMarkupDelete?: (markup: ImageMarkup) => void;
  readonly?: boolean;
}

interface CanvasPosition {
  x: number;
  y: number;
}

interface FeedbackForm {
  title: string;
  description: string;
  additionalText: string;
  referenceUrls: string[];
  referenceFiles: File[];
  category: FeedbackCategory;
  priority: 'low' | 'medium' | 'high';
}

export default function EnhancedMarkupCanvas({
  version,
  projectId,
  userRole,
  currentUserId,
  generalFeedbacks = [],
  onFeedbackCreate,
  onFeedbackUpdate,
  onMarkupDelete,
  readonly = false
}: EnhancedMarkupCanvasProps) {
  const [selectedTool, setSelectedTool] = useState<MarkupType>('point');
  const [markups, setMarkups] = useState<ImageMarkup[]>([]);
  const [feedbacks, setFeedbacks] = useState<MarkupFeedback[]>([]);
  const [selectedMarkup, setSelectedMarkup] = useState<ImageMarkup | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    title: '',
    description: '',
    additionalText: '',
    referenceUrls: [],
    referenceFiles: [],
    category: 'general',
    priority: 'medium'
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [showMarkupList, setShowMarkupList] = useState(true);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [checklistForm, setChecklistForm] = useState({
    content: '',
    priority: 'medium' as ChecklistItem['priority'],
    description: '',
    referenceUrls: [] as string[],
    referenceFiles: [] as File[]
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 마크업 및 피드백 로드
  useEffect(() => {
    const loadMarkupsAndFeedbacks = () => {
      const versionMarkups = MarkupManager.getVersionMarkups(version.id);
      const versionFeedbacks = MarkupManager.getVersionMarkupFeedbacks(version.id);
      
      setMarkups(versionMarkups);
      setFeedbacks(versionFeedbacks);
    };

    loadMarkupsAndFeedbacks();
  }, [version.id]);

  // 캔버스 클릭 처리
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (readonly || !canvasRef.current || !imageRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    // 이미지 영역 내부 클릭인지 확인
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const imageLeft = imageRect.left - rect.left;
    const imageTop = imageRect.top - rect.top;
    const imageRight = imageLeft + imageRect.width;
    const imageBottom = imageTop + imageRect.height;
    
    if (clickX < imageLeft || clickX > imageRight || clickY < imageTop || clickY > imageBottom) {
      return;
    }

    // 이미지 내 상대 좌표 계산
    const relativeX = ((clickX - imageLeft) / imageRect.width) * 100;
    const relativeY = ((clickY - imageTop) / imageRect.height) * 100;

    // 새 마크업 생성
    const newMarkup = MarkupManager.createMarkup(
      version.id,
      relativeX,
      relativeY,
      selectedTool,
      currentUserId
    );

    setMarkups(prev => [...prev, newMarkup]);
    setSelectedMarkup(newMarkup);
    
    // 피드백 폼 표시
    setShowFeedbackForm(true);
    setIsDrawing(true);
  }, [readonly, selectedTool, currentUserId, version.id]);

  // 마크업 선택 처리
  const handleMarkupClick = useCallback((markup: ImageMarkup, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedMarkup(markup);
    
    // 연결된 피드백이 있으면 편집 모드로
    if (markup.feedback_id) {
      const feedback = feedbacks.find(f => f.id === markup.feedback_id);
      if (feedback) {
        setFeedbackForm({
          title: feedback.title,
          description: feedback.description,
          additionalText: feedback.additionalText || '',
          referenceUrls: feedback.referenceUrls || [],
          referenceFiles: [], // 기존 파일은 File 객체가 아니므로 빈 배열로 초기화
          category: feedback.category,
          priority: feedback.priority
        });
        setShowFeedbackForm(true);
      }
    }
  }, [feedbacks]);

  // 피드백 제출 처리
  const handleFeedbackSubmit = async () => {
    if (!selectedMarkup || !feedbackForm.title.trim()) return;

    try {
      if (selectedMarkup.feedback_id) {
        // 기존 피드백 업데이트
        const updatedFeedback = MarkupManager.updateMarkupFeedback(
          selectedMarkup.feedback_id,
          {
            title: feedbackForm.title.trim(),
            description: feedbackForm.description.trim(),
            additionalText: feedbackForm.additionalText.trim(),
            category: feedbackForm.category,
            priority: feedbackForm.priority
          }
        );
        
        if (updatedFeedback) {
          setFeedbacks(prev => prev.map(f => 
            f.id === updatedFeedback.id ? updatedFeedback : f
          ));
          onFeedbackUpdate?.(updatedFeedback);
        }
      } else {
        // 새 피드백 생성
        // TODO: MarkupManager에서 레퍼런스 데이터 처리 구현 필요
        const newFeedback = MarkupManager.createMarkupFeedback(
          selectedMarkup.id,
          version.id,
          projectId,
          feedbackForm.title.trim(),
          feedbackForm.description.trim(),
          feedbackForm.additionalText.trim(),
          feedbackForm.category,
          feedbackForm.priority,
          currentUserId
        );
        
        // 레퍼런스 데이터 임시 추가 (실제로는 MarkupManager에서 처리해야 함)
        if (newFeedback) {
          newFeedback.referenceUrls = feedbackForm.referenceUrls.filter(url => url.trim());
          // referenceFiles는 실제 업로드 구현 필요
        }
        
        setFeedbacks(prev => [...prev, newFeedback]);
        
        // 마크업 피드백용 체크리스트 항목 자동 생성
        const checklistItem: ChecklistItem = {
          id: `markup-${newFeedback.id}`,
          content: newFeedback.title,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          priority: newFeedback.priority,
          type: 'markup',
          markupFeedbackId: newFeedback.id
        };
        setChecklistItems(prev => [...prev, checklistItem]);
        
        // 마크업에 피드백 연결 업데이트
        const updatedMarkup = { ...selectedMarkup, feedback_id: newFeedback.id };
        setMarkups(prev => prev.map(m => 
          m.id === updatedMarkup.id ? updatedMarkup : m
        ));
        
        onFeedbackCreate?.(newFeedback);
      }
      
      // 폼 초기화
      setShowFeedbackForm(false);
      setFeedbackForm({
        title: '',
        description: '',
        additionalText: '',
        referenceUrls: [],
        referenceFiles: [],
        category: 'general',
        priority: 'medium'
      });
      setSelectedMarkup(null);
      setIsDrawing(false);
    } catch (error) {
      console.error('피드백 처리 실패:', error);
    }
  };

  // 마크업 삭제
  const handleMarkupDelete = (markup: ImageMarkup) => {
    if (readonly) return;
    
    if (confirm('이 마크업과 연결된 피드백을 삭제하시겠습니까?')) {
      const success = MarkupManager.deleteMarkup(markup.id);
      if (success) {
        setMarkups(prev => prev.filter(m => m.id !== markup.id));
        if (markup.feedback_id) {
          setFeedbacks(prev => prev.filter(f => f.id !== markup.feedback_id));
        }
        onMarkupDelete?.(markup);
        
        if (selectedMarkup?.id === markup.id) {
          setSelectedMarkup(null);
          setShowFeedbackForm(false);
        }
      }
    }
  };

  // 피드백 상태 업데이트
  const handleFeedbackStatusUpdate = (feedback: MarkupFeedback, newStatus: MarkupFeedback['status']) => {
    const updatedFeedback = MarkupManager.updateMarkupFeedback(feedback.id, { 
      status: newStatus,
      resolved_by: newStatus === 'resolved' ? currentUserId : undefined
    });
    
    if (updatedFeedback) {
      setFeedbacks(prev => prev.map(f => 
        f.id === updatedFeedback.id ? updatedFeedback : f
      ));
      onFeedbackUpdate?.(updatedFeedback);
    }
  };

  // 체크리스트 관련 함수들
  const addChecklistItem = () => {
    if (!checklistForm.content.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      content: checklistForm.content.trim(),
      description: checklistForm.description.trim() || undefined,
      referenceUrls: checklistForm.referenceUrls.filter(url => url.trim()),
      // referenceFiles는 실제 업로드 구현 필요
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: checklistForm.priority,
      type: 'general'
    };
    
    setChecklistItems(prev => [...prev, newItem]);
    setChecklistForm({ 
      content: '', 
      priority: 'medium', 
      description: '', 
      referenceUrls: [], 
      referenceFiles: [] 
    });
    setShowChecklistForm(false);
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isCompleted: !item.isCompleted, updatedAt: new Date().toISOString() }
        : item
    ));
  };

  const removeChecklistItem = (itemId: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateChecklistItemPriority = (itemId: string, priority: ChecklistItem['priority']) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, priority, updatedAt: new Date().toISOString() }
        : item
    ));
  };

  // 마크업 렌더링
  const renderMarkup = (markup: ImageMarkup) => {
    const isSelected = selectedMarkup?.id === markup.id;
    const connectedFeedback = feedbacks.find(f => f.id === markup.feedback_id);
    
    const baseStyle = {
      position: 'absolute' as const,
      left: `${markup.x}%`,
      top: `${markup.y}%`,
      transform: 'translate(-50%, -50%)',
      cursor: 'pointer',
      zIndex: isSelected ? 20 : 10,
    };

    const getStatusColor = () => {
      if (!connectedFeedback) return markup.color;
      switch (connectedFeedback.status) {
        case 'resolved': return '#10b981'; // green-500
        case 'in_progress': return '#f59e0b'; // amber-500
        case 'rejected': return '#ef4444'; // red-500
        default: return markup.color;
      }
    };

    switch (markup.type) {
      case 'point':
        return (
          <div
            key={markup.id}
            style={{
              ...baseStyle,
              width: `${markup.size || 12}px`,
              height: `${markup.size || 12}px`,
              backgroundColor: getStatusColor(),
              borderRadius: '50%',
              border: isSelected ? '3px solid #3b82f6' : '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => handleMarkupClick(markup, e)}
          >
            <div className="absolute -top-6 -left-2 text-white text-xs font-bold bg-black/50 px-1 rounded">
              {markup.number}
            </div>
          </div>
        );

      case 'circle':
        return (
          <div
            key={markup.id}
            style={{
              ...baseStyle,
              width: `${markup.size || 40}px`,
              height: `${markup.size || 40}px`,
              border: `3px solid ${getStatusColor()}`,
              borderRadius: '50%',
              backgroundColor: `${getStatusColor()}20`
            }}
            onClick={(e) => handleMarkupClick(markup, e)}
          >
            <div className="absolute -top-6 -left-2 text-white text-xs font-bold bg-black/50 px-1 rounded">
              {markup.number}
            </div>
          </div>
        );

      case 'rectangle':
        return (
          <div
            key={markup.id}
            style={{
              ...baseStyle,
              width: `${markup.size || 60}px`,
              height: `${(markup.size || 60) * 0.6}px`,
              border: `2px solid ${getStatusColor()}`,
              backgroundColor: `${getStatusColor()}20`
            }}
            onClick={(e) => handleMarkupClick(markup, e)}
          >
            <div className="absolute -top-6 -left-2 text-white text-xs font-bold bg-black/50 px-1 rounded">
              {markup.number}
            </div>
          </div>
        );

      case 'text':
        return (
          <div
            key={markup.id}
            style={{
              ...baseStyle,
              padding: '4px 8px',
              backgroundColor: getStatusColor(),
              color: 'white',
              borderRadius: '4px',
              fontSize: `${markup.size || 14}px`,
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => handleMarkupClick(markup, e)}
          >
            {markup.number}
          </div>
        );

      default:
        return null;
    }
  };

  // 디버깅용 로그
  console.log('EnhancedMarkupCanvas - version:', version);
  console.log('EnhancedMarkupCanvas - version.files:', version.files);
  
  const primaryFile = version.files.find(f => f.is_primary) || version.files[0];
  
  console.log('EnhancedMarkupCanvas - primaryFile:', primaryFile);
  
  if (!primaryFile) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📁</div>
        <p className="text-base-content/60">표시할 이미지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 도구 모음 */}
      {!readonly && userRole === 'client' && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center space-x-2">
                <span>🛠️</span>
                <span>마크업 도구</span>
              </h4>
              <div className="text-sm text-base-content/60">
                클릭하여 피드백 위치 지정
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {MARKUP_TOOLS.map((tool) => (
                <button
                  key={tool.type}
                  className={`btn btn-sm ${
                    selectedTool === tool.type ? 'btn-primary' : 'btn-ghost'
                  }`}
                  onClick={() => setSelectedTool(tool.type)}
                  title={tool.description}
                >
                  <span className="mr-1">{tool.icon}</span>
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 이미지 캔버스 */}
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">시안 미리보기</h4>
                <div className="flex items-center space-x-2">
                  <div className="badge badge-primary">{markups.length}개 마크업</div>
                  <div className="badge badge-info">{feedbacks.length}개 피드백</div>
                </div>
              </div>
              
              <div
                ref={canvasRef}
                className="relative bg-gray-50 rounded-lg overflow-hidden cursor-crosshair"
                onClick={handleCanvasClick}
                style={{ minHeight: '400px' }}
              >
                <img
                  ref={imageRef}
                  src={primaryFile.file_url || '/markdown_test.png'}
                  alt={version.title || `시안 v${version.version_number}`}
                  className="w-full h-auto max-h-[600px] object-contain"
                  onError={(e) => {
                    console.log('이미지 로딩 실패:', primaryFile.file_url);
                    e.currentTarget.src = '/markdown_test.png';
                  }}
                />
                
                {/* 마크업들 렌더링 */}
                {markups.map(renderMarkup)}
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          {/* 마크업 목록 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">마크업 목록</h4>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowMarkupList(!showMarkupList)}
                >
                  {showMarkupList ? '접기' : '펼치기'}
                </button>
              </div>
              
              {showMarkupList && (
                <div className={`space-y-2 ${
                  markups.length > 8 
                    ? 'max-h-96 overflow-y-auto scrollbar-hide' 
                    : ''
                }`}>
                  {markups.length === 0 ? (
                    <p className="text-sm text-base-content/60 text-center py-4">
                      마크업이 없습니다
                    </p>
                  ) : (
                    markups.map((markup) => {
                      const feedback = feedbacks.find(f => f.id === markup.feedback_id);
                      const tool = MARKUP_TOOLS.find(t => t.type === markup.type);
                      const isExpanded = selectedMarkup?.id === markup.id;
                      
                      return (
                        <div
                          key={markup.id}
                          className={`rounded border transition-all duration-200 ${
                            isExpanded
                              ? 'border-primary bg-primary/5'
                              : 'border-base-300 hover:border-base-400'
                          }`}
                        >
                          {/* 마크업 헤더 */}
                          <div
                            className="p-2 cursor-pointer"
                            onClick={() => setSelectedMarkup(isExpanded ? null : markup)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span>{tool?.icon}</span>
                                <span className="font-medium text-sm">#{markup.number}</span>
                                {feedback && (
                                  <div className={`badge badge-xs ${
                                    feedback.status === 'resolved' ? 'badge-success' :
                                    feedback.status === 'in_progress' ? 'badge-warning' :
                                    feedback.status === 'rejected' ? 'badge-error' :
                                    'badge-neutral'
                                  }`}>
                                    {feedback.status === 'resolved' ? '✓' :
                                     feedback.status === 'in_progress' ? '⏳' :
                                     feedback.status === 'rejected' ? '❌' : '📋'}
                                  </div>
                                )}
                                {feedback && (
                                  <span className="text-xs text-base-content/60 truncate max-w-[120px]">
                                    {feedback.title}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <span className={`text-xs transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}>
                                  ▼
                                </span>
                                {!readonly && (
                                  <button
                                    className="btn btn-ghost btn-xs text-error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkupDelete(markup);
                                    }}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* 펼쳐지는 피드백 상세 영역 */}
                          {isExpanded && feedback && (
                            <div className="px-2 pb-3 border-t border-base-200 bg-base-50">
                              <div className="pt-3 space-y-3">
                                <div>
                                  <h5 className="font-medium text-sm text-primary">{feedback.title}</h5>
                                  {feedback.description && (
                                    <p className="text-sm text-base-content/70 mt-1">
                                      {feedback.description}
                                    </p>
                                  )}
                                                              {feedback.additionalText && (
                              <p className="text-sm text-base-content/60 mt-2 p-2 bg-base-200 rounded">
                                💡 {feedback.additionalText}
                              </p>
                            )}
                            {feedback.referenceUrls && feedback.referenceUrls.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-base-content/70 mb-1">레퍼런스 링크:</p>
                                <div className="space-y-1">
                                  {feedback.referenceUrls.map((url, index) => (
                                    <a
                                      key={index}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline block truncate"
                                    >
                                      🔗 {url}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                                </div>
                                
                                <div className="flex items-center space-x-2 text-xs">
                                  <div className={`badge badge-xs ${
                                    feedback.priority === 'high' ? 'badge-error' :
                                    feedback.priority === 'medium' ? 'badge-warning' :
                                    'badge-success'
                                  }`}>
                                    {feedback.priority}
                                  </div>
                                  <div className="badge badge-xs badge-neutral">
                                    {FEEDBACK_CATEGORIES.find(c => c.value === feedback.category)?.label}
                                  </div>
                                </div>
                                
                                {!readonly && userRole === 'designer' && (
                                  <div className="flex space-x-1 pt-2">
                                    {feedback.status !== 'resolved' && (
                                      <button
                                        className="btn btn-success btn-xs"
                                        onClick={() => handleFeedbackStatusUpdate(feedback, 'resolved')}
                                      >
                                        해결완료
                                      </button>
                                    )}
                                    {feedback.status === 'pending' && (
                                      <button
                                        className="btn btn-warning btn-xs"
                                        onClick={() => handleFeedbackStatusUpdate(feedback, 'in_progress')}
                                      >
                                        진행중
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* 피드백이 없는 경우 */}
                          {isExpanded && !feedback && (
                            <div className="px-2 pb-3 border-t border-base-200 bg-base-50">
                              <div className="pt-3 text-center">
                                <p className="text-sm text-base-content/60">
                                  연결된 피드백이 없습니다.
                                </p>
                                {!readonly && userRole === 'client' && (
                                  <button
                                    className="btn btn-primary btn-xs mt-2"
                                    onClick={() => setShowFeedbackForm(true)}
                                  >
                                    피드백 작성하기
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 독립적인 수정 체크리스트 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">수정 체크리스트</h4>
                <div className="badge badge-primary badge-sm">
                  {checklistItems.filter(item => item.isCompleted).length}/{checklistItems.length}
                </div>
              </div>
              
              <div className="space-y-4">
                {/* 새 체크리스트 항목 추가 버튼 */}
                {!readonly && (
                  <button
                    className="btn btn-primary btn-sm w-full"
                    onClick={() => setShowChecklistForm(true)}
                  >
                    ➕ 새 수정사항 추가
                  </button>
                )}
                
                {/* 체크리스트 항목들 */}
                <div className="space-y-2">
                  {checklistItems.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-sm text-base-content/60">수정 체크리스트가 비어있습니다</p>
                      <p className="text-xs text-base-content/40 mt-1">
                        마크업을 추가하거나 직접 항목을 작성해보세요
                      </p>
                    </div>
                  ) : (
                    checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded border transition-colors ${
                          item.isCompleted 
                            ? 'bg-success/10 border-success/30' 
                            : 'bg-base-200/50 border-base-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm mt-0.5"
                          checked={item.isCompleted}
                          disabled={readonly}
                          onChange={() => {
                            toggleChecklistItem(item.id);
                            // 마크업 피드백과 연결된 항목이면 피드백 상태도 업데이트
                            if (item.type === 'markup' && item.markupFeedbackId) {
                              const feedback = feedbacks.find(f => f.id === item.markupFeedbackId);
                              if (feedback) {
                                handleFeedbackStatusUpdate(feedback, item.isCompleted ? 'pending' : 'resolved');
                              }
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${item.isCompleted ? 'line-through text-base-content/60' : ''}`}>
                            {item.content}
                          </p>
                          {item.description && (
                            <p className={`text-xs text-base-content/50 mt-1 ${item.isCompleted ? 'line-through' : ''}`}>
                              {item.description}
                            </p>
                          )}
                          {item.referenceUrls && item.referenceUrls.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-base-content/70 mb-1">레퍼런스 링크:</p>
                              <div className="space-y-1">
                                {item.referenceUrls.map((url, index) => (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline block truncate"
                                  >
                                    🔗 {url}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`badge badge-xs ${
                              item.type === 'markup' ? 'badge-info' : 'badge-neutral'
                            }`}>
                              {item.type === 'markup' ? '🎯 마크업' : '📝 일반'}
                            </span>
                            <select
                              className="select select-xs w-auto"
                              value={item.priority}
                              disabled={readonly}
                              onChange={(e) => updateChecklistItemPriority(item.id, e.target.value as ChecklistItem['priority'])}
                            >
                              <option value="low">낮음</option>
                              <option value="medium">보통</option>
                              <option value="high">높음</option>
                            </select>
                            <span className={`badge badge-xs ${
                              item.priority === 'high' ? 'badge-error' :
                              item.priority === 'medium' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {item.priority === 'high' ? '높음' : 
                               item.priority === 'medium' ? '보통' : '낮음'}
                            </span>
                            {item.type === 'markup' && (
                              <span className="text-xs text-base-content/50">
                                마크업 #{markups.find(m => m.feedback_id === item.markupFeedbackId)?.number}
                              </span>
                            )}
                            {item.referenceUrls && item.referenceUrls.length > 0 && (
                              <span className="text-xs text-base-content/50">
                                🔗 {item.referenceUrls.length}개 레퍼런스
                              </span>
                            )}
                          </div>
                        </div>
                        {!readonly && item.type === 'general' && (
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => removeChecklistItem(item.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {/* 완료 상태 표시 */}
                {checklistItems.length > 0 && checklistItems.every(item => item.isCompleted) && (
                  <div className="alert alert-success">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎉</span>
                      <div>
                        <p className="font-medium">모든 수정사항이 완료되었습니다!</p>
                        <p className="text-xs opacity-70">클라이언트에게 검토 요청을 보낼 수 있습니다.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 피드백 작성/편집 모달 */}
      {showFeedbackForm && selectedMarkup && !readonly && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              마크업 #{selectedMarkup.number} 피드백 {
                selectedMarkup.feedback_id ? '편집' : '작성'
              }
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <input
                  type="text"
                  placeholder="피드백 제목을 입력하세요"
                  className="input input-bordered w-full"
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">상세 설명</label>
                <textarea
                  placeholder="구체적인 수정 요청사항을 입력하세요"
                  className="textarea textarea-bordered h-24 w-full"
                  value={feedbackForm.description}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">추가 메모</label>
                <input
                  type="text"
                  placeholder="참고사항이나 보충 설명을 입력하세요"
                  className="input input-bordered w-full"
                  value={feedbackForm.additionalText}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, additionalText: e.target.value }))}
                />
              </div>
              
              {/* 레퍼런스 URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  레퍼런스 URL
                  <span className="text-xs text-base-content/60 ml-2">(참고할 디자인이나 예시 링크)</span>
                </label>
                <div className="space-y-2">
                  {feedbackForm.referenceUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com"
                        className="input input-bordered input-sm flex-1"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...feedbackForm.referenceUrls];
                          newUrls[index] = e.target.value;
                          setFeedbackForm(prev => ({ ...prev, referenceUrls: newUrls }));
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => {
                          const newUrls = feedbackForm.referenceUrls.filter((_, i) => i !== index);
                          setFeedbackForm(prev => ({ ...prev, referenceUrls: newUrls }));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-primary"
                    onClick={() => {
                      setFeedbackForm(prev => ({ ...prev, referenceUrls: [...prev.referenceUrls, ''] }));
                    }}
                  >
                    + URL 추가
                  </button>
                </div>
              </div>
              
              {/* 레퍼런스 파일 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  레퍼런스 파일
                  <span className="text-xs text-base-content/60 ml-2">(이미지, PDF 등)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    className="file-input file-input-bordered file-input-sm w-full"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setFeedbackForm(prev => ({ 
                          ...prev, 
                          referenceFiles: [...prev.referenceFiles, ...newFiles] 
                        }));
                      }
                    }}
                  />
                  {feedbackForm.referenceFiles.length > 0 && (
                    <div className="space-y-1">
                      {feedbackForm.referenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-base-200 p-2 rounded">
                          <span className="flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-base-content/60">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => {
                              const newFiles = feedbackForm.referenceFiles.filter((_, i) => i !== index);
                              setFeedbackForm(prev => ({ ...prev, referenceFiles: newFiles }));
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">카테고리</label>
                  <select
                    className="select select-bordered w-full"
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, category: e.target.value as FeedbackCategory }))}
                  >
                    {FEEDBACK_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">우선순위</label>
                  <select
                    className="select select-bordered w-full"
                    value={feedbackForm.priority}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowFeedbackForm(false);
                  if (isDrawing) {
                    // 새로 생성된 마크업이라면 삭제
                    handleMarkupDelete(selectedMarkup);
                  }
                  setSelectedMarkup(null);
                  setIsDrawing(false);
                }}
              >
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={handleFeedbackSubmit}
                disabled={!feedbackForm.title.trim()}
              >
                {selectedMarkup.feedback_id ? '수정' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 체크리스트 항목 추가 모달 */}
      {showChecklistForm && !readonly && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">새 수정사항 추가</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <input
                  type="text"
                  placeholder="수정사항 제목을 입력하세요"
                  className="input input-bordered w-full"
                  value={checklistForm.content}
                  onChange={(e) => setChecklistForm(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">상세 설명</label>
                <textarea
                  placeholder="구체적인 수정 요청사항을 입력하세요"
                  className="textarea textarea-bordered h-24 w-full"
                  value={checklistForm.description}
                  onChange={(e) => setChecklistForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              {/* 레퍼런스 URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  레퍼런스 URL
                  <span className="text-xs text-base-content/60 ml-2">(참고할 디자인이나 예시 링크)</span>
                </label>
                <div className="space-y-2">
                  {checklistForm.referenceUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com"
                        className="input input-bordered input-sm flex-1"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...checklistForm.referenceUrls];
                          newUrls[index] = e.target.value;
                          setChecklistForm(prev => ({ ...prev, referenceUrls: newUrls }));
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => {
                          const newUrls = checklistForm.referenceUrls.filter((_, i) => i !== index);
                          setChecklistForm(prev => ({ ...prev, referenceUrls: newUrls }));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-primary"
                    onClick={() => {
                      setChecklistForm(prev => ({ ...prev, referenceUrls: [...prev.referenceUrls, ''] }));
                    }}
                  >
                    + URL 추가
                  </button>
                </div>
              </div>
              
              {/* 레퍼런스 파일 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  레퍼런스 파일
                  <span className="text-xs text-base-content/60 ml-2">(이미지, PDF 등)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    className="file-input file-input-bordered file-input-sm w-full"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setChecklistForm(prev => ({ 
                          ...prev, 
                          referenceFiles: [...prev.referenceFiles, ...newFiles] 
                        }));
                      }
                    }}
                  />
                  {checklistForm.referenceFiles.length > 0 && (
                    <div className="space-y-1">
                      {checklistForm.referenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-base-200 p-2 rounded">
                          <span className="flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-base-content/60">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => {
                              const newFiles = checklistForm.referenceFiles.filter((_, i) => i !== index);
                              setChecklistForm(prev => ({ ...prev, referenceFiles: newFiles }));
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">카테고리</label>
                  <select className="select select-bordered w-full" disabled>
                    <option value="general">일반 수정사항</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">우선순위</label>
                  <select
                    className="select select-bordered w-full"
                    value={checklistForm.priority}
                    onChange={(e) => setChecklistForm(prev => ({ ...prev, priority: e.target.value as ChecklistItem['priority'] }))}
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowChecklistForm(false);
                  setChecklistForm({ 
                    content: '', 
                    priority: 'medium', 
                    description: '', 
                    referenceUrls: [], 
                    referenceFiles: [] 
                  });
                }}
              >
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={addChecklistItem}
                disabled={!checklistForm.content.trim()}
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}