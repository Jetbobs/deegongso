"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { MarkupManager, MARKUP_TOOLS, FEEDBACK_CATEGORIES } from '@/lib/markupManager';
import { ImageMarkup, MarkupFeedback, MarkupType, FeedbackCategory, DesignVersion, UserRole, ChecklistItem, SubmittedModificationRequestData, Feedback } from '@/types';
import MarkupComments from './MarkupComments';

interface EnhancedMarkupCanvasProps {
  version: DesignVersion;
  projectId: string;
  userRole: UserRole;
  currentUserId: string;
  generalFeedbacks?: Feedback[]; // 일반 피드백 목록
  onFeedbackCreate?: (feedback: MarkupFeedback) => void;
  onFeedbackUpdate?: (feedback: MarkupFeedback | Feedback) => void;
  onMarkupDelete?: (markup: ImageMarkup) => void;
  readonly?: boolean;
  onChecklistUpdate?: (checklistItems: ChecklistItem[]) => void;
  onMarkupsUpdate?: (markups: ImageMarkup[]) => void;
  onMarkupFeedbacksUpdate?: (feedbacks: MarkupFeedback[]) => void;
  onRevisionUpdate?: (revisionNumber: number) => void;
  onRemainingRevisionsUpdate?: (remaining: number) => void;
  onSubmitModificationRequest?: (requestData: SubmittedModificationRequestData) => void; // 제출된 수정요청으로 데이터 전달
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
  readonly = false,
  onChecklistUpdate,
  onMarkupsUpdate,
  onMarkupFeedbacksUpdate,
  onRevisionUpdate,
  onRemainingRevisionsUpdate,
  onSubmitModificationRequest
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
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [checklistForm, setChecklistForm] = useState({
    content: '',
    priority: 'medium' as ChecklistItem['priority'],
    description: '',
    referenceUrls: [] as string[],
    referenceFiles: [] as File[]
  });
  const [currentRevisionNumber, setCurrentRevisionNumber] = useState(1);
  const [totalRevisions] = useState(3); // 프로젝트 생성 시 설정된 수정 횟수
  const [remainingRevisions, setRemainingRevisions] = useState(2); // 남은 수정 횟수 (첫 제출로 1회 차감된 상태)
  const [isFirstSubmission, setIsFirstSubmission] = useState(true); // 첫 제출 여부
  
  // 아코디언 상태 관리
  const [expandedMarkups, setExpandedMarkups] = useState<Set<string>>(new Set());
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Set<string>>(new Set());
  
