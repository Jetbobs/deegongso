"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header = ({ title, onMenuClick }: HeaderProps) => {
  const router = useRouter();

  const handleLogout = () => {
    // 실제로는 인증 상태 초기화 및 토큰 삭제 등의 로직이 들어갈 것
    if (confirm("로그아웃 하시겠습니까?")) {
      // 로그인 페이지로 리다이렉트 (실제로는 로그인 페이지 경로로 변경)
      router.push("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-base-100 border-b border-base-300 lg:left-64">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={onMenuClick}
            className="btn btn-ghost btn-sm lg:hidden"
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

          {/* 페이지 제목 */}
          <h1 className="text-xl font-semibold text-base-content">{title}</h1>
        </div>

        {/* 헤더 액션들 */}
        <div className="flex items-center space-x-2">
          {/* 알림 버튼 */}
          <button className="btn btn-ghost btn-sm">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v3m0 12v3m9-9h-3M3 12h3m15.364-6.364l-2.121 2.121M6.757 17.243l-2.121 2.121m12.728 0l-2.121-2.121M6.757 6.757L4.636 4.636"
                />
              </svg>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>

          {/* 사용자 드롭다운 */}
          <div className="dropdown dropdown-end" data-tour="profile">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-8 rounded-full">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-8">
                    <span className="text-xs">JD</span>
                  </div>
                </div>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <Link href="/profile">프로필</Link>
              </li>
              <li>
                <Link href="/settings">설정</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="w-full text-left">
                  로그아웃
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
