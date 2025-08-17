// 브라우저 푸시 알림 관리자
export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  private constructor() {
    this.checkSupport();
    this.updatePermission();
  }

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  private checkSupport(): void {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }

  private updatePermission(): void {
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  // 푸시 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
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
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        silent: options.silent,
        requireInteraction: options.requireInteraction
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
      console.error('Failed to show notification:', error);
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
    if (!this.isSupported) return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        data: options.data,
        silent: options.silent,
        requireInteraction: options.requireInteraction
      });
    } catch (error) {
      console.error('Failed to show service worker notification:', error);
    }
  }

  // 권한 상태 확인
  getPermissionStatus(): NotificationPermission {
    this.updatePermission();
    return this.permission;
  }

  // 알림 지원 여부 확인
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // 특정 태그의 알림들 닫기
  async closeNotificationsByTag(tag: string): Promise<void> {
    if (!this.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications({ tag });
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Failed to close notifications:', error);
    }
  }

  // 모든 알림 닫기
  async closeAllNotifications(): Promise<void> {
    if (!this.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Failed to close all notifications:', error);
    }
  }
}

// 편의성 함수들
const pushManager = PushNotificationManager.getInstance();

export const showPushNotification = (options: Parameters<typeof pushManager.showNotification>[0]) => {
  return pushManager.showNotification(options);
};

export const requestNotificationPermission = () => {
  return pushManager.requestPermission();
};

export const getNotificationPermission = () => {
  return pushManager.getPermissionStatus();
};

// 프로젝트 관련 알림 템플릿
export const ProjectNotifications = {
  feedbackReceived: (projectName: string, onClick?: () => void) => {
    return showPushNotification({
      title: '새로운 피드백',
      body: `${projectName} 프로젝트에 새 피드백이 도착했습니다.`,
      icon: '/favicon.ico',
      tag: 'feedback',
      onClick
    });
  },

  statusChanged: (projectName: string, newStatus: string, onClick?: () => void) => {
    return showPushNotification({
      title: '프로젝트 상태 변경',
      body: `${projectName}이(가) ${newStatus} 상태로 변경되었습니다.`,
      icon: '/favicon.ico',
      tag: 'status-change',
      onClick
    });
  },

  deadlineApproaching: (projectName: string, daysLeft: number, onClick?: () => void) => {
    return showPushNotification({
      title: '마감일 알림',
      body: `${projectName} 마감까지 ${daysLeft}일 남았습니다.`,
      icon: '/favicon.ico',
      tag: 'deadline',
      requireInteraction: true,
      onClick
    });
  },

  messageReceived: (senderName: string, message: string, onClick?: () => void) => {
    return showPushNotification({
      title: `${senderName}님의 새 메시지`,
      body: message.length > 50 ? message.substring(0, 50) + '...' : message,
      icon: '/favicon.ico',
      tag: 'message',
      onClick
    });
  },

  completionRequested: (projectName: string, onClick?: () => void) => {
    return showPushNotification({
      title: '완료 승인 요청',
      body: `${projectName} 프로젝트 완료 승인이 요청되었습니다.`,
      icon: '/favicon.ico',
      tag: 'completion',
      requireInteraction: true,
      onClick
    });
  }
};

// 알림 설정 관리
export class NotificationSettings {
  private static readonly STORAGE_KEY = 'deeo_notification_settings';

  static getSettings() {
    if (typeof window === 'undefined') return this.getDefaultSettings();
    
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return this.getDefaultSettings();

    try {
      return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
    } catch {
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: Partial<NotificationSettingsType>) {
    if (typeof window === 'undefined') return;

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
        start: '22:00',
        end: '08:00'
      }
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
    end: string;   // HH:MM
  };
}

// 조용한 시간 확인
export function isQuietHours(settings: NotificationSettingsType): boolean {
  if (!settings.quietHours.enabled) return false;

  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
  const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
  
  const startTime = startHour * 100 + startMin;
  const endTime = endHour * 100 + endMin;

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // 자정을 넘나드는 경우 (예: 22:00 - 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
}