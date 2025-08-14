"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { NotificationItem } from "@/types";
import { getNotifications, markAsRead } from "@/lib/notifications";
import { useToastActions } from "./Toast";
import { NotificationSettings, isQuietHours } from "@/lib/pushNotifications";

interface EnhancedNotificationsDropdownProps {
  userId?: string;
  showMarkAllRead?: boolean;
  maxDisplayCount?: number;
}

export default function EnhancedNotificationsDropdown({
  userId,
  showMarkAllRead = true,
  maxDisplayCount = 10
}: EnhancedNotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { success } = useToastActions();

  // 알림 로드
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // 30초마다 알림 새로고침
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 필터링된 알림
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.is_read
  ).slice(0, maxDisplayCount);

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // 알림 읽음 처리
  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    setIsOpen(false);
  };

  // 모든 알림 읽음 처리
  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    try {
      await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      success("모든 알림을 읽음으로 표시했습니다.");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (message: string) => {
    if (message.includes('피드백')) return '💬';
    if (message.includes('상태')) return '📈';
    if (message.includes('메시지')) return '✉️';
    if (message.includes('마감')) return '⏰';
    if (message.includes('완료')) return '✅';
    return '🔔';
  };

  // 알림 우선순위 결정
  const getNotificationPriority = (message: string): 'high' | 'medium' | 'low' => {
    if (message.includes('긴급') || message.includes('마감')) return 'high';
    if (message.includes('완료') || message.includes('승인')) return 'medium';
    return 'low';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-circle relative"
        data-tour="notifications"
      >
        <div className="indicator">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-3.5-3.5a11.95 11.95 0 01-1.5.707V17zm-6.5 0h3v-3.793c-.516-.219-1.01-.467-1.5-.742V17zm-1.5 0h-3l3.5-3.5c.49.275.984.523 1.5.742V17z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="badge badge-primary badge-sm indicator-item">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-base-100 border border-base-300 rounded-lg shadow-xl z-50 max-h-[500px] flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">알림</h3>
              {showMarkAllRead && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="btn btn-ghost btn-sm text-primary"
                >
                  모두 읽음
                </button>
              )}
            </div>

            {/* 필터 탭 */}
            <div className="tabs tabs-boxed tabs-xs">
              <button
                className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                전체 ({notifications.length})
              </button>
              <button
                className={`tab ${filter === 'unread' ? 'tab-active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                읽지 않음 ({unreadCount})
              </button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="skeleton w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-base-content/60">
                  {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-base-300">
                {filteredNotifications.map((notification) => {
                  const priority = getNotificationPriority(notification.message);
                  const icon = getNotificationIcon(notification.message);

                  return (
                    <div
                      key={notification.id}
                      className={`
                        p-4 hover:bg-base-200 cursor-pointer transition-colors
                        ${!notification.is_read ? 'bg-primary/5 border-l-4 border-l-primary' : ''}
                        ${priority === 'high' ? 'border-l-error border-l-4' : ''}
                      `}
                    >
                      {notification.url ? (
                        <Link
                          href={notification.url}
                          onClick={() => handleNotificationClick(notification)}
                          className="block"
                        >
                          <NotificationContent 
                            notification={notification}
                            icon={icon}
                            priority={priority}
                          />
                        </Link>
                      ) : (
                        <div onClick={() => handleNotificationClick(notification)}>
                          <NotificationContent 
                            notification={notification}
                            icon={icon}
                            priority={priority}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > maxDisplayCount && (
            <div className="p-3 border-t border-base-300 text-center">
              <Link
                href="/notifications"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsOpen(false)}
              >
                모든 알림 보기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NotificationContentProps {
  notification: NotificationItem;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

function NotificationContent({ notification, icon, priority }: NotificationContentProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-start space-x-3">
      {/* 아이콘 */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
        ${priority === 'high' ? 'bg-error/20 text-error' : 
          priority === 'medium' ? 'bg-warning/20 text-warning' : 
          'bg-primary/20 text-primary'}
      `}>
        {icon}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-base-content/60">
            {formatTime(notification.created_at)}
          </p>
          {!notification.is_read && (
            <div className="w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}