"use client";

import { useState, useEffect, useCallback } from "react";
import { DesignVersion, UserRole } from "@/types";
import { VersionManager } from "@/lib/versionManager";
import VersionUpload from "./VersionUpload";
import VersionList from "./VersionList";
import VersionComparison from "./VersionComparison";

interface VersionManagerProps {
  projectId: string;
  userRole: UserRole;
  isDesigner: boolean;
  onVersionChange?: (version: DesignVersion) => void;
}

type ViewMode = 'list' | 'comparison' | 'upload';

export default function VersionManagerComponent({
  projectId,
  userRole,
  isDesigner,
  onVersionChange
}: VersionManagerProps) {
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<DesignVersion | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 버전 목록 로드
  const loadVersions = useCallback(() => {
    const projectVersions = VersionManager.getProjectVersions(projectId);
    const current = VersionManager.getCurrentVersion(projectId);
    
    setVersions(projectVersions.sort((a, b) => b.version_number - a.version_number));
    setCurrentVersion(current);
  }, [projectId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  // 새 버전 업로드 처리
  const handleVersionUpload = async (
    files: File[],
    title?: string,
    description?: string
  ) => {
    setIsLoading(true);
    
    try {
      const newVersion = VersionManager.createVersion(
        projectId,
        files,
        "current-user-id", // 실제로는 useAuth의 user.id 사용
        title,
        description
      );

      loadVersions();
      setViewMode('list');
      onVersionChange?.(newVersion);
      
    } catch (error) {
      console.error('버전 업로드 실패:', error);
      alert('시안 업로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 버전 승인 처리
  const handleVersionApproval = (versionId: string) => {
    const approvedVersion = VersionManager.approveVersion(versionId, "current-user-id");
    if (approvedVersion) {
      loadVersions();
      alert('시안이 승인되었습니다.');
    }
  };

  // 버전 되돌리기 처리
  const handleVersionRevert = (versionId: string) => {
    if (confirm('이 버전으로 되돌리시겠습니까? 현재 작업 중인 내용이 변경됩니다.')) {
      const revertedVersion = VersionManager.setCurrentVersion(versionId);
      if (revertedVersion) {
        loadVersions();
        onVersionChange?.(revertedVersion);
        alert('해당 버전으로 되돌렸습니다.');
      }
    }
  };

  // 버전 삭제 처리
  const handleVersionDelete = (versionId: string) => {
    if (confirm('이 버전을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (VersionManager.deleteVersion(versionId)) {
        loadVersions();
        alert('버전이 삭제되었습니다.');
      }
    }
  };

  // 비교할 버전 선택
  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(prev => prev.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, versionId]);
    } else {
      // 이미 2개가 선택되어 있으면 첫 번째를 제거하고 새로운 것 추가
      setSelectedVersions([selectedVersions[1], versionId]);
    }
  };

  // 비교 시작
  const startComparison = () => {
    if (selectedVersions.length === 2) {
      setViewMode('comparison');
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold">시안 버전 관리</h2>
        <p className="text-base-content/70 mt-1">
          총 {versions.length}개 버전 • 현재: v{currentVersion?.version_number || 0}
        </p>
      </div>

      <div className="flex gap-2">
        {viewMode === 'comparison' && (
          <button
            className="btn btn-outline"
            onClick={() => setViewMode('list')}
          >
            목록으로
          </button>
        )}

        {selectedVersions.length === 2 && viewMode === 'list' && (
          <button
            className="btn btn-secondary"
            onClick={startComparison}
          >
            버전 비교하기
          </button>
        )}

        {isDesigner && (
          <button
            className={`btn btn-primary ${viewMode === 'upload' ? 'btn-active' : ''}`}
            onClick={() => setViewMode(viewMode === 'upload' ? 'list' : 'upload')}
          >
            {viewMode === 'upload' ? '취소' : '새 시안 업로드'}
          </button>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'upload':
        return (
          <VersionUpload
            onUpload={handleVersionUpload}
            onCancel={() => setViewMode('list')}
            isLoading={isLoading}
          />
        );

      case 'comparison':
        if (selectedVersions.length === 2) {
          return (
            <VersionComparison
              versionAId={selectedVersions[0]}
              versionBId={selectedVersions[1]}
              onClose={() => setViewMode('list')}
            />
          );
        }
        break;

      default:
        return (
          <VersionList
            versions={versions}
            currentVersion={currentVersion}
            userRole={userRole}
            isDesigner={isDesigner}
            selectedVersions={selectedVersions}
            onVersionSelect={handleVersionSelect}
            onVersionApprove={handleVersionApproval}
            onVersionRevert={handleVersionRevert}
            onVersionDelete={handleVersionDelete}
          />
        );
    }
  };

  if (versions.length === 0 && !isDesigner) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-semibold mb-2">아직 업로드된 시안이 없습니다</h3>
        <p className="text-base-content/70">
          디자이너가 시안을 업로드하면 여기에서 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderHeader()}
      
      {selectedVersions.length > 0 && viewMode === 'list' && (
        <div className="alert alert-info">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span>🔍</span>
              <span>
                {selectedVersions.length}개 버전 선택됨
                {selectedVersions.length === 2 && " - 비교할 수 있습니다"}
              </span>
            </div>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setSelectedVersions([])}
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}