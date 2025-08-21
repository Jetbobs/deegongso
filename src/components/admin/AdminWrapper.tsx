"use client";

import { ReactNode } from "react";
import { AdminUser } from "@/types";

interface AdminWrapperProps {
  children: ReactNode;
  requiredPermission?: keyof AdminUser["permissions"];
  fallback?: ReactNode;
}

export default function AdminWrapper({ 
  children, 
  requiredPermission,
  fallback = <div className="text-center text-red-500">접근 권한이 없습니다.</div>
}: AdminWrapperProps) {
  // Mock admin user - 실제로는 auth context에서 가져옴
  const mockAdminUser: AdminUser = {
    id: "admin-1",
    email: "admin@deeo.com",
    name: "슈퍼 관리자",
    phone: "010-1234-5678",
    role: "admin",
    admin_level: "super",
    permissions: {
      user_management: true,
      dispute_resolution: true,
      payment_management: true,
      platform_settings: true,
      analytics_access: true,
      content_moderation: true,
    },
    created_at: "2025-08-20T00:00:00Z",
    updated_at: "2025-08-20T00:00:00Z",
  };

  // 권한 체크
  if (requiredPermission && !mockAdminUser.permissions[requiredPermission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}