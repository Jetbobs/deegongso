"use client";

import { useState } from "react";

const mockNotifications = [
  {
    id: "1",
    message: "새로운 프로젝트 요청이 도착했습니다.",
    time: "5분 전",
    isRead: false
  },
  {
    id: "2", 
    message: "프로젝트 검토가 완료되었습니다.",
    time: "15분 전",
    isRead: false
  },
  {
    id: "3",
    message: "결제가 완료되었습니다.",
    time: "1시간 전",
    isRead: true
  }
];

export default function SimpleNotificationsDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button 
        className="btn btn-ghost btn-sm relative"
        onClick={() => setIsOpen(!isOpen)}
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
            d="M15 17h5l-5 5v-5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17H4l5 5v-5z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[1000]">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">알림</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">미확인 {unreadCount}</span>
                {unreadCount > 0 && (
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={markAllAsRead}
                  >
                    모두 읽음
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                새 알림이 없습니다
              </div>
            ) : (
              notifications.map((notification) => (
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
              ))
            )}
          </div>
        </div>
      )}
      
      {/* 외부 클릭시 닫기 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[999]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}