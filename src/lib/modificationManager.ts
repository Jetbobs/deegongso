import { ModificationRequest, ModificationTracker, ModificationRequestFormData, Feedback } from "@/types";

/**
 * 수정요청 관리를 위한 유틸리티 클래스
 */
export class ModificationManager {
  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 새로운 수정요청을 생성합니다
   */
  static createModificationRequest(
    projectId: string,
    formData: ModificationRequestFormData,
    requestedBy: string,
    isAdditionalCost: boolean = false,
    additionalCostAmount?: number
  ): ModificationRequest {
    // 기존 요청들을 조회하여 다음 번호 결정
    const existingRequests = this.getProjectModificationRequests(projectId);
    const nextRequestNumber = Math.max(0, ...existingRequests.map(r => r.request_number)) + 1;

    return {
      id: this.generateId(),
      project_id: projectId,
      request_number: nextRequestNumber,
      feedback_ids: formData.feedback_ids,
      status: "pending",
      requested_at: new Date().toISOString(),
      description: formData.description,
      urgency: formData.urgency,
      requested_by: requestedBy,
      is_additional_cost: isAdditionalCost,
      additional_cost_amount: additionalCostAmount,
      estimated_completion_date: formData.estimated_completion_date,
      notes: formData.notes
    };
  }

  /**
   * 수정요청을 승인합니다
   */
  static approveModificationRequest(
    requestId: string,
    approvedBy: string
  ): ModificationRequest | null {
    const request = this.getModificationRequest(requestId);
    if (!request || request.status !== "pending") {
      return null;
    }

    const updatedRequest: ModificationRequest = {
      ...request,
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: approvedBy
    };

    this.saveModificationRequest(updatedRequest);
    return updatedRequest;
  }

  /**
   * 수정요청을 거절합니다
   */
  static rejectModificationRequest(
    requestId: string,
    rejectionReason: string
  ): ModificationRequest | null {
    const request = this.getModificationRequest(requestId);
    if (!request || request.status !== "pending") {
      return null;
    }

    const updatedRequest: ModificationRequest = {
      ...request,
      status: "rejected",
      rejection_reason: rejectionReason
    };

    this.saveModificationRequest(updatedRequest);
    return updatedRequest;
  }

  /**
   * 수정요청을 진행중으로 변경합니다
   */
  static startModificationRequest(requestId: string): ModificationRequest | null {
    const request = this.getModificationRequest(requestId);
    if (!request || request.status !== "approved") {
      return null;
    }

    const updatedRequest: ModificationRequest = {
      ...request,
      status: "in_progress"
    };

    this.saveModificationRequest(updatedRequest);
    return updatedRequest;
  }

  /**
   * 수정요청을 완료합니다 - 자동으로 수정 횟수 차감
   */
  static completeModificationRequest(
    requestId: string,
    actualCompletionDate?: string
  ): ModificationRequest | null {
    const request = this.getModificationRequest(requestId);
    if (!request || !["approved", "in_progress"].includes(request.status)) {
      return null;
    }

    const updatedRequest: ModificationRequest = {
      ...request,
      status: "completed",
      completed_at: new Date().toISOString(),
      actual_completion_date: actualCompletionDate || new Date().toISOString()
    };

    this.saveModificationRequest(updatedRequest);
    
    // 자동으로 프로젝트 수정 횟수 업데이트
    this.updateProjectModificationCount(request.project_id, updatedRequest);
    
    return updatedRequest;
  }

  /**
   * 프로젝트의 수정요청 현황을 가져옵니다
   */
  static getModificationTracker(projectId: string): ModificationTracker {
    const requests = this.getProjectModificationRequests(projectId);
    const project = this.getProject(projectId); // 프로젝트 정보 조회 (가정)

    const totalAllowed = project?.total_modification_count || 3; // 기본값 3회
    const completedRequests = requests.filter(r => r.status === "completed" && !r.is_additional_cost);
    const inProgressRequests = requests.filter(r => ["approved", "in_progress"].includes(r.status) && !r.is_additional_cost);
    const additionalRequests = requests.filter(r => r.is_additional_cost);

    const used = completedRequests.length;
    const inProgress = inProgressRequests.length;
    const remaining = Math.max(0, totalAllowed - used - inProgress);

    const totalAdditionalCost = additionalRequests
      .filter(r => r.status === "completed")
      .reduce((sum, r) => sum + (r.additional_cost_amount || 0), 0);

    return {
      project_id: projectId,
      total_allowed: totalAllowed,
      used,
      in_progress: inProgress,
      remaining,
      requests: requests.filter(r => !r.is_additional_cost),
      additional_requests: additionalRequests,
      total_additional_cost: totalAdditionalCost,
      last_updated: new Date().toISOString()
    };
  }

