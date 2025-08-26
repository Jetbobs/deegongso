import { ImageMarkup, MarkupFeedback, MarkupType, FeedbackCategory } from "@/types";

/**
 * 이미지 마크업 관리를 위한 유틸리티 클래스
 */
export class MarkupManager {
  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 새로운 마크업을 생성합니다
   */
  static createMarkup(
    versionId: string,
    x: number,
    y: number,
    type: MarkupType,
    createdBy: string,
    options?: {
      color?: string;
      size?: number;
    }
  ): ImageMarkup {
    const existingMarkups = this.getVersionMarkups(versionId);
    const nextNumber = existingMarkups.length + 1;

    const markup: ImageMarkup = {
      id: this.generateId(),
      version_id: versionId,
      x: Math.round(x * 100) / 100, // 소수점 2자리까지
      y: Math.round(y * 100) / 100,
      type,
      number: nextNumber,
      created_at: new Date().toISOString(),
      created_by: createdBy,
      color: options?.color || this.getDefaultColor(type),
      size: options?.size || this.getDefaultSize(type),
    };

    this.saveMarkup(markup);
    return markup;
  }

  /**
   * 마크업에 연결된 피드백을 생성합니다
   */
  static createMarkupFeedback(
    markupId: string,
    versionId: string,
    projectId: string,
    title: string,
    description: string,
    additionalText: string,
    category: FeedbackCategory,
    priority: 'low' | 'medium' | 'high',
    createdBy: string
  ): MarkupFeedback {
    const feedback: MarkupFeedback = {
      id: this.generateId(),
      markup_id: markupId,
      version_id: versionId,
      project_id: projectId,
      title,
      description,
      additionalText,
      category,
      priority,
      status: 'pending',
      created_at: new Date().toISOString(),
      created_by: createdBy,
    };

    // 마크업에 피드백 ID 연결
    const markup = this.getMarkup(markupId);
    if (markup) {
      markup.feedback_id = feedback.id;
      this.saveMarkup(markup);
    }

    this.saveMarkupFeedback(feedback);
    return feedback;
  }

