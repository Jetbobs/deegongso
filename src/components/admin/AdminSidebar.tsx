"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminMenuItem {
  label: string;
  href: string;
  icon: string;
  permission?: keyof import("@/types").AdminPermissions;
  badge?: number;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAdminAuth();

  const menuItems: AdminMenuItem[] = [
    {
      label: "대시보드",
      href: "/admin/dashboard",
      icon: "📊",
    },
    {
      label: "사용자 관리",
      href: "/admin/users",
      icon: "👥",
      permission: "user_management",
    },
    {
      label: "공지사항",
      href: "/admin/announcements",
      icon: "📢",
      permission: "announcement_management",
    },
    {
      label: "분쟁 해결",
      href: "/admin/disputes",
      icon: "⚖️",
      permission: "dispute_resolution",
      badge: 3,
    },
    {
      label: "통계 분석",
      href: "/admin/analytics",
      icon: "📈",
      permission: "analytics_access",
    },
    {
      label: "플랫폼 설정",
      href: "/admin/settings",
      icon: "⚙️",
      permission: "platform_settings",
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold">관리 메뉴</h2>
          <p className="text-sm text-gray-400 mt-1">시스템 관리 도구</p>
        </div>

        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-12 pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">빠른 액션</div>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded">
              🚨 긴급 알림 전송
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded">
              📋 시스템 상태 확인
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded">
              🔒 보안 로그 조회
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}