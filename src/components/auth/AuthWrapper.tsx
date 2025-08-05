"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthWrapper({
  children,
  requireAuth = true,
}: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // 클라이언트 사이드 hydration 완료 확인
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !loading && !hasRedirected) {
      if (requireAuth && !user) {
        setHasRedirected(true);
        router.push("/login");
      } else if (!requireAuth && user) {
        setHasRedirected(true);
        router.push("/dashboard");
      }
    }
  }, [user, loading, requireAuth, router, isHydrated, hasRedirected]);

  // hydration이 완료되지 않았거나 로딩 중일 때
  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // 인증이 필요한데 로그인하지 않은 경우
  if (requireAuth && !user) {
    return null; // 리다이렉트 중
  }

  // 인증이 필요하지 않은데 로그인한 경우
  if (!requireAuth && user) {
    return null; // 리다이렉트 중
  }

  return <>{children}</>;
}
