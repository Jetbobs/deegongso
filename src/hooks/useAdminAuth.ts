"use client";

import { AdminUser } from "@/types";

// Mock hook - 실제로는 Supabase auth와 연결
export function useAdminAuth() {
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
      announcement_management: true,
    },
    created_at: "2025-08-20T00:00:00Z",
    updated_at: "2025-08-20T00:00:00Z",
  };

  return {
    user: mockAdminUser,
    isAdmin: true,
    hasPermission: (permission: keyof AdminUser["permissions"]) => 
      mockAdminUser.permissions[permission],
    isLoading: false,
  };
}