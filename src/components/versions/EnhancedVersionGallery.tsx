"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { VersionManager, ImageUtils } from '@/lib/versionManager';
import { DesignVersion, UserRole } from '@/types';

interface EnhancedVersionGalleryProps {
  projectId: string;
  userRole: UserRole;
  currentUserId: string;
  onVersionSelect?: (version: DesignVersion) => void;
  onVersionApprove?: (version: DesignVersion) => void;
  onVersionDelete?: (version: DesignVersion) => void;
  onVersionCompare?: (versionA: DesignVersion, versionB: DesignVersion) => void;
}

type ViewMode = 'grid' | 'list' | 'timeline';
type SortBy = 'newest' | 'oldest' | 'approved';

export default function EnhancedVersionGallery({
  projectId,
  userRole,
  currentUserId,
  onVersionSelect,
  onVersionApprove,
  onVersionDelete,
  onVersionCompare
}: EnhancedVersionGalleryProps) {
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
    version: DesignVersion;
  } | null>(null);

  // 버전 목록 로드
  useEffect(() => {
    const loadVersions = () => {
      try {
        const projectVersions = VersionManager.getProjectVersions(projectId);
        
        // 정렬 적용
        let sortedVersions = [...projectVersions];
        switch (sortBy) {
          case 'newest':
            sortedVersions.sort((a, b) => b.version_number - a.version_number);
            break;
          case 'oldest':
            sortedVersions.sort((a, b) => a.version_number - b.version_number);
            break;
          case 'approved':
            sortedVersions.sort((a, b) => {
              if (a.is_approved && !b.is_approved) return -1;
              if (!a.is_approved && b.is_approved) return 1;
              return b.version_number - a.version_number;
            });
            break;
        }
        
        setVersions(sortedVersions);
      } catch (error) {
        console.error('버전 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, [projectId, sortBy]);

  // 버전 선택/해제
  const toggleVersionSelection = (versionId: string) => {
    const newSelected = new Set(selectedVersions);
    if (newSelected.has(versionId)) {
      newSelected.delete(versionId);
    } else {
      if (newSelected.size >= 2) {
        // 최대 2개까지만 선택 가능 (비교용)
        const firstSelected = Array.from(newSelected)[0];
        newSelected.clear();
        newSelected.add(firstSelected);
      }
      newSelected.add(versionId);
    }
    setSelectedVersions(newSelected);
  };

  // 버전 승인 처리
  const handleApproveVersion = (version: DesignVersion) => {
    if (userRole !== 'client') return;
    
    const approved = VersionManager.approveVersion(version.id, currentUserId);
    if (approved) {
      setVersions(prev => prev.map(v => v.id === version.id ? approved : v));
      onVersionApprove?.(approved);
    }
  };

  // 버전 삭제 처리
  const handleDeleteVersion = (version: DesignVersion) => {
    if (userRole !== 'designer' && version.created_by !== currentUserId) return;
    
    if (confirm(`${version.title}을(를) 정말 삭제하시겠습니까?`)) {
      const success = VersionManager.deleteVersion(version.id);
      if (success) {
        setVersions(prev => prev.filter(v => v.id !== version.id));
        onVersionDelete?.(version);
      }
    }
  };

  // 현재 버전으로 설정
  const handleSetCurrentVersion = (version: DesignVersion) => {
    const updated = VersionManager.setCurrentVersion(version.id);
    if (updated) {
      setVersions(prev => prev.map(v => ({
        ...v,
        is_current: v.id === version.id
      })));
    }
  };

  // 비교하기
  const handleCompareVersions = () => {
    const selectedArray = Array.from(selectedVersions);
    if (selectedArray.length !== 2) return;
    
    const versionA = versions.find(v => v.id === selectedArray[0]);
    const versionB = versions.find(v => v.id === selectedArray[1]);
    
    if (versionA && versionB) {
      onVersionCompare?.(versionA, versionB);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <div className="text-base-content/70">시안을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-bold mb-2">시안이 없습니다</h3>
        <p className="text-base-content/60">
          {userRole === 'designer' 
            ? '첫 번째 시안을 업로드해보세요.' 
            : '디자이너가 시안을 업로드하면 여기서 확인할 수 있습니다.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 바 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">시안 갤러리</h3>
          <div className="badge badge-primary">{versions.length}개</div>
          {selectedVersions.size > 0 && (
            <div className="badge badge-secondary">{selectedVersions.size}개 선택</div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* 정렬 */}
          <select 
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="approved">승인순</option>
          </select>

          {/* 뷰 모드 */}
          <div className="btn-group">
            <button 
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              📅
            </button>
          </div>

          {/* 비교 버튼 */}
          {selectedVersions.size === 2 && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleCompareVersions}
            >
              비교하기
            </button>
          )}
        </div>
      </div>

      {/* 그리드 뷰 */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                selectedVersions.has(version.id) ? 'ring-2 ring-primary' : ''
              } ${version.is_current ? 'ring-2 ring-success' : ''}`}
              onClick={() => toggleVersionSelection(version.id)}
            >
              {/* 썸네일 */}
              <figure className="relative aspect-video">
                {version.thumbnail_url ? (
                  <Image
                    src={version.thumbnail_url}
                    alt={version.title || `시안 v${version.version_number}`}
                    width={400}
                    height={240}
                    className="w-full h-full object-cover"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage({
                        url: version.thumbnail_url!,
                        title: version.title || `시안 v${version.version_number}`,
                        version
                      });
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-base-200 flex items-center justify-center">
                    <span className="text-4xl">🎨</span>
                  </div>
                )}
                
                {/* 뱃지들 */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  <div className="badge badge-primary">v{version.version_number}</div>
                  {version.is_current && (
                    <div className="badge badge-success">현재</div>
                  )}
                  {version.is_approved && (
                    <div className="badge badge-info">승인</div>
                  )}
                </div>

                {/* 파일 수 */}
                {version.files.length > 1 && (
                  <div className="absolute top-2 right-2">
                    <div className="badge badge-neutral">+{version.files.length - 1}</div>
                  </div>
                )}

                {/* 선택 체크박스 */}
                <div className="absolute bottom-2 left-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={selectedVersions.has(version.id)}
                    onChange={() => toggleVersionSelection(version.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </figure>

              {/* 카드 내용 */}
              <div className="card-body p-4">
                <h3 className="font-semibold truncate">
                  {version.title || `시안 v${version.version_number}`}
                </h3>
                
                {version.description && (
                  <p className="text-sm text-base-content/70 line-clamp-2">
                    {version.description}
                  </p>
                )}

                <div className="text-xs text-base-content/60">
                  <p>{new Date(version.created_at).toLocaleDateString()}</p>
                  <p>{version.files.length}개 파일 • {
                    ImageUtils.formatFileSize(
                      version.files.reduce((sum, file) => sum + file.file_size, 0)
                    )
                  }</p>
                </div>

                {/* 액션 버튼들 */}
                <div className="card-actions justify-end mt-2">
                  <div className="flex space-x-1">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionSelect?.(version);
                      }}
                    >
                      보기
                    </button>
                    
                    {!version.is_current && userRole === 'designer' && (
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCurrentVersion(version);
                        }}
                      >
                        현재로
                      </button>
                    )}
                    
                    {!version.is_approved && userRole === 'client' && (
                      <button
                        className="btn btn-success btn-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveVersion(version);
                        }}
                      >
                        승인
                      </button>
                    )}
                    
                    {(userRole === 'designer' || version.created_by === currentUserId) && (
                      <button
                        className="btn btn-error btn-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVersion(version);
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 리스트 뷰 */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`card bg-base-100 shadow-sm ${
                selectedVersions.has(version.id) ? 'ring-2 ring-primary' : ''
              } ${version.is_current ? 'ring-2 ring-success' : ''}`}
            >
              <div className="card-body p-4">
                <div className="flex items-center space-x-4">
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedVersions.has(version.id)}
                    onChange={() => toggleVersionSelection(version.id)}
                  />

                  {/* 썸네일 */}
                  <div className="w-16 h-12 relative flex-shrink-0">
                    {version.thumbnail_url ? (
                      <Image
                        src={version.thumbnail_url}
                        alt={version.title || `시안 v${version.version_number}`}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover rounded cursor-pointer"
                        onClick={() => setSelectedImage({
                          url: version.thumbnail_url!,
                          title: version.title || `시안 v${version.version_number}`,
                          version
                        })}
                      />
                    ) : (
                      <div className="w-full h-full bg-base-200 rounded flex items-center justify-center">
                        <span>🎨</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {version.title || `시안 v${version.version_number}`}
                      </h3>
                      <div className="badge badge-primary badge-sm">v{version.version_number}</div>
                      {version.is_current && (
                        <div className="badge badge-success badge-sm">현재</div>
                      )}
                      {version.is_approved && (
                        <div className="badge badge-info badge-sm">승인</div>
                      )}
                    </div>
                    
                    <div className="text-sm text-base-content/70">
                      <p className="truncate">{version.description}</p>
                      <p className="text-xs">
                        {new Date(version.created_at).toLocaleDateString()} • 
                        {version.files.length}개 파일 • 
                        {ImageUtils.formatFileSize(
                          version.files.reduce((sum, file) => sum + file.file_size, 0)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex space-x-1 flex-shrink-0">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onVersionSelect?.(version)}
                    >
                      보기
                    </button>
                    
                    {!version.is_current && userRole === 'designer' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleSetCurrentVersion(version)}
                      >
                        현재로
                      </button>
                    )}
                    
                    {!version.is_approved && userRole === 'client' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveVersion(version)}
                      >
                        승인
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 타임라인 뷰 */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {versions.map((version, index) => (
            <div key={version.id} className="flex items-start space-x-4">
              {/* 타임라인 라인 */}
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${
                  version.is_current ? 'bg-success' : 
                  version.is_approved ? 'bg-info' : 'bg-base-300'
                }`}></div>
                {index < versions.length - 1 && (
                  <div className="w-0.5 h-16 bg-base-300 mt-2"></div>
                )}
              </div>

              {/* 버전 카드 */}
              <div className={`card bg-base-100 shadow-sm flex-1 ${
                selectedVersions.has(version.id) ? 'ring-2 ring-primary' : ''
              }`}>
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm"
                          checked={selectedVersions.has(version.id)}
                          onChange={() => toggleVersionSelection(version.id)}
                        />
                        <h3 className="font-semibold">
                          {version.title || `시안 v${version.version_number}`}
                        </h3>
                        <div className="badge badge-primary badge-sm">v{version.version_number}</div>
                        {version.is_current && <div className="badge badge-success badge-sm">현재</div>}
                        {version.is_approved && <div className="badge badge-info badge-sm">승인</div>}
                      </div>
                      
                      <p className="text-sm text-base-content/70 mb-2">{version.description}</p>
                      <p className="text-xs text-base-content/60">
                        {new Date(version.created_at).toLocaleString()} • 
                        {version.files.length}개 파일
                      </p>
                    </div>

                    {/* 썸네일 */}
                    {version.thumbnail_url && (
                      <div className="w-20 h-15 relative ml-4 cursor-pointer" 
                           onClick={() => setSelectedImage({
                             url: version.thumbnail_url!,
                             title: version.title || `시안 v${version.version_number}`,
                             version
                           })}>
                        <Image
                          src={version.thumbnail_url}
                          alt={version.title || `시안 v${version.version_number}`}
                          width={80}
                          height={60}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
            
            <div className="flex flex-col items-center">
              <Image 
                src={selectedImage.url}
                alt={selectedImage.title}
                width={800}
                height={600}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
              />
              
              <div className="flex space-x-2 mt-4">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => onVersionSelect?.(selectedImage.version)}
                >
                  상세보기
                </button>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedImage(null)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          </div>
        </div>
      )}
    </div>
  );
}