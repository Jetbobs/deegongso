// 브라우저 푸시 알림 관리자
export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private permission: NotificationPermission = "default";
  private isSupported: boolean = false;

  private constructor() {
    // 브라우저 환경에서만 초기화
    if (typeof window !== "undefined") {
      this.checkSupport();
      this.updatePermission();
    }
  }

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  private checkSupport(): void {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      this.isSupported =
        "Notification" in window && "serviceWorker" in navigator;
    }
  }

  private updatePermission(): void {
    if (this.isSupported && typeof window !== "undefined") {
      this.permission = Notification.permission;
    }
  }

  // 푸시 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    if (!this.isSupported) {
      console.warn("Push notifications are not supported in this browser");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    if (this.permission === "denied") {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }

  // 즉시 알림 표시
  async showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: { action: string; title: string; icon?: string }[];
    silent?: boolean;
    requireInteraction?: boolean;
    onClick?: () => void;
  }): Promise<Notification | null> {
    if (typeof window === "undefined") return null;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/favicon.ico",
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        silent: options.silent,
        requireInteraction: options.requireInteraction,
      });

      // 클릭 이벤트 처리
      if (options.onClick) {
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          options.onClick!();
          notification.close();
        };
      }

      // 자동 닫기 (기본 5초)
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error("Failed to show notification:", error);
      return null;
    }
  }

  // Service Worker를 통한 푸시 알림 (백그라운드 알림)
  async showServiceWorkerNotification(options: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: { action: string; title: string; icon?: string }[];
    silent?: boolean;
    requireInteraction?: boolean;
  }): Promise<void> {
    if (typeof window === "undefined" || !this.isSupported) return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || "/favicon.ico",
        badge: options.badge || "/favicon.ico",
        tag: options.tag,
        data: options.data,
        silent: options.silent,
        requireInteraction: options.requireInteraction,
      });
    } catch (error) {
      console.error("Failed to show service worker notification:", error);
    }
  }

  // 권한 상태 확인
  getPermissionStatus(): NotificationPermission {
    if (typeof window !== "undefined") {
      this.updatePermission();
    }
    return this.permission;
  }

  // 알림 지원 여부 확인
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // 특정 태그의 알림들 닫기
  async closeNotificationsByTag(tag: string): Promise<void> {
    if (typeof window === "undefined" || !this.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications({ tag });
      notifications.forEach((notification) => notification.close());
    } catch (error) {
      console.error("Failed to close notifications:", error);
    }
  }

  // 모든 알림 닫기
  async closeAllNotifications(): Promise<void> {
    if (typeof window === "undefined" || !this.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      notifications.forEach((notification) => notification.close());
    } catch (error) {
      console.error("Failed to close all notifications:", error);
    }
  }
}

// 편의성 함수들 - 조건부 초기화
let pushManager: PushNotificationManager | null = null;

function getPushManager(): PushNotificationManager | null {
  if (typeof window === "undefined") return null;
  if (!pushManager) {
    pushManager = PushNotificationManager.getInstance();
  }
  return pushManager;
}

export const showPushNotification = (
  options: Parameters<PushNotificationManager["showNotification"]>[0]
) => {
  const manager = getPushManager();
  return manager ? manager.showNotification(options) : Promise.resolve(null);
};

export const requestNotificationPermission = () => {
  const manager = getPushManager();
  return manager ? manager.requestPermission() : Promise.resolve(false);
};

export const getNotificationPermission = (): NotificationPermission => {
  const manager = getPushManager();
  return manager ? manager.getPermissionStatus() : "default";
};

