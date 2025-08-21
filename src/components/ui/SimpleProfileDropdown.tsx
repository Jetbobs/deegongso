"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function SimpleProfileDropdown() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      await signOut();
      router.push("/login");
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserRole = () => {
    const role = user?.role ?? user?.userType;
    switch(role) {
      case "client": return "클라이언트";
      case "designer": return "디자이너";
      case "admin": return "관리자";
      default: return "사용자";
    }
  };

  const getAvatarColor = () => {
    const role = user?.role ?? user?.userType;
    switch(role) {
      case "client": return "bg-blue-500";
      case "designer": return "bg-green-500";
      case "admin": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="relative">
      <button 
        className="btn btn-ghost btn-circle avatar"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`w-8 h-8 rounded-full ${getAvatarColor()} text-white flex items-center justify-center text-sm font-semibold`}>
          {getUserInitials()}
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-[1000]">
          <div className="p-4 border-b border-gray-200">
            <div className="font-semibold text-gray-900">
              {user?.name || user?.email || "사용자"}
            </div>
            <div className="text-sm text-gray-500">
              {getUserRole()}
            </div>
          </div>
          
          <div className="py-2">
            <Link 
              href="/profile" 
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              프로필
            </Link>
            
            {(user?.role ?? user?.userType) === "admin" && (
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                관리자 대시보드
              </Link>
            )}
            
            <Link 
              href="/settings" 
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              설정
            </Link>
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