"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuth } from "@/hooks/useAuth";

export default function AdminHeader() {
  const { user } = useAdminAuth();
  const { signOut } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      await signOut();
      router.push("/login");
    }
  };

  const mockNotifications = [
    {
      id: "1",
      message: "새로운 사용자 가입 요청이 있습니다.",
      time: "5분 전",
      isRead: false
    },
    {
      id: "2",
      message: "분쟁 해결 요청이 등록되었습니다.",
      time: "15분 전", 
      isRead: false
    },
    {
      id: "3",
      message: "시스템 백업이 완료되었습니다.",
      time: "1시간 전",
      isRead: true
    }
  ];

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

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
          {/* 알림 드롭다운 */}
          <div className="relative">
            <button 
              className="relative p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 17H4l5 5v-5z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">알림</h3>
                    <span className="text-sm text-gray-500">미확인 {unreadCount}</span>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 관리자 프로필 드롭다운 */}
          <div className="relative">
            <button 
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.admin_level} Admin</p>
              </div>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.[0]}
                </span>
              </div>
            </button>
            
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="font-semibold text-gray-900">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {user?.admin_level} 관리자
                  </div>
                </div>
                
                <div className="py-2">
                  <button 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/profile");
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    프로필
                  </button>
                  
                  <button 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/admin/settings");
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    관리자 설정
                  </button>
                  
                  <button 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/dashboard");
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v6l3-3 3 3V5a2 2 0 00-2-2H10a2 2 0 00-2 2z" />
                    </svg>
                    일반 대시보드
                  </button>
                </div>
                
                <div className="border-t border-gray-200">
                  <button 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 외부 클릭시 드롭다운 닫기 */}
        {(showNotifications || showProfile) && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowNotifications(false);
              setShowProfile(false);
            }}
          />
        )}
      </div>
    </header>
  );
}