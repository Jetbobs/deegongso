"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { createPortal } from "react-dom";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // ms, 0이면 자동 닫힘 없음
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean;
  icon?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// 편의성 훅들
export function useToastActions() {
  const { addToast } = useToast();

  const success = useCallback((message: string, options?: Partial<Toast>) => {
    addToast({
      message,
      type: 'success',
      duration: 4000,
      icon: '✅',
      ...options
    });
  }, [addToast]);

  const error = useCallback((message: string, options?: Partial<Toast>) => {
    addToast({
      message,
      type: 'error',
      duration: 6000,
      icon: '❌',
      ...options
    });
  }, [addToast]);

  const warning = useCallback((message: string, options?: Partial<Toast>) => {
    addToast({
      message,
      type: 'warning',
      duration: 5000,
      icon: '⚠️',
      ...options
    });
  }, [addToast]);

  const info = useCallback((message: string, options?: Partial<Toast>) => {
    addToast({
      message,
      type: 'info',
      duration: 4000,
      icon: 'ℹ️',
      ...options
    });
  }, [addToast]);

  return { success, error, warning, info };
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastProvider({ 
  children, 
  maxToasts = 5,
  position = 'top-right'
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newToast: Toast = {
      id,
      duration: 4000,
      closable: true,
      ...toastData
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts); // 최대 개수 제한
    });

    // 자동 제거
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  position: ToastProviderProps['position'];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  const getPositionClasses = () => {
    const baseClasses = "fixed z-50 flex flex-col gap-2 p-4";
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-0 right-0`;
      case 'top-left':
        return `${baseClasses} top-0 left-0`;
      case 'bottom-right':
        return `${baseClasses} bottom-0 right-0`;
      case 'bottom-left':
        return `${baseClasses} bottom-0 left-0`;
      case 'top-center':
        return `${baseClasses} top-0 left-1/2 -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClasses} bottom-0 left-1/2 -translate-x-1/2`;
      default:
        return `${baseClasses} top-0 right-0`;
    }
  };

  const portalRoot = document.body;

  return createPortal(
    <div className={getPositionClasses()}>
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={onRemove}
          index={index}
        />
      ))}
    </div>,
    portalRoot
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  index: number;
}

function ToastItem({ toast, onRemove, index }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 진입 애니메이션
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // 애니메이션 지속시간과 맞춤
  };

  const getToastClasses = () => {
    const baseClasses = `
      alert max-w-sm w-full shadow-lg transform transition-all duration-300 ease-in-out
      ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `;

    switch (toast.type) {
      case 'success':
        return `${baseClasses} alert-success`;
      case 'error':
        return `${baseClasses} alert-error`;
      case 'warning':
        return `${baseClasses} alert-warning`;
      case 'info':
        return `${baseClasses} alert-info`;
      default:
        return `${baseClasses} alert-info`;
    }
  };

  return (
    <div 
      className={getToastClasses()}
      style={{ 
        animationDelay: `${index * 100}ms`,
        marginTop: index > 0 ? '8px' : '0'
      }}
    >
      <div className="flex items-start space-x-3 w-full">
        {/* 아이콘 */}
        {toast.icon && (
          <div className="flex-shrink-0 text-lg">
            {toast.icon}
          </div>
        )}

        {/* 메시지 내용 */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <div className="font-semibold text-sm mb-1">
              {toast.title}
            </div>
          )}
          <div className="text-sm">
            {toast.message}
          </div>
          
          {/* 액션 버튼 */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="btn btn-ghost btn-xs mt-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* 닫기 버튼 */}
        {toast.closable && (
          <button
            onClick={handleRemove}
            className="btn btn-ghost btn-xs btn-circle flex-shrink-0"
            aria-label="알림 닫기"
          >
            ✕
          </button>
        )}
      </div>

      {/* 진행 바 (지속시간이 있는 경우) */}
      {toast.duration && toast.duration > 0 && (
        <div className="mt-2">
          <div className="w-full bg-black/20 rounded-full h-1">
            <div 
              className="bg-current h-1 rounded-full transition-all ease-linear"
              style={{
                width: '100%',
                animation: `toast-progress ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// CSS 애니메이션을 위한 스타일 (globals.css에 추가 필요)
export const toastStyles = `
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;