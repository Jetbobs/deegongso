"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SimpleNotificationsDropdown from "@/components/ui/SimpleNotificationsDropdown";
import SimpleProfileDropdown from "@/components/ui/SimpleProfileDropdown";
import GlobalSearch from "@/components/search/GlobalSearch";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header = ({ title, onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuth();

  // 개발용 역할 전환 함수
  const handleRoleSwitch = () => {
    const currentRole = user?.role ?? user?.userType ?? "client";
    const newRole = currentRole === "client" ? "designer" : "client";
    
    // localStorage에서 사용자 정보 업데이트
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    userData.role = newRole;
    userData.userType = newRole;
    localStorage.setItem('user', JSON.stringify(userData));
    
    // 페이지 새로고침하여 변경사항 적용
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-base-100 border-b border-base-300 lg:left-64">
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={onMenuClick}
            className="btn btn-ghost btn-sm lg:hidden flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* 페이지 제목 - 모바일에서는 숨김 */}
          <h1 className="hidden sm:block text-lg sm:text-xl font-semibold text-base-content truncate">{title}</h1>
        </div>

        {/* 전역 검색 - 데스크탑 */}
        <div className="hidden lg:block flex-1 max-w-md mx-4">
          <GlobalSearch />
        </div>

        {/* 헤더 액션들 */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* 개발용 역할 전환 버튼 */}
          {process.env.NODE_ENV === 'development' && (
            <button
              className="btn btn-outline btn-sm"
              onClick={handleRoleSwitch}
              title="역할 전환 (개발용)"
            >
              🔄 {(user?.role ?? user?.userType) === "client" ? "디자이너로" : "클라이언트로"}
            </button>
          )}

          {/* Admin 페이지 링크 */}
          <Link href="/admin" className="btn btn-error btn-sm">
            🛠️ Admin
          </Link>

          {/* 모바일 검색 버튼 */}
          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => {
              // 모바일 검색 모달 열기
              const searchModal = document.getElementById('mobile-search-modal') as HTMLDialogElement;
              searchModal?.showModal();
            }}
          >
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* 알림 드롭다운 */}
          <SimpleNotificationsDropdown />

          {/* 사용자 드롭다운 */}
          <SimpleProfileDropdown />
        </div>
      </div>

      {/* 모바일 검색 모달 */}
      <dialog id="mobile-search-modal" className="modal lg:hidden">
        <div className="modal-box w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">검색</h3>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm">✕</button>
            </form>
          </div>
          <GlobalSearch 
            placeholder="프로젝트, 메시지, 파일 검색..." 
            showShortcut={false}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </header>
  );
};

export default Header;
