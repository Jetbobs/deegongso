"use client";

import { ComponentProps } from "react";
import dynamic from "next/dynamic";
import NoSSR from "@/components/ui/NoSSR";

// 동적 임포트로 TestImageCanvas 로드 (SSR 비활성화)
const DynamicTestImageCanvas = dynamic(
  () => import("./TestImageCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="relative bg-base-200 rounded-lg overflow-hidden flex items-center justify-center" style={{ width: 800, height: 600 }}>
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <div className="text-base-content/70">테스트 이미지를 생성하는 중...</div>
          <div className="text-xs text-base-content/50 mt-2">Konva.js 라이브러리 로딩중...</div>
        </div>
      </div>
    ),
  }
);

type TestImageCanvasProps = ComponentProps<typeof import("./TestImageCanvas").default>;

export default function ImageMarkupCanvasWrapper(props: TestImageCanvasProps) {
  return (
    <NoSSR
      fallback={
        <div className="relative bg-base-200 rounded-lg overflow-hidden flex items-center justify-center" style={{ width: 800, height: 600 }}>
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <div className="text-base-content/70">캔버스를 준비하는 중...</div>
          </div>
        </div>
      }
    >
      <DynamicTestImageCanvas {...props} />
    </NoSSR>
  );
}
