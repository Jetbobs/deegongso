"use client";

import { useState } from "react";
import { UserRole } from "@/types";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  userRole?: UserRole;
}

const DashboardLayout = ({
  children,
  title = "Dashboard",
  userRole = "client",
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-200">
      {/* 헤더 - 최상단 고정 */}
      <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

      {/* 사이드바 */}
      <Sidebar
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="pt-16 lg:ml-64 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
