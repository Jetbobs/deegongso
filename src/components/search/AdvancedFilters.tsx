"use client";

import { useState } from "react";

interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  priority: string[];
  category: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

const initialFilters: FilterState = {
  dateRange: {
    start: "",
    end: ""
  },
  status: [],
  priority: [],
  category: [],
  sortBy: "updated_at",
  sortOrder: "desc"
};

const STATUS_OPTIONS = [
  { value: "in_progress", label: "진행 중", color: "primary" },
  { value: "feedback_period", label: "피드백 기간", color: "accent" },
  { value: "completed", label: "완료", color: "success" },
  { value: "pending", label: "대기", color: "warning" },
  { value: "cancelled", label: "취소", color: "error" }
];

const PRIORITY_OPTIONS = [
  { value: "critical", label: "긴급", color: "error" },
  { value: "high", label: "높음", color: "warning" },
  { value: "medium", label: "보통", color: "info" },
  { value: "low", label: "낮음", color: "success" }
];

const CATEGORY_OPTIONS = [
  { value: "logo", label: "로고 디자인" },
  { value: "web", label: "웹 디자인" },
  { value: "branding", label: "브랜딩" },
  { value: "app", label: "앱 디자인" },
  { value: "print", label: "인쇄물" }
];

const SORT_OPTIONS = [
  { value: "created_at", label: "생성일" },
  { value: "updated_at", label: "수정일" },
  { value: "deadline", label: "마감일" },
  { value: "priority", label: "우선순위" },
  { value: "name", label: "이름" }
];

export default function AdvancedFilters({ onFiltersChange, onReset, className = "" }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleArrayToggle = (field: keyof Pick<FilterState, "status" | "priority" | "category">, value: string) => {
    const currentArray = filters[field];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [field]: newArray });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    onReset();
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.category.length > 0 ||
      filters.sortBy !== "updated_at" ||
      filters.sortOrder !== "desc"
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* 필터 토글 버튼 */}
      <button
        className={`btn btn-outline ${hasActiveFilters() ? 'btn-primary' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        고급 필터
        {hasActiveFilters() && (
          <span className="badge badge-primary badge-sm ml-2">ON</span>
        )}
      </button>

      {/* 필터 패널 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 p-6 w-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">고급 필터</h3>
            <div className="flex space-x-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={resetFilters}
                disabled={!hasActiveFilters()}
              >
                초기화
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* 날짜 범위 */}
            <div>
              <label className="block text-sm font-medium mb-2">날짜 범위</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilters({
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                />
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilters({
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium mb-2">상태</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className={`btn btn-xs ${
                      filters.status.includes(option.value)
                        ? `btn-${option.color}`
                        : 'btn-outline'
                    }`}
                    onClick={() => handleArrayToggle('status', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 우선순위 */}
            <div>
              <label className="block text-sm font-medium mb-2">우선순위</label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className={`btn btn-xs ${
                      filters.priority.includes(option.value)
                        ? `btn-${option.color}`
                        : 'btn-outline'
                    }`}
                    onClick={() => handleArrayToggle('priority', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium mb-2">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className={`btn btn-xs ${
                      filters.category.includes(option.value)
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    onClick={() => handleArrayToggle('category', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 정렬 */}
            <div>
              <label className="block text-sm font-medium mb-2">정렬</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="select select-bordered select-sm"
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="select select-bordered select-sm"
                  value={filters.sortOrder}
                  onChange={(e) => updateFilters({ sortOrder: e.target.value as "asc" | "desc" })}
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </select>
              </div>
            </div>
          </div>

          {/* 적용된 필터 요약 */}
          {hasActiveFilters() && (
            <div className="mt-4 p-3 bg-base-200 rounded text-sm">
              <div className="font-medium mb-2">적용된 필터:</div>
              <div className="space-y-1 text-xs">
                {filters.dateRange.start && (
                  <div>• 시작일: {filters.dateRange.start}</div>
                )}
                {filters.dateRange.end && (
                  <div>• 종료일: {filters.dateRange.end}</div>
                )}
                {filters.status.length > 0 && (
                  <div>• 상태: {filters.status.length}개 선택</div>
                )}
                {filters.priority.length > 0 && (
                  <div>• 우선순위: {filters.priority.length}개 선택</div>
                )}
                {filters.category.length > 0 && (
                  <div>• 카테고리: {filters.category.length}개 선택</div>
                )}
                <div>• 정렬: {SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label} ({filters.sortOrder === 'desc' ? '내림차순' : '오름차순'})</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}