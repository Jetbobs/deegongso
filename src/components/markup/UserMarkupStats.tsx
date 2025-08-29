"use client";

import { useState, useEffect } from "react";
import { MarkupManager } from "@/lib/markupManager";
import { UserMarkupStats, UserMarkupActivity, MarkupType } from "@/types";

interface UserMarkupStatsProps {
  userId: string;
  className?: string;
  showDetailedStats?: boolean;
  showRecentActivity?: boolean;
}

export default function UserMarkupStatsComponent({ 
  userId, 
  className = "", 
  showDetailedStats = true,
  showRecentActivity = false 
}: UserMarkupStatsProps) {
  const [stats, setStats] = useState<UserMarkupStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserMarkupActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [userId]);

  const loadUserStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const userStats = MarkupManager.getUserMarkupStats(userId);
      setStats(userStats);
      
      if (showRecentActivity) {
        const activity = MarkupManager.getUserRecentActivity(userId, 5);
        setRecentActivity(activity);
      }
    } catch (error) {
      console.error('Failed to load user markup stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // 마크업 도구 아이콘 매핑
  const getMarkupTypeIcon = (type: MarkupType): string => {
    const iconMap: { [key in MarkupType]: string } = {
      point: '📍',
      circle: '⭕',
      arrow: '➡️',
      rectangle: '⬜',
      text: '💬',
      freehand: '✏️'
    };
    return iconMap[type] || '📍';
  };

  // 활동 타입 아이콘 매핑
  const getActivityIcon = (type: UserMarkupActivity['type']): string => {
    const iconMap = {
      markup_created: '📍',
      feedback_created: '💬',
      feedback_received: '📬',
      feedback_resolved: '✅'
    };
    return iconMap[type] || '📋';
  };

  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-sm ${className}`}>
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="loading loading-spinner loading-md"></div>
            <span className="ml-2">통계를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`card bg-base-100 shadow-sm ${className}`}>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-error">통계를 불러올 수 없습니다.</div>
            <button 
              className="btn btn-ghost btn-sm mt-2"
              onClick={loadUserStats}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 통계가 모두 0인 경우
  const hasActivity = stats.totalMarkups > 0 || stats.totalFeedbacks > 0 || stats.receivedFeedbacks > 0;

  if (!hasActivity) {
    return (
      <div className={`card bg-base-100 shadow-sm ${className}`}>
        <div className="card-body">
          <h3 className="card-title text-lg">📊 내 마크업 활동</h3>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-lg font-medium mb-2">아직 마크업 활동이 없습니다</div>
            <div className="text-sm text-base-content/60 mb-4">
              프로젝트에서 마크업을 추가하고 피드백을 작성해보세요!
            </div>
            <div className="flex justify-center space-x-2">
              <div className="badge badge-outline">📍 마크업</div>
              <div className="badge badge-outline">💬 피드백</div>
              <div className="badge badge-outline">🎨 협업</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-sm ${className}`}>
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-lg">📊 내 마크업 활동</h3>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={loadUserStats}
          >
            🔄
          </button>
        </div>
        
        {/* 기본 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="stat bg-primary/10 rounded-lg p-3">
            <div className="stat-title text-xs">총 마크업</div>
            <div className="stat-value text-lg text-primary">{stats.totalMarkups}</div>
          </div>
          <div className="stat bg-secondary/10 rounded-lg p-3">
            <div className="stat-title text-xs">작성한 피드백</div>
            <div className="stat-value text-lg text-secondary">{stats.totalFeedbacks}</div>
          </div>
          <div className="stat bg-accent/10 rounded-lg p-3">
            <div className="stat-title text-xs">받은 피드백</div>
            <div className="stat-value text-lg text-accent">{stats.receivedFeedbacks}</div>
          </div>
          <div className="stat bg-success/10 rounded-lg p-3">
            <div className="stat-title text-xs">참여 프로젝트</div>
            <div className="stat-value text-lg text-success">{stats.projectsWithMarkups}</div>
          </div>
        </div>
        
        {showDetailedStats && (
          <>
            {/* 상태별 피드백 */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">피드백 상태</h4>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="badge badge-warning badge-sm">대기중</div>
                  <span className="text-sm">{stats.pendingFeedbacks}개</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="badge badge-success badge-sm">해결됨</div>
                  <span className="text-sm">{stats.resolvedFeedbacks}개</span>
                </div>
              </div>
            </div>
            
            {/* 타입별 사용 통계 */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">마크업 도구 사용량</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(stats.markupTypeUsage)
                  .filter(([, count]) => count > 0)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-base-200 rounded">
                      <div className="flex items-center space-x-2">
                        <span>{getMarkupTypeIcon(type as MarkupType)}</span>
                        <span className="capitalize">{type}</span>
                      </div>
                      <span className="font-medium badge badge-ghost badge-sm">{count}</span>
                    </div>
                  ))}
              </div>
              {Object.values(stats.markupTypeUsage).every(count => count === 0) && (
                <div className="text-sm text-base-content/60 text-center py-2">
                  아직 사용한 마크업 도구가 없습니다
                </div>
              )}
            </div>
            
            {/* 최근 활동 */}
            <div>
              <h4 className="font-medium mb-2">최근 활동</h4>
              <div className="text-sm space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>이번 주:</span>
                  <span className="font-medium text-primary">{stats.thisWeekMarkups}개 마크업</span>
                </div>
                <div className="flex justify-between">
                  <span>이번 달:</span>
                  <span className="font-medium text-secondary">{stats.thisMonthMarkups}개 마크업</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 최근 활동 목록 */}
        {showRecentActivity && recentActivity.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">최근 활동 내역</h4>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 bg-base-200 rounded text-sm">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium">{activity.description}</div>
                    <div className="text-xs text-base-content/60 mt-1">
                      {activity.projectName} • {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showDetailedStats && (
          <div className="text-center mt-4">
            <div className="text-xs text-base-content/60">
              더 자세한 통계는 프로필 페이지에서 확인하세요
            </div>
          </div>
        )}
      </div>
    </div>
  );
}