// 프로젝트 관련 알림 템플릿
export const ProjectNotifications = {
  feedbackReceived: (projectName: string, onClick?: () => void) => {
    return showPushNotification({
      title: "새로운 피드백",
      body: `${projectName} 프로젝트에 새 피드백이 도착했습니다.`,
      icon: "/favicon.ico",
      tag: "feedback",
      onClick,
    });
  },

  statusChanged: (
    projectName: string,
    newStatus: string,
    onClick?: () => void
  ) => {
    return showPushNotification({
      title: "프로젝트 상태 변경",
      body: `${projectName}이(가) ${newStatus} 상태로 변경되었습니다.`,
      icon: "/favicon.ico",
      tag: "status-change",
      onClick,
    });
  },

  deadlineApproaching: (
    projectName: string,
    daysLeft: number,
    onClick?: () => void
  ) => {
    return showPushNotification({
      title: "마감일 알림",
      body: `${projectName} 마감까지 ${daysLeft}일 남았습니다.`,
      icon: "/favicon.ico",
      tag: "deadline",
      requireInteraction: true,
      onClick,
    });
  },

  messageReceived: (
    senderName: string,
    message: string,
    onClick?: () => void
  ) => {
    return showPushNotification({
      title: `${senderName}님의 새 메시지`,
      body: message.length > 50 ? message.substring(0, 50) + "..." : message,
      icon: "/favicon.ico",
      tag: "message",
      onClick,
    });
  },

  completionRequested: (projectName: string, onClick?: () => void) => {
    return showPushNotification({
      title: "완료 승인 요청",
      body: `${projectName} 프로젝트 완료 승인이 요청되었습니다.`,
      icon: "/favicon.ico",
      tag: "completion",
      requireInteraction: true,
      onClick,
    });
  },

  // 수정 요청 워크플로우 전용 알림
  modificationRequestSubmitted: (
    projectName: string,
    requestNumber: number,
    remainingCount: number,
    isDesigner: boolean,
    onClick?: () => void
  ) => {
    const title = isDesigner ? "수정 요청 도착" : "수정 요청 제출 완료";
    const body = isDesigner 
      ? `${projectName}의 ${requestNumber}차 수정 요청을 검토해주세요.`
      : `${projectName}의 수정 요청이 제출되었습니다. (남은 횟수: ${remainingCount}회)`;
    
    return showPushNotification({
      title,
      body,
      icon: "/favicon.ico",
      tag: `modification-request-${requestNumber}`,
      requireInteraction: isDesigner,
      onClick,
    });
  },

  clarificationRequested: (
    projectName: string,
    requestCount: number,
    isClient: boolean,
    onClick?: () => void
  ) => {
    const title = isClient ? "세부 설명 요청" : "세부 설명 요청 완료";
    const body = isClient 
      ? `${projectName}에 대한 세부 설명 요청 ${requestCount}건이 도착했습니다.`
      : `${projectName}의 세부 설명 요청이 전송되었습니다.`;
    
    return showPushNotification({
      title,
      body,
      icon: "/favicon.ico",
      tag: "clarification",
      requireInteraction: isClient,
      onClick,
    });
  },

  clarificationAnswered: (
    projectName: string,
    answeredCount: number,
    totalCount: number,
    isDesigner: boolean,
    onClick?: () => void
  ) => {
    const title = isDesigner ? "세부 설명 답변 도착" : "세부 설명 답변 완료";
    const body = isDesigner 
      ? `${projectName}의 세부 설명 답변이 도착했습니다. (${answeredCount}/${totalCount})`
      : `${projectName}의 세부 설명 답변이 전송되었습니다.`;
    
    return showPushNotification({
      title,
      body,
      icon: "/favicon.ico",
      tag: "clarification-answered",
      onClick,
    });
  },

  workProgressStarted: (
    projectName: string,
    totalItems: number,
    estimatedCompletion: string,
    isClient: boolean,
    onClick?: () => void
  ) => {
    const title = isClient ? "작업 시작 알림" : "작업 계획 수립 완료";
    const body = isClient 
      ? `${projectName} 수정 작업이 시작되었습니다. (총 ${totalItems}개 항목, 예상 완료: ${new Date(estimatedCompletion).toLocaleDateString('ko-KR')})`
      : `${projectName}의 작업 계획이 수립되었습니다.`;
    
    return showPushNotification({
      title,
      body,
      icon: "/favicon.ico",
      tag: "work-started",
      onClick,
    });
  },

  workProgressUpdated: (
    projectName: string,
    completedItems: number,
    totalItems: number,
    overallProgress: number,
    isClient: boolean,
    onClick?: () => void
  ) => {
    if (!isClient) return; // 디자이너에게는 알림 안 함
    
    const milestones = [25, 50, 75, 90]; // 주요 진행률에서만 알림
    const shouldNotify = milestones.some(milestone => 
      overallProgress >= milestone && (overallProgress - 10) < milestone
    );
    
    if (!shouldNotify) return;
    
    return showPushNotification({
      title: "작업 진행 상황 업데이트",
      body: `${projectName} 수정 작업이 ${overallProgress}% 완료되었습니다. (${completedItems}/${totalItems} 항목 완료)`,
      icon: "/favicon.ico",
      tag: "work-progress",
      onClick,
    });
  },

  modificationCountDeducted: (
    projectName: string,
    remainingCount: number,
    isClient: boolean,
    onClick?: () => void
  ) => {
    if (!isClient) return; // 클라이언트에게만 알림
    
    return showPushNotification({
      title: "수정 횟수 차감",
      body: `${projectName}의 수정 횟수가 차감되었습니다. 남은 횟수: ${remainingCount}회`,
      icon: "/favicon.ico",
      tag: "count-deducted",
      onClick,
    });
  },

  modificationCountRestored: (
    projectName: string,
    restoredCount: number,
    isClient: boolean,
    onClick?: () => void
  ) => {
    if (!isClient) return; // 클라이언트에게만 알림
    
    return showPushNotification({
      title: "수정 횟수 복구",
      body: `${projectName}의 수정 요청이 거절되어 수정 횟수 1회가 복구되었습니다. (현재: ${restoredCount}회)`,
      icon: "/favicon.ico",
      tag: "count-restored",
      onClick,
    });
  }
};

// 알림 설정 관리
export class NotificationSettings {
  private static readonly STORAGE_KEY = "deeo_notification_settings";

  static getSettings() {
    if (typeof window === "undefined") return this.getDefaultSettings();

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return this.getDefaultSettings();

    try {
      return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
    } catch {
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: Partial<NotificationSettingsType>) {
    if (typeof window === "undefined") return;

    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  private static getDefaultSettings(): NotificationSettingsType {
    return {
      pushEnabled: false,
      toastEnabled: true,
      emailEnabled: true,
      feedbackNotifications: true,
      statusChangeNotifications: true,
      messageNotifications: true,
      deadlineNotifications: true,
      completionNotifications: true,
      sound: true,
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    };
  }
}

export interface NotificationSettingsType {
  pushEnabled: boolean;
  toastEnabled: boolean;
  emailEnabled: boolean;
  feedbackNotifications: boolean;
  statusChangeNotifications: boolean;
  messageNotifications: boolean;
  deadlineNotifications: boolean;
  completionNotifications: boolean;
  sound: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

// 조용한 시간 확인
export function isQuietHours(settings: NotificationSettingsType): boolean {
  if (!settings.quietHours.enabled) return false;

  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  const [startHour, startMin] = settings.quietHours.start
    .split(":")
    .map(Number);
  const [endHour, endMin] = settings.quietHours.end.split(":").map(Number);

  const startTime = startHour * 100 + startMin;
  const endTime = endHour * 100 + endMin;

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // 자정을 넘나드는 경우 (예: 22:00 - 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
}
