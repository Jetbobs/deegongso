import { ModificationRequest, ModificationTracker, ModificationRequestFormData, Feedback, ClarificationRequest, FeedbackClarityAssessment, WorkProgress, WorkChecklistItem, ProgressUpdateEvent, WorkAttachment } from "@/types";
import { workflowNotification, createNotificationContext } from "./workflowNotificationService";

/**
 * 수정요청 관리를 위한 유틸리티 클래스
 */
export class ModificationManager {
  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 새로운 수정요청을 생성합니다 - 이 시점에 수정 횟수가 차감됩니다
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

    const newRequest: ModificationRequest = {
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

    // 💡 중요: 수정요청 생성 시점에 즉시 수정 횟수 차감
    if (!isAdditionalCost) {
      this.deductModificationCount(projectId, newRequest);
    }

    // 수정요청 저장
    this.saveModificationRequest(newRequest);

    // 📨 알림 전송
    this.sendWorkflowNotification(newRequest, "submitted");

    return newRequest;
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

    // 📨 알림 전송
    this.sendWorkflowNotification(updatedRequest, "approved");

    return updatedRequest;
  }

  /**
   * 수정요청을 거절합니다 - 거절 시 수정 횟수를 복구합니다
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
      rejection_reason: rejectionReason,
      rejected_at: new Date().toISOString()
    };

    // 💡 중요: 거절 시 수정 횟수 복구 (추가 비용 요청이 아니었던 경우)
    if (!request.is_additional_cost) {
      this.restoreModificationCount(request.project_id, updatedRequest);
    }

    this.saveModificationRequest(updatedRequest);

    // 📨 알림 전송
    this.sendWorkflowNotification(updatedRequest, "rejected");

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
   * 수정요청을 완료합니다 - 수정 횟수는 이미 차감되었으므로 완료 상태만 업데이트
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
    
    // 수정 이력에 기록 업데이트 (수정 횟수 차감은 제거)
    this.updateModificationHistory(request.project_id, updatedRequest);
    
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
   * @deprecated 이 함수는 더 이상 사용되지 않습니다. 
   * 수정 횟수 차감은 createModificationRequest에서, 
   * 이력 업데이트는 updateModificationHistory에서 처리됩니다.
   */
  static updateProjectModificationCount(
    projectId: string, 
    completedRequest: ModificationRequest
  ): void {
    console.warn('⚠️  updateProjectModificationCount는 deprecated되었습니다. updateModificationHistory를 사용해주세요.');
    this.updateModificationHistory(projectId, completedRequest);
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

  /**
   * 피드백의 명확성을 평가합니다
   */
  static assessFeedbackClarity(
    feedbackId: string,
    assessorId: string,
    assessment: Omit<FeedbackClarityAssessment, "feedback_id" | "assessed_by" | "assessed_at">
  ): FeedbackClarityAssessment {
    const clarityAssessment: FeedbackClarityAssessment = {
      ...assessment,
      feedback_id: feedbackId,
      assessed_by: assessorId,
      assessed_at: new Date().toISOString()
    };

    // 실제 구현에서는 API 호출 또는 데이터베이스 저장
    localStorage.setItem(`feedback_clarity_${feedbackId}`, JSON.stringify(clarityAssessment));

    console.log(`🔍 피드백 명확성 평가 완료: ${assessment.clarity_score}/5점`);
    return clarityAssessment;
  }

  /**
   * 수정요청에 대한 세부 설명을 재요청합니다
   */
  static requestClarification(
    modificationRequestId: string,
    feedbackId: string,
    question: string,
    requestedBy: string
  ): ClarificationRequest {
    const clarificationRequest: ClarificationRequest = {
      id: this.generateId(),
      modification_request_id: modificationRequestId,
      feedback_id: feedbackId,
      question,
      status: "pending",
      requested_by: requestedBy,
      requested_at: new Date().toISOString()
    };

    // 수정요청 상태를 'clarification_needed'로 변경
    const modificationRequest = this.getModificationRequest(modificationRequestId);
    if (modificationRequest) {
      const updatedRequest = {
        ...modificationRequest,
        status: "clarification_needed" as const,
        clarification_requests: [...(modificationRequest.clarification_requests || []), clarificationRequest]
      };
      this.saveModificationRequest(updatedRequest);
    }

    // 세부 설명 재요청 저장
    localStorage.setItem(`clarification_${clarificationRequest.id}`, JSON.stringify(clarificationRequest));

    // 세부 설명 요청 알림 전송
    this.sendClarificationNotifications(modificationRequest, [clarificationRequest], "requested");

    console.log(`🤔 세부 설명 재요청 생성: ${question}`);
    return clarificationRequest;
  }

  /**
   * 세부 설명 재요청에 답변합니다
   */
  static respondToClarification(
    clarificationId: string,
    response: string
  ): ClarificationRequest | null {
    const stored = localStorage.getItem(`clarification_${clarificationId}`);
    if (!stored) return null;

    const clarificationRequest: ClarificationRequest = JSON.parse(stored);
    const updatedRequest = {
      ...clarificationRequest,
      response,
      status: "answered" as const,
      answered_at: new Date().toISOString()
    };

    localStorage.setItem(`clarification_${clarificationId}`, JSON.stringify(updatedRequest));

    // 세부 설명 답변 알림 전송
    const modificationRequest = this.getModificationRequestByIdFromClarification(clarificationId);
    if (modificationRequest) {
      this.sendClarificationNotifications(modificationRequest, [updatedRequest], "answered");
    }

    console.log(`✅ 세부 설명 답변 완료: ${response}`);
    return updatedRequest;
  }

  /**
   * 세부 설명 재요청을 해결로 처리합니다
   */
  static resolveClarification(
    clarificationId: string,
    resolvedBy: string
  ): ClarificationRequest | null {
    const stored = localStorage.getItem(`clarification_${clarificationId}`);
    if (!stored) return null;

    const clarificationRequest: ClarificationRequest = JSON.parse(stored);
    const updatedRequest = {
      ...clarificationRequest,
      status: "resolved" as const,
      resolved_at: new Date().toISOString()
    };

    localStorage.setItem(`clarification_${clarificationId}`, JSON.stringify(updatedRequest));

    console.log(`✓ 세부 설명 재요청 해결 완료`);
    return updatedRequest;
  }

  /**
   * 수정요청의 모든 세부 설명이 해결되었는지 확인하여 승인 가능 상태로 만듭니다
   */
  static checkAndUpdateClarificationStatus(
    modificationRequestId: string
  ): ModificationRequest | null {
    const modificationRequest = this.getModificationRequest(modificationRequestId);
    if (!modificationRequest || !modificationRequest.clarification_requests) {
      return null;
    }

    const allResolved = modificationRequest.clarification_requests.every(
      req => req.status === "resolved"
    );

    if (allResolved && modificationRequest.status === "clarification_needed") {
      const updatedRequest = {
        ...modificationRequest,
        status: "pending" as const // 다시 승인 대기 상태로
      };

      this.saveModificationRequest(updatedRequest);
      console.log(`✅ 모든 세부 설명이 해결되어 승인 대기 상태로 변경`);
      return updatedRequest;
    }

    return modificationRequest;
  }

  /**
   * 수정요청에 대한 작업 체크리스트를 생성합니다
   */
  static createWorkProgress(
    modificationRequestId: string,
    checklistItems: Omit<WorkChecklistItem, "id" | "status" | "progress_percentage" | "started_at">[],
    estimatedCompletion: string
  ): WorkProgress {
    const workProgress: WorkProgress = {
      modification_request_id: modificationRequestId,
      checklist_items: checklistItems.map(item => ({
        ...item,
        id: this.generateId(),
        status: "pending" as const,
        progress_percentage: 0,
        started_at: undefined
      })),
      overall_progress: 0,
      estimated_completion: estimatedCompletion,
      status: "not_started",
      last_updated: new Date().toISOString()
    };

    // 수정요청에 진행 상황 연결
    const modificationRequest = this.getModificationRequest(modificationRequestId);
    if (modificationRequest) {
      const updatedRequest = {
        ...modificationRequest,
        work_progress: workProgress,
        status: "in_progress" as const
      };
      this.saveModificationRequest(updatedRequest);
    }

    localStorage.setItem(`work_progress_${modificationRequestId}`, JSON.stringify(workProgress));
    
    // 작업 시작 알림 전송
    if (modificationRequest) {
      this.sendWorkflowNotification(modificationRequest, "work_started");
    }
    
    console.log(`📋 체크리스트 생성: ${checklistItems.length}개 항목`);
    return workProgress;
  }

  /**
   * 체크리스트 항목 상태 업데이트
   */
  static updateChecklistItem(
    modificationRequestId: string,
    checklistItemId: string,
    updates: Partial<WorkChecklistItem>,
    updatedBy: string
  ): WorkProgress | null {
    const workProgress = this.getWorkProgress(modificationRequestId);
    if (!workProgress) return null;

    const itemIndex = workProgress.checklist_items.findIndex(item => item.id === checklistItemId);
    if (itemIndex === -1) return null;

    const oldItem = workProgress.checklist_items[itemIndex];
    const updatedItem = { ...oldItem, ...updates };

    // 상태 변경 시 시간 기록
    if (updates.status && updates.status !== oldItem.status) {
      if (updates.status === "in_progress" && !updatedItem.started_at) {
        updatedItem.started_at = new Date().toISOString();
      } else if (updates.status === "completed" && !updatedItem.completed_at) {
        updatedItem.completed_at = new Date().toISOString();
        updatedItem.progress_percentage = 100;
      }
    }

    workProgress.checklist_items[itemIndex] = updatedItem;
    workProgress.last_updated = new Date().toISOString();

    // 전체 진행률 재계산
    this.recalculateOverallProgress(workProgress);

    // 진행 상황 저장
    localStorage.setItem(`work_progress_${modificationRequestId}`, JSON.stringify(workProgress));

    // 진행 상황 이벤트 기록
    this.logProgressEvent({
      modification_request_id: modificationRequestId,
      checklist_item_id: checklistItemId,
      event_type: updates.status ? "progress_updated" : "progress_updated",
      description: `${oldItem.title}: ${oldItem.status} → ${updatedItem.status}`,
      old_value: oldItem.status,
      new_value: updatedItem.status,
      created_by: updatedBy
    });

    // 작업 진행 상황 알림 전송 (주요 진행률 달성 시에만)
    const modificationRequest = this.getModificationRequest(modificationRequestId);
    if (modificationRequest && this.shouldNotifyProgressUpdate(workProgress)) {
      this.sendWorkflowNotification(modificationRequest, "work_updated");
    }

    console.log(`🔄 체크리스트 업데이트: ${updatedItem.title} (${updatedItem.progress_percentage}%)`);
    return workProgress;
  }

  /**
   * 전체 진행률 재계산
   */
  private static recalculateOverallProgress(workProgress: WorkProgress): void {
    const totalItems = workProgress.checklist_items.length;
    if (totalItems === 0) {
      workProgress.overall_progress = 0;
      return;
    }

    const previousStatus = workProgress.status;
    const totalProgress = workProgress.checklist_items.reduce(
      (sum, item) => sum + item.progress_percentage,
      0
    );
    workProgress.overall_progress = Math.round(totalProgress / totalItems);

    // 전체 상태 업데이트
    const completedCount = workProgress.checklist_items.filter(item => item.status === "completed").length;
    const inProgressCount = workProgress.checklist_items.filter(item => item.status === "in_progress").length;
    
    if (completedCount === totalItems) {
      workProgress.status = "completed";
    } else if (completedCount > 0 || inProgressCount > 0) {
      workProgress.status = "in_progress";
    } else {
      workProgress.status = "not_started";
    }

    // 작업 완료 시 알림 전송
    if (previousStatus !== "completed" && workProgress.status === "completed") {
      const modificationRequest = this.getModificationRequest(workProgress.modification_request_id);
      if (modificationRequest) {
        this.sendWorkflowNotification(modificationRequest, "completed");
        
        // 수정 요청도 완료 상태로 업데이트
        const updatedRequest = {
          ...modificationRequest,
          status: "completed" as const,
          completed_at: new Date().toISOString()
        };
        this.saveModificationRequest(updatedRequest);
      }
    }
  }

  /**
   * 작업 진행 상황 조회
   */
  static getWorkProgress(modificationRequestId: string): WorkProgress | null {
    const stored = localStorage.getItem(`work_progress_${modificationRequestId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * 체크리스트 항목에 파일 첨부
   */
  static attachFileToChecklistItem(
    modificationRequestId: string,
    checklistItemId: string,
    fileInfo: Omit<WorkAttachment, "id" | "uploaded_at" | "uploaded_by">,
    uploadedBy: string
  ): WorkProgress | null {
    const workProgress = this.getWorkProgress(modificationRequestId);
    if (!workProgress) return null;

    const itemIndex = workProgress.checklist_items.findIndex(item => item.id === checklistItemId);
    if (itemIndex === -1) return null;

    const attachment: WorkAttachment = {
      ...fileInfo,
      id: this.generateId(),
      uploaded_at: new Date().toISOString(),
      uploaded_by: uploadedBy
    };

    const item = workProgress.checklist_items[itemIndex];
    item.attachments = [...(item.attachments || []), attachment];
    workProgress.last_updated = new Date().toISOString();

    localStorage.setItem(`work_progress_${modificationRequestId}`, JSON.stringify(workProgress));

    // 이벤트 로그
    this.logProgressEvent({
      modification_request_id: modificationRequestId,
      checklist_item_id: checklistItemId,
      event_type: "file_attached",
      description: `파일 첨부: ${attachment.filename}`,
      created_by: uploadedBy
    });

    console.log(`📎 파일 첨부: ${attachment.filename}`);
    return workProgress;
  }

  /**
   * 진행 상황 이벤트 로그
   */
  private static logProgressEvent(
    eventData: Omit<ProgressUpdateEvent, "id" | "created_at">
  ): void {
    const event: ProgressUpdateEvent = {
      ...eventData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };

    // 이벤트 로그 저장
    const existingEvents = this.getProgressEvents(eventData.modification_request_id);
    const updatedEvents = [...existingEvents, event];
    localStorage.setItem(`progress_events_${eventData.modification_request_id}`, JSON.stringify(updatedEvents));
  }

  /**
   * 진행 상황 이벤트 로그 조회
   */
  static getProgressEvents(modificationRequestId: string): ProgressUpdateEvent[] {
    const stored = localStorage.getItem(`progress_events_${modificationRequestId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 체크리스트를 자동으로 분석하여 생성
   */
  static generateChecklistFromFeedback(
    modificationRequest: ModificationRequest,
    feedbacks: Feedback[]
  ): Omit<WorkChecklistItem, "id" | "status" | "progress_percentage" | "started_at">[] {
    const checklistItems: Omit<WorkChecklistItem, "id" | "status" | "progress_percentage" | "started_at">[] = [];
    
    // 피드백에서 체크리스트 항목 추출
    const relatedFeedbacks = feedbacks.filter(f => modificationRequest.feedback_ids.includes(f.id));
    
    relatedFeedbacks.forEach((feedback, index) => {
      // HTML 에서 텍스트 추출
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = feedback.content_html;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      const item: Omit<WorkChecklistItem, "id" | "status" | "progress_percentage" | "started_at"> = {
        title: `피드백 #${index + 1} 반영`,
        description: textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent,
        category: this.categorizeFeedback(feedback),
        priority: this.getPriorityFromFeedback(feedback),
        estimated_hours: this.estimateHoursFromFeedback(feedback),
        assigned_to: undefined, // 디자이너가 설정
        dependencies: [],
        notes: `원본 피드백 ID: ${feedback.id}`
      };
      
      checklistItems.push(item);
    });

    // 기본 체크리스트 항목 추가
    checklistItems.push({
      title: "최종 검토 및 품질 확인",
      description: "수정된 내용에 대한 최종 검토 및 품질 확인",
      category: "review",
      priority: "high",
      estimated_hours: 2
    });

    checklistItems.push({
      title: "완료 보고 및 전달",
      description: "수정 완료 보고 및 클라이언트에게 전달",
      category: "delivery",
      priority: "medium",
      estimated_hours: 1
    });

    return checklistItems;
  }

  private static categorizeFeedback(feedback: Feedback): WorkChecklistItem['category'] {
    const content = feedback.content.toLowerCase();
    if (content.includes('디자인') || content.includes('색상') || content.includes('레이아웃')) {
      return 'design';
    } else if (content.includes('기능') || content.includes('개발')) {
      return 'development';
    } else if (content.includes('검토') || content.includes('확인')) {
      return 'review';
    } else {
      return 'other';
    }
  }

  private static getPriorityFromFeedback(feedback: Feedback): WorkChecklistItem['priority'] {
    return feedback.priority === 'critical' ? 'critical' :
           feedback.priority === 'high' ? 'high' :
           feedback.priority === 'low' ? 'low' : 'medium';
  }

  private static estimateHoursFromFeedback(feedback: Feedback): number {
    // 피드백 복잡도에 따른 예상 시간 계산
    const contentLength = feedback.content.length;
    const hasAttachments = feedback.attachments && feedback.attachments.length > 0;
    
    let baseHours = 2; // 기본 2시간
    if (contentLength > 500) baseHours += 2;
    if (hasAttachments) baseHours += 1;
    if (feedback.priority === 'critical') baseHours += 2;
    
    return Math.min(baseHours, 8); // 최대 8시간
  }

  /**
   * 워크플로우 단계별 알림 전송
   */
  private static async sendWorkflowNotification(
    modificationRequest: ModificationRequest,
    action: "submitted" | "approved" | "rejected" | "clarified" | "work_started" | "work_updated" | "completed"
  ): Promise<void> {
    const project = this.getProject(modificationRequest.project_id);
    if (!project) return;

    const projectName = project.name || `프로젝트 #${modificationRequest.project_id.slice(-8)}`;
    const actionUrl = `/projects/${modificationRequest.project_id}/modifications/${modificationRequest.id}`;

    try {
      switch (action) {
        case "submitted": {
          // 디자이너에게 알림
          const designerContext = createNotificationContext(
            modificationRequest.project_id,
            projectName,
            project.designer_id,
            "designer",
            actionUrl
          );

          await workflowNotification.notifyModificationRequestSubmitted(
            designerContext,
            modificationRequest,
            project.remaining_modification_count || 0
          );

          // 클라이언트에게 수정 횟수 차감 알림
          const clientContext = createNotificationContext(
            modificationRequest.project_id,
            projectName,
            project.client_id,
            "client",
            actionUrl
          );

          if (!modificationRequest.is_additional_cost) {
            await workflowNotification.notifyModificationCountDeducted(
              clientContext,
              project.remaining_modification_count || 0
            );
          }
          break;
        }

        case "approved": {
          // 클라이언트에게 승인 알림
          const clientContext = createNotificationContext(
            modificationRequest.project_id,
            projectName,
            project.client_id,
            "client",
            actionUrl
          );

          await workflowNotification.notifyModificationRequestDecision(
            clientContext,
            modificationRequest,
            "approved"
          );
          break;
        }

        case "rejected": {
          // 클라이언트에게 거절 알림 및 수정 횟수 복구 알림
          const clientContext = createNotificationContext(
            modificationRequest.project_id,
            projectName,
            project.client_id,
            "client",
            actionUrl
          );

          await workflowNotification.notifyModificationRequestDecision(
            clientContext,
            modificationRequest,
            "rejected",
            modificationRequest.rejection_reason
          );

          if (!modificationRequest.is_additional_cost) {
            await workflowNotification.notifyModificationCountRestored(
              clientContext,
              project.remaining_modification_count || 0
            );
          }
          break;
        }

        case "work_started": {
          // 클라이언트에게 작업 시작 알림
          const clientContext = createNotificationContext(
            modificationRequest.project_id,
            projectName,
            project.client_id,
            "client",
            actionUrl
          );

          const workProgress = this.getWorkProgress(modificationRequest.project_id);
          if (workProgress) {
            await workflowNotification.notifyWorkProgressStarted(clientContext, workProgress);
          }
          break;
        }

        case "work_updated": {
          // 클라이언트에게 진행 상황 알림
          const clientContext = createNotificationContext(
            modificationRequest.project_id,
            projectName,
            project.client_id,
            "client",
            actionUrl
          );

          const workProgress = this.getWorkProgress(modificationRequest.project_id);
          if (workProgress) {
            await workflowNotification.notifyWorkProgressUpdated(clientContext, workProgress);
          }
          break;
        }

        case "completed": {
          // 클라이언트에게 완료 알림
          const clientContext = createNotificationContext(
            modificationRequest.project_id,
            projectName,
            project.client_id,
            "client",
            actionUrl
          );

          await workflowNotification.notifyWorkflowCompleted(clientContext, modificationRequest);
          break;
        }
      }
    } catch (error) {
      console.error('알림 전송 실패:', error);
    }
  }

  /**
   * 세부 설명 재요청 알림 전송
   */
  private static async sendClarificationNotifications(
    modificationRequest: ModificationRequest,
    clarificationRequests: ClarificationRequest[],
    action: "requested" | "answered"
  ): Promise<void> {
    const project = this.getProject(modificationRequest.project_id);
    if (!project) return;

    const projectName = project.name || `프로젝트 #${modificationRequest.project_id.slice(-8)}`;
    const actionUrl = `/projects/${modificationRequest.project_id}/clarifications`;

    try {
      if (action === "requested") {
        // 클라이언트에게 세부 설명 요청 알림
        const clientContext = createNotificationContext(
          modificationRequest.project_id,
          projectName,
          project.client_id,
          "client",
          actionUrl
        );

        await workflowNotification.notifyClarificationRequested(clientContext, clarificationRequests);
      } else if (action === "answered") {
        // 디자이너에게 세부 설명 답변 알림
        const designerContext = createNotificationContext(
          modificationRequest.project_id,
          projectName,
          project.designer_id,
          "designer",
          actionUrl
        );

        const answeredCount = clarificationRequests.filter(r => r.status === "answered").length;
        await workflowNotification.notifyClarificationAnswered(
          designerContext,
          answeredCount,
          clarificationRequests.length
        );
      }
    } catch (error) {
      console.error('세부 설명 알림 전송 실패:', error);
    }
  }

  /**
   * 수정요청 생성 시 수정 횟수를 차감합니다
   */
  private static deductModificationCount(
    projectId: string,
    request: ModificationRequest
  ): void {
    const project = this.getProject(projectId);
    if (!project) return;

    // 수정 횟수 차감
    const updatedProject = {
      ...project,
      remaining_modification_count: Math.max(0, project.remaining_modification_count - 1),
      updated_at: new Date().toISOString()
    };

    this.saveProject(updatedProject);

    // 수정 횟수 소진 알림
    if (updatedProject.remaining_modification_count === 0) {
      this.createModificationLimitNotification(projectId, request.requested_by);
    }

    console.log(`📊 수정 횟수 차감: ${project.remaining_modification_count} -> ${updatedProject.remaining_modification_count}`);
  }

  /**
   * 수정요청 거절 시 수정 횟수를 복구합니다
   */
  private static restoreModificationCount(
    projectId: string,
    rejectedRequest: ModificationRequest
  ): void {
    const project = this.getProject(projectId);
    if (!project) return;

    // 수정 횟수 복구
    const updatedProject = {
      ...project,
      remaining_modification_count: Math.min(
        project.total_modification_count || 3,
        project.remaining_modification_count + 1
      ),
      updated_at: new Date().toISOString()
    };

    this.saveProject(updatedProject);

    console.log(`🔄 수정 횟수 복구: ${project.remaining_modification_count} -> ${updatedProject.remaining_modification_count}`);
  }

  /**
   * 수정 이력만 업데이트합니다 (수정 횟수 차감 없이)
   */
  private static updateModificationHistory(
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

    // 수정 이력에만 추가 (횟수 차감은 제거)
    const updatedProject = {
      ...project,
      modification_history: [...(project.modification_history || []), modificationRecord],
      updated_at: new Date().toISOString()
    };

    this.saveProject(updatedProject);

    console.log(`📝 수정 이력 업데이트: ${completedRequest.description}`);
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

  /**
   * 세부 설명 재요청 ID로 수정요청 찾기
   */
  private static getModificationRequestByIdFromClarification(clarificationId: string): ModificationRequest | null {
    // localStorage에서 모든 수정 요청을 검색하여 해당 세부 설명을 포함하는 요청 찾기
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('modification_request_'));
    
    for (const key of allKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const request: ModificationRequest = JSON.parse(stored);
        if (request.clarification_requests?.some(cr => cr.id === clarificationId)) {
          return request;
        }
      }
    }
    
    return null;
  }

  /**
   * 작업 진행 상황 알림을 보낼지 결정
   */
  private static shouldNotifyProgressUpdate(workProgress: WorkProgress): boolean {
    const milestones = [25, 50, 75, 90, 100]; // 주요 진행률 기준점
    const currentProgress = workProgress.overall_progress;
    
    // 기준점에 도달했는지 확인
    return milestones.includes(currentProgress) || 
           (currentProgress === 100 && workProgress.status === 'completed');
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
      pending: { label: "승인 대기", color: "warning", icon: "⏳", description: "디자이너 승인을 기다리고 있습니다" },
      clarification_needed: { label: "세부 설명 필요", color: "accent", icon: "🤔", description: "디자이너가 세부 설명을 요청했습니다" },
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