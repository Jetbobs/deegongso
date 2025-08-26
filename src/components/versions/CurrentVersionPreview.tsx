"use client";

import { useState, useEffect } from "react";
import { DesignVersion } from "@/types";
import { VersionManager } from "@/lib/versionManager";

interface CurrentVersionPreviewProps {
  projectId: string;
  onViewVersions: () => void;
}

export default function CurrentVersionPreview({
  projectId,
  onViewVersions
}: CurrentVersionPreviewProps) {
  const [currentVersion, setCurrentVersion] = useState<DesignVersion | null>(null);
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const current = VersionManager.getCurrentVersion(projectId);
    const allVersions = VersionManager.getProjectVersions(projectId);
    
    setCurrentVersion(current);
    setVersions(allVersions);
  }, [projectId]);

  if (!currentVersion || currentVersion.files.length === 0) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">현재 시안</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={onViewVersions}
            >
              전체 버전 보기
            </button>
          </div>
          
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎨</div>
            <h4 className="text-lg font-medium mb-2">아직 시안이 없습니다</h4>
            <p className="text-base-content/70 mb-4">
              디자이너가 첫 번째 시안을 업로드하면 여기에 표시됩니다.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={onViewVersions}
            >
              시안 버전 관리로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">현재 시안</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-base-content/70">
                v{currentVersion.version_number}
                {currentVersion.title && ` • ${currentVersion.title}`}
              </span>
              <div className="flex gap-1">
                <span className="badge badge-primary badge-sm">현재</span>
                {currentVersion.is_approved && (
                  <span className="badge badge-success badge-sm">승인됨</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className="text-sm text-base-content/60">
              총 {versions.length}개 버전
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={onViewVersions}
            >
              전체 보기
            </button>
          </div>
        </div>

        {/* 시안 이미지 */}
        <div className="relative">
          <div className="aspect-video bg-base-200 rounded-lg overflow-hidden">
            <img
              src={currentVersion.files[selectedImageIndex]?.file_url}
              alt={currentVersion.title || `버전 ${currentVersion.version_number}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* 여러 파일이 있을 경우 네비게이션 */}
          {currentVersion.files.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                <button
                  className="btn btn-circle btn-xs"
                  onClick={() => setSelectedImageIndex(
                    selectedImageIndex > 0 ? selectedImageIndex - 1 : currentVersion.files.length - 1
                  )}
                >
                  ←
                </button>
                
                <span className="text-white text-xs px-2">
                  {selectedImageIndex + 1} / {currentVersion.files.length}
                </span>
                
                <button
                  className="btn btn-circle btn-xs"
                  onClick={() => setSelectedImageIndex(
                    selectedImageIndex < currentVersion.files.length - 1 ? selectedImageIndex + 1 : 0
                  )}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 시안 정보 */}
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-base-content/60">업로드일:</span>
              <p className="font-medium">
                {new Date(currentVersion.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
            
            <div>
              <span className="text-base-content/60">파일 수:</span>
              <p className="font-medium">
                {currentVersion.files.length}개
              </p>
            </div>
            
            <div>
              <span className="text-base-content/60">상태:</span>
              <p className={`font-medium ${currentVersion.is_approved ? 'text-success' : 'text-warning'}`}>
                {currentVersion.is_approved ? '승인됨' : '검토 중'}
              </p>
            </div>
          </div>

          {currentVersion.description && (
            <div className="mt-3">
              <span className="text-base-content/60 text-sm">설명:</span>
              <p className="text-sm mt-1">{currentVersion.description}</p>
            </div>
          )}
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="flex gap-2 mt-4">
          <button
            className="btn btn-sm btn-outline flex-1"
            onClick={onViewVersions}
          >
            🔍 전체 버전 보기
          </button>
          
          {versions.length > 1 && (
            <button
              className="btn btn-sm btn-outline flex-1"
              onClick={onViewVersions}
            >
              🔄 버전 비교하기
            </button>
          )}
        </div>

        {/* 파일 썸네일 (여러 파일이 있을 경우) */}
        {currentVersion.files.length > 1 && (
          <div className="mt-4">
            <div className="text-sm text-base-content/60 mb-2">
              포함된 파일들:
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {currentVersion.files.map((file, index) => (
                <button
                  key={index}
                  className={`aspect-square bg-base-200 rounded overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={file.file_url}
                    alt={`파일 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}