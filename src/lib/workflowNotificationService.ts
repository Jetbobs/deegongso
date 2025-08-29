import { ProjectNotifications, NotificationSettings } from "./pushNotifications";
import { ModificationRequest, WorkProgress, ClarificationRequest, User } from "@/types";

export interface NotificationContext {
  projectId: string;
  projectName: string;
  recipientId: string;
  recipientRole: "client" | "designer";
  actionUrl?: string;
}

export class WorkflowNotificationService {
  private static instance: WorkflowNotificationService;
  
  static getInstance(): WorkflowNotificationService {
    if (!WorkflowNotificationService.instance) {
      WorkflowNotificationService.instance = new WorkflowNotificationService();
    }
    return WorkflowNotificationService.instance;
  }

  /**
   * 수정 요청 제출 시 알림
   */
  async notifyModificationRequestSubmitted(
    context: NotificationContext,
    modificationRequest: ModificationRequest,
    remainingCount: number
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "statusChangeNotifications")) {
      return;
    }

    const isDesigner = context.recipientRole === "designer";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    await ProjectNotifications.modificationRequestSubmitted(
      context.projectName,
      modificationRequest.request_number,
      remainingCount,
      isDesigner,
      onClick
    );

    // 추가 맥락 정보가 있는 경우
    if (modificationRequest.urgency === "urgent" && isDesigner) {
      setTimeout(() => {
        ProjectNotifications.deadlineApproaching(
          context.projectName,
          1, // 긴급은 1일로 표시
          onClick
        );
      }, 2000); // 2초 후 추가 알림
    }

    console.log(`📨 수정 요청 제출 알림 전송: ${context.recipientRole}에게`);
  }

  /**
   * 세부 설명 재요청 시 알림
   */
  async notifyClarificationRequested(
    context: NotificationContext,
    clarificationRequests: ClarificationRequest[]
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "statusChangeNotifications")) {
      return;
    }

    const isClient = context.recipientRole === "client";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    await ProjectNotifications.clarificationRequested(
      context.projectName,
      clarificationRequests.length,
      isClient,
      onClick
    );

    console.log(`🤔 세부 설명 재요청 알림 전송: ${clarificationRequests.length}건`);
  }

  /**
   * 세부 설명 답변 시 알림
   */
  async notifyClarificationAnswered(
    context: NotificationContext,
    answeredCount: number,
    totalCount: number
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "statusChangeNotifications")) {
      return;
    }

    const isDesigner = context.recipientRole === "designer";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    await ProjectNotifications.clarificationAnswered(
      context.projectName,
      answeredCount,
      totalCount,
      isDesigner,
      onClick
    );

    console.log(`💬 세부 설명 답변 알림 전송: ${answeredCount}/${totalCount}`);
  }

  /**
   * 작업 진행 시작 알림
   */
  async notifyWorkProgressStarted(
    context: NotificationContext,
    workProgress: WorkProgress
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "statusChangeNotifications")) {
      return;
    }

    const isClient = context.recipientRole === "client";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    await ProjectNotifications.workProgressStarted(
      context.projectName,
      workProgress.checklist_items.length,
      workProgress.estimated_completion,
      isClient,
      onClick
    );

    console.log(`🚀 작업 시작 알림 전송: ${workProgress.checklist_items.length}개 항목`);
  }

  /**
   * 작업 진행 상황 업데이트 알림
   */
  async notifyWorkProgressUpdated(
    context: NotificationContext,
    workProgress: WorkProgress
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "statusChangeNotifications")) {
      return;
    }

    const completedItems = workProgress.checklist_items.filter(item => item.status === "completed").length;
    const isClient = context.recipientRole === "client";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    await ProjectNotifications.workProgressUpdated(
      context.projectName,
      completedItems,
      workProgress.checklist_items.length,
      workProgress.overall_progress,
      isClient,
      onClick
    );

    console.log(`📊 작업 진행 상황 알림: ${workProgress.overall_progress}%`);
  }

  /**
   * 수정 횟수 차감 알림
   */
  async notifyModificationCountDeducted(
    context: NotificationContext,
    remainingCount: number
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "statusChangeNotifications")) {
      return;
    }

    const isClient = context.recipientRole === "client";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    await ProjectNotifications.modificationCountDeducted(
      context.projectName,
      remainingCount,
      isClient,
      onClick
    );

    // 수정 횟수가 적으면 경고 알림 추가
    if (remainingCount <= 1 && isClient) {
      setTimeout(() => {
        ProjectNotifications.deadlineApproaching(
          context.projectName + " (수정 횟수 부족)",
          0,
          onClick
        );
      }, 3000);
    }

    console.log(`📉 수정 횟수 차감 알림: 잔여 ${remainingCount}회`);
  }

  /**
   * 수정 횟수 복구 알림
   */
  async notifyModificationCountRestored(
    context: NotificationContext,
    restoredCount: number
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "statusChangeNotifications")) {
      return;
    }

    const isClient = context.recipientRole === "client";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    await ProjectNotifications.modificationCountRestored(
      context.projectName,
      restoredCount,
      isClient,
      onClick
    );

    console.log(`📈 수정 횟수 복구 알림: 현재 ${restoredCount}회`);
  }

  /**
   * 수정 요청 승인/거절 시 알림
   */
  async notifyModificationRequestDecision(
    context: NotificationContext,
    modificationRequest: ModificationRequest,
    decision: "approved" | "rejected",
    reason?: string
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "statusChangeNotifications")) {
      return;
    }

    const isClient = context.recipientRole === "client";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    const title = decision === "approved" ? "수정 요청 승인" : "수정 요청 거절";
    const body = decision === "approved" 
      ? `${context.projectName}의 ${modificationRequest.request_number}차 수정 요청이 승인되어 작업이 시작됩니다.`
      : `${context.projectName}의 ${modificationRequest.request_number}차 수정 요청이 거절되었습니다.${reason ? ` 사유: ${reason}` : ''}`;

    await ProjectNotifications.statusChanged(
      context.projectName,
      decision === "approved" ? "작업 시작" : "요청 거절",
      onClick
    );

    console.log(`⚖️ 수정 요청 결정 알림: ${decision}`);
  }

  /**
   * 워크플로우 완료 알림
   */
  async notifyWorkflowCompleted(
    context: NotificationContext,
    modificationRequest: ModificationRequest
  ): Promise<void> {
    const settings = NotificationSettings.getSettings();
    
    if (!this.shouldSendNotification(settings, "completionNotifications")) {
      return;
    }

    const isClient = context.recipientRole === "client";
    const onClick = context.actionUrl ? () => window.location.href = context.actionUrl! : undefined;

    if (isClient) {
      await ProjectNotifications.completionRequested(context.projectName, onClick);
    } else {
      await ProjectNotifications.statusChanged(
        context.projectName,
        "수정 작업 완료",
        onClick
      );
    }

    console.log(`🎉 워크플로우 완료 알림 전송`);
  }

  /**
   * 알림 전송 여부 판단
   */
  private shouldSendNotification(
    settings: Record<string, unknown>,
    notificationType: string
  ): boolean {
    // 조용한 시간 확인
    if (settings.quietHours && (settings.quietHours as any).enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      
      const [startHour, startMin] = (settings.quietHours as any).start.split(":").map(Number);
      const [endHour, endMin] = (settings.quietHours as any).end.split(":").map(Number);
      const startTime = startHour * 100 + startMin;
      const endTime = endHour * 100 + endMin;
      
      const isQuietTime = startTime <= endTime 
        ? (currentTime >= startTime && currentTime <= endTime)
        : (currentTime >= startTime || currentTime <= endTime);
        
      if (isQuietTime) {
        console.log("🔇 조용한 시간으로 알림 생략");
        return false;
      }
    }

    // 푸시 알림 설정 확인
    if (!settings.pushEnabled) {
      console.log("🔕 푸시 알림 비활성화로 알림 생략");
      return false;
    }

    // 특정 알림 타입 설정 확인
    if (!settings[notificationType]) {
      console.log(`🔕 ${notificationType} 알림 비활성화로 알림 생략`);
      return false;
    }

    return true;
  }

  /**
   * 배치 알림 (여러 수신자에게 한번에)
   */
  async notifyMultipleUsers(
    contexts: NotificationContext[],
    notificationFn: (context: NotificationContext) => Promise<void>
  ): Promise<void> {
    const promises = contexts.map(context => 
      notificationFn(context).catch(error => {
        console.error(`알림 전송 실패 (${context.recipientId}):`, error);
      })
    );

    await Promise.allSettled(promises);
    console.log(`📤 배치 알림 전송 완료: ${contexts.length}명`);
  }

  /**
   * 예약 알림 (특정 시간에)
   */
  scheduleNotification(
    context: NotificationContext,
    notificationFn: (context: NotificationContext) => Promise<void>,
    scheduleTime: Date
  ): void {
    const delay = scheduleTime.getTime() - new Date().getTime();
    
    if (delay <= 0) {
      console.warn("예약 시간이 이미 지났습니다.");
      return;
    }

    setTimeout(() => {
      notificationFn(context).catch(error => {
        console.error("예약 알림 전송 실패:", error);
      });
    }, delay);

    console.log(`⏰ 알림 예약됨: ${scheduleTime.toLocaleString('ko-KR')}`);
  }
}

// 편의성 함수들
export const workflowNotification = WorkflowNotificationService.getInstance();

export const createNotificationContext = (
  projectId: string,
  projectName: string,
  recipientId: string,
  recipientRole: "client" | "designer",
  actionUrl?: string
): NotificationContext => ({
  projectId,
  projectName,
  recipientId,
  recipientRole,
  actionUrl
});