  /**
   * 버전의 모든 마크업을 가져옵니다
   */
  static getVersionMarkups(versionId: string): ImageMarkup[] {
    const stored = localStorage.getItem(`version_markups_${versionId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 특정 마크업을 가져옵니다
   */
  static getMarkup(markupId: string): ImageMarkup | null {
    const stored = localStorage.getItem(`markup_${markupId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * 마크업과 연결된 피드백을 가져옵니다
   */
  static getMarkupFeedback(feedbackId: string): MarkupFeedback | null {
    const stored = localStorage.getItem(`markup_feedback_${feedbackId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * 버전의 모든 마크업 피드백을 가져옵니다
   */
  static getVersionMarkupFeedbacks(versionId: string): MarkupFeedback[] {
    const markups = this.getVersionMarkups(versionId);
    const feedbacks: MarkupFeedback[] = [];

    markups.forEach(markup => {
      if (markup.feedback_id) {
        const feedback = this.getMarkupFeedback(markup.feedback_id);
        if (feedback) {
          feedbacks.push(feedback);
        }
      }
    });

    return feedbacks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  /**
   * 마크업을 업데이트합니다
   */
  static updateMarkup(markupId: string, updates: Partial<ImageMarkup>): ImageMarkup | null {
    const markup = this.getMarkup(markupId);
    if (!markup) return null;

    const updatedMarkup = { ...markup, ...updates };
    this.saveMarkup(updatedMarkup);
    return updatedMarkup;
  }

  /**
   * 피드백을 업데이트합니다
   */
  static updateMarkupFeedback(feedbackId: string, updates: Partial<MarkupFeedback>): MarkupFeedback | null {
    const feedback = this.getMarkupFeedback(feedbackId);
    if (!feedback) return null;

    const updatedFeedback = { ...feedback, ...updates };
    
    // 상태가 resolved로 변경될 때 resolved_at 자동 설정
    if (updates.status === 'resolved' && !updatedFeedback.resolved_at) {
      updatedFeedback.resolved_at = new Date().toISOString();
    }

    this.saveMarkupFeedback(updatedFeedback);
    return updatedFeedback;
  }

  /**
   * 마크업을 삭제합니다
   */
  static deleteMarkup(markupId: string): boolean {
    const markup = this.getMarkup(markupId);
    if (!markup) return false;

    // 연결된 피드백도 함께 삭제
    if (markup.feedback_id) {
      this.deleteMarkupFeedback(markup.feedback_id);
    }

    // 마크업 삭제
    localStorage.removeItem(`markup_${markupId}`);
    
    // 버전 마크업 목록에서 제거
    const versionMarkups = this.getVersionMarkups(markup.version_id);
    const filteredMarkups = versionMarkups.filter(m => m.id !== markupId);
    
    // 번호 재정렬
    filteredMarkups.forEach((m, index) => {
      m.number = index + 1;
      this.saveMarkup(m);
    });

    this.saveVersionMarkups(markup.version_id, filteredMarkups);
    return true;
  }

  /**
   * 피드백을 삭제합니다
   */
  static deleteMarkupFeedback(feedbackId: string): boolean {
    const feedback = this.getMarkupFeedback(feedbackId);
    if (!feedback) return false;

    // 마크업에서 피드백 연결 해제
    const markup = this.getMarkup(feedback.markup_id);
    if (markup) {
      markup.feedback_id = undefined;
      this.saveMarkup(markup);
    }

    localStorage.removeItem(`markup_feedback_${feedbackId}`);
    return true;
  }

  /**
   * 마크업 타입별 기본 색상을 반환합니다
   */
  private static getDefaultColor(type: MarkupType): string {
    const colorMap: Record<MarkupType, string> = {
      point: '#ef4444', // red-500
      circle: '#f97316', // orange-500
      arrow: '#eab308', // yellow-500
      rectangle: '#22c55e', // green-500
      text: '#3b82f6', // blue-500
      freehand: '#8b5cf6', // violet-500
    };
    return colorMap[type];
  }

  /**
   * 마크업 타입별 기본 크기를 반환합니다
   */
  private static getDefaultSize(type: MarkupType): number {
    const sizeMap: Record<MarkupType, number> = {
      point: 12,
      circle: 20,
      arrow: 15,
      rectangle: 2,
      text: 14,
      freehand: 3,
    };
    return sizeMap[type];
  }

  /**
   * 마크업 통계를 가져옵니다
   */
  static getMarkupStats(versionId: string) {
    const markups = this.getVersionMarkups(versionId);
    const feedbacks = this.getVersionMarkupFeedbacks(versionId);

    return {
      total_markups: markups.length,
      total_feedbacks: feedbacks.length,
      pending_feedbacks: feedbacks.filter(f => f.status === 'pending').length,
      in_progress_feedbacks: feedbacks.filter(f => f.status === 'in_progress').length,
      resolved_feedbacks: feedbacks.filter(f => f.status === 'resolved').length,
      high_priority: feedbacks.filter(f => f.priority === 'high').length,
      medium_priority: feedbacks.filter(f => f.priority === 'medium').length,
      low_priority: feedbacks.filter(f => f.priority === 'low').length,
    };
  }

  // Private helper methods
  private static saveMarkup(markup: ImageMarkup): void {
    localStorage.setItem(`markup_${markup.id}`, JSON.stringify(markup));
    
    // 버전별 마크업 목록 업데이트
    const versionMarkups = this.getVersionMarkups(markup.version_id);
    const existingIndex = versionMarkups.findIndex(m => m.id === markup.id);
    
    if (existingIndex >= 0) {
      versionMarkups[existingIndex] = markup;
    } else {
      versionMarkups.push(markup);
    }
    
    this.saveVersionMarkups(markup.version_id, versionMarkups);
  }

  private static saveMarkupFeedback(feedback: MarkupFeedback): void {
    localStorage.setItem(`markup_feedback_${feedback.id}`, JSON.stringify(feedback));
  }

  private static saveVersionMarkups(versionId: string, markups: ImageMarkup[]): void {
    localStorage.setItem(`version_markups_${versionId}`, JSON.stringify(markups));
  }
}

/**
 * 마크업 도구 설정
 */
export const MARKUP_TOOLS = [
  {
    type: 'point' as MarkupType,
    icon: '📍',
    label: '포인트',
    description: '특정 지점을 가리킵니다',
    color: '#ef4444',
  },
  {
    type: 'circle' as MarkupType,
    icon: '⭕',
    label: '원형',
    description: '영역을 원형으로 표시합니다',
    color: '#f97316',
  },
  {
    type: 'arrow' as MarkupType,
    icon: '➡️',
    label: '화살표',
    description: '방향을 가리킵니다',
    color: '#eab308',
  },
  {
    type: 'rectangle' as MarkupType,
    icon: '⬜',
    label: '사각형',
    description: '영역을 사각형으로 표시합니다',
    color: '#22c55e',
  },
  {
    type: 'text' as MarkupType,
    icon: '💬',
    label: '텍스트',
    description: '텍스트 메모를 추가합니다',
    color: '#3b82f6',
  },
];

/**
 * 피드백 카테고리 설정
 */
export const FEEDBACK_CATEGORIES = [
  { value: 'color' as FeedbackCategory, label: '색상', icon: '🎨' },
  { value: 'typography' as FeedbackCategory, label: '타이포그래피', icon: '✍️' },
  { value: 'layout' as FeedbackCategory, label: '레이아웃', icon: '📐' },
  { value: 'content' as FeedbackCategory, label: '콘텐츠', icon: '📝' },
  { value: 'size' as FeedbackCategory, label: '크기', icon: '📏' },
  { value: 'positioning' as FeedbackCategory, label: '위치', icon: '🎯' },
  { value: 'style' as FeedbackCategory, label: '스타일', icon: '✨' },
  { value: 'general' as FeedbackCategory, label: '일반', icon: '💭' },
];