import { ImageMarkup, MarkupFeedback, MarkupType, FeedbackCategory, MarkupComment, ArchiveData, Feedback, UserMarkupStats, UserMarkupActivity } from "@/types";

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

  // ========== 마크업 댓글 관리 메서드들 ==========

  /**
   * 마크업 댓글을 가져옵니다
   */
  static getMarkupComments(markupId: string): MarkupComment[] {
    const stored = localStorage.getItem(`markup_comments_${markupId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 마크업 댓글을 저장합니다
   */
  static saveMarkupComments(markupId: string, comments: MarkupComment[]): void {
    localStorage.setItem(`markup_comments_${markupId}`, JSON.stringify(comments));
    
    // 마크업 정보 업데이트 (댓글 수, 미해결 댓글 여부)
    this.updateMarkupCommentInfo(markupId, comments);
  }

  /**
   * 새 댓글을 추가합니다
   */
  static addMarkupComment(
    markupId: string,
    authorId: string,
    authorName: string,
    authorRole: "client" | "designer",
    content: string,
    parentId?: string
  ): MarkupComment {
    const comment: MarkupComment = {
      id: this.generateId(),
      markup_id: markupId,
      author_id: authorId,
      author_name: authorName,
      author_role: authorRole,
      content,
      created_at: new Date().toISOString(),
      parent_id: parentId,
      is_resolved: false
    };

    const existingComments = this.getMarkupComments(markupId);
    const updatedComments = [...existingComments, comment];
    this.saveMarkupComments(markupId, updatedComments);

    console.log(`💬 마크업 댓글 추가: ${content}`);
    return comment;
  }

  /**
   * 댓글을 삭제합니다 (대댓글도 함께)
   */
  static deleteMarkupComment(markupId: string, commentId: string): boolean {
    const existingComments = this.getMarkupComments(markupId);
    
    // 해당 댓글과 그 대댓글들을 모두 삭제
    const updatedComments = existingComments.filter(
      c => c.id !== commentId && c.parent_id !== commentId
    );
    
    this.saveMarkupComments(markupId, updatedComments);
    
    console.log(`🗑️ 마크업 댓글 삭제: ${commentId}`);
    return true;
  }

  /**
   * 댓글의 해결 상태를 변경합니다
   */
  static toggleMarkupCommentResolved(
    markupId: string,
    commentId: string,
    resolvedBy: string
  ): boolean {
    const existingComments = this.getMarkupComments(markupId);
    const updatedComments = existingComments.map(comment => {
      if (comment.id === commentId) {
        const newResolvedState = !comment.is_resolved;
        return {
          ...comment,
          is_resolved: newResolvedState,
          resolved_at: newResolvedState ? new Date().toISOString() : undefined,
          resolved_by: newResolvedState ? resolvedBy : undefined
        };
      }
      return comment;
    });

    this.saveMarkupComments(markupId, updatedComments);
    
    const comment = updatedComments.find(c => c.id === commentId);
    console.log(`✅ 댓글 해결 상태 변경: ${comment?.is_resolved ? '해결됨' : '미해결'}`);
    return true;
  }

  /**
   * 마크업의 댓글 정보를 업데이트합니다
   */
  private static updateMarkupCommentInfo(markupId: string, comments: MarkupComment[]): void {
    const markup = this.getMarkup(markupId);
    if (!markup) return;

    const commentCount = comments.length;
    const hasUnresolved = comments.some(c => !c.is_resolved);

    const updatedMarkup = {
      ...markup,
      comment_count: commentCount,
      has_unresolved_comments: hasUnresolved
    };

    this.saveMarkup(updatedMarkup);
  }

  /**
   * 버전의 모든 마크업 댓글 통계를 가져옵니다
   */
  static getVersionCommentStats(versionId: string) {
    const markups = this.getVersionMarkups(versionId);
    let totalComments = 0;
    let unresolvedComments = 0;
    let resolvedComments = 0;

    markups.forEach(markup => {
      const comments = this.getMarkupComments(markup.id);
      totalComments += comments.length;
      unresolvedComments += comments.filter(c => !c.is_resolved).length;
      resolvedComments += comments.filter(c => c.is_resolved).length;
    });

    return {
      total_comments: totalComments,
      unresolved_comments: unresolvedComments,
      resolved_comments: resolvedComments,
      markups_with_comments: markups.filter(m => (m.comment_count || 0) > 0).length,
      markups_with_unresolved: markups.filter(m => m.has_unresolved_comments).length
    };
  }

  // ========== 체크리스트 댓글 관리 메서드들 ==========

  /**
   * 체크리스트 항목 댓글을 가져옵니다
   */
  static getChecklistComments(checklistItemId: string): MarkupComment[] {
    const stored = localStorage.getItem(`checklist_comments_${checklistItemId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 체크리스트 항목 댓글을 저장합니다
   */
  static saveChecklistComments(checklistItemId: string, comments: MarkupComment[]): void {
    localStorage.setItem(`checklist_comments_${checklistItemId}`, JSON.stringify(comments));
  }

  /**
   * 체크리스트 항목에 새 댓글을 추가합니다
   */
  static addChecklistComment(
    checklistItemId: string,
    authorId: string,
    authorName: string,
    authorRole: "client" | "designer",
    content: string,
    parentId?: string
  ): MarkupComment {
    const comment: MarkupComment = {
      id: this.generateId(),
      markup_id: checklistItemId, // 체크리스트 ID를 마크업 ID 필드에 저장
      author_id: authorId,
      author_name: authorName,
      author_role: authorRole,
      content,
      created_at: new Date().toISOString(),
      parent_id: parentId,
      is_resolved: false
    };

    const existingComments = this.getChecklistComments(checklistItemId);
    const updatedComments = [...existingComments, comment];
    this.saveChecklistComments(checklistItemId, updatedComments);

    console.log(`💬 체크리스트 댓글 추가: ${content}`);
    return comment;
  }

  /**
   * 체크리스트 댓글을 삭제합니다
   */
  static deleteChecklistComment(checklistItemId: string, commentId: string): boolean {
    const existingComments = this.getChecklistComments(checklistItemId);
    
    const updatedComments = existingComments.filter(
      c => c.id !== commentId && c.parent_id !== commentId
    );
    
    this.saveChecklistComments(checklistItemId, updatedComments);
    
    console.log(`🗑️ 체크리스트 댓글 삭제: ${commentId}`);
    return true;
  }

  /**
   * 체크리스트 댓글의 해결 상태를 변경합니다
   */
  static toggleChecklistCommentResolved(
    checklistItemId: string,
    commentId: string,
    resolvedBy: string
  ): boolean {
    const existingComments = this.getChecklistComments(checklistItemId);
    const updatedComments = existingComments.map(comment => {
      if (comment.id === commentId) {
        const newResolvedState = !comment.is_resolved;
        return {
          ...comment,
          is_resolved: newResolvedState,
          resolved_at: newResolvedState ? new Date().toISOString() : undefined,
          resolved_by: newResolvedState ? resolvedBy : undefined
        };
      }
      return comment;
    });

    this.saveChecklistComments(checklistItemId, updatedComments);
    
    const comment = updatedComments.find(c => c.id === commentId);
    console.log(`✅ 체크리스트 댓글 해결 상태 변경: ${comment?.is_resolved ? '해결됨' : '미해결'}`);
    return true;
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

  // ========== 아카이브 관리 메서드들 ==========

  /**
   * 차수별 데이터 아카이브
   */
  static archiveVersionData(versionId: string, revisionNumber: number, data: {
    markups: ImageMarkup[];
    feedbacks: MarkupFeedback[];
    generalFeedbacks: Feedback[];
  }): boolean {
    try {
      const archiveKey = `markup_archive_${versionId}_rev${revisionNumber}`;
      const archiveData = {
        versionId,
        revisionNumber,
        archivedAt: new Date().toISOString(),
        markups: data.markups,
        feedbacks: data.feedbacks,
        generalFeedbacks: data.generalFeedbacks
      };
      
      localStorage.setItem(archiveKey, JSON.stringify(archiveData));
      console.log(`차수 ${revisionNumber} 데이터 아카이브 완료:`, archiveData);
      return true;
    } catch (error) {
      console.error('데이터 아카이브 실패:', error);
      return false;
    }
  }

  /**
   * 아카이브된 데이터 조회
   */
  static getArchivedVersionData(versionId: string, revisionNumber: number): ArchiveData | null {
    try {
      const archiveKey = `markup_archive_${versionId}_rev${revisionNumber}`;
      const archiveData = localStorage.getItem(archiveKey);
      return archiveData ? JSON.parse(archiveData) : null;
    } catch (error) {
      console.error('아카이브 데이터 조회 실패:', error);
      return null;
    }
  }

  /**
   * 버전의 모든 아카이브 조회
   */
  static getAllArchivedRevisions(versionId: string): ArchiveData[] {
    try {
      const archives: ArchiveData[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`markup_archive_${versionId}_rev`)) {
          const archiveData = localStorage.getItem(key);
          if (archiveData) {
            archives.push(JSON.parse(archiveData));
          }
        }
      }
      return archives.sort((a, b) => a.revisionNumber - b.revisionNumber);
    } catch (error) {
      console.error('아카이브 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 모든 버전 ID를 가져옵니다 (실제 구현에서는 프로젝트 API에서 가져옴)
   */
  static getAllVersionIds(): string[] {
    // localStorage에서 모든 프로젝트의 버전 ID를 가져옵니다
    const markupsData = localStorage.getItem('project_markups');
    if (!markupsData) return [];
    
    try {
      const allMarkups = JSON.parse(markupsData);
      const versionIds = new Set<string>();
      
      Object.keys(allMarkups).forEach(versionId => {
        if (allMarkups[versionId] && allMarkups[versionId].length > 0) {
          versionIds.add(versionId);
        }
      });
      
      return Array.from(versionIds);
    } catch {
      return [];
    }
  }

  /**
   * 마크업 ID로 마크업을 찾습니다
   */
  static getMarkupById(markupId: string): ImageMarkup | null {
    const allVersionIds = this.getAllVersionIds();
    
    for (const versionId of allVersionIds) {
      const markups = this.getVersionMarkups(versionId);
      const markup = markups.find(m => m.id === markupId);
      if (markup) return markup;
    }
    
    return null;
  }

  /**
   * 사용자별 마크업 통계를 가져옵니다
   */
  static getUserMarkupStats(userId: string): UserMarkupStats {
    const allVersionIds = this.getAllVersionIds();
    
    let totalMarkups = 0;
    let totalFeedbacks = 0;
    let receivedFeedbacks = 0;
    let pendingFeedbacks = 0;
    let resolvedFeedbacks = 0;
    
    const projectsSet = new Set<string>();
    const markupTypeUsage: { [key in MarkupType]: number } = {
      point: 0,
      circle: 0, 
      arrow: 0,
      rectangle: 0,
      text: 0,
      freehand: 0
    };
    
    let thisWeekMarkups = 0;
    let thisMonthMarkups = 0;
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    allVersionIds.forEach(versionId => {
      // 내가 생성한 마크업
      const userMarkups = this.getVersionMarkups(versionId)
        .filter(markup => markup.created_by === userId);
      
      totalMarkups += userMarkups.length;
      
      userMarkups.forEach(markup => {
        // 프로젝트 추가
        projectsSet.add(versionId);
        
        // 타입별 카운트
        if (markupTypeUsage[markup.type] !== undefined) {
          markupTypeUsage[markup.type]++;
        }
        
        // 시간별 카운트
        const createdDate = new Date(markup.created_at);
        if (createdDate >= weekAgo) thisWeekMarkups++;
        if (createdDate >= monthAgo) thisMonthMarkups++;
      });
      
      // 내가 작성한 피드백
      const userFeedbacks = this.getVersionMarkupFeedbacks(versionId)
        .filter(feedback => feedback.created_by === userId);
      
      totalFeedbacks += userFeedbacks.length;
      
      userFeedbacks.forEach(feedback => {
        if (feedback.status === 'pending' || feedback.status === 'in_progress') {
          pendingFeedbacks++;
        } else if (feedback.status === 'resolved') {
          resolvedFeedbacks++;
        }
      });
      
      // 내가 받은 피드백 (내 마크업에 대한 다른 사람의 피드백)
      const receivedCount = this.getVersionMarkupFeedbacks(versionId)
        .filter(feedback => {
          const markup = this.getMarkupById(feedback.markup_id);
          return markup?.created_by === userId && feedback.created_by !== userId;
        }).length;
      
      receivedFeedbacks += receivedCount;
    });
    
    return {
      totalMarkups,
      totalFeedbacks,
      receivedFeedbacks,
      pendingFeedbacks,
      resolvedFeedbacks,
      projectsWithMarkups: projectsSet.size,
      activeProjects: projectsSet.size, // 현재는 모든 프로젝트가 활성으로 가정
      markupTypeUsage,
      thisWeekMarkups,
      thisMonthMarkups
    };
  }

  /**
   * 사용자의 최근 마크업 활동을 가져옵니다
   */
  static getUserRecentActivity(userId: string, limit: number = 10): UserMarkupActivity[] {
    const allVersionIds = this.getAllVersionIds();
    const activities: UserMarkupActivity[] = [];
    
    allVersionIds.forEach(versionId => {
      // 내가 생성한 마크업
      const userMarkups = this.getVersionMarkups(versionId)
        .filter(markup => markup.created_by === userId);
        
      userMarkups.forEach(markup => {
        activities.push({
          id: `markup_${markup.id}`,
          type: 'markup_created',
          projectId: versionId,
          projectName: `프로젝트 ${versionId}`,
          description: `${markup.type} 마크업을 생성했습니다`,
          createdAt: markup.created_at,
          markupId: markup.id
        });
      });
      
      // 내가 작성한 피드백
      const userFeedbacks = this.getVersionMarkupFeedbacks(versionId)
        .filter(feedback => feedback.created_by === userId);
        
      userFeedbacks.forEach(feedback => {
        activities.push({
          id: `feedback_${feedback.id}`,
          type: 'feedback_created',
          projectId: versionId,
          projectName: `프로젝트 ${versionId}`,
          description: `"${feedback.title}" 피드백을 작성했습니다`,
          createdAt: feedback.created_at,
          feedbackId: feedback.id,
          markupId: feedback.markup_id
        });
      });
      
      // 내가 받은 피드백
      const receivedFeedbacks = this.getVersionMarkupFeedbacks(versionId)
        .filter(feedback => {
          const markup = this.getMarkupById(feedback.markup_id);
          return markup?.created_by === userId && feedback.created_by !== userId;
        });
        
      receivedFeedbacks.forEach(feedback => {
        activities.push({
          id: `received_${feedback.id}`,
          type: 'feedback_received',
          projectId: versionId,
          projectName: `프로젝트 ${versionId}`,
          description: `"${feedback.title}" 피드백을 받았습니다`,
          createdAt: feedback.created_at,
          feedbackId: feedback.id,
          markupId: feedback.markup_id
        });
      });
    });
    
    // 시간순 정렬 후 제한된 개수만 반환
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
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

