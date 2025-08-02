"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 메인 페이지 접속 시 대시보드로 리다이렉트
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-base-content/60">대시보드로 이동 중...</p>
      </div>
    </div>
  );
}
