// Notifications client utility with seeding, using localStorage
import { NotificationItem } from "@/types";

const STORAGE_KEY = "deeo_notifications";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedIfEmpty() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return;
  const seed: NotificationItem[] = [
    {
      id: "notif_0001",
      user_id: "1",
      message: "김디자이너로부터 새로운 프로젝트 요청이 도착했습니다.",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      url: "/requests",
    },
    {
      id: "notif_0002",
      user_id: "1",
      message: "브랜드 로고 디자인 프로젝트 요청을 검토해주세요.",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      url: "/requests",
    },
    {
      id: "notif_0003",
      user_id: "1",
      message: "웹사이트 UI/UX 프로젝트의 1차 보고물이 업로드되었습니다.",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      url: "/projects/2?tab=reports",
    },
    {
      id: "notif_0004",
      user_id: "1",
      message: "로고 디자인 프로젝트 최종 검토 마감일까지 2일 남았습니다.",
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      url: "/projects/1?tab=timeline",
    },
    {
      id: "notif_0005",
      user_id: "2",
      message: "스타트업 A에서 새로운 프로젝트 의뢰가 도착했습니다.",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      url: "/proposals",
    },
    {
      id: "notif_0006",
      user_id: "2", 
      message: "카페 체인 C 프로젝트 협상이 시작되었습니다.",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      url: "/proposals",
    },
    {
      id: "notif_0007",
      user_id: "2",
      message: "새 메시지가 도착했습니다.",
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      url: "/messages?conversation=abc123",
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

function readFromStorage(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  seedIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as NotificationItem[];
    return [];
  } catch {
    return [];
  }
}

function writeToStorage(notifs: NotificationItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

export async function getNotifications(
  userId?: string
): Promise<NotificationItem[]> {
  await delay(250);
  const data = readFromStorage();
  if (!userId) return data;
  return data.filter((n) => n.user_id === userId);
}

export async function markAsRead(notificationId: string): Promise<void> {
  await delay(150);
  const data = readFromStorage();
  const updated = data.map((n) =>
    n.id === notificationId ? { ...n, is_read: true } : n
  );
  writeToStorage(updated);
}

export async function addNotification(
  notification: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>
): Promise<void> {
  await delay(150);
  const data = readFromStorage();
  
  const newNotification: NotificationItem = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    is_read: false,
    created_at: new Date().toISOString()
  };
  
  const next = [newNotification, ...data];
  writeToStorage(next);
}
