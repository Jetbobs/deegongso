"use client";

import { useEffect, useState } from 'react';
import { ModificationManager } from '@/lib/modificationManager';

interface ModificationCountDisplayProps {
  projectId: string;
  className?: string;
  onLimitExceeded?: () => void;
  onWarning?: () => void;
}

export default function ModificationCountDisplay({
  projectId,
  className = '',
  onLimitExceeded,
  onWarning
}: ModificationCountDisplayProps) {
  const [countStatus, setCountStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModificationStatus = () => {
      try {
        const status = ModificationManager.getModificationCountStatus(projectId);
        setCountStatus(status);
        
        // 콜백 실행
        if (status.is_limit_exceeded && onLimitExceeded) {
          onLimitExceeded();
        } else if (status.should_warn && onWarning) {
          onWarning();
        }
      } catch (error) {
        console.error('수정 횟수 상태 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModificationStatus();
    
    // 5초마다 상태 업데이트
    const interval = setInterval(loadModificationStatus, 5000);
    return () => clearInterval(interval);
  }, [projectId, onLimitExceeded, onWarning]);

  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-sm ${className}`}>
        <div className="card-body">
          <div className="flex items-center space-x-2">
            <div className="loading loading-spinner loading-sm"></div>
            <span className="text-sm">수정 횟수 확인 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!countStatus) {
    return null;
  }

  return (
    <div className={`card bg-base-100 shadow-sm ${className}`}>
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <span>🔄</span>
            <span>수정 횟수 현황</span>
          </h3>
          <div className={`badge badge-${countStatus.status_color} badge-lg`}>
            {countStatus.used}/{countStatus.total_allowed}
          </div>
        </div>

        {/* 진행률 표시 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>사용률</span>
            <span className="font-medium">
              {Math.round((countStatus.used / countStatus.total_allowed) * 100)}%
            </span>
          </div>
          <progress 
            className={`progress progress-${countStatus.status_color} w-full`}
            value={countStatus.used}
            max={countStatus.total_allowed}
          />
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">사용됨</div>
            <div className="stat-value text-lg text-primary">{countStatus.used}</div>
            <div className="stat-desc text-xs">완료된 수정</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">남은 횟수</div>
            <div className={`stat-value text-lg ${
              countStatus.remaining === 0 ? 'text-error' : 'text-success'
            }`}>
              {countStatus.remaining}
            </div>
            <div className="stat-desc text-xs">무료 수정</div>
          </div>
          
          {countStatus.in_progress > 0 && (
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">진행 중</div>
              <div className="stat-value text-lg text-info">{countStatus.in_progress}</div>
              <div className="stat-desc text-xs">처리 중인 요청</div>
            </div>
          )}
          
          {countStatus.additional_used > 0 && (
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">추가 수정</div>
              <div className="stat-value text-lg text-warning">{countStatus.additional_used}</div>
              <div className="stat-desc text-xs">유료 수정</div>
            </div>
          )}
        </div>

        {/* 상태 메시지 */}
        <div className={`alert alert-${countStatus.status_color}`}>
          <div className="flex items-start space-x-2">
            <span className="text-lg">
              {countStatus.is_limit_exceeded ? '⚠️' : 
               countStatus.should_warn ? '🔔' : '✅'}
            </span>
            <div>
              <p className="font-medium text-sm">{countStatus.status_message}</p>
              {countStatus.is_limit_exceeded && (
                <p className="text-xs mt-1 opacity-80">
                  추가 수정 시 건당 {ModificationManager['formatCurrency'](countStatus.next_modification_cost)}이 부과됩니다.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 추가 비용 정보 */}
        {countStatus.total_additional_cost > 0 && (
          <div className="mt-4 p-3 bg-warning/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>💰</span>
                <span className="text-sm font-medium">추가 비용 발생</span>
              </div>
              <div className="font-bold text-warning">
                +{ModificationManager['formatCurrency'](countStatus.total_additional_cost)}
              </div>
            </div>
          </div>
        )}

        {/* 경고 메시지 */}
        {countStatus.should_warn && !countStatus.is_limit_exceeded && (
          <div className="mt-4 p-3 bg-warning/10 border-l-4 border-warning rounded">
            <div className="flex items-start space-x-2">
              <span className="text-warning text-lg">⚡</span>
              <div className="text-sm">
                <p className="font-medium text-warning">주의: 수정 횟수가 부족합니다!</p>
                <p className="text-warning/80">
                  신중하게 피드백을 정리한 후 수정요청을 제출해주세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}