'use client';

import React, { useState } from 'react';
import ProjectCreationForm from '@/components/project/ProjectCreationForm';

type UserRole = 'designer' | 'client';

const ProjectWorkflowPage: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('designer');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleProjectComplete = (data: Record<string, unknown>) => {
    console.log('프로젝트 완료 데이터:', data);
    alert('프로젝트 워크플로우가 성공적으로 완료되었습니다!');
    setIsFormVisible(false);
  };

  const startWorkflow = (role: UserRole) => {
    setCurrentUserRole(role);
    setIsFormVisible(true);
  };

  if (isFormVisible) {
    return (
      <div>
        <div className="bg-base-200 p-4 mb-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-lg font-semibold">
              프로젝트 생성 워크플로우 - {currentUserRole === 'designer' ? '디자이너' : '클라이언트'} 모드
            </h1>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setIsFormVisible(false)}
            >
              시작 화면으로
            </button>
          </div>
        </div>
        <ProjectCreationForm
          currentUserRole={currentUserRole}
          onComplete={handleProjectComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            프로젝트 생성 워크플로우 데모
          </h1>
          <p className="text-lg text-base-content/70 mb-8">
            디자이너와 클라이언트 간의 4단계 프로젝트 협의 과정을 체험해보세요
          </p>
        </div>

        {/* 워크플로우 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card bg-base-100 border border-base-300 shadow">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="card-title text-lg justify-center">1단계</h3>
              <p className="text-sm text-base-content/70">
                디자이너가 프로젝트 초안, 견적, 일정을 제안합니다
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="card-title text-lg justify-center">2단계</h3>
              <p className="text-sm text-base-content/70">
                클라이언트가 제안을 검토하고 수정사항을 제안합니다
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="card-title text-lg justify-center">3단계</h3>
              <p className="text-sm text-base-content/70">
                디자이너가 수정사항을 검토하고 최종 승인을 요청합니다
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="card-title text-lg justify-center">4단계</h3>
              <p className="text-sm text-base-content/70">
                클라이언트가 최종 조건을 승인하여 프로젝트를 시작합니다
              </p>
            </div>
          </div>
        </div>

        {/* 역할 선택 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-base-content mb-6">
            어떤 역할로 워크플로우를 체험하시겠습니까?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-lg transition-shadow">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="card-title text-xl justify-center mb-2">디자이너로 시작</h3>
                <p className="text-base-content/70 mb-4">
                  프로젝트 초안을 작성하고 클라이언트의 피드백을 받아 최종 계약을 체결합니다
                </p>
                <ul className="text-sm text-base-content/60 text-left space-y-1 mb-4">
                  <li>• 프로젝트 초안 작성</li>
                  <li>• 견적 및 일정 제안</li>
                  <li>• 클라이언트 수정사항 검토</li>
                  <li>• 최종 승인 요청</li>
                </ul>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => startWorkflow('designer')}
                >
                  디자이너로 시작하기
                </button>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:shadow-lg transition-shadow">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">👔</div>
                <h3 className="card-title text-xl justify-center mb-2">클라이언트로 시작</h3>
                <p className="text-base-content/70 mb-4">
                  디자이너의 제안을 검토하고 수정사항을 제안하여 최종 계약을 체결합니다
                </p>
                <ul className="text-sm text-base-content/60 text-left space-y-1 mb-4">
                  <li>• 디자이너 제안 검토</li>
                  <li>• 수정사항 제안</li>
                  <li>• 추가 요구사항 전달</li>
                  <li>• 최종 조건 승인</li>
                </ul>
                <button
                  className="btn btn-secondary w-full"
                  onClick={() => startWorkflow('client')}
                >
                  클라이언트로 시작하기
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-info/10 border border-info/20 rounded-lg">
            <p className="text-sm text-base-content/70">
              💡 <strong>팁:</strong> 실제 서비스에서는 각 단계마다 상대방에게 알림이 전송되며, 
              각자의 역할에 맞는 단계에서만 작업이 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkflowPage;