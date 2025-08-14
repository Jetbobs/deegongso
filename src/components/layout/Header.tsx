"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import NotificationsDropdown from "@/components/ui/NotificationsDropdown";
import GlobalSearch from "@/components/search/GlobalSearch";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header = ({ title, onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      await signOut();
      router.push("/login");
    }
  };

  // 사용자 이니셜 생성
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
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
          <NotificationsDropdown userId={user?.id} />
          {/** 미확인 개수 뱃지를 아이콘에 수치로 표시하도록 개선하려면 NotificationsDropdown 내부에서 처리됨 */}

          {/* 사용자 드롭다운 */}
          <div className="dropdown dropdown-end" data-tour="profile">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-8 rounded-full">
                <div className="avatar placeholder">
                  <div
                    className={`${
                      (user?.role ?? user?.userType) === "client"
                        ? "bg-primary text-primary-content"
                        : "bg-secondary text-secondary-content"
                    } rounded-full w-8`}
                  >
                    <span className="text-xs">{getUserInitials()}</span>
                  </div>
                </div>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-48 sm:w-52"
            >
              <li className="menu-title">
                <span>{user?.name || user?.email}</span>
                <span className="text-xs opacity-60">
                  {(user?.role ?? user?.userType) === "client"
                    ? "클라이언트"
                    : "디자이너"}
                </span>
              </li>
              <li>
                <Link href="/profile">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  프로필
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  설정
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-error"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  로그아웃
                </button>
              </li>
            </ul>
          </div>
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
