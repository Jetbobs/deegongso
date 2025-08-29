'use client';

import React, { useState } from 'react';

// 사용자 역할 타입
type UserRole = 'designer' | 'client';

// 결제 조건 타입
interface PaymentTerms {
  method: 'lump_sum' | 'installment';
  installments?: {
    percentage: number;
    timing: string;
  }[];
}

// 프로젝트 일정 타입
interface ProjectSchedule {
  startDate: string;
  draftDeadline: string;
  firstReviewDeadline: string;
  finalDeadline: string;
}

// 프로젝트 데이터 타입
interface ProjectData {
  name: string;
  description: string;
  totalModifications: number;
  estimatedPrice: number;
  schedule: ProjectSchedule;
  paymentTerms: PaymentTerms;
  contractFile?: File;
  additionalFiles?: File[];
  additionalDescription?: string;
}

// 워크플로우 단계
type WorkflowStep = 1 | 2 | 3 | 4;

// 컴포넌트 props
interface ProjectCreationFormProps {
  currentUserRole: UserRole;
  onComplete?: (data: ProjectData) => void;
}

const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({ 
  currentUserRole, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole] = useState<UserRole>(currentUserRole);
  
  // 프로젝트 데이터 상태
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    totalModifications: 3,
    estimatedPrice: 0,
    schedule: {
      startDate: '',
      draftDeadline: '',
      firstReviewDeadline: '',
      finalDeadline: ''
    },
    paymentTerms: {
      method: 'lump_sum'
    }
  });

  // 클라이언트 수정 제안 데이터
  const [clientModifications, setClientModifications] = useState({
    totalModifications: projectData.totalModifications,
    estimatedPrice: projectData.estimatedPrice,
    additionalDescription: '',
    additionalFiles: [] as File[]
  });

  // 디자이너 승인 상태
  const [designerApproval, setDesignerApproval] = useState<boolean | null>(null);

  // 모의 API 호출 함수
  const simulateApiCall = (duration: number = 1500) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  // 입력 필드 업데이트 함수
  const updateProjectData = (field: keyof ProjectData | string, value: string | number | File | File[] | undefined) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProjectData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProjectData] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setProjectData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // 결제 조건 업데이트 함수
  const updatePaymentTerms = (terms: PaymentTerms) => {
    setProjectData(prev => ({
      ...prev,
      paymentTerms: terms
    }));
  };

  // 다음 단계로 진행
  const goToNextStep = async () => {
    setIsLoading(true);
    await simulateApiCall();
    setCurrentStep(prev => (prev + 1) as WorkflowStep);
    setIsLoading(false);
  };

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as WorkflowStep);
    }
  };

  // 재협상 요청 (3단계에서 2단계로)
  const requestRenegotiation = async () => {
    setIsLoading(true);
    await simulateApiCall();
    setCurrentStep(2);
    setDesignerApproval(null);
    setIsLoading(false);
  };

  // 최종 완료
  const completeWorkflow = async () => {
    setIsLoading(true);
    await simulateApiCall();
    const finalData = {
      ...projectData,
      totalModifications: clientModifications.totalModifications,
      estimatedPrice: clientModifications.estimatedPrice,
      description: projectData.description + (clientModifications.additionalDescription ? '\n\n' + clientModifications.additionalDescription : ''),
      additionalFiles: clientModifications.additionalFiles
    };
    onComplete?.(finalData);
    setIsLoading(false);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (files: FileList | null, field: string) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    if (field === 'contractFile') {
      setProjectData(prev => ({ ...prev, contractFile: fileArray[0] }));
    } else if (field === 'additionalFiles') {
      setClientModifications(prev => ({ 
        ...prev, 
        additionalFiles: [...prev.additionalFiles, ...fileArray] 
      }));
    }
  };

  // 진행률 계산
  const progressPercentage = (currentStep / 4) * 100;

  // 1단계: 디자이너 초안 제안
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">프로젝트 초안 제안</h2>
        <p className="text-base-content/70 mt-2">디자이너가 프로젝트 초안을 작성합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">프로젝트명 *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={projectData.name}
              onChange={(e) => updateProjectData('name', e.target.value)}
              placeholder="프로젝트 제목을 입력하세요"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">프로젝트 설명 *</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              value={projectData.description}
              onChange={(e) => updateProjectData('description', e.target.value)}
              placeholder="프로젝트에 대한 상세한 설명을 작성해주세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">총 수정 횟수 *</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full no-spinner"
                value={projectData.totalModifications}
                onChange={(e) => updateProjectData('totalModifications', parseInt(e.target.value) || 0)}
                min="1"
                max="10"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">예상 견적 (원) *</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full no-spinner"
                value={projectData.estimatedPrice}
                onChange={(e) => updateProjectData('estimatedPrice', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* 일정 및 결제 */}
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">시작일 *</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={projectData.schedule.startDate}
              onChange={(e) => updateProjectData('schedule.startDate', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">초안 제출일 *</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={projectData.schedule.draftDeadline}
              onChange={(e) => updateProjectData('schedule.draftDeadline', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">중간 보고물 제출일 *</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={projectData.schedule.firstReviewDeadline}
              onChange={(e) => updateProjectData('schedule.firstReviewDeadline', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">최종 마감일 *</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={projectData.schedule.finalDeadline}
              onChange={(e) => updateProjectData('schedule.finalDeadline', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 결제 조건 */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-lg">결제 조건</h3>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">결제 방식</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={projectData.paymentTerms.method}
              onChange={(e) => updatePaymentTerms({ 
                method: e.target.value as 'lump_sum' | 'installment' 
              })}
            >
              <option value="lump_sum">일시불</option>
              <option value="installment">분할 결제</option>
            </select>
          </div>

          {projectData.paymentTerms.method === 'installment' && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">선급금 비율 (%)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered no-spinner"
                    placeholder="50"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">지불 시점</span>
                  </label>
                  <select className="select select-bordered">
                    <option>계약 승인 시</option>
                    <option>프로젝트 시작 시</option>
                    <option>중간 보고물 제출 시</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">잔금 비율 (%)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered no-spinner"
                    placeholder="50"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">지불 시점</span>
                  </label>
                  <select className="select select-bordered">
                    <option>최종 마감일</option>
                    <option>프로젝트 완료 시</option>
                    <option>최종 승인 시</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 계약서 업로드 */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">계약서 파일</span>
        </label>
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleFileUpload(e.target.files, 'contractFile')}
        />
        {projectData.contractFile && (
          <div className="text-sm text-base-content/70 mt-1">
            선택된 파일: {projectData.contractFile.name}
          </div>
        )}
      </div>
    </div>
  );

  // 2단계: 클라이언트 검토 및 수정 제안
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">프로젝트 검토 및 수정 제안</h2>
        <p className="text-base-content/70 mt-2">디자이너 제안을 검토하고 수정사항을 제안해주세요</p>
      </div>

      {/* 디자이너 제안 요약 (읽기 전용) */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-lg">디자이너 제안 요약</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <p><strong>프로젝트명:</strong> {projectData.name}</p>
              <p><strong>시작일:</strong> {projectData.schedule.startDate}</p>
              <p><strong>최종 마감일:</strong> {projectData.schedule.finalDeadline}</p>
            </div>
            <div className="space-y-2">
              <p><strong>예상 견적:</strong> {projectData.estimatedPrice.toLocaleString()}원</p>
              <p><strong>총 수정 횟수:</strong> {projectData.totalModifications}회</p>
              <p><strong>결제 방식:</strong> {projectData.paymentTerms.method === 'lump_sum' ? '일시불' : '분할 결제'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p><strong>프로젝트 설명:</strong></p>
            <p className="mt-2 text-base-content/80">{projectData.description}</p>
          </div>
        </div>
      </div>

      {/* 수정 가능 항목 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">총 수정 횟수 조정</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full no-spinner"
              value={clientModifications.totalModifications}
              onChange={(e) => setClientModifications(prev => ({
                ...prev,
                totalModifications: parseInt(e.target.value) || 0
              }))}
              min="1"
              max="10"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">예상 견적 조정 (원)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full no-spinner"
              value={clientModifications.estimatedPrice}
              onChange={(e) => setClientModifications(prev => ({
                ...prev,
                estimatedPrice: parseInt(e.target.value) || 0
              }))}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">추가 요구사항 및 설명</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              value={clientModifications.additionalDescription}
              onChange={(e) => setClientModifications(prev => ({
                ...prev,
                additionalDescription: e.target.value
              }))}
              placeholder="추가적인 요구사항이나 수정하고 싶은 내용을 상세히 작성해주세요"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">추가 첨부 자료</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e.target.files, 'additionalFiles')}
            />
            {clientModifications.additionalFiles.length > 0 && (
              <div className="text-sm text-base-content/70 mt-1">
                {clientModifications.additionalFiles.length}개 파일 선택됨
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 수정된 결제 조건 */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-lg">결제 조건 수정</h3>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-medium">결제 방식</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={projectData.paymentTerms.method}
              onChange={(e) => updatePaymentTerms({ 
                method: e.target.value as 'lump_sum' | 'installment' 
              })}
            >
              <option value="lump_sum">일시불</option>
              <option value="installment">분할 결제</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // 3단계: 디자이너 최종 검토
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">최종 검토 및 승인 요청</h2>
        <p className="text-base-content/70 mt-2">클라이언트의 수정 제안을 검토하고 승인 여부를 결정해주세요</p>
      </div>

      {/* 클라이언트 수정 제안 요약 */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-lg">클라이언트 수정 제안</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* 변경 사항 비교 */}
            <div className="space-y-4">
              <h4 className="font-semibold">변경된 조건</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>총 수정 횟수:</span>
                  <span>
                    <span className="text-base-content/60 line-through">{projectData.totalModifications}회</span>
                    {' → '}
                    <span className="font-semibold text-primary">{clientModifications.totalModifications}회</span>
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>예상 견적:</span>
                  <span>
                    <span className="text-base-content/60 line-through">{projectData.estimatedPrice.toLocaleString()}원</span>
                    {' → '}
                    <span className="font-semibold text-primary">{clientModifications.estimatedPrice.toLocaleString()}원</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 추가 요구사항 */}
            <div className="space-y-4">
              <h4 className="font-semibold">추가 요구사항</h4>
              {clientModifications.additionalDescription ? (
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm">{clientModifications.additionalDescription}</p>
                </div>
              ) : (
                <p className="text-base-content/60 text-sm">추가 요구사항 없음</p>
              )}
              
              {clientModifications.additionalFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">첨부된 추가 자료:</p>
                  <ul className="text-sm text-base-content/70">
                    {clientModifications.additionalFiles.map((file, index) => (
                      <li key={index}>• {file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 승인/거절 선택 */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-lg">검토 결과</h3>
          
          <div className="space-y-4 mt-4">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">클라이언트 제안에 동의합니다</span>
                <input
                  type="radio"
                  name="approval"
                  className="radio radio-primary"
                  checked={designerApproval === true}
                  onChange={() => setDesignerApproval(true)}
                />
              </label>
            </div>
            
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">수정이 필요하여 재협상을 요청합니다</span>
                <input
                  type="radio"
                  name="approval"
                  className="radio radio-secondary"
                  checked={designerApproval === false}
                  onChange={() => setDesignerApproval(false)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 4단계: 클라이언트 최종 승인
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">최종 승인</h2>
        <p className="text-base-content/70 mt-2">최종 프로젝트 조건을 확인하고 승인해주세요</p>
      </div>

      {/* 최종 프로젝트 조건 요약 */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-lg">최종 프로젝트 조건</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-base">기본 정보</h4>
                <p><strong>프로젝트명:</strong> {projectData.name}</p>
                <p><strong>시작일:</strong> {projectData.schedule.startDate}</p>
                <p><strong>최종 마감일:</strong> {projectData.schedule.finalDeadline}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-base">계약 조건</h4>
                <p><strong>총 수정 횟수:</strong> {clientModifications.totalModifications}회</p>
                <p><strong>최종 견적:</strong> {clientModifications.estimatedPrice.toLocaleString()}원</p>
                <p><strong>결제 방식:</strong> {projectData.paymentTerms.method === 'lump_sum' ? '일시불' : '분할 결제'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-base">일정</h4>
                <p><strong>초안 제출:</strong> {projectData.schedule.draftDeadline}</p>
                <p><strong>중간 보고물:</strong> {projectData.schedule.firstReviewDeadline}</p>
                <p><strong>최종 완료:</strong> {projectData.schedule.finalDeadline}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-base">첨부 자료</h4>
                {projectData.contractFile && (
                  <p><strong>계약서:</strong> {projectData.contractFile.name}</p>
                )}
                {clientModifications.additionalFiles.length > 0 && (
                  <p><strong>추가 자료:</strong> {clientModifications.additionalFiles.length}개 파일</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-base mb-2">프로젝트 설명</h4>
            <div className="bg-base-200 p-4 rounded-lg">
              <p>{projectData.description}</p>
              {clientModifications.additionalDescription && (
                <>
                  <div className="divider"></div>
                  <p><strong>추가 요구사항:</strong></p>
                  <p>{clientModifications.additionalDescription}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 최종 승인 확인 */}
      <div className="card bg-primary/10 border border-primary/20">
        <div className="card-body text-center">
          <h3 className="card-title justify-center text-lg">최종 승인 확인</h3>
          <p className="text-base-content/80 mt-2">
            위의 모든 조건에 동의하시면 프로젝트 최종 승인 버튼을 클릭해주세요.
          </p>
          <p className="text-sm text-base-content/60 mt-1">
            승인 후에는 계약 조건을 변경할 수 없습니다.
          </p>
        </div>
      </div>
    </div>
  );

  // 네비게이션 버튼 렌더링
  const renderNavigationButtons = () => {
    const canProceed = () => {
      switch (currentStep) {
        case 1:
          return userRole === 'designer' && 
                 projectData.name && 
                 projectData.description && 
                 projectData.estimatedPrice > 0;
        case 2:
          return userRole === 'client';
        case 3:
          return userRole === 'designer' && designerApproval !== null;
        case 4:
          return userRole === 'client';
        default:
          return false;
      }
    };

    return (
      <div className="flex justify-between items-center mt-8">
        <button
          className="btn btn-outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 1 || isLoading}
        >
          이전
        </button>

        <div className="flex gap-2">
          <button className="btn btn-ghost" disabled={isLoading}>
            임시 저장
          </button>

          {currentStep < 4 ? (
            <>
              {currentStep === 3 && designerApproval === false ? (
                <button
                  className="btn btn-secondary"
                  onClick={requestRenegotiation}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      처리중...
                    </>
                  ) : (
                    '재협상 요청'
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={goToNextStep}
                  disabled={!canProceed() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      처리중...
                    </>
                  ) : (
                    currentStep === 1 ? '검토 요청' :
                    currentStep === 2 ? '수정 제안' :
                    '승인 요청'
                  )}
                </button>
              )}
            </>
          ) : (
            <button
              className="btn btn-success"
              onClick={completeWorkflow}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  완료 처리중...
                </>
              ) : (
                '프로젝트 최종 승인'
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 진행률 표시기 */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-base-content">프로젝트 생성 워크플로우</h1>
            <p className="text-base-content/70 mt-2">
              현재 진행 상황: {currentStep}/4 단계 ({userRole === 'designer' ? '디자이너' : '클라이언트'} 모드)
            </p>
          </div>
          
          <div className="w-full bg-base-200 rounded-full h-3 mb-6">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* 단계 표시기 */}
          <div className="flex justify-between items-center mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center ${
                  step <= currentStep ? 'text-primary' : 'text-base-content/40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep 
                      ? 'bg-primary text-primary-content' 
                      : 'bg-base-300 text-base-content/60'
                  }`}
                >
                  {step}
                </div>
                <span className="text-xs mt-1 text-center">
                  {step === 1 && '초안 제안'}
                  {step === 2 && '검토 & 수정'}
                  {step === 3 && '최종 검토'}
                  {step === 4 && '승인'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 단계별 콘텐츠 */}
        <div className="card bg-base-100 border border-base-300 shadow-lg">
          <div className="card-body">
            {/* 역할별 가시성 제어 */}
            {(currentStep === 1 && userRole === 'designer') && renderStep1()}
            {(currentStep === 2 && userRole === 'client') && renderStep2()}
            {(currentStep === 3 && userRole === 'designer') && renderStep3()}
            {(currentStep === 4 && userRole === 'client') && renderStep4()}

            {/* 잘못된 역할/단계 조합에 대한 대기 메시지 */}
            {((currentStep === 1 && userRole === 'client') ||
              (currentStep === 2 && userRole === 'designer') ||
              (currentStep === 3 && userRole === 'client') ||
              (currentStep === 4 && userRole === 'designer')) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-base-content mb-2">
                  {userRole === 'designer' ? '클라이언트' : '디자이너'}의 작업을 기다리고 있습니다
                </h3>
                <p className="text-base-content/70">
                  상대방이 작업을 완료하면 알림을 받게 됩니다.
                </p>
              </div>
            )}

            {/* 네비게이션 버튼 */}
            {((currentStep === 1 && userRole === 'designer') ||
              (currentStep === 2 && userRole === 'client') ||
              (currentStep === 3 && userRole === 'designer') ||
              (currentStep === 4 && userRole === 'client')) && renderNavigationButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationForm;