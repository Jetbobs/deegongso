"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications as fetchNotifications,
  markAsRead,
} from "@/lib/notifications";
import { NotificationItem } from "@/types";

interface Props {
  userId?: string;
}

export default function NotificationsDropdown({ userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await fetchNotifications(userId);
      if (mounted) {
        setItems(data);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const unread = useMemo(() => items.filter((n) => !n.is_read), [items]);

  const markAllAsRead = async () => {
    // 개별 호출 대신 클라이언트 상태만 즉시 반영 (mock 환경)
    const pending = unread.map((n) => markAsRead(n.id));
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    await Promise.allSettled(pending);
  };

  const handleClick = async (n: NotificationItem) => {
    await markAsRead(n.id);
    setItems((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
    );
    router.push(n.url);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
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
              d="M15 17h5l-5 5v-5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17H4l5 5v-5z"
            />
          </svg>
          {unread.length > 0 && (
            <span className="badge badge-primary badge-sm indicator-item">
              {unread.length}
            </span>
          )}
        </div>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-80"
      >
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-sm font-semibold">알림</span>
          <div className="flex items-center gap-2">
            <span className="badge badge-sm">미확인 {unread.length}</span>
            {unread.length > 0 && (
              <button className="btn btn-ghost btn-xs" onClick={markAllAsRead}>
                모두 읽음
              </button>
            )}
          </div>
        </div>
        <div className="divider my-1"></div>
        {loading && (
          <div className="p-4 text-sm text-base-content/60">로딩 중...</div>
        )}
        {!loading && unread.length === 0 && (
          <div className="p-4 text-sm text-base-content/60">
            새 알림이 없습니다
          </div>
        )}
        {!loading && unread.length > 0 && (
          <ul className="max-h-80 overflow-auto">
            {unread.map((n) => (
              <li key={n.id}>
                <button
                  className="w-full text-left p-3 hover:bg-base-200 rounded"
                  onClick={() => handleClick(n)}
                >
                  <div className="text-sm">{n.message}</div>
                  <div className="text-xs text-base-content/60 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