  /**
   * 수정요청에 포함될 수 있는 피드백들을 필터링합니다
   */
  static getAvailableFeedbacksForModification(
    projectId: string,
    reportId?: string
  ): Feedback[] {
    const allFeedbacks = this.getProjectFeedbacks(projectId);
    const existingRequests = this.getProjectModificationRequests(projectId);
    
    // 이미 수정요청에 포함된 피드백 ID들
    const usedFeedbackIds = new Set(
      existingRequests
        .filter(r => r.status !== "rejected")
        .flatMap(r => r.feedback_ids)
    );

    return allFeedbacks.filter(feedback => {
      // 이미 사용된 피드백은 제외
      if (usedFeedbackIds.has(feedback.id)) {
        return false;
      }

      // 특정 리포트의 피드백만 필터링 (선택사항)
      if (reportId && feedback.report_id !== reportId) {
        return false;
      }

      // 해결되지 않은 피드백만 포함
      return feedback.status !== "resolved";
    });
  }

  /**
   * 수정요청 생성 시 추가 비용 여부를 계산합니다
   */
  static calculateAdditionalCost(
    projectId: string,
    urgency: "normal" | "urgent" = "normal"
  ): { isAdditionalCost: boolean; amount?: number } {
    const tracker = this.getModificationTracker(projectId);
    
    if (tracker.remaining > 0) {
      return { isAdditionalCost: false };
    }

    // 프로젝트에서 설정된 추가 수정 요금 가져오기
    const project = this.getProjectInfo(projectId);
    const baseAdditionalCost = project?.additional_modification_fee || 50000; // 기본 5만원
    const urgentMultiplier = urgency === "urgent" ? 1.5 : 1;
    
    return {
      isAdditionalCost: true,
      amount: Math.round(baseAdditionalCost * urgentMultiplier)
    };
  }

  /**
   * 프로젝트의 수정 횟수를 자동으로 업데이트합니다
   */
  static updateProjectModificationCount(
    projectId: string, 
    completedRequest: ModificationRequest
  ): void {
    const project = this.getProject(projectId);
    if (!project) return;

    // 수정 이력에 추가
    const modificationRecord = {
      id: this.generateId(),
      project_id: projectId,
      modification_number: project.modification_history?.length + 1 || 1,
      description: completedRequest.description,
      is_additional: completedRequest.is_additional_cost,
      additional_fee: completedRequest.additional_cost_amount,
      requested_at: completedRequest.requested_at,
      completed_at: completedRequest.completed_at!,
      requested_by: completedRequest.requested_by,
      approved_by: completedRequest.approved_by
    };

    // 프로젝트 정보 업데이트
    const updatedProject = {
      ...project,
      remaining_modification_count: completedRequest.is_additional_cost 
        ? project.remaining_modification_count 
        : Math.max(0, project.remaining_modification_count - 1),
      modification_history: [...(project.modification_history || []), modificationRecord],
      updated_at: new Date().toISOString()
    };

    this.saveProject(updatedProject);
    
    // 수정 횟수 소진 시 알림
    if (updatedProject.remaining_modification_count === 0 && !completedRequest.is_additional_cost) {
      this.createModificationLimitNotification(projectId, completedRequest.requested_by);
    }
  }

  /**
   * 수정 횟수 소진 알림을 생성합니다
   */
  static createModificationLimitNotification(projectId: string, userId: string): void {
    this.sendNotification({
      user_id: userId,
      message: "⚠️ 계약된 수정 횟수를 모두 사용했습니다. 추가 수정은 별도 요금이 발생합니다.",
      url: `/projects/${projectId}`,
      created_at: new Date().toISOString(),
      priority: "high"
    });
  }

  /**
   * 수정 횟수 현황을 실시간으로 계산합니다
   */
  static getModificationCountStatus(projectId: string) {
    const tracker = this.getModificationTracker(projectId);
    const project = this.getProject(projectId);
    
    const status = {
      total_allowed: tracker.total_allowed,
      used: tracker.used,
      in_progress: tracker.in_progress,
      remaining: tracker.remaining,
      additional_used: tracker.additional_requests.filter(r => r.status === "completed").length,
      total_additional_cost: tracker.total_additional_cost,
      is_limit_exceeded: tracker.remaining === 0,
      next_modification_cost: project?.additional_modification_fee || 50000,
      warning_threshold: Math.ceil(tracker.total_allowed * 0.8) // 80% 사용 시 경고
    };

    return {
      ...status,
      should_warn: tracker.used >= status.warning_threshold && !status.is_limit_exceeded,
      status_color: status.is_limit_exceeded ? 'error' : 
                   status.should_warn ? 'warning' : 
                   tracker.used > 0 ? 'info' : 'success',
      status_message: status.is_limit_exceeded 
        ? `계약 범위를 초과했습니다. 추가 수정은 ${this.formatCurrency(status.next_modification_cost)}이 부과됩니다.`
        : status.should_warn 
        ? `${status.remaining}회 남았습니다. 신중하게 사용해주세요.`
        : `${status.remaining}회 수정이 가능합니다.`
    };
  }

