"use client";

import { useState, useEffect } from "react";
import { DesignVersion, VersionComparison } from "@/types";
import { VersionManager } from "@/lib/versionManager";

interface VersionComparisonProps {
  versionAId: string;
  versionBId: string;
  onClose: () => void;
}

type ComparisonMode = 'side-by-side' | 'overlay' | 'slider';

export default function VersionComparisonComponent({
  versionAId,
  versionBId,
  onClose
}: VersionComparisonProps) {
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('side-by-side');
  const [selectedFileA, setSelectedFileA] = useState(0);
  const [selectedFileB, setSelectedFileB] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const comparisonData = VersionManager.prepareComparison(versionAId, versionBId);
    setComparison(comparisonData);
    setIsLoading(false);
  }, [versionAId, versionBId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-xl font-semibold mb-2">비교할 수 없습니다</h3>
        <p className="text-base-content/70 mb-4">
          선택한 버전을 찾을 수 없습니다.
        </p>
        <button className="btn btn-primary" onClick={onClose}>
          돌아가기
        </button>
      </div>
    );
  }

  const { version_a, version_b } = comparison;

  // 나란히 보기
  const renderSideBySide = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      {/* 버전 A */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            v{version_a.version_number}
            {version_a.title && ` • ${version_a.title}`}
          </h3>
          {version_a.files.length > 1 && (
            <select
              className="select select-sm select-bordered"
              value={selectedFileA}
              onChange={(e) => setSelectedFileA(parseInt(e.target.value))}
            >
              {version_a.files.map((file, index) => (
                <option key={index} value={index}>
                  파일 {index + 1}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="bg-base-200 rounded-lg h-full flex items-center justify-center overflow-hidden">
          <img
            src={version_a.files[selectedFileA]?.file_url}
            alt={`버전 ${version_a.version_number}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        <div className="text-sm text-base-content/70">
          📅 {new Date(version_a.created_at).toLocaleDateString('ko-KR')}
          {version_a.description && (
            <p className="mt-1">{version_a.description}</p>
          )}
        </div>
      </div>

      {/* 버전 B */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            v{version_b.version_number}
            {version_b.title && ` • ${version_b.title}`}
          </h3>
          {version_b.files.length > 1 && (
            <select
              className="select select-sm select-bordered"
              value={selectedFileB}
              onChange={(e) => setSelectedFileB(parseInt(e.target.value))}
            >
              {version_b.files.map((file, index) => (
                <option key={index} value={index}>
                  파일 {index + 1}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="bg-base-200 rounded-lg h-full flex items-center justify-center overflow-hidden">
          <img
            src={version_b.files[selectedFileB]?.file_url}
            alt={`버전 ${version_b.version_number}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        <div className="text-sm text-base-content/70">
          📅 {new Date(version_b.created_at).toLocaleDateString('ko-KR')}
          {version_b.description && (
            <p className="mt-1">{version_b.description}</p>
          )}
        </div>
      </div>
    </div>
  );

  // 오버레이 보기
  const renderOverlay = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="overlay-base"
              value="a"
              defaultChecked
              className="radio radio-primary radio-sm"
            />
            <span>v{version_a.version_number} 기준</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="overlay-base"
              value="b"
              className="radio radio-primary radio-sm"
            />
            <span>v{version_b.version_number} 기준</span>
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">투명도:</span>
          <input
            type="range"
            min="0"
            max="100"
            value="50"
            className="range range-sm range-primary w-24"
          />
        </div>
      </div>

      <div className="relative bg-base-200 rounded-lg h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src={version_a.files[selectedFileA]?.file_url}
          alt={`버전 ${version_a.version_number}`}
          className="absolute max-w-full max-h-full object-contain"
        />
        <img
          src={version_b.files[selectedFileB]?.file_url}
          alt={`버전 ${version_b.version_number}`}
          className="absolute max-w-full max-h-full object-contain opacity-50"
        />
      </div>
    </div>
  );

  // 슬라이더 보기
  const renderSlider = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4">
          <span className="text-sm">v{version_a.version_number}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(parseInt(e.target.value))}
            className="range range-primary w-48"
          />
          <span className="text-sm">v{version_b.version_number}</span>
        </div>
      </div>

      <div className="relative bg-base-200 rounded-lg h-[500px] flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          {/* 버전 A */}
          <div 
            className="absolute top-0 left-0 h-full overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={version_a.files[selectedFileA]?.file_url}
              alt={`버전 ${version_a.version_number}`}
              className="w-full h-full object-contain"
              style={{ width: `${100 * 100 / sliderPosition}%` }}
            />
          </div>
          
          {/* 버전 B */}
          <div 
            className="absolute top-0 right-0 h-full overflow-hidden"
            style={{ width: `${100 - sliderPosition}%` }}
          >
            <img
              src={version_b.files[selectedFileB]?.file_url}
              alt={`버전 ${version_b.version_number}`}
              className="w-full h-full object-contain"
              style={{ 
                width: `${100 * 100 / (100 - sliderPosition)}%`,
                marginLeft: `-${100 * sliderPosition / (100 - sliderPosition)}%`
              }}
            />
          </div>

          {/* 슬라이더 라인 */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-primary z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (comparisonMode) {
      case 'overlay':
        return renderOverlay();
      case 'slider':
        return renderSlider();
      default:
        return renderSideBySide();
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">시안 버전 비교</h2>
          <p className="text-base-content/70">
            v{version_a.version_number} vs v{version_b.version_number}
          </p>
        </div>
        
        <button
          className="btn btn-outline"
          onClick={onClose}
        >
          목록으로 돌아가기
        </button>
      </div>

      {/* 비교 모드 선택 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">비교 방식:</span>
            
            <div className="btn-group">
              <button
                className={`btn btn-sm ${comparisonMode === 'side-by-side' ? 'btn-active' : ''}`}
                onClick={() => setComparisonMode('side-by-side')}
              >
                나란히 보기
              </button>
              <button
                className={`btn btn-sm ${comparisonMode === 'overlay' ? 'btn-active' : ''}`}
                onClick={() => setComparisonMode('overlay')}
              >
                오버레이
              </button>
              <button
                className={`btn btn-sm ${comparisonMode === 'slider' ? 'btn-active' : ''}`}
                onClick={() => setComparisonMode('slider')}
              >
                슬라이더
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 비교 내용 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {renderContent()}
        </div>
      </div>

      {/* 버전 정보 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-2">
              v{version_a.version_number} 정보
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>제목:</strong> {version_a.title || '제목 없음'}</p>
              <p><strong>생성일:</strong> {new Date(version_a.created_at).toLocaleDateString('ko-KR')}</p>
              <p><strong>파일 수:</strong> {version_a.files.length}개</p>
              <p><strong>상태:</strong> 
                <span className={`ml-1 ${version_a.is_approved ? 'text-success' : 'text-warning'}`}>
                  {version_a.is_approved ? '승인됨' : '검토 중'}
                </span>
              </p>
              {version_a.description && (
                <p><strong>설명:</strong> {version_a.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-2">
              v{version_b.version_number} 정보
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>제목:</strong> {version_b.title || '제목 없음'}</p>
              <p><strong>생성일:</strong> {new Date(version_b.created_at).toLocaleDateString('ko-KR')}</p>
              <p><strong>파일 수:</strong> {version_b.files.length}개</p>
              <p><strong>상태:</strong> 
                <span className={`ml-1 ${version_b.is_approved ? 'text-success' : 'text-warning'}`}>
                  {version_b.is_approved ? '승인됨' : '검토 중'}
                </span>
              </p>
              {version_b.description && (
                <p><strong>설명:</strong> {version_b.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}