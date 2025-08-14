"use client";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "bounce";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingIndicator({
  size = "md",
  variant = "spinner",
  className = "",
  text,
  fullScreen = false
}: LoadingIndicatorProps) {
  const getSizeClass = () => {
    switch (size) {
      case "sm": return "w-4 h-4";
      case "md": return "w-8 h-8";
      case "lg": return "w-12 h-12";
      case "xl": return "w-16 h-16";
      default: return "w-8 h-8";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm": return "text-sm";
      case "md": return "text-base";
      case "lg": return "text-lg";
      case "xl": return "text-xl";
      default: return "text-base";
    }
  };

  const renderIndicator = () => {
    const sizeClass = getSizeClass();
    
    switch (variant) {
      case "spinner":
        return (
          <div className={`loading loading-spinner ${sizeClass} ${className}`} />
        );
      
      case "dots":
        return (
          <div className={`loading loading-dots ${sizeClass} ${className}`} />
        );
      
      case "pulse":
        return (
          <div className={`animate-pulse ${sizeClass} ${className}`}>
            <div className="w-full h-full bg-primary rounded-full opacity-75"></div>
          </div>
        );
      
      case "bounce":
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${getSizeClass()} bg-primary rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`loading loading-spinner ${sizeClass} ${className}`} />
        );
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderIndicator()}
      {text && (
        <div className={`text-base-content/70 ${getTextSize()}`}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// 프리셋 로딩 컴포넌트들
export function PageLoading({ text = "페이지를 불러오는 중..." }: { text?: string }) {
  return (
    <LoadingIndicator
      size="lg"
      variant="spinner"
      text={text}
      fullScreen
    />
  );
}

export function ButtonLoading({ size = "sm", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <LoadingIndicator
      size={size}
      variant="spinner"
      className={`text-current ${className}`}
    />
  );
}

export function CardLoading({ text }: { text?: string }) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body flex items-center justify-center py-12">
        <LoadingIndicator
          size="lg"
          variant="spinner"
          text={text}
        />
      </div>
    </div>
  );
}

export function InlineLoading({ 
  size = "sm", 
  text, 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg"; 
  text?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingIndicator size={size} variant="spinner" />
      {text && <span className="text-base-content/70 text-sm">{text}</span>}
    </div>
  );
}