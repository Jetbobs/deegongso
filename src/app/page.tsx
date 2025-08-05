"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/auth/AuthForm";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자에게 로그인 폼 표시
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // 인증된 사용자는 대시보드로 이동 (리다이렉트 중)
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-base-content/60">대시보드로 이동 중...</p>
      </div>
    </div>
  );
}