  /**
   * 수정요청 상태별 통계를 가져옵니다
   */
  static getModificationStatistics(projectId: string) {
    const requests = this.getProjectModificationRequests(projectId);
    
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === "pending").length,
      approved: requests.filter(r => r.status === "approved").length,
      in_progress: requests.filter(r => r.status === "in_progress").length,
      completed: requests.filter(r => r.status === "completed").length,
      rejected: requests.filter(r => r.status === "rejected").length,
      additional_cost_requests: requests.filter(r => r.is_additional_cost).length,
      urgent_requests: requests.filter(r => r.urgency === "urgent").length
    };
  }

  /**
   * 수정요청 알림을 생성합니다
   */
  static createModificationNotification(
    request: ModificationRequest,
    type: "created" | "approved" | "rejected" | "completed",
    recipientId: string
  ) {
    const messages = {
      created: `새로운 수정요청 #${request.request_number}이 등록되었습니다.`,
      approved: `수정요청 #${request.request_number}이 승인되었습니다.`,
      rejected: `수정요청 #${request.request_number}이 거절되었습니다.`,
      completed: `수정요청 #${request.request_number}이 완료되었습니다.`
    };

    // 실제 알림 시스템에 전달
    this.sendNotification({
      user_id: recipientId,
      message: messages[type],
      url: `/projects/${request.project_id}/modifications/${request.id}`,
      created_at: new Date().toISOString()
    });
  }

  // ======= Private Helper Methods =======

  private static getModificationRequest(requestId: string): ModificationRequest | null {
    // 실제 구현에서는 API 호출 또는 데이터베이스 조회
    const stored = localStorage.getItem(`modification_request_${requestId}`);
    return stored ? JSON.parse(stored) : null;
  }

  private static saveModificationRequest(request: ModificationRequest): void {
    // 실제 구현에서는 API 호출 또는 데이터베이스 저장
    localStorage.setItem(`modification_request_${request.id}`, JSON.stringify(request));
    
    // 프로젝트별 인덱스도 업데이트
    const projectRequestsKey = `project_modification_requests_${request.project_id}`;
    const existingRequests = this.getProjectModificationRequests(request.project_id);
    const updatedRequests = existingRequests.filter(r => r.id !== request.id);
    updatedRequests.push(request);
    
    localStorage.setItem(projectRequestsKey, JSON.stringify(updatedRequests));
  }

  private static getProjectModificationRequests(projectId: string): ModificationRequest[] {
    // 실제 구현에서는 API 호출 또는 데이터베이스 조회
    const stored = localStorage.getItem(`project_modification_requests_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  }

  private static getProject(projectId: string): any {
    // 실제 구현에서는 API 호출 또는 데이터베이스 조회
    const stored = localStorage.getItem(`project_${projectId}`);
    return stored ? JSON.parse(stored) : { total_modification_count: 3, additional_modification_fee: 50000 };
  }

  private static getProjectInfo(projectId: string): any {
    return this.getProject(projectId);
  }

  private static getProjectFeedbacks(projectId: string): Feedback[] {
    // 실제 구현에서는 API 호출 또는 데이터베이스 조회
    const stored = localStorage.getItem(`project_feedbacks_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  }

  private static saveProject(project: any): void {
    // 실제 구현에서는 API 호출 또는 데이터베이스 저장
    localStorage.setItem(`project_${project.id}`, JSON.stringify(project));
  }

  private static sendNotification(notification: any): void {
    // 실제 알림 시스템 연동
    console.log("Sending notification:", notification);
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

/**
 * 수정요청 관련 유틸리티 함수들
 */
export const ModificationUtils = {
  /**
   * 수정요청 상태에 따른 표시 정보
   */
  getStatusInfo: (status: ModificationRequest["status"]) => {
    const info = {
      pending: { label: "승인 대기", color: "warning", icon: "⏳", description: "관리자 승인을 기다리고 있습니다" },
      approved: { label: "승인됨", color: "info", icon: "✅", description: "승인되어 작업을 시작할 수 있습니다" },
      in_progress: { label: "진행 중", color: "primary", icon: "🚧", description: "현재 수정 작업이 진행중입니다" },
      completed: { label: "완료", color: "success", icon: "✅", description: "수정 작업이 완료되었습니다" },
      rejected: { label: "거절됨", color: "error", icon: "❌", description: "요청이 거절되었습니다" }
    };
    return info[status];
  },

  /**
   * 긴급도에 따른 표시 정보
   */
  getUrgencyInfo: (urgency: ModificationRequest["urgency"]) => {
    const info = {
      normal: { label: "일반", color: "neutral", icon: "📅", description: "일반적인 처리 일정으로 진행" },
      urgent: { label: "긴급", color: "error", icon: "🔥", description: "우선 처리가 필요한 요청" }
    };
    return info[urgency];
  },

  /**
   * 날짜 포맷팅
   */
  formatDate: (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateTime: (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * 예상 완료일까지 남은 일수 계산
   */
  getDaysUntilCompletion: (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  /**
   * 비용 포맷팅
   */
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount);
  }
};