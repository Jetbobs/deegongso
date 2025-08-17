"use client";

import { useState, useMemo } from "react";
import { Feedback } from "@/types";
import { FeedbackVersionManager, FeedbackVersion, FeedbackChange, FeedbackHistory } from "@/lib/feedbackVersionManager";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackVersionHistoryProps {
  feedbackId: string;
  onVersionRestore?: (version: number) => void;
  onVersionCompare?: (version1: number, version2: number) => void;
  showActions?: boolean;
}

export default function FeedbackVersionHistory({
  feedbackId,
  onVersionRestore,
  onVersionCompare,
  showActions = true
}: FeedbackVersionHistoryProps) {
  const { user } = useAuth();
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<FeedbackChange[] | null>(null);

  const history = useMemo(() => {
    return FeedbackVersionManager.getFeedbackHistory(feedbackId);
  }, [feedbackId]);

  const toggleVersionExpansion = (version: number) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  const toggleVersionSelection = (version: number) => {
    setSelectedVersions(prev => {
      if (prev.includes(version)) {
        return prev.filter(v => v !== version);
      } else if (prev.length < 2) {
        return [...prev, version];
      } else {
        return [prev[1], version];
      }
    });
  };

  const handleVersionCompare = () => {
    if (selectedVersions.length === 2) {
      const changes = FeedbackVersionManager.compareFeedbackVersions(
        feedbackId,
        Math.min(...selectedVersions),
        Math.max(...selectedVersions)
      );
      
      setComparisonData(changes);
      setShowComparison(true);
      
      if (onVersionCompare) {
        onVersionCompare(Math.min(...selectedVersions), Math.max(...selectedVersions));
      }
    }
  };

  const handleVersionRestore = (version: number) => {
    if (confirm(`버전 ${version}으로 되돌리시겠습니까? 새로운 버전이 생성됩니다.`)) {
      const result = FeedbackVersionManager.rollbackToVersion(feedbackId, version, user?.id || '');
      if (result && onVersionRestore) {
        onVersionRestore(version);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeTypeInfo = (changeType: FeedbackChange['change_type']) => {
    const info = {
      added: { label: '추가', color: 'success', icon: '➕' },
      modified: { label: '수정', color: 'warning', icon: '✏️' },
      removed: { label: '제거', color: 'error', icon: '➖' }
    };
    return info[changeType];
  };

  const renderChangeValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-base-content/40 italic">없음</span>;
    }

    if (typeof value === 'boolean') {
      return <span className={value ? 'text-success' : 'text-error'}>{value ? '예' : '아니오'}</span>;
    }

    if (typeof value === 'object') {
      return <span className="text-base-content/60">객체</span>;
    }

    if (typeof value === 'string' && value.length > 50) {
      return (
        <span className="text-sm">
          {value.slice(0, 50)}...
          <button className="btn btn-ghost btn-xs ml-1">더보기</button>
        </span>
      );
    }

    return <span>{String(value)}</span>;
  };

  const renderChange = (change: FeedbackChange) => {
    const typeInfo = getChangeTypeInfo(change.change_type);
    
    return (
      <div key={change.field} className="flex items-start space-x-3 p-3 bg-base-200 rounded">
        <span className={`badge badge-${typeInfo.color} badge-sm`}>
          {typeInfo.icon} {typeInfo.label}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm mb-1">
            {FeedbackVersionManager.getFieldDisplayName(change.field)}
          </div>
          {change.change_type === 'modified' && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-error font-medium">이전:</span>
                {renderChangeValue(change.old_value)}
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-success font-medium">변경:</span>
                {renderChangeValue(change.new_value)}
              </div>
            </div>
          )}
          {change.change_type === 'added' && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-success font-medium">추가된 값:</span>
              {renderChangeValue(change.new_value)}
            </div>
          )}
          {change.change_type === 'removed' && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-error font-medium">제거된 값:</span>
              {renderChangeValue(change.old_value)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVersionItem = (versionData: FeedbackVersion, isLatest: boolean) => {
    const isExpanded = expandedVersions.has(versionData.version);
    const isSelected = selectedVersions.includes(versionData.version);

    return (
      <div key={versionData.version} className={`card bg-base-100 shadow-sm ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <div className="card-body p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={isSelected}
                  onChange={() => toggleVersionSelection(versionData.version)}
                  disabled={selectedVersions.length >= 2 && !isSelected}
                />
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">버전 {versionData.version}</span>
                  {isLatest && <span className="badge badge-primary badge-sm">최신</span>}
                  {versionData.version === 1 && <span className="badge badge-ghost badge-sm">초기</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-base-content/60">
                {formatDate(versionData.created_at)}
              </span>
              
              {showActions && (
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                    ⋮
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
                    <li>
                      <button onClick={() => toggleVersionExpansion(versionData.version)}>
                        👁️ {isExpanded ? '접기' : '상세보기'}
                      </button>
                    </li>
                    {!isLatest && onVersionRestore && (
                      <li>
                        <button
                          onClick={() => handleVersionRestore(versionData.version)}
                          className="text-warning"
                        >
                          ↶ 이 버전으로 되돌리기
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 변경사항 요약 */}
          <div className="mt-2">
            {versionData.changes.length > 0 ? (
              <div className="text-sm text-base-content/60">
                {FeedbackVersionManager.getChangesSummary(versionData.changes)}
              </div>
            ) : (
              <div className="text-sm text-base-content/40 italic">
                최초 생성
              </div>
            )}
          </div>

          {/* 상세 변경사항 */}
          {isExpanded && versionData.changes.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">상세 변경사항:</div>
              {versionData.changes.map(renderChange)}
            </div>
          )}

          {/* 메타데이터 */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-base-content/60">
            <div>
              작성자: {versionData.created_by}
            </div>
            <div>
              {versionData.changes.length}개 변경사항
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!history) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📜</div>
        <p className="text-base-content/60">버전 히스토리를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">버전 히스토리</h3>
          <p className="text-sm text-base-content/60">
            총 {history.versions.length}개 버전, {history.total_changes}개 변경사항
          </p>
        </div>
        
        {selectedVersions.length === 2 && (
          <button
            onClick={handleVersionCompare}
            className="btn btn-primary btn-sm"
          >
            🔍 버전 비교
          </button>
        )}
      </div>

      {/* 버전 목록 */}
      <div className="space-y-4">
        {[...history.versions].reverse().map((versionData, index) => 
          renderVersionItem(versionData, index === 0)
        )}
      </div>

      {/* 비교 모달 */}
      {showComparison && comparisonData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  버전 비교: v{Math.min(...selectedVersions)} → v{Math.max(...selectedVersions)}
                </h3>
                <button
                  onClick={() => setShowComparison(false)}
                  className="btn btn-ghost btn-sm"
                >
                  ✕
                </button>
              </div>

              {comparisonData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-base-content/60">선택한 버전 간에 차이점이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-base-content/60 mb-4">
                    {comparisonData.length}개의 차이점을 발견했습니다.
                  </div>
                  {comparisonData.map(renderChange)}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowComparison(false)}
                  className="btn btn-primary"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 선택 안내 */}
      {selectedVersions.length > 0 && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="text-sm">
            {selectedVersions.length === 1 
              ? `버전 ${selectedVersions[0]}이 선택되었습니다. 비교할 다른 버전을 선택하세요.`
              : `버전 ${selectedVersions.join(', ')}이 선택되었습니다. 비교 버튼을 클릭하세요.`
            }
          </div>
          <button
            onClick={() => setSelectedVersions([])}
            className="btn btn-ghost btn-xs mt-2"
          >
            선택 해제
          </button>
        </div>
      )}
    </div>
  );
}