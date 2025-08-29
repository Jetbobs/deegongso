"use client";

import { useState } from "react";
import Image from "next/image";
import { DesignVersion, UserRole } from "@/types";
import { ImageUtils } from "@/lib/versionManager";

interface VersionListProps {
  versions: DesignVersion[];
  currentVersion: DesignVersion | null;
  userRole: UserRole;
  isDesigner: boolean;
  selectedVersions: string[];
  onVersionSelect: (versionId: string) => void;
  onVersionApprove: (versionId: string) => void;
  onVersionRevert: (versionId: string) => void;
  onVersionDelete: (versionId: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'approved';

export default function VersionList({
  versions,
  currentVersion,
  userRole,
  isDesigner,
  selectedVersions,
  onVersionSelect,
  onVersionApprove,
  onVersionRevert,
  onVersionDelete
}: VersionListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('oldest');
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  // 버전 정렬
  const sortedVersions = [...versions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.version_number - a.version_number;
      case 'oldest':
        return a.version_number - b.version_number;
      case 'approved':
        if (a.is_approved && !b.is_approved) return -1;
        if (!a.is_approved && b.is_approved) return 1;
        return b.version_number - a.version_number;
      default:
        return 0;
    }
  });

  // 상태 배지 렌더링
  const renderStatusBadge = (version: DesignVersion) => (
    <div className="flex gap-1">
      {version.is_current && (
        <span className="badge badge-primary badge-sm">현재</span>
      )}
      {version.is_approved && (
        <span className="badge badge-success badge-sm">승인됨</span>
      )}
    </div>
  );

  // 액션 버튼 렌더링
  const renderActionButtons = (version: DesignVersion) => (
    <div className="flex gap-1">
      {/* 승인 버튼 (클라이언트만, 미승인 버전만) */}
      {!isDesigner && !version.is_approved && (
        <button
          className="btn btn-xs btn-success"
          onClick={() => onVersionApprove(version.id)}
          title="이 버전을 승인"
        >
          승인
        </button>
      )}

      {/* 되돌리기 버튼 (디자이너만, 현재 버전이 아닌 경우) */}
      {isDesigner && !version.is_current && (
        <button
          className="btn btn-xs btn-secondary"
          onClick={() => onVersionRevert(version.id)}
          title="이 버전으로 되돌리기"
        >
          되돌리기
        </button>
      )}

      {/* 삭제 버튼 (디자이너만, 현재 버전이 아닌 경우) */}
      {isDesigner && !version.is_current && versions.length > 1 && (
        <button
          className="btn btn-xs btn-error"
          onClick={() => onVersionDelete(version.id)}
          title="버전 삭제"
        >
          삭제
        </button>
      )}
    </div>
  );

  // 그리드 뷰 렌더링
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedVersions.map((version) => (
        <div
          key={version.id}
          className={`card bg-base-100 shadow-sm border-2 transition-all cursor-pointer ${
            selectedVersions.includes(version.id)
              ? 'border-primary shadow-lg'
              : 'border-base-300 hover:border-primary/50'
          }`}
          onClick={() => onVersionSelect(version.id)}
        >
          {/* 이미지 */}
          <figure className="relative aspect-[4/3] bg-base-200">
            {version.files.length > 0 && (
              <Image
                src={version.files[0].file_url}
                alt={version.title || `버전 ${version.version_number}`}
                width={400}
                height={300}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage({
                    url: version.files[0].file_url,
                    title: version.title || `버전 ${version.version_number}`
                  });
                }}
              />
            )}
            
            {/* 선택 체크박스 */}
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={selectedVersions.includes(version.id)}
                onChange={() => onVersionSelect(version.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* 파일 개수 */}
            {version.files.length > 1 && (
              <div className="absolute top-2 right-2">
                <span className="badge badge-neutral badge-sm">
                  +{version.files.length - 1}
                </span>
              </div>
            )}
          </figure>

          {/* 카드 내용 */}
          <div className="card-body p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">
                  v{version.version_number}
                  {version.title && ` • ${version.title}`}
                </h3>
                <p className="text-xs text-base-content/60 mt-1">
                  {new Date(version.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              {renderStatusBadge(version)}
            </div>

            {version.description && (
              <p className="text-xs text-base-content/80 line-clamp-2">
                {version.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-base-content/60">
                {version.files.length}개 파일
              </span>
              {renderActionButtons(version)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 리스트 뷰 렌더링
  const renderListView = () => (
    <div className="space-y-3">
      {sortedVersions.map((version) => (
        <div
          key={version.id}
          className={`card bg-base-100 shadow-sm border-2 transition-all cursor-pointer ${
            selectedVersions.includes(version.id)
              ? 'border-primary shadow-lg'
              : 'border-base-300 hover:border-primary/50'
          }`}
          onClick={() => onVersionSelect(version.id)}
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-4">
              {/* 체크박스 */}
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={selectedVersions.includes(version.id)}
                onChange={() => onVersionSelect(version.id)}
                onClick={(e) => e.stopPropagation()}
              />

              {/* 썸네일 */}
              <div className="w-16 h-12 bg-base-200 rounded overflow-hidden flex-shrink-0">
                {version.files.length > 0 && (
                  <Image
                    src={version.files[0].file_url}
                    alt={version.title || `버전 ${version.version_number}`}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">
                    v{version.version_number}
                    {version.title && ` • ${version.title}`}
                  </h3>
                  {renderStatusBadge(version)}
                </div>
                
                {version.description && (
                  <p className="text-sm text-base-content/80 mb-2 line-clamp-1">
                    {version.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-base-content/60">
                  <span>
                    📁 {version.files.length}개 파일
                  </span>
                  <span>
                    📅 {new Date(version.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  {version.is_approved && version.approved_at && (
                    <span>
                      ✅ {new Date(version.approved_at).toLocaleDateString('ko-KR')} 승인
                    </span>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div onClick={(e) => e.stopPropagation()}>
                {renderActionButtons(version)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (versions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold mb-2">아직 시안이 없습니다</h3>
        <p className="text-base-content/70">
          첫 번째 시안을 업로드해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 정렬 옵션 */}
          <select
            className="select select-sm select-bordered"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="newest">최신순</option>
            <option value="oldest">과거순</option>
            <option value="approved">승인순</option>
          </select>
        </div>

        {/* 뷰 모드 전환 */}
        <div className="btn-group">
          <button
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            🔳 그리드
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 리스트
          </button>
        </div>
      </div>

      {/* 버전 목록 */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}

      {/* 이미지 미리보기 모달 */}
      {selectedImage && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{selectedImage.title}</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
            <div className="w-full">
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                width={800}
                height={600}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedImage(null)} />
        </div>
      )}
    </div>
  );
}