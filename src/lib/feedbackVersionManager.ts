import { Feedback, FeedbackAttachment } from "@/types";

export interface FeedbackVersion {
  version: number;
  feedback: Feedback;
  changes: FeedbackChange[];
  created_at: string;
  created_by: string;
}

export interface FeedbackChange {
  field: keyof Feedback;
  old_value: unknown;
  new_value: unknown;
  change_type: 'added' | 'modified' | 'removed';
}

export interface FeedbackHistory {
  feedback_id: string;
  versions: FeedbackVersion[];
  current_version: number;
  total_changes: number;
}

export class FeedbackVersionManager {
  private static histories: Map<string, FeedbackHistory> = new Map();

  // 새 피드백 생성
  static createFeedback(feedback: Feedback): FeedbackHistory {
    const history: FeedbackHistory = {
      feedback_id: feedback.id,
      versions: [{
        version: 1,
        feedback: { ...feedback, version: 1 },
        changes: [],
        created_at: feedback.submitted_at,
        created_by: feedback.client_id
      }],
      current_version: 1,
      total_changes: 0
    };

    this.histories.set(feedback.id, history);
    return history;
  }

  // 피드백 업데이트
  static updateFeedback(
    feedbackId: string, 
    updates: Partial<Feedback>, 
    updatedBy: string
  ): FeedbackHistory | null {
    const history = this.histories.get(feedbackId);
    if (!history) return null;

    const currentFeedback = history.versions[history.versions.length - 1].feedback;
    const changes: FeedbackChange[] = [];

    // 변경사항 추적
    Object.entries(updates).forEach(([key, newValue]) => {
      const field = key as keyof Feedback;
      const oldValue = currentFeedback[field];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          old_value: oldValue,
          new_value: newValue,
          change_type: oldValue === undefined ? 'added' : 
                      newValue === undefined ? 'removed' : 'modified'
        });
      }
    });

    if (changes.length === 0) return history;

    // 새 버전 생성
    const newVersion = history.current_version + 1;
    const updatedFeedback: Feedback = {
      ...currentFeedback,
      ...updates,
      version: newVersion,
      updated_at: new Date().toISOString()
    };

    const version: FeedbackVersion = {
      version: newVersion,
      feedback: updatedFeedback,
      changes,
      created_at: new Date().toISOString(),
      created_by: updatedBy
    };

    history.versions.push(version);
    history.current_version = newVersion;
    history.total_changes += changes.length;

    this.histories.set(feedbackId, history);
    return history;
  }

  // 피드백 히스토리 조회
  static getFeedbackHistory(feedbackId: string): FeedbackHistory | null {
    return this.histories.get(feedbackId) || null;
  }

  // 특정 버전 조회
  static getFeedbackVersion(feedbackId: string, version: number): FeedbackVersion | null {
    const history = this.histories.get(feedbackId);
    if (!history) return null;

    return history.versions.find(v => v.version === version) || null;
  }

  // 현재 버전 조회
  static getCurrentFeedback(feedbackId: string): Feedback | null {
    const history = this.histories.get(feedbackId);
    if (!history) return null;

    const currentVersion = history.versions[history.versions.length - 1];
    return currentVersion?.feedback || null;
  }

  // 버전 비교
  static compareFeedbackVersions(
    feedbackId: string, 
    version1: number, 
    version2: number
  ): FeedbackChange[] | null {
    const history = this.histories.get(feedbackId);
    if (!history) return null;

    const v1 = history.versions.find(v => v.version === version1);
    const v2 = history.versions.find(v => v.version === version2);

    if (!v1 || !v2) return null;

    const changes: FeedbackChange[] = [];
    const allFields = new Set([
      ...Object.keys(v1.feedback),
      ...Object.keys(v2.feedback)
    ]) as Set<keyof Feedback>;

    allFields.forEach(field => {
      const val1 = v1.feedback[field];
      const val2 = v2.feedback[field];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({
          field,
          old_value: val1,
          new_value: val2,
          change_type: val1 === undefined ? 'added' : 
                      val2 === undefined ? 'removed' : 'modified'
        });
      }
    });

    return changes;
  }

  // 버전 롤백
  static rollbackToVersion(
    feedbackId: string, 
    targetVersion: number, 
    rolledBackBy: string
  ): FeedbackHistory | null {
    const history = this.histories.get(feedbackId);
    if (!history) return null;

    const targetVersionData = history.versions.find(v => v.version === targetVersion);
    if (!targetVersionData) return null;

    // 현재 버전과 타겟 버전 비교
    const currentFeedback = history.versions[history.versions.length - 1].feedback;
    const targetFeedback = targetVersionData.feedback;

    const changes: FeedbackChange[] = [];
    const allFields = new Set([
      ...Object.keys(currentFeedback),
      ...Object.keys(targetFeedback)
    ]) as Set<keyof Feedback>;

    allFields.forEach(field => {
      const currentValue = currentFeedback[field];
      const targetValue = targetFeedback[field];

      if (JSON.stringify(currentValue) !== JSON.stringify(targetValue)) {
        changes.push({
          field,
          old_value: currentValue,
          new_value: targetValue,
          change_type: currentValue === undefined ? 'added' : 
                      targetValue === undefined ? 'removed' : 'modified'
        });
      }
    });

    if (changes.length === 0) return history;

    // 새 버전으로 롤백 생성
    const newVersion = history.current_version + 1;
    const rolledBackFeedback: Feedback = {
      ...targetFeedback,
      id: currentFeedback.id,
      version: newVersion,
      updated_at: new Date().toISOString()
    };

    const rollbackVersion: FeedbackVersion = {
      version: newVersion,
      feedback: rolledBackFeedback,
      changes,
      created_at: new Date().toISOString(),
      created_by: rolledBackBy
    };

    history.versions.push(rollbackVersion);
    history.current_version = newVersion;
    history.total_changes += changes.length;

    this.histories.set(feedbackId, history);
    return history;
  }

  // 변경사항 요약
  static getChangesSummary(changes: FeedbackChange[]): string {
    const summaries: string[] = [];

    const groupedChanges = changes.reduce((groups, change) => {
      const type = change.change_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(change);
      return groups;
    }, {} as Record<string, FeedbackChange[]>);

    Object.entries(groupedChanges).forEach(([type, typeChanges]) => {
      const fields = typeChanges.map(c => this.getFieldDisplayName(c.field));
      
      switch (type) {
        case 'added':
          summaries.push(`추가됨: ${fields.join(', ')}`);
          break;
        case 'modified':
          summaries.push(`수정됨: ${fields.join(', ')}`);
          break;
        case 'removed':
          summaries.push(`제거됨: ${fields.join(', ')}`);
          break;
      }
    });

    return summaries.join(' / ');
  }

  // 필드명 한국어 변환
  static getFieldDisplayName(field: keyof Feedback): string {
    const fieldNames: Record<keyof Feedback, string> = {
      id: 'ID',
      project_id: '프로젝트 ID',
      report_id: '보고서 ID',
      content: '내용',
      content_html: 'HTML 내용',
      attachments: '첨부파일',
      annotations: '주석',
      is_official: '공식 여부',
      priority: '우선순위',
      category: '카테고리',
      status: '상태',
      submitted_at: '제출일',
      updated_at: '수정일',
      resolved_at: '해결일',
      client_id: '클라이언트 ID',
      version: '버전',
      parent_feedback_id: '부모 피드백 ID',
      revision_request_count: '수정 요청 횟수'
    };

    return fieldNames[field] || field;
  }

  // 모든 피드백 히스토리 조회 (관리자용)
  static getAllHistories(): Map<string, FeedbackHistory> {
    return new Map(this.histories);
  }

  // 피드백 히스토리 삭제
  static deleteFeedbackHistory(feedbackId: string): boolean {
    return this.histories.delete(feedbackId);
  }

  // 통계 정보
  static getStatistics() {
    const totalFeedbacks = this.histories.size;
    let totalVersions = 0;
    let totalChanges = 0;
    let mostVersionedFeedback = { id: '', versions: 0 };

    this.histories.forEach((history, feedbackId) => {
      totalVersions += history.versions.length;
      totalChanges += history.total_changes;

      if (history.versions.length > mostVersionedFeedback.versions) {
        mostVersionedFeedback = { id: feedbackId, versions: history.versions.length };
      }
    });

    return {
      total_feedbacks: totalFeedbacks,
      total_versions: totalVersions,
      total_changes: totalChanges,
      average_versions_per_feedback: totalFeedbacks > 0 ? totalVersions / totalFeedbacks : 0,
      most_versioned_feedback: mostVersionedFeedback.versions > 0 ? mostVersionedFeedback : null
    };
  }

  // 내보내기 (백업용)
  static exportHistories(): string {
    const data = Array.from(this.histories.entries()).map(([id, history]) => ({
      id,
      ...history
    }));

    return JSON.stringify(data, null, 2);
  }

  // 가져오기 (복원용)
  static importHistories(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }

      data.forEach(item => {
        if (item.id && item.versions && item.current_version !== undefined) {
          this.histories.set(item.id, {
            feedback_id: item.id,
            versions: item.versions,
            current_version: item.current_version,
            total_changes: item.total_changes || 0
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to import feedback histories:', error);
      return false;
    }
  }
}