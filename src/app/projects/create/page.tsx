"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { UserRole } from "@/types";
import { useProposalStore, seedProposalStore } from "@/stores/proposalStore";

// 결제 조건 타입
interface PaymentTerms {
  method: "lump_sum" | "installment" | "milestone";
  installments?: {
    percentage: number;
    timing: string;
  }[];
}

// 프로젝트 일정 타입
interface ProjectSchedule {
  startDate: string;
  draftDeadline: string;
  finalDeadline: string;
}

// 프로젝트 데이터 타입
interface ProjectData {
  name: string;
  description: string;
  category: string;
  totalModifications: number;
  estimatedPrice: number;
  schedule: ProjectSchedule;
  paymentTerms: PaymentTerms;
  contractFile?: File;
  additionalFiles?: File[];
  additionalDescription?: string;
  clientEmail: string;
  clientCompany?: string;
}

// 워크플로우 단계
type WorkflowStep = 1 | 2 | 3 | 4;

export default function ProjectCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Zustand 스토어 훅들
  const { 
    currentProposal,
    createNewProposal,
    updateCurrentProposal,
    saveCurrentProposal,
    sendProposal,
    loadProposal,
    clearCurrentProposal
  } = useProposalStore();

  // 프로젝트 데이터 상태
  const [projectData, setProjectData] = useState<ProjectData>({
    name: "",
    description: "",
    category: "",
    totalModifications: 3,
    estimatedPrice: 0,
    schedule: {
      startDate: "",
      draftDeadline: "",
      finalDeadline: "",
    },
    paymentTerms: {
      method: "lump_sum",
    },
    clientEmail: "",
    clientCompany: "",
  });

  // 클라이언트 수정 제안 데이터
  const [clientModifications, setClientModifications] = useState({
    totalModifications: projectData.totalModifications,
    estimatedPrice: projectData.estimatedPrice,
    additionalDescription: "",
    additionalFiles: [] as File[],
  });

  // 디자이너 승인 상태
  const [designerApproval, setDesignerApproval] = useState<boolean | null>(
    null
  );

  const userRole: UserRole = user?.role ?? user?.userType ?? "designer";

  // 스토어 초기화 및 URL 파라미터 처리
  useEffect(() => {
    // Mock 데이터 시딩 (개발용)
    seedProposalStore();
    
    const requestId = searchParams.get("request");
    const proposalId = searchParams.get("proposal");
    const step = searchParams.get("step");
    const from = searchParams.get("from");
    
    if (step) {
      const stepNumber = parseInt(step) as WorkflowStep;
      if (stepNumber >= 1 && stepNumber <= 4) {
        setCurrentStep(stepNumber);
      }
    }
    
    // 기존 제안서 로드
    if (proposalId && !from) {
      loadProposal(proposalId);
    }
    // 새 제안서 생성 또는 기존 제안서가 없으면 생성
    else if (!currentProposal && !requestId) {
      createNewProposal();
    }
    
    // 클라이언트 요청에서 시작하는 경우 (기존 로직 유지)
    if (requestId) {
      if (requestId === "req-001") {
        setProjectData(prev => ({
          ...prev,
          name: "브랜드 로고 디자인",
          description: "스타트업을 위한 심플하고 모던한 로고 디자인 작업입니다.",
          category: "로고 디자인",
          estimatedPrice: 500000,
          totalModifications: 3,
          schedule: {
            startDate: "2024-01-25",
            draftDeadline: "2024-02-01", 
            firstReviewDeadline: "2024-02-05",
            finalDeadline: "2024-02-10"
          },
          clientEmail: "client@example.com"
        }));
        
        setClientModifications(prev => ({
          ...prev,
          totalModifications: 3,
          estimatedPrice: 500000
        }));
      }
    }
  }, [searchParams, currentProposal, createNewProposal, loadProposal]);

  // 스토어의 currentProposal과 projectData 동기화 (초기 로딩 시에만)
  useEffect(() => {
    if (currentProposal && !searchParams.get("request") && projectData.name === "") {
      setProjectData({
        name: currentProposal.name || "",
        description: currentProposal.description || "",
        category: currentProposal.category || "",
        clientEmail: currentProposal.clientEmail || "",
        estimatedPrice: currentProposal.estimatedPrice || 0,
        totalModifications: currentProposal.totalModifications || 3,
        schedule: currentProposal.schedule || {
          startDate: "",
          draftDeadline: "",
          finalDeadline: ""
        },
        paymentTerms: currentProposal.paymentTerms || { method: "lump_sum" },
        contractFile: currentProposal.contractFile || null,
        additionalFiles: currentProposal.additionalFiles || []
      });
    }
  }, [currentProposal, searchParams]);

  // 디자이너 전용 접근 가드 (1단계에서만)
  useEffect(() => {
    if (currentStep === 1 && user && userRole !== "designer") {
      alert("프로젝트 생성은 디자이너만 시작할 수 있습니다.");
      router.replace("/projects");
    }
  }, [user, userRole, currentStep, router]);

  // 모의 API 호출 함수
  const simulateApiCall = (duration: number = 1500) => {
    return new Promise((resolve) => setTimeout(resolve, duration));
  };

  // 입력 필드 업데이트 함수 (스토어 연동)
  const updateProjectData = (field: keyof ProjectData | string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProjectData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProjectData] as any),
          [child]: value,
        },
      }));
      
      // 스토어 업데이트
      if (currentProposal) {
        updateCurrentProposal({
          [parent]: {
            ...(currentProposal[parent as keyof typeof currentProposal] as any),
            [child]: value,
          }
        });
        saveCurrentProposal();
      }
    } else {
      setProjectData((prev) => ({
        ...prev,
        [field]: value,
      }));
      
      // 스토어 업데이트
      if (currentProposal) {
        updateCurrentProposal({ [field]: value });
        saveCurrentProposal();
      }
    }
  };

  // 결제 조건 업데이트 함수
  const updatePaymentTerms = (terms: PaymentTerms) => {
    setProjectData((prev) => ({
      ...prev,
      paymentTerms: terms,
    }));
    
    // 스토어에도 동일하게 업데이트
    if (currentProposal) {
      updateCurrentProposal({ paymentTerms: terms });
      saveCurrentProposal();
    }
  };

  // 다음 단계로 진행
  const goToNextStep = async () => {
    setIsLoading(true);
    await simulateApiCall();

    if (currentStep === 1) {
      // 1단계에서 2단계로: 클라이언트에게 검토 요청
      if (currentProposal) {
        sendProposal(currentProposal.id);
      }
      alert("클라이언트에게 검토 요청이 발송되었습니다.");
    }

    setCurrentStep((prev) => (prev + 1) as WorkflowStep);
    setIsLoading(false);
  };

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WorkflowStep);
    }
  };

  // 재협상 요청 (3단계에서 2단계로)
  const requestRenegotiation = async () => {
    setIsLoading(true);
    await simulateApiCall();
    setCurrentStep(2);
    setDesignerApproval(null);
    alert("클라이언트에게 재협상 요청이 발송되었습니다.");
    setIsLoading(false);
  };

  // 최종 완료 - 실제 프로젝트 생성
  const completeWorkflow = async () => {
    setIsLoading(true);
    await simulateApiCall();

    const finalData = {
      ...projectData,
      totalModifications: clientModifications.totalModifications,
      estimatedPrice: clientModifications.estimatedPrice,
      description:
        projectData.description +
        (clientModifications.additionalDescription
          ? "\n\n" + clientModifications.additionalDescription
          : ""),
      additionalFiles: clientModifications.additionalFiles,
    };

    // 실제 프로젝트 생성 (localStorage에 저장)
    const newProject = {
      id: Date.now().toString(),
      name: finalData.name,
      description: finalData.description,
      status: "in_progress" as const,
      client_id: "1",
      designer_id: "2", 
      start_date: finalData.schedule.startDate,
      end_date: finalData.schedule.finalDeadline,
      draft_deadline: finalData.schedule.draftDeadline,
      first_review_deadline: finalData.schedule.firstReviewDeadline,
      final_review_deadline: finalData.schedule.finalDeadline,
      estimated_price: finalData.estimatedPrice,
      budget_used: 0,
      total_modification_count: finalData.totalModifications,
      remaining_modification_count: finalData.totalModifications,
      requirements: finalData.description,
      attached_files: finalData.additionalFiles?.map(f => f.name) || [],
      contract_file: finalData.contractFile?.name || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // localStorage에서 기존 프로젝트 목록 가져오기
    const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = [newProject, ...existingProjects];
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    console.log("새 프로젝트 생성됨:", newProject);
    alert("🎉 프로젝트가 성공적으로 생성되어 진행을 시작합니다!");
    
    // 생성된 프로젝트 페이지로 이동
    router.push(`/projects/${newProject.id}`);
    setIsLoading(false);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (files: FileList | null, field: string) => {
    if (!files) return;

    const fileArray = Array.from(files);
    if (field === "contractFile") {
      setProjectData((prev) => ({ ...prev, contractFile: fileArray[0] }));
    } else if (field === "additionalFiles") {
      setClientModifications((prev) => ({
        ...prev,
        additionalFiles: [...prev.additionalFiles, ...fileArray],
      }));
    }
  };

  // 진행률 계산
  const progressPercentage = (currentStep / 4) * 100;

  // 현재 단계에서 작업할 수 있는 역할 확인
  const canUserWork = () => {
    if (currentStep === 1 || currentStep === 3) {
      return userRole === "designer";
    } else if (currentStep === 2 || currentStep === 4) {
      return userRole === "client";
    }
    return false;
  };

  // 1단계: 디자이너 초안 제안
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">
          프로젝트 초안 제안
        </h2>
        <p className="text-base-content/70 mt-2">
          디자이너가 프로젝트 초안을 작성합니다
        </p>
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
              onChange={(e) => updateProjectData("name", e.target.value)}
              placeholder="프로젝트 제목을 입력하세요"
              disabled={!canUserWork()}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">카테고리 *</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={projectData.category}
              onChange={(e) => updateProjectData("category", e.target.value)}
              disabled={!canUserWork()}
            >
              <option value="">카테고리를 선택해주세요</option>
              <option value="logo">🎨 로고 디자인</option>
              <option value="web">💻 웹 디자인</option>
              <option value="branding">✨ 브랜딩</option>
              <option value="app">📱 앱 디자인</option>
              <option value="print">📄 인쇄물 디자인</option>
              <option value="other">🔗 기타</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">프로젝트 설명 *</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              value={projectData.description}
              onChange={(e) => updateProjectData("description", e.target.value)}
              placeholder="프로젝트에 대한 상세한 설명을 작성해주세요"
              disabled={!canUserWork()}
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
                onChange={(e) =>
                  updateProjectData(
                    "totalModifications",
                    parseInt(e.target.value) || 0
                  )
                }
                min="1"
                max="10"
                disabled={!canUserWork()}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">예상 견적 (원) *</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full no-spinner"
                value={
                  projectData.estimatedPrice === 0
                    ? ""
                    : projectData.estimatedPrice
                }
                onChange={(e) =>
                  updateProjectData(
                    "estimatedPrice",
                    e.target.value === "" ? 0 : parseInt(e.target.value) || 0
                  )
                }
                placeholder="예상 견적을 입력하세요"
                disabled={!canUserWork()}
              />
            </div>
          </div>
        </div>

        {/* 일정 및 클라이언트 정보 */}
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">시작일 *</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={projectData.schedule.startDate}
              onChange={(e) =>
                updateProjectData("schedule.startDate", e.target.value)
              }
              disabled={!canUserWork()}
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
              onChange={(e) =>
                updateProjectData("schedule.draftDeadline", e.target.value)
              }
              disabled={!canUserWork()}
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
              onChange={(e) =>
                updateProjectData("schedule.finalDeadline", e.target.value)
              }
              disabled={!canUserWork()}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                클라이언트 이메일 *
              </span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={projectData.clientEmail}
              onChange={(e) => updateProjectData("clientEmail", e.target.value)}
              placeholder="client@example.com"
              disabled={!canUserWork()}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">클라이언트 회사명</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={projectData.clientCompany}
              onChange={(e) =>
                updateProjectData("clientCompany", e.target.value)
              }
              placeholder="회사명 (선택사항)"
              disabled={!canUserWork()}
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
              onChange={(e) =>
                updatePaymentTerms({
                  method: e.target.value as "lump_sum" | "installment" | "milestone",
                })
              }
              disabled={!canUserWork()}
            >
              <option value="lump_sum">일시불</option>
              <option value="installment">분할 결제 (2회)</option>
              <option value="milestone">단계별 결제 (3회)</option>
            </select>
          </div>

          {/* 분할 결제 (2회) */}
          {projectData.paymentTerms.method === "installment" && (
            <div className="space-y-4 mt-4 p-4 bg-info/5 rounded-lg">
              <h4 className="font-medium text-base">분할 결제 설정 (2회)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    선급금 (%)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full no-spinner"
                    placeholder="50"
                    min="0"
                    max="100"
                    disabled={!canUserWork()}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    계약 체결 시
                  </div>
                  {projectData.estimatedPrice > 0 && (
                    <div className="text-xs font-medium text-info mt-1">
                      ≈ {Math.round(projectData.estimatedPrice * 0.5).toLocaleString()}원
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    잔금 (%)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full no-spinner"
                    placeholder="50"
                    min="0"
                    max="100"
                    disabled={!canUserWork()}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    최종 완료 시
                  </div>
                  {projectData.estimatedPrice > 0 && (
                    <div className="text-xs font-medium text-info mt-1">
                      ≈ {Math.round(projectData.estimatedPrice * 0.5).toLocaleString()}원
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/60">총합:</span>
                <div className="text-right">
                  <span className="font-medium">100%</span>
                  {projectData.estimatedPrice > 0 && (
                    <div className="text-xs font-medium text-info">
                      = {projectData.estimatedPrice.toLocaleString()}원
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 단계별 결제 (3회) */}
          {projectData.paymentTerms.method === "milestone" && (
            <div className="space-y-4 mt-4 p-4 bg-warning/5 rounded-lg">
              <h4 className="font-medium text-base">단계별 결제 설정 (3회)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    선급금 (%)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full no-spinner"
                    placeholder="30"
                    min="0"
                    max="100"
                    disabled={!canUserWork()}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    계약 체결 시
                  </div>
                  {projectData.estimatedPrice > 0 && (
                    <div className="text-xs font-medium text-warning mt-1">
                      ≈ {Math.round(projectData.estimatedPrice * 0.3).toLocaleString()}원
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    중도금 (%)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full no-spinner"
                    placeholder="40"
                    min="0"
                    max="100"
                    disabled={!canUserWork()}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    초안 완료 시
                  </div>
                  {projectData.estimatedPrice > 0 && (
                    <div className="text-xs font-medium text-warning mt-1">
                      ≈ {Math.round(projectData.estimatedPrice * 0.4).toLocaleString()}원
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    잔금 (%)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full no-spinner"
                    placeholder="30"
                    min="0"
                    max="100"
                    disabled={!canUserWork()}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    최종 완료 시
                  </div>
                  {projectData.estimatedPrice > 0 && (
                    <div className="text-xs font-medium text-warning mt-1">
                      ≈ {Math.round(projectData.estimatedPrice * 0.3).toLocaleString()}원
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/60">총합:</span>
                <div className="text-right">
                  <span className="font-medium">100%</span>
                  {projectData.estimatedPrice > 0 && (
                    <div className="text-xs font-medium text-warning">
                      = {projectData.estimatedPrice.toLocaleString()}원
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 일시불 안내 */}
          {projectData.paymentTerms.method === "lump_sum" && (
            <div className="mt-4 p-4 bg-success/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-success">✓</span>
                  <span className="text-sm font-medium">프로젝트 완료 후 전액 지급</span>
                </div>
                {projectData.estimatedPrice > 0 && (
                  <span className="text-sm font-bold text-success">
                    {projectData.estimatedPrice.toLocaleString()}원
                  </span>
                )}
              </div>
              <div className="text-xs text-base-content/60 mt-1">
                최종 결과물 납품 완료 시 100% 지급됩니다.
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
          onChange={(e) => handleFileUpload(e.target.files, "contractFile")}
          disabled={!canUserWork()}
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
        <h2 className="text-2xl font-bold text-base-content">
          프로젝트 검토 및 수정 제안
        </h2>
        <p className="text-base-content/70 mt-2">
          디자이너 제안을 검토하고 수정사항을 제안해주세요
        </p>
      </div>

      {/* 디자이너 제안 요약 (읽기 전용) */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-lg">디자이너 제안 요약</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <p>
                <strong>프로젝트명:</strong> {projectData.name}
              </p>
              <p>
                <strong>카테고리:</strong> {projectData.category}
              </p>
              <p>
                <strong>시작일:</strong> {projectData.schedule.startDate}
              </p>
              <p>
                <strong>최종 마감일:</strong>{" "}
                {projectData.schedule.finalDeadline}
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>예상 견적:</strong>{" "}
                {projectData.estimatedPrice.toLocaleString()}원
              </p>
              <p>
                <strong>총 수정 횟수:</strong> {projectData.totalModifications}
                회
              </p>
              <p>
                <strong>결제 방식:</strong>{" "}
                {projectData.paymentTerms.method === "lump_sum"
                  ? "일시불"
                  : "분할 결제"}
              </p>
              <p>
                <strong>클라이언트:</strong> {projectData.clientEmail}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p>
              <strong>프로젝트 설명:</strong>
            </p>
            <p className="mt-2 text-base-content/80">
              {projectData.description}
            </p>
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
              onChange={(e) =>
                setClientModifications((prev) => ({
                  ...prev,
                  totalModifications: parseInt(e.target.value) || 0,
                }))
              }
              min="1"
              max="10"
              disabled={!canUserWork()}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                예상 견적 조정 (원)
              </span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full no-spinner"
              value={
                clientModifications.estimatedPrice === 0
                  ? ""
                  : clientModifications.estimatedPrice
              }
              onChange={(e) =>
                setClientModifications((prev) => ({
                  ...prev,
                  estimatedPrice:
                    e.target.value === "" ? 0 : parseInt(e.target.value) || 0,
                }))
              }
              placeholder="조정할 견적을 입력하세요"
              disabled={!canUserWork()}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                추가 요구사항 및 설명
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              value={clientModifications.additionalDescription}
              onChange={(e) =>
                setClientModifications((prev) => ({
                  ...prev,
                  additionalDescription: e.target.value,
                }))
              }
              placeholder="추가적인 요구사항이나 수정하고 싶은 내용을 상세히 작성해주세요"
              disabled={!canUserWork()}
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
              onChange={(e) =>
                handleFileUpload(e.target.files, "additionalFiles")
              }
              disabled={!canUserWork()}
            />
            {clientModifications.additionalFiles.length > 0 && (
              <div className="text-sm text-base-content/70 mt-1">
                {clientModifications.additionalFiles.length}개 파일 선택됨
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 결제 조건 수정 */}
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
                method: e.target.value as "lump_sum" | "installment" 
              })}
              disabled={!canUserWork()}
            >
              <option value="lump_sum">일시불</option>
              <option value="installment">분할 결제</option>
            </select>
          </div>

          {projectData.paymentTerms.method === "installment" && (
            <div className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    선급금 비율 (%)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full no-spinner"
                    placeholder="50"
                    min="0"
                    max="100"
                    disabled={!canUserWork()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    지불 시점
                  </label>
                  <select
                    className="select select-bordered w-full"
                    disabled={!canUserWork()}
                  >
                    <option>계약 승인 시</option>
                    <option>프로젝트 시작 시</option>
                    <option>중간 보고물 제출 시</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    잔금 비율 (%)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full no-spinner"
                    placeholder="50"
                    min="0"
                    max="100"
                    disabled={!canUserWork()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    지불 시점
                  </label>
                  <select
                    className="select select-bordered w-full"
                    disabled={!canUserWork()}
                  >
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
    </div>
  );

  // 3단계: 디자이너 최종 검토
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">
          최종 검토 및 승인 요청
        </h2>
        <p className="text-base-content/70 mt-2">
          클라이언트의 수정 제안을 검토하고 승인 여부를 결정해주세요
        </p>
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
                    <span className="text-base-content/60 line-through">
                      {projectData.totalModifications}회
                    </span>
                    {" → "}
                    <span className="font-semibold text-primary">
                      {clientModifications.totalModifications}회
                    </span>
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>예상 견적:</span>
                  <span>
                    <span className="text-base-content/60 line-through">
                      {projectData.estimatedPrice.toLocaleString()}원
                    </span>
                    {" → "}
                    <span className="font-semibold text-primary">
                      {clientModifications.estimatedPrice.toLocaleString()}원
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 추가 요구사항 */}
            <div className="space-y-4">
              <h4 className="font-semibold">추가 요구사항</h4>
              {clientModifications.additionalDescription ? (
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm">
                    {clientModifications.additionalDescription}
                  </p>
                </div>
              ) : (
                <p className="text-base-content/60 text-sm">
                  추가 요구사항 없음
                </p>
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
      {canUserWork() && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-lg">검토 결과</h3>

            <div className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">
                    클라이언트 제안에 동의합니다
                  </span>
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
                  <span className="label-text">
                    수정이 필요하여 재협상을 요청합니다
                  </span>
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
      )}
    </div>
  );

  // 4단계: 클라이언트 최종 승인
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">최종 승인</h2>
        <p className="text-base-content/70 mt-2">
          최종 프로젝트 조건을 확인하고 승인해주세요
        </p>
      </div>

      {/* 최종 프로젝트 조건 요약 */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-lg">최종 프로젝트 조건</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-base">기본 정보</h4>
                <p>
                  <strong>프로젝트명:</strong> {projectData.name}
                </p>
                <p>
                  <strong>카테고리:</strong> {projectData.category}
                </p>
                <p>
                  <strong>시작일:</strong> {projectData.schedule.startDate}
                </p>
                <p>
                  <strong>최종 마감일:</strong>{" "}
                  {projectData.schedule.finalDeadline}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-base">계약 조건</h4>
                <p>
                  <strong>총 수정 횟수:</strong>{" "}
                  {clientModifications.totalModifications}회
                </p>
                <p>
                  <strong>최종 견적:</strong>{" "}
                  {clientModifications.estimatedPrice.toLocaleString()}원
                </p>
                <p>
                  <strong>결제 방식:</strong>{" "}
                  {projectData.paymentTerms.method === "lump_sum"
                    ? "일시불"
                    : "분할 결제"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-base">일정</h4>
                <p>
                  <strong>초안 제출:</strong>{" "}
                  {projectData.schedule.draftDeadline}
                </p>
                <p>
                  <strong>중간 보고물:</strong>{" "}
                  {projectData.schedule.firstReviewDeadline}
                </p>
                <p>
                  <strong>최종 완료:</strong>{" "}
                  {projectData.schedule.finalDeadline}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-base">첨부 자료</h4>
                {projectData.contractFile && (
                  <p>
                    <strong>계약서:</strong> {projectData.contractFile.name}
                  </p>
                )}
                {clientModifications.additionalFiles.length > 0 && (
                  <p>
                    <strong>추가 자료:</strong>{" "}
                    {clientModifications.additionalFiles.length}개 파일
                  </p>
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
                  <p>
                    <strong>추가 요구사항:</strong>
                  </p>
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
          return (
            userRole === "designer" &&
            projectData.name &&
            projectData.description &&
            projectData.estimatedPrice > 0 &&
            projectData.clientEmail
          );
        case 2:
          return userRole === "client";
        case 3:
          return userRole === "designer" && designerApproval !== null;
        case 4:
          return userRole === "client";
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
                    "재협상 요청"
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
                  ) : currentStep === 1 ? (
                    "클라이언트에게 검토 요청"
                  ) : currentStep === 2 ? (
                    "디자이너에게 수정 제안"
                  ) : (
                    "클라이언트에게 승인 요청"
                  )}
                </button>
              )}
            </>
          ) : (
            <button
              className="btn btn-success"
              onClick={completeWorkflow}
              disabled={!canUserWork() || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  완료 처리중...
                </>
              ) : (
                "프로젝트 최종 승인"
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthWrapper requireAuth>
      <DashboardLayout title="새 프로젝트 생성" userRole={userRole}>
        <div className="min-h-screen bg-base-100 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* 진행률 표시기 */}
            <div className="mb-8">
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-base-content">
                  프로젝트 생성 워크플로우
                </h1>
                <p className="text-base-content/70 mt-2">
                  현재 진행 상황: {currentStep}/4 단계
                  {!canUserWork() && (
                    <span className="ml-2 badge badge-warning">
                      {currentStep === 1 || currentStep === 3
                        ? "디자이너"
                        : "클라이언트"}{" "}
                      작업 대기중
                    </span>
                  )}
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
                      step <= currentStep
                        ? "text-primary"
                        : "text-base-content/40"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step <= currentStep
                          ? "bg-primary text-primary-content"
                          : "bg-base-300 text-base-content/60"
                      }`}
                    >
                      {step}
                    </div>
                    <span className="text-xs mt-1 text-center">
                      {step === 1 && "디자이너 초안"}
                      {step === 2 && "클라이언트 검토"}
                      {step === 3 && "디자이너 승인"}
                      {step === 4 && "최종 승인"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 단계별 콘텐츠 */}
            <div className="card bg-base-100 border border-base-300 shadow-lg">
              <div className="card-body">
                {/* 현재 작업 권한이 없는 경우 대기 메시지 */}
                {!canUserWork() && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-base-content mb-2">
                      {currentStep === 1 || currentStep === 3
                        ? "디자이너"
                        : "클라이언트"}
                      의 작업을 기다리고 있습니다
                    </h3>
                    <p className="text-base-content/70">
                      해당 역할의 사용자가 작업을 완료하면 알림을 받게 됩니다.
                    </p>
                  </div>
                )}

                {/* 단계별 폼 */}
                {canUserWork() && (
                  <>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}

                    {/* 네비게이션 버튼 */}
                    {renderNavigationButtons()}
                  </>
                )}

                {/* 읽기 전용 모드에서도 현재 단계 내용 표시 */}
                {!canUserWork() && (
                  <div className="opacity-60 pointer-events-none">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthWrapper>
  );
}
