// 클래스명 합성 유틸리티
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// 날짜 포맷팅
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 상대적 시간 표시
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = now.getTime() - target.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "방금 전";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else {
    return formatDate(date);
  }
}

// 금액 포맷팅
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

// 파일 크기 포맷팅
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 진행률 계산
export function calculateProgress(
  startDate: string,
  endDate: string,
  currentDate: string = new Date().toISOString()
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const current = new Date(currentDate).getTime();

  if (current <= start) return 0;
  if (current >= end) return 100;

  const progress = ((current - start) / (end - start)) * 100;
  return Math.round(progress);
}

// D-Day 계산
export function calculateDaysRemaining(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diffInMs = target.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
}

// 프로젝트 상태에 따른 뱃지 스타일
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    client_review_pending: "badge-warning",
    designer_review_pending: "badge-info",
    in_progress: "badge-primary",
    feedback_period: "badge-accent",
    modification_in_progress: "badge-secondary",
    completed: "badge-success",
    cancelled: "badge-error",
  };

  return statusMap[status] || "badge-neutral";
}

// 프로젝트 상태 한글 변환
export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    client_review_pending: "클라이언트 검토 대기",
    designer_review_pending: "디자이너 검토 대기",
    in_progress: "진행 중",
    feedback_period: "피드백 정리 기간",
    modification_in_progress: "수정 작업 중",
    completed: "완료",
    cancelled: "취소",
  };

  return statusMap[status] || status;
}
