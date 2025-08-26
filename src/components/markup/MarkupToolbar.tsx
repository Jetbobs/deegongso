"use client";

import { useState } from "react";
import { MarkupType, MarkupTool } from "@/types";
import { MARKUP_TOOLS } from "@/lib/markupManager";

interface MarkupToolbarProps {
  selectedTool: MarkupType | null;
  onToolSelect: (tool: MarkupType | null) => void;
  isMarkupMode: boolean;
  onToggleMarkupMode: () => void;
  onClearAll?: () => void;
  disabled?: boolean;
}

export default function MarkupToolbar({
  selectedTool,
  onToolSelect,
  isMarkupMode,
  onToggleMarkupMode,
  onClearAll,
  disabled = false
}: MarkupToolbarProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleToolSelect = (toolType: MarkupType) => {
    if (disabled) return;
    
    if (selectedTool === toolType) {
      // 같은 도구를 다시 클릭하면 선택 해제
      onToolSelect(null);
    } else {
      onToolSelect(toolType);
    }
  };

  const handleToggleMode = () => {
    if (disabled) return;
    onToggleMarkupMode();
    
    if (!isMarkupMode) {
      // 마크업 모드 활성화 시 기본적으로 포인트 도구 선택
      if (!selectedTool) {
        onToolSelect('point');
      }
    } else {
      // 마크업 모드 비활성화 시 도구 선택 해제
      onToolSelect(null);
    }
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-lg p-4 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {disabled ? '마크업 보기' : '마크업 도구'}
        </h3>
        
        <div className="flex gap-2">
          {/* 마크업 모드 토글 */}
          <button
            className={`btn btn-sm ${
              isMarkupMode ? 'btn-primary' : 'btn-outline'
            }`}
            onClick={handleToggleMode}
            disabled={disabled}
            title={isMarkupMode ? '마크업 모드 비활성화' : '마크업 모드 활성화'}
          >
            {isMarkupMode ? (
              <>
                ✏️ 활성
              </>
            ) : (
              <>
                📍 비활성
              </>
            )}
          </button>

          {/* 모두 지우기 */}
          {onClearAll && (
            <button
              className="btn btn-sm btn-ghost text-error"
              onClick={onClearAll}
              disabled={disabled || !isMarkupMode}
              title="모든 마크업 지우기"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* 도구 선택 */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-base-content/70">
          도구 선택:
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MARKUP_TOOLS.map((tool) => (
            <div
              key={tool.type}
              className="relative"
              onMouseEnter={() => setShowTooltip(tool.type)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <button
                className={`btn btn-sm w-full justify-start ${
                  selectedTool === tool.type && isMarkupMode
                    ? 'btn-primary'
                    : 'btn-outline'
                } ${disabled || !isMarkupMode ? 'btn-disabled' : ''}`}
                onClick={() => handleToolSelect(tool.type)}
                disabled={disabled || !isMarkupMode}
                style={{
                  borderColor: selectedTool === tool.type ? tool.color : undefined,
                }}
              >
                <span className="text-base mr-1">{tool.icon}</span>
                <span className="text-xs">{tool.label}</span>
              </button>

              {/* 툴팁 */}
              {showTooltip === tool.type && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                  <div className="bg-base-content text-base-100 text-xs rounded px-2 py-1 whitespace-nowrap">
                    {tool.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="border-4 border-transparent border-t-base-content"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 상태 정보 */}
      <div className="mt-4 p-3 bg-base-200 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              isMarkupMode ? 'bg-success animate-pulse' : 'bg-base-content/30'
            }`}></span>
            <span className="text-base-content/70">
              마크업 모드: {isMarkupMode ? '활성' : '비활성'}
            </span>
          </div>
          
          {selectedTool && isMarkupMode && (
            <div className="flex items-center gap-2">
              <span className="text-primary">
                {MARKUP_TOOLS.find(t => t.type === selectedTool)?.icon}
              </span>
              <span className="font-medium">
                {MARKUP_TOOLS.find(t => t.type === selectedTool)?.label} 선택됨
              </span>
            </div>
          )}
        </div>

        {/* 사용법 안내 */}
        {isMarkupMode && selectedTool && (
          <div className="mt-2 text-xs text-base-content/60 border-t border-base-content/10 pt-2">
            💡 이미지를 클릭하여 마크업을 추가하세요
          </div>
        )}
        
        {!isMarkupMode && (
          <div className="mt-2 text-xs text-base-content/60 border-t border-base-content/10 pt-2">
            💡 마크업 모드를 활성화한 후 도구를 선택하세요
          </div>
        )}
      </div>

      {/* 비활성화 안내 메시지 */}
      {disabled && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="text-sm font-medium text-warning mb-1">
            👀 읽기 전용 모드
          </div>
          <div className="text-xs text-base-content/70">
            클라이언트만 마크업을 추가할 수 있습니다. 기존 마크업은 클릭하여 확인 가능합니다.
          </div>
        </div>
      )}

      {/* 키보드 단축키 */}
      {!disabled && (
        <div className="mt-4 p-3 bg-info/10 rounded-lg">
          <div className="text-xs font-medium text-info mb-2">
            ⌨️ 키보드 단축키
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-base-content/70">
            <div><kbd className="kbd kbd-xs">M</kbd> 마크업 모드 토글</div>
            <div><kbd className="kbd kbd-xs">1</kbd> 포인트 도구</div>
            <div><kbd className="kbd kbd-xs">2</kbd> 원형 도구</div>
            <div><kbd className="kbd kbd-xs">3</kbd> 화살표 도구</div>
            <div><kbd className="kbd kbd-xs">4</kbd> 사각형 도구</div>
            <div><kbd className="kbd kbd-xs">5</kbd> 텍스트 도구</div>
          </div>
        </div>
      )}
    </div>
  );
}