  // 아코디언 토글 함수
  const toggleMarkupExpansion = (markupId: string) => {
    setExpandedMarkups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(markupId)) {
        newSet.delete(markupId);
      } else {
        newSet.add(markupId);
      }
      return newSet;
    });
  };
  
  const toggleFeedbackExpansion = (feedbackId: string) => {
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
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 마크업 및 피드백 로드
  useEffect(() => {
    const loadMarkupsAndFeedbacks = () => {
      const versionMarkups = MarkupManager.getVersionMarkups(version.id);
      const versionFeedbacks = MarkupManager.getVersionMarkupFeedbacks(version.id);
      
      // 테스트용 마크업이 없으면 하나 생성 (개발 시에만)
      if (versionMarkups.length === 0 && process.env.NODE_ENV === 'development') {
        console.log('테스트용 마크업 생성 중...');
        const testMarkup = MarkupManager.createMarkup(
          version.id,
          25,
          30,
          'point',
          currentUserId || 'test-user'
        );
        console.log('테스트 마크업 생성됨:', testMarkup);
        
        // 새로 생성된 마크업 포함하여 다시 로드
        const updatedMarkups = MarkupManager.getVersionMarkups(version.id);
        setMarkups(updatedMarkups);
      } else {
      setMarkups(versionMarkups);
      }
      
      setFeedbacks(versionFeedbacks);
    };

    loadMarkupsAndFeedbacks();
  }, [version.id, currentUserId]);

  // 상태 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    onChecklistUpdate?.(checklistItems);
  }, [checklistItems, onChecklistUpdate]);

  useEffect(() => {
    onMarkupsUpdate?.(markups);
  }, [markups, onMarkupsUpdate]);

  useEffect(() => {
    onMarkupFeedbacksUpdate?.(feedbacks);
  }, [feedbacks, onMarkupFeedbacksUpdate]);

  useEffect(() => {
    onRevisionUpdate?.(currentRevisionNumber);
  }, [currentRevisionNumber, onRevisionUpdate]);

  useEffect(() => {
    onRemainingRevisionsUpdate?.(remainingRevisions);
  }, [remainingRevisions, onRemainingRevisionsUpdate]);

  // 댓글 변경 후 마크업 데이터 리로드
  const handleCommentChange = useCallback(() => {
    const loadMarkupsAndFeedbacks = () => {
      const versionMarkups = MarkupManager.getVersionMarkups(version.id);
      const versionFeedbacks = MarkupManager.getVersionMarkupFeedbacks(version.id);
      
      setMarkups(versionMarkups);
      setFeedbacks(versionFeedbacks);
    };

    loadMarkupsAndFeedbacks();
  }, [version.id]);

  // 검토 승인 시 새로운 차수의 체크리스트 생성
  const handleApprovalAndCreateNewRevision = () => {
    // 현재 체크리스트의 완료된 항목들을 기반으로 새로운 차수 생성
    const pendingItems = checklistItems.filter(item => !item.completed && !item.isRevisionHeader);
    
    if (pendingItems.length > 0) {
      alert('아직 완료되지 않은 체크리스트 항목이 있습니다. 모든 항목을 완료한 후 승인해주세요.');
      return;
    }

    // 남은 수정 횟수 확인
    if (remainingRevisions <= 0) {
      alert('남은 수정 횟수가 없습니다. 추가 수정이 필요한 경우 수정 횟수를 추가 구매해주세요.');
      return;
    }

    const nextRevisionNumber = currentRevisionNumber + 1;
    
    // 현재 차수의 모든 항목을 완료 상태로 변경 (히스토리 보존)
    const completedChecklistItems = checklistItems.map(item => ({
      ...item,
      completed: true,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      revisionNumber: item.revisionNumber || currentRevisionNumber, // 차수 정보 저장
      isArchived: true, // 아카이브 상태로 설정하여 종합 검토 리스트에서 제거
      archivedAt: new Date().toISOString()
    }));
    
    // 새로운 차수의 체크리스트 헤더 생성
    const newRevisionHeader: ChecklistItem = {
      id: `revision-${nextRevisionNumber}-header`,
      content: `${nextRevisionNumber}회차 수정 요청사항`,
      priority: 'high',
      completed: false,
      isCompleted: false,
      type: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: `${currentRevisionNumber}회차 검토 완료 후 새로운 수정사항 (남은 횟수: ${remainingRevisions - 1}회)`,
      isRevisionHeader: true,
      revisionNumber: nextRevisionNumber
    };

    // 디버깅 로그
    console.log('🔍 handleApprovalAndCreateNewRevision 디버깅:');
    console.log('- markups:', markups);
    console.log('- feedbacks:', feedbacks);
    console.log('- generalFeedbacks:', generalFeedbacks);
    console.log('- checklistItems:', checklistItems);
    
    // 체크리스트 업데이트: 기존 항목들은 아카이브 처리하고, 새로운 차수 헤더만 추가
    // (기존 항목들은 제출된 수정요청으로 이동되므로 체크리스트에 다시 추가하지 않음)
    setChecklistItems([newRevisionHeader]);
    setCurrentRevisionNumber(nextRevisionNumber);
    setRemainingRevisions(remainingRevisions - 1);
    
    // 댓글 데이터를 포함한 상세 정보 수집 (아카이브되지 않은 항목들만)
    const activeMarkups = markups.filter(m => !(m as any).isArchived);
    const activeGeneralFeedbacks = generalFeedbacks.filter(f => !(f as any).isArchived);
    const activeChecklistItems = checklistItems.filter(item => !item.isRevisionHeader && !(item as any).isArchived);
    
    const enrichedMarkups = activeMarkups.map((markup) => {
      const feedback = feedbacks.find(f => f.id === markup.feedback_id);
      
      // 댓글 데이터 수집 (MarkupManager에서 또는 기존 데이터에서)
      let comments = [];
      try {
        comments = (MarkupManager as any).getMarkupComments?.(markup.id) || [];
        
        // 댓글이 없고 comment_count가 있으면 임시 댓글 데이터 생성
        if (comments.length === 0 && markup.comment_count && markup.comment_count > 0) {
          comments = Array.from({ length: markup.comment_count }, (_, index) => ({
            id: `temp-${markup.id}-${index}`,
            content: `마크업 #${markup.number}에 대한 댓글 ${index + 1}`,
            author: index % 2 === 0 ? '클라이언트' : '디자이너',
            createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
            isResolved: index < (markup.comment_count || 1) - 1,
            markupId: markup.id
          }));
        }
      } catch (error) {
        console.warn('댓글 데이터 로딩 실패:', error);
        
        // 오류 발생 시 comment_count 기반 임시 데이터라도 생성
        if (markup.comment_count && markup.comment_count > 0) {
          comments = Array.from({ length: markup.comment_count }, (_, index) => ({
            id: `fallback-${markup.id}-${index}`,
            content: `댓글 내용 ${index + 1}`,
            author: '사용자',
            createdAt: new Date().toISOString(),
            isResolved: false,
            markupId: markup.id
          }));
        }
      }
      
      return {
        id: markup.id,
        type: 'markup',
        markupNumber: markup.number,
        markupType: markup.type,
        position: { x: markup.x, y: markup.y },
        title: feedback?.title || `마크업 #${markup.number}`,
        description: feedback?.description || '',
        additionalText: feedback?.additionalText || '',
        category: feedback?.category || 'general',
        priority: feedback?.priority || 'medium',
        status: feedback?.status || 'pending',
        createdAt: markup.created_at || new Date().toISOString(),
        updatedAt: (feedback as any)?.updated_at || new Date().toISOString(),
        comments: comments,
        commentCount: comments?.length || markup.comment_count || 0,
        hasUnresolvedComments: comments?.some((c: { isResolved?: boolean }) => !c.isResolved) || markup.has_unresolved_comments || false,
        referenceUrls: feedback?.referenceUrls || [],
        markup: markup,
        feedback: feedback
      };
    });

    const enrichedGeneralFeedbacks = activeGeneralFeedbacks.map((feedback) => {
      // 댓글 데이터 수집
      let comments = [];
      try {
        comments = (MarkupManager as any).getMarkupComments?.(feedback.id) || [];
        
        // 댓글이 없고 comment_count가 있으면 임시 댓글 데이터 생성
        if (comments.length === 0 && feedback.comment_count && feedback.comment_count > 0) {
          comments = Array.from({ length: feedback.comment_count }, (_, index) => ({
            id: `temp-feedback-${feedback.id}-${index}`,
            content: `일반 피드백에 대한 댓글 ${index + 1}`,
            author: index % 2 === 0 ? '클라이언트' : '디자이너',
            createdAt: new Date(Date.now() - (index * 12 * 60 * 60 * 1000)).toISOString(),
            isResolved: Math.random() > 0.5,
            feedbackId: feedback.id
          }));
        }
      } catch (error) {
        console.warn('일반 피드백 댓글 데이터 로딩 실패:', error);
        
        // 오류 발생 시도 임시 데이터 생성
        if (feedback.comment_count && feedback.comment_count > 0) {
          comments = Array.from({ length: feedback.comment_count }, (_, index) => ({
            id: `fallback-feedback-${feedback.id}-${index}`,
            content: `피드백 댓글 ${index + 1}`,
            author: '사용자',
            createdAt: new Date().toISOString(),
            isResolved: false,
            feedbackId: feedback.id
          }));
        }
      }
      
      return {
        id: feedback.id,
        type: 'general_feedback',
        title: feedback.title || feedback.content,
        description: feedback.content_html || feedback.content,
        category: feedback.category || 'general',
        priority: feedback.priority || 'medium',
        status: feedback.status || 'pending',
        createdAt: feedback.submitted_at || feedback.created_at,
        updatedAt: (feedback as any).updated_at || new Date().toISOString(),
        comments: comments,
        commentCount: comments?.length || 0,
        hasUnresolvedComments: comments?.some((c: { isResolved?: boolean }) => !c.isResolved) || false,
        originalFeedback: feedback
      };
    });

    // 체크리스트 항목도 상세 정보와 함께 수집
    const enrichedChecklistItems = activeChecklistItems.map((item) => {
        return {
          id: item.id,
          type: 'checklist_item',
          title: item.content,
          description: item.description || '',
          priority: item.priority,
          status: item.completed || item.isCompleted ? 'completed' : 'pending',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          referenceUrls: item.referenceUrls || [],
          markupFeedbackId: item.markupFeedbackId,
          generalFeedbackId: item.generalFeedbackId,
          markupId: item.markupId,
          originalItem: item
        };
      });

    // 제출된 수정요청 데이터 생성 (댓글 포함한 완전한 정보)
    const totalItems = enrichedMarkups.length + enrichedGeneralFeedbacks.length + enrichedChecklistItems.length;
    const submittedRequestData: SubmittedModificationRequestData = {
      id: `modification-request-${Date.now()}`,
      revisionNumber: currentRevisionNumber,
      submittedAt: new Date().toISOString(),
      status: 'approved',
      title: `${currentRevisionNumber}차 수정요청`,
      description: `마크업 피드백 ${feedbacks.length}개 및 수정 체크리스트 ${checklistItems.filter(item => !item.isRevisionHeader).length}개 항목`,
      approvedAt: new Date().toISOString(),
      
      // 상세 항목들 (아카이브되지 않은 실제 데이터)
      items: {
        markupFeedbacks: enrichedMarkups.map(em => em.feedback).filter(f => f != null), // 실제 마크업 피드백
        generalFeedbacks: enrichedGeneralFeedbacks.map(eg => eg.originalFeedback).filter(f => f != null), // 실제 일반 피드백
        checklistItems: enrichedChecklistItems.map(ec => ec.originalItem).filter(item => item != null) // 실제 체크리스트 항목
      },
      
      // 필수 통계 정보
      totalItems: totalItems,
      approvedItems: totalItems, // 모든 항목이 승인됨
      rejectedItems: 0,
      pendingItems: 0
    };

    // 제출된 수정요청으로 데이터 전달
    if (onSubmitModificationRequest) {
      console.log('🔍 제출할 데이터 디버깅:', {
        totalItems,
        activeMarkupsLength: activeMarkups.length,
        activeGeneralFeedbacksLength: activeGeneralFeedbacks.length,
        activeChecklistItemsLength: activeChecklistItems.length,
        enrichedMarkupsLength: enrichedMarkups.length,
        enrichedGeneralFeedbacksLength: enrichedGeneralFeedbacks.length,
        enrichedChecklistItemsLength: enrichedChecklistItems.length,
        submittedRequestData: {
          id: submittedRequestData.id,
          title: submittedRequestData.title,
          description: submittedRequestData.description,
          items: {
            markupFeedbacksLength: submittedRequestData.items.markupFeedbacks.length,
            generalFeedbacksLength: submittedRequestData.items.generalFeedbacks.length,
            checklistItemsLength: submittedRequestData.items.checklistItems.length
          },
          totalItems: submittedRequestData.totalItems
        }
      });
      onSubmitModificationRequest(submittedRequestData);
    }

    // 종합 검토 리스트 초기화 (현재 피드백과 마크업을 히스토리로 이동)
    // 마크업과 피드백을 히스토리 상태로 변경하여 종합 검토 리스트에서 제거
    const archivedMarkups = markups.map(markup => ({
      ...markup,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      revisionNumber: currentRevisionNumber
    }));
    
    const archivedFeedbacks = feedbacks.map(feedback => ({
      ...feedback,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      revisionNumber: currentRevisionNumber
    }));
    
    // 일반 피드백도 아카이브 상태로 설정
    const archivedGeneralFeedbacks = generalFeedbacks.map(feedback => ({
      ...feedback,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      revisionNumber: currentRevisionNumber
    }));
    
    // 마크업, 피드백, 체크리스트를 아카이브 상태로 설정 (실제로는 localStorage나 서버에 저장)
    MarkupManager.archiveVersionData(version.id, currentRevisionNumber, {
      markups: archivedMarkups,
      feedbacks: archivedFeedbacks,
      generalFeedbacks: archivedGeneralFeedbacks,
      checklistItems: completedChecklistItems // 완료된 체크리스트도 히스토리에 저장
    } as any);
    
    // 현재 활성 마크업과 피드백 초기화 (새로운 차수를 위해)
    setMarkups([]);
    setFeedbacks([]);
    
    // 일반 피드백도 아카이브된 상태로 업데이트 (부모 컴포넌트에 알림)
    if (onFeedbackUpdate) {
      archivedGeneralFeedbacks.forEach(feedback => {
        onFeedbackUpdate(feedback);
      });
    }
    
    console.log(`검토 승인 완료: ${currentRevisionNumber}회차 → ${nextRevisionNumber}회차 수정 단계로 진행`);
    console.log(`수정 횟수 차감: ${remainingRevisions} → ${remainingRevisions - 1}회 남음`);
    console.log('이전 차수 데이터 아카이브 완료');
    
    alert(`${currentRevisionNumber}회차 검토가 승인되었습니다.\n\n📤 제출된 수정요청 생성 완료:\n• 마크업 피드백: ${feedbacks.length}개\n• 일반 피드백: ${generalFeedbacks.length}개\n• 체크리스트: ${checklistItems.filter(item => !item.isRevisionHeader).length}개\n• 총 항목: ${totalItems}개\n\n✅ 제출된 수정요청 탭에서 상세 내용을 확인할 수 있습니다.\n📋 ${nextRevisionNumber}회차 수정 요청사항을 새로 추가할 수 있습니다.\n\n남은 수정 횟수: ${remainingRevisions - 1}회`);
    
    console.log('📤 제출된 수정요청으로 데이터 전달 완료:');
    console.log('📋 상세 데이터:', submittedRequestData.items);
    console.log('💬 제출된 요청 데이터:', submittedRequestData);
  };

  // 캔버스 클릭 처리 (클라이언트만)
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (readonly || userRole !== 'client' || !canvasRef.current || !imageRef.current) return;

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
          completed: false,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          priority: newFeedback.priority,
          type: 'markup',
          markupFeedbackId: newFeedback.id
        };
        setChecklistItems(prev => {
          const newItems = [...prev, checklistItem];
          // 첫 제출 완료 표시
          if (isFirstSubmission) {
            setIsFirstSubmission(false);
            console.log(`1회차 수정 요청 시작 (이미 차감됨: ${totalRevisions - remainingRevisions}회 사용)`);
          }
          return newItems;
        });
        
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
      completed: false,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: checklistForm.priority,
      type: 'general' 
    };
    
        setChecklistItems(prev => {
      const newItems = [...prev, newItem];
      // 첫 제출 완료 표시
      if (isFirstSubmission && prev.length === 0) {
        setIsFirstSubmission(false);
        console.log(`1회차 수정 요청 시작 (이미 차감됨: ${totalRevisions - remainingRevisions}회 사용)`);
      }
      return newItems;
    });
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

  // 수정 요청 제출 함수
  const handleSubmitModificationRequest = async () => {
    if (markups.length === 0 && checklistItems.length === 0) {
      alert('마크업 피드백이나 수정사항이 없습니다. 최소 하나는 작성해주세요.');
      return;
    }

    // 확인 다이얼로그
    const confirmMessage = `📤 수정 요청을 제출하시겠습니까?\n\n` +
      `마크업 피드백: ${markups.length}개\n` +
      `수정 체크리스트: ${checklistItems.length}개\n\n` +
      `⚠️ 제출 시 수정 횟수가 즉시 차감됩니다.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // ModificationRequest 데이터 생성
      const requestData = {
        description: `마크업 피드백 ${markups.length}개 및 수정 체크리스트 ${checklistItems.length}개 항목`,
        feedback_ids: feedbacks.map(f => f.id),
        urgency: 'normal' ,
        notes: `프로젝트 ${projectId} 버전 ${version.id}에서 생성된 수정 요청`,
        checklist_items: checklistItems.map(item => ({
          content: item.content,
          description: item.description,
          priority: item.priority,
          type: item.type,
          markupFeedbackId: item.markupFeedbackId
        }))
      };

      // 실제로는 API 호출하여 서버에 저장 + 수정 횟수 차감
      console.log('🚀 수정 요청 제출:', requestData);
      
      // 성공 메시지
      alert('✅ 수정 요청이 성공적으로 제출되었습니다!\n디자이너에게 알림이 전송됩니다.');
      
      // onFeedbackCreate 콜백 호출 (상위 컴포넌트에 알림)
      // 실제로는 ModificationRequest 객체를 생성하여 전달
      
    } catch (error) {
      console.error('수정 요청 제출 실패:', error);
      alert('❌ 수정 요청 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 디자이너의 수정요청 승인 함수
  const handleApproveModificationRequest = async () => {
    const confirmMessage = `✅ 이 수정요청을 승인하시겠습니까?\n\n승인 후 작업을 시작하게 됩니다.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // 실제로는 API 호출하여 승인 처리
      console.log('✅ 수정 요청 승인됨');
      alert('✅ 수정 요청이 승인되었습니다!\n작업을 시작해주세요.');
      
      // TODO: 상태 업데이트 및 알림
      
    } catch (error) {
      console.error('수정 요청 승인 실패:', error);
      alert('❌ 승인 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 디자이너의 수정요청 거절 함수 (수정 횟수 복구 포함)
  const handleRejectModificationRequest = async () => {
    const reason = prompt('거절 사유를 입력해주세요:');
    if (!reason) return;

    const confirmMessage = `❌ 이 수정요청을 거절하시겠습니까?\n\n⚠️ 거절해도 수정 횟수는 복구되지 않습니다.\n\n거절 사유: ${reason}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // 실제로는 API 호출하여 거절 처리 (수정 횟수는 복구하지 않음)
      console.log('❌ 수정 요청 거절됨:', reason);
      
      alert('❌ 수정 요청이 거절되었습니다!\n클라이언트에게 알림이 전송됩니다.');
      
      // TODO: 
      // 1. 수정요청 상태를 'rejected'로 변경
      // 2. rejection_reason에 사유 저장  
      // 3. 클라이언트에게 거절 알림 전송 (수정 횟수는 복구하지 않음)
      
    } catch (error) {
      console.error('수정 요청 거절 실패:', error);
      alert('❌ 거절 처리에 실패했습니다. 다시 시도해주세요.');
    }
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
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
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
          {/* 마크업 목록 (클라이언트용) */}
          {userRole === 'client' && (
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
                                
                                {/* 댓글 표시 */}
                                <div className="flex items-center space-x-1 text-xs text-base-content/60">
                                  <span>💬</span>
                                  <span>{markup.comment_count || 0}</span>
                                  {markup.has_unresolved_comments && (
                                    <span className="badge badge-error badge-xs">미해결</span>
                                  )}
                                </div>
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
                                
                                {!readonly && (
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
                                
                                {/* 마크업 댓글 섹션 */}
                                <div className="mt-4 border-t border-base-200 pt-3">
                                  <MarkupComments 
                                    markupId={markup.id}
                                    onCommentCountChange={handleCommentChange}
                                    onResolveStatusChange={handleCommentChange}
                                    isDesigner={false}
                                    projectId={projectId}
                                  />
                                </div>
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
                                
                                {/* 피드백이 없는 마크업에도 댓글 기능 추가 */}
                                <div className="mt-4 border-t border-base-200 pt-3">
                                  <MarkupComments 
                                    markupId={markup.id}
                                    onCommentCountChange={handleCommentChange}
                                    onResolveStatusChange={handleCommentChange}
                                    isDesigner={false}
                                    projectId={projectId}
                                  />
                                </div>
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
          )}

          {/* 독립적인 수정 체크리스트 (클라이언트용) */}
          {userRole === 'client' && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">수정 체크리스트</h4>
                <div className="badge badge-primary badge-sm">
                  {checklistItems.filter(item => item.isCompleted).length}/{checklistItems.length}
                </div>
              </div>
              
              <div className="space-y-4">
                {/* 새 체크리스트 항목 추가 버튼 (클라이언트만) */}
                {!readonly && userRole === 'client' && (
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
                        className={`p-3 rounded border transition-colors ${
                          item.isCompleted 
                            ? 'bg-success/10 border-success/30' 
                            : 'bg-base-200/50 border-base-300'
                        }`}
                      >
                        {/* 체크리스트 항목 내용 */}
                        <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm mt-0.5"
                          checked={item.isCompleted}
                          disabled={readonly || userRole !== 'client'}
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
                              disabled={readonly || userRole !== 'client'}
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
                        {!readonly && userRole === 'client' && item.type === 'general' && (
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => removeChecklistItem(item.id)}
                          >
                            ✕
                          </button>
                        )}
                        </div>
                      
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



                {/* 수정 관련 액션 버튼 */}
                {!readonly && (markups.length > 0 || checklistItems.length > 0) && (
                  <div className="mt-6 p-4 bg-base-100 border border-base-300 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-base">
                          {userRole === 'client' ? '📤 수정 요청' : '👁️ 수정 검토'}
                        </h4>
                        <p className="text-sm text-base-content/60 mt-1">
                          {userRole === 'client' 
                            ? '작성한 마크업 피드백과 수정사항을 디자이너에게 전달합니다'
                            : '클라이언트가 요청한 수정사항을 검토하고 승인/거절하세요'
                          }
                        </p>
                      </div>
                    </div>

                    {/* 클라이언트용 제출 안내 */}
                    {userRole === 'client' && (
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="text-warning text-sm">⚠️</span>
                          <div className="text-sm">
                            <p className="font-medium">제출 시 수정 횟수가 즉시 차감됩니다</p>
                            <p className="text-base-content/60 text-xs mt-1">
                              디자이너가 거절할 경우 수정 횟수가 복구됩니다
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 디자이너용 종합 체크리스트 */}
                    {false && (
                      <div className="space-y-4 mb-4">
                        {/* 마크업 피드백 목록 */}
                        {markups.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-3 text-base">🎯 마크업 피드백 ({markups.length}개)</h5>
                            <div className="space-y-2">
                              {markups.map((markup) => {
                                const feedback = feedbacks.find(f => f.id === markup.feedback_id);
                                return (
                                  <div key={markup.id} className="flex items-start gap-3 p-3 bg-base-50 rounded border">
                                    <input type="checkbox" className="checkbox checkbox-sm mt-1" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">마크업 #{markup.number}</span>
                                        <span className="badge badge-info badge-sm">{markup.type}</span>
                                      </div>
                                      {feedback && (
                                        <div className="text-sm">
                                          <p className="font-medium">{feedback.title}</p>
                                          {feedback.description && (
                                            <p className="text-base-content/70 mt-1">{feedback.description}</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 체크리스트 항목들 */}
                        {checklistItems.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-3 text-base">📋 수정 체크리스트 ({checklistItems.length}개)</h5>
                            <div className="space-y-2">
                              {checklistItems.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 p-3 bg-base-50 rounded border">
                                  <input type="checkbox" className="checkbox checkbox-sm mt-1" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{item.content}</span>
                                      <span className={`badge badge-sm ${
                                        item.priority === 'high' ? 'badge-error' :
                                        item.priority === 'medium' ? 'badge-warning' :
                                        'badge-info'
                                      }`}>
                                        {item.priority === 'high' ? '높음' : 
                                         item.priority === 'medium' ? '보통' : '낮음'}
                                      </span>
                                    </div>
                                    {item.description && (
                                      <p className="text-sm text-base-content/70">{item.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 액션 버튼들 */}
                    <div className="flex gap-3">
                      {userRole === 'client' ? (
                        <button
                          onClick={handleSubmitModificationRequest}
                          className="btn btn-primary flex-1"
                          disabled={markups.length === 0 && checklistItems.length === 0}
                        >
                          🚀 수정 요청 제출하기
                        </button>
                      ) : (
                        <>
                          <button 
                            className="btn btn-success flex-1"
                            onClick={handleApproveModificationRequest}
                          >
                            ✅ 승인
                          </button>
                          <button 
                            className="btn btn-warning flex-1"
                            onClick={handleRejectModificationRequest}
                          >
                            💬 질문 및 역제안
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* 디자이너용 종합 검토 컨테이너 */}
          {(userRole as UserRole) === 'designer' && (
            generalFeedbacks.filter(f => !(f as any).isArchived).length > 0 || 
            markups.filter(m => !(m as any).isArchived).length > 0 || 
            checklistItems.filter(item => !item.completed && !item.isCompleted && !(item as any).isArchived).length > 0
          ) && (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">📋 종합 검토 리스트</h4>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-info badge-sm">
                      총 {
                        generalFeedbacks.filter(f => !(f as any).isArchived).length + 
                        markups.filter(m => !(m as any).isArchived).length + 
                        checklistItems.filter(item => !item.completed && !item.isCompleted && !(item as any).isArchived).length
                      }개 항목
                    </div>
                    <div className={`badge badge-sm ${remainingRevisions > 0 ? 'badge-success' : 'badge-error'}`}>
                      수정 {remainingRevisions}/{totalRevisions}회 남음
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* 일반 피드백 항목들 */}
                  {generalFeedbacks.filter(f => !(f as any).isArchived).length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-primary mb-3">💬 일반 피드백 ({generalFeedbacks.filter(f => !(f as any).isArchived).length}개)</h5>
                      <div className="space-y-2">
                        {generalFeedbacks.filter(f => !(f as any).isArchived).map((feedback) => {
                          const isExpanded = expandedFeedbacks.has(feedback.id);
                          
                          return (
                            <div key={feedback.id} className="bg-base-50 rounded border">
                              {/* 헤더 (항상 보임) */}
                              <div 
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-base-100 transition-colors"
                                onClick={() => toggleFeedbackExpansion(feedback.id)}
                              >
                                <input 
                                  type="checkbox" 
                                  className="checkbox checkbox-sm" 
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                  <span className="font-medium text-sm flex-shrink-0">피드백 #{feedback.id.split('-')[1]}</span>
                                  <span className="badge badge-info badge-xs flex-shrink-0">{feedback.category}</span>
                                  <span className="font-medium text-sm truncate flex-1 min-w-0">{feedback.content}</span>
                                </div>
                                <div className={`text-base-content/50 transition-transform duration-300 ease-in-out flex-shrink-0 w-4 h-4 flex items-center justify-center ${
                                  isExpanded ? 'rotate-90' : 'rotate-0'
                                }`}>
                                  ▶
                                </div>
                              </div>
                              
                              {/* 상세 내용 (접혔다 펼쳐짐) */}
                              <div 
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                  isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                }`}
                              >
                                <div className="px-3 pb-3 border-t border-base-200">
                                  <div className="mt-3">
                                    {feedback.content_html && (
                                      <div className="mb-3">
                                        <p className="text-sm text-base-content/80" 
                                           dangerouslySetInnerHTML={{ __html: feedback.content_html }} />
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className={`badge badge-sm ${
                                        feedback.priority === 'high' ? 'badge-error' :
                                        feedback.priority === 'medium' ? 'badge-warning' :
                                        'badge-success'
                                      }`}>
                                        {feedback.priority}
                                      </span>
                                      <span className="badge badge-sm badge-neutral">
                                        {feedback.category}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* 일반 피드백 댓글 섹션 */}
                                  <div className="border-t border-base-200 pt-3">
                                    <MarkupComments 
                                      markupId={feedback.id}
                                      onCommentCountChange={handleCommentChange}
                                      onResolveStatusChange={handleCommentChange}
                                      isDesigner={false}
                                      projectId={projectId}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 마크업 피드백 항목들 */}
                  {markups.filter(m => !(m as any).isArchived).length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-primary mb-3">🎯 마크업 피드백 ({markups.filter(m => !(m as any).isArchived).length}개)</h5>
                      <div className="space-y-2">
                        {markups.filter(m => !(m as any).isArchived).map((markup) => {
                          const feedback = feedbacks.find(f => f.id === markup.feedback_id);
                          const isExpanded = expandedMarkups.has(markup.id);
                          
                          return (
                            <div key={markup.id} className="bg-base-50 rounded border">
                              {/* 헤더 (항상 보임) */}
                              <div 
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-base-100 transition-colors"
                                onClick={() => toggleMarkupExpansion(markup.id)}
                              >
                                <input 
                                  type="checkbox" 
                                  className="checkbox checkbox-sm" 
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                  <span className="font-medium text-sm flex-shrink-0">마크업 #{markup.number}</span>
                                  <span className="badge badge-info badge-xs flex-shrink-0">{markup.type}</span>
                                  {feedback && (
                                    <span className="font-medium text-sm truncate flex-1 min-w-0">{feedback.title}</span>
                                  )}
                                </div>
                                <div className={`text-base-content/50 transition-transform duration-300 ease-in-out flex-shrink-0 w-4 h-4 flex items-center justify-center ${
                                  isExpanded ? 'rotate-90' : 'rotate-0'
                                }`}>
                                  ▶
                                </div>
                              </div>
                              
                              {/* 상세 내용 (접혔다 펼쳐짐) */}
                              <div 
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                  isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                }`}
                              >
                                <div className="px-3 pb-3 border-t border-base-200">
                                  {feedback && (
                                    <div className="mt-3">
                                      {feedback.description && (
                                        <div className="mb-3">
                                          <p className="text-sm text-base-content/80">{feedback.description}</p>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className={`badge badge-sm ${
                                          feedback.priority === 'high' ? 'badge-error' :
                                          feedback.priority === 'medium' ? 'badge-warning' :
                                          'badge-success'
                                        }`}>
                                          {feedback.priority}
                                        </span>
                                        <span className="badge badge-sm badge-neutral">
                                          {FEEDBACK_CATEGORIES.find(c => c.value === feedback.category)?.label}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* 마크업 댓글 섹션 */}
                                  <div className="border-t border-base-200 pt-3">
                                    <MarkupComments 
                                      markupId={markup.id}
                                      onCommentCountChange={handleCommentChange}
                                      onResolveStatusChange={handleCommentChange}
                                      isDesigner={false}
                                      projectId={projectId}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 체크리스트 항목들 */}
                  {checklistItems.filter(item => !item.completed && !item.isCompleted && !(item as any).isArchived).length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-primary mb-3">📝 수정 체크리스트 ({checklistItems.filter(item => !item.completed && !item.isCompleted && !(item as any).isArchived).length}개)</h5>
                      <div className="space-y-2">
                        {checklistItems.filter(item => (!item.completed && !item.isCompleted && !(item as any).isArchived) || item.isRevisionHeader).map((item) => (
                          <div key={item.id}>
                            {/* 차수 헤더인 경우 특별한 스타일 */}
                            {item.isRevisionHeader ? (
                              <div className="mb-4 mt-6 first:mt-0">
                                <div className="flex items-center gap-3 p-4 bg-primary/10 border-l-4 border-primary rounded">
                                  <div className="text-2xl">📋</div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-lg text-primary">{item.content}</h4>
                                    <p className="text-sm text-base-content/70 mt-1">{item.description}</p>
                                  </div>
                                  <div className="badge badge-primary">
                                    {item.revisionNumber}회차
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* 일반 체크리스트 아이템 */
                              <div className="flex items-start gap-3 p-3 bg-base-50 rounded border mb-2">
                                <input 
                                  type="checkbox" 
                                  className="checkbox checkbox-sm mt-1" 
                                  checked={item.completed || item.isCompleted}
                                  readOnly
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{item.content}</span>
                                    <span className={`badge badge-xs ${
                                      item.type === 'markup' ? 'badge-primary' : 'badge-secondary'
                                    }`}>
                                      {item.type === 'markup' ? '마크업' : '수동'}
                                    </span>
                                    <span className={`badge badge-xs ${
                                      item.priority === 'high' ? 'badge-error' :
                                      item.priority === 'medium' ? 'badge-warning' :
                                      'badge-info'
                                    }`}>
                                      {item.priority === 'high' ? '높음' : 
                                       item.priority === 'medium' ? '보통' : '낮음'}
                                    </span>
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-base-content/70">{item.description}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 종합 검토 완료 액션 버튼 */}
                <div className="mt-6 pt-4 border-t border-base-200">
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        console.log('🔴 검토 승인 버튼 클릭됨!');
                        handleApprovalAndCreateNewRevision();
                      }}
                    >
                      ✅ 검토 승인
                    </button>
                    <button 
                      className="btn btn-outline btn-warning"
                      onClick={() => {
                        // TODO: 재검토 요청 로직
                        console.log('재검토 요청');
                        alert('재검토 요청이 클라이언트에게 전송되었습니다.');
                      }}
                    >
                      🔄 재검토 요청
                    </button>
                  </div>
                  <p className="text-xs text-base-content/60 mt-2 text-right">
                    모든 피드백을 검토한 후 최종 결정을 내려주세요
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 피드백 작성/편집 모달 (클라이언트만) */}
      {showFeedbackForm && selectedMarkup && !readonly && userRole === 'client' && (
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
      {showChecklistForm && !readonly && userRole === 'client' && (
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