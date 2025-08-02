"use client";

import { NavigationItem, UserRole } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ userRole, isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  // 역할별 네비게이션 메뉴
  const getNavigationItems = (role: UserRole): NavigationItem[] => {
    const commonItems: NavigationItem[] = [
      { label: "대시보드", href: "/dashboard", icon: "🏠" },
      { label: "내 프로젝트", href: "/projects", icon: "📁" },
      { label: "메시지", href: "/messages", icon: "💬", badge: 3 },
      { label: "설정", href: "/settings", icon: "⚙️" },
    ];

    if (role === "designer") {
      return [
        ...commonItems.slice(0, 2),
        { label: "계약 관리", href: "/contracts", icon: "📋" },
        ...commonItems.slice(2),
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems(userRole);

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-base-100 border-r border-base-300
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* 로고 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 h-16">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Deeo
          </Link>
          <button onClick={onClose} className="btn btn-ghost btn-sm lg:hidden">
            ✕
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="p-4 flex-1 overflow-y-auto" data-tour="sidebar">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const tourAttribute =
                item.href === "/projects"
                  ? { "data-tour": "projects" }
                  : item.href === "/messages"
                  ? { "data-tour": "messages" }
                  : {};

              return (
                <li key={item.href} {...tourAttribute}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-between p-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-content"
                          : "hover:bg-base-200"
                      }
                    `}
                    onClick={onClose}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="badge badge-secondary badge-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 사용자 정보 */}
        <div className="absolute bottom-0 w-full p-4 border-t border-base-300 bg-base-100">
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span className="text-sm">JD</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userRole === "client" ? "클라이언트" : "디자이너"}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                user@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
