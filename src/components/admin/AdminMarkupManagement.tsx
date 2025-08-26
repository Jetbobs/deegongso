"use client";

import { useState, useEffect } from "react";
import { MarkupManager } from "@/lib/markupManager";
import { ImageMarkup, MarkupFeedback } from "@/types";

export default function AdminMarkupManagement() {
  const [markupStats, setMarkupStats] = useState({
    totalMarkups: 0,
    totalFeedbacks: 0,
    pendingFeedbacks: 0,
    resolvedFeedbacks: 0,
    projectsWithMarkups: 0
  });
  const [recentMarkups, setRecentMarkups] = useState<ImageMarkup[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<MarkupFeedback[]>([]);

  useEffect(() => {
    loadMarkupData();
  }, []);

  const loadMarkupData = () => {
    // 전체 마크업 통계 계산 (실제 구현에서는 API 호출)
    const allVersions = ['version-1', 'version-2', 'version-3']; // Mock data
    
    let totalMarkups = 0;
    let totalFeedbacks = 0;
    let pendingFeedbacks = 0;
    let resolvedFeedbacks = 0;
    const projectsWithMarkupsSet = new Set();
    const allMarkups: ImageMarkup[] = [];
    const allFeedbacks: MarkupFeedback[] = [];

    allVersions.forEach(versionId => {
      const versionMarkups = MarkupManager.getVersionMarkups(versionId);
      const versionFeedbacks = MarkupManager.getVersionMarkupFeedbacks(versionId);
      
      totalMarkups += versionMarkups.length;
      totalFeedbacks += versionFeedbacks.length;
      
      versionFeedbacks.forEach(feedback => {
        if (feedback.status === 'pending' || feedback.status === 'in_progress') {
          pendingFeedbacks++;
        } else if (feedback.status === 'resolved') {
          resolvedFeedbacks++;
        }
      });

      if (versionMarkups.length > 0) {
        projectsWithMarkupsSet.add(versionId);
      }

      allMarkups.push(...versionMarkups);
      allFeedbacks.push(...versionFeedbacks);
    });

    setMarkupStats({
      totalMarkups,
      totalFeedbacks,
      pendingFeedbacks,
      resolvedFeedbacks,
      projectsWithMarkups: projectsWithMarkupsSet.size
    });

    // 최근 마크업과 피드백 (최대 10개씩)
    setRecentMarkups(allMarkups.slice(-10).reverse());
    setRecentFeedbacks(allFeedbacks.slice(-10).reverse());
  };

  const handleClearAllMarkups = () => {
    if (!confirm('모든 마크업과 피드백을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    // 전체 마크업 삭제 (실제로는 API 호출)
    localStorage.removeItem('project_markups');
    localStorage.removeItem('markup_feedbacks');
    
    alert('모든 마크업 데이터가 삭제되었습니다.');
    loadMarkupData();
  };

  const handleExportMarkupData = () => {
    const allData = {
      markups: recentMarkups,
      feedbacks: recentFeedbacks,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markup-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">마크업 관리</h1>
          <p className="text-gray-600">프로젝트별 마크업과 피드백을 관리합니다</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExportMarkupData}
            className="btn btn-outline btn-info"
          >
            📊 데이터 내보내기
          </button>
          <button
            onClick={handleClearAllMarkups}
            className="btn btn-outline btn-error"
          >
            🗑️ 전체 삭제
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">전체 마크업</div>
          <div className="stat-value text-primary">{markupStats.totalMarkups}</div>
          <div className="stat-desc">모든 프로젝트</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">전체 피드백</div>
          <div className="stat-value text-secondary">{markupStats.totalFeedbacks}</div>
          <div className="stat-desc">작성된 피드백 수</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">미해결 피드백</div>
          <div className="stat-value text-warning">{markupStats.pendingFeedbacks}</div>
          <div className="stat-desc">처리 필요</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">해결된 피드백</div>
          <div className="stat-value text-success">{markupStats.resolvedFeedbacks}</div>
          <div className="stat-desc">완료됨</div>
        </div>
        
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">마크업 프로젝트</div>
          <div className="stat-value text-info">{markupStats.projectsWithMarkups}</div>
          <div className="stat-desc">마크업이 있는 프로젝트</div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 마크업 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">최근 마크업</h2>
            
            {recentMarkups.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <div className="text-4xl mb-2">📍</div>
                <p>마크업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMarkups.map((markup) => (
                  <div key={markup.id} className="border border-base-300 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-sm badge-primary">
                          #{markup.number}
                        </span>
                        <span className="text-sm font-medium">
                          {markup.type} 마크업
                        </span>
                      </div>
                      <div className="text-xs text-base-content/60">
                        {new Date(markup.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <div className="text-sm text-base-content/70 mt-1">
                      위치: ({markup.x.toFixed(1)}%, {markup.y.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 최근 피드백 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">최근 피드백</h2>
            
            {recentFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <div className="text-4xl mb-2">💬</div>
                <p>피드백이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="border border-base-300 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {feedback.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className={`badge badge-xs ${
                          feedback.priority === 'high' ? 'badge-error' :
                          feedback.priority === 'medium' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {feedback.priority === 'high' ? '높음' :
                           feedback.priority === 'medium' ? '보통' : '낮음'}
                        </span>
                        <span className={`badge badge-xs ${
                          feedback.status === 'resolved' ? 'badge-success' :
                          feedback.status === 'in_progress' ? 'badge-warning' :
                          feedback.status === 'rejected' ? 'badge-error' : 'badge-info'
                        }`}>
                          {feedback.status === 'resolved' ? '해결' :
                           feedback.status === 'in_progress' ? '진행중' :
                           feedback.status === 'rejected' ? '거절' : '대기'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-base-content/70 line-clamp-2">
                      {feedback.description}
                    </p>
                    <div className="text-xs text-base-content/60 mt-1">
                      {new Date(feedback.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 도구별 사용 통계 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">마크업 도구별 사용 통계</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            {['point', 'circle', 'arrow', 'rectangle', 'text'].map(toolType => {
              const count = recentMarkups.filter(m => m.type === toolType).length;
              const percentage = recentMarkups.length > 0 ? (count / recentMarkups.length * 100) : 0;
              
              return (
                <div key={toolType} className="text-center p-4 border border-base-300 rounded-lg">
                  <div className="text-2xl mb-2">
                    {toolType === 'point' ? '📍' :
                     toolType === 'circle' ? '⭕' :
                     toolType === 'arrow' ? '➡️' :
                     toolType === 'rectangle' ? '⬜' : '📝'}
                  </div>
                  <div className="font-bold text-lg">{count}</div>
                  <div className="text-sm text-base-content/60 capitalize">{toolType}</div>
                  <div className="text-xs text-base-content/40">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}