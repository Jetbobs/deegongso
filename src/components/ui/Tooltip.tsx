"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  disabled?: boolean;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  delay = 500,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipWidth = 200; // 예상 툴팁 너비
        const tooltipHeight = 40; // 예상 툴팁 높이

        let x = 0;
        let y = 0;

        switch (position) {
          case "top":
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.top - tooltipHeight - 8;
            break;
          case "bottom":
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.bottom + 8;
            break;
          case "left":
            x = rect.left - tooltipWidth - 8;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case "right":
            x = rect.right + 8;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
        }

        // 화면 경계 체크
        const padding = 8;
        if (x < padding) x = padding;
        if (x + tooltipWidth > window.innerWidth - padding) {
          x = window.innerWidth - tooltipWidth - padding;
        }
        if (y < padding) y = padding;
        if (y + tooltipHeight > window.innerHeight - padding) {
          y = window.innerHeight - tooltipHeight - padding;
        }

        setTooltipPosition({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            maxWidth: "200px",
          }}
        >
          {content}

          {/* 화살표 */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === "top"
                ? "bottom-[-4px] left-1/2 -translate-x-1/2"
                : position === "bottom"
                ? "top-[-4px] left-1/2 -translate-x-1/2"
                : position === "left"
                ? "right-[-4px] top-1/2 -translate-y-1/2"
                : "left-[-4px] top-1/2 -translate-y-1/2"
            }`}
          />
        </div>
      )}
    </>
  );
}

// 도움말 아이콘과 함께 사용하는 헬퍼 컴포넌트
interface HelpIconProps {
  tooltip: string;
  size?: "sm" | "md" | "lg";
}

export function HelpIcon({ tooltip, size = "sm" }: HelpIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-sm",
    lg: "w-6 h-6 text-base",
  };

  return (
    <Tooltip content={tooltip} position="top">
      <div
        className={`inline-flex items-center justify-center rounded-full bg-base-300 text-base-content/60 hover:bg-base-200 hover:text-base-content cursor-help transition-colors ${sizeClasses[size]}`}
      >
        <span>?</span>
      </div>
    </Tooltip>
  );
}
