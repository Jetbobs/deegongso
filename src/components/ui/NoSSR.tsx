"use client";

import { useEffect, useState } from "react";

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 클라이언트 사이드에서만 렌더링되는 컴포넌트
 * SSR 중에는 fallback을 표시하고, 클라이언트에서 hydration 후 실제 컴포넌트를 렌더링
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
