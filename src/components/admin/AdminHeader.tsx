"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminHeader() {
  const { user } = useAdminAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Deeo Admin Panel
          </h1>
          <span className="text-sm text-gray-500">관리자 대시보드</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 알림 아이콘 */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-5 5h5m-5-5v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1m3-9V5a3 3 0 013-3h6a3 3 0 013 3v4M9 12l2 2 4-4" />
            </svg>
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* 관리자 프로필 */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.admin_level} Admin</p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}