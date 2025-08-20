"use client";

import React from 'react';
import { useProposalStore } from '@/stores/proposalStore';
import { useRouter } from 'next/navigation';

interface ProposalsDashboardProps {
  userRole: 'designer' | 'client';
}

const ProposalsDashboard: React.FC<ProposalsDashboardProps> = ({ userRole }) => {
  const router = useRouter();
  const { proposals, getProposalsByStatus, currentProposal } = useProposalStore();

  if (userRole !== 'designer') {
    return null; // 디자이너만 제안서를 볼 수 있음
  }

  const draftProposals = getProposalsByStatus('draft');
  const sentProposals = getProposalsByStatus('sent');
  const negotiatingProposals = getProposalsByStatus('negotiating');

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'badge-ghost',
      sent: 'badge-warning',
      negotiating: 'badge-info',
      accepted: 'badge-success',
      completed: 'badge-success'
    };
    return colors[status as keyof typeof colors] || 'badge-neutral';
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: '작성 중',
      sent: '발송됨',
      negotiating: '협상 중',
      accepted: '승인됨',
      completed: '완료'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleContinueProposal = (proposalId: string) => {
    router.push(`/projects/create?proposal=${proposalId}`);
  };

  const handleNewProposal = () => {
    router.push('/projects/create');
  };

  if (proposals.length === 0) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title">내 제안서</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-base-content/60 mb-4">
              아직 작성한 제안서가 없습니다
            </p>
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleNewProposal}
            >
              새 제안서 작성하기
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
          <h3 className="card-title">내 제안서</h3>
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleNewProposal}
          >
            + 새 제안서
          </button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-ghost">{draftProposals.length}</div>
            <div className="text-xs text-base-content/60">작성 중</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{sentProposals.length}</div>
            <div className="text-xs text-base-content/60">발송됨</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-info">{negotiatingProposals.length}</div>
            <div className="text-xs text-base-content/60">협상 중</div>
          </div>
        </div>

        {/* 현재 작성 중인 제안서 */}
        {currentProposal && (
          <div className="mb-4">
            <div className="alert alert-info">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h4 className="font-semibold">📝 작성 중인 제안서</h4>
                  <p className="text-sm">
                    {currentProposal.name || '제목 없음'} 
                    {currentProposal.clientEmail && ` • ${currentProposal.clientEmail}`}
                  </p>
                </div>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleContinueProposal(currentProposal.id)}
                >
                  계속 작성
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 최근 제안서 목록 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">최근 제안서</h4>
          {proposals.slice(0, 3).map((proposal) => (
            <div 
              key={proposal.id}
              className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 cursor-pointer transition-colors"
              onClick={() => handleContinueProposal(proposal.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`badge badge-xs ${getStatusColor(proposal.status)}`}>
                    {getStatusText(proposal.status)}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {new Date(proposal.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-medium text-sm truncate">
                  {proposal.name || '제목 없음'}
                </p>
                {proposal.clientEmail && (
                  <p className="text-xs text-base-content/60 truncate">
                    {proposal.clientEmail}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-primary">
                  {proposal.estimatedPrice > 0 
                    ? `${proposal.estimatedPrice.toLocaleString()}원`
                    : '-'
                  }
                </div>
              </div>
            </div>
          ))}
          
          {proposals.length > 3 && (
            <button 
              className="btn btn-ghost btn-sm w-full"
              onClick={() => router.push('/proposals')}
            >
              더 보기 ({proposals.length - 3}개)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalsDashboard;