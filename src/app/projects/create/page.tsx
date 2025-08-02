"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// 단계 타입 정의
type Step = 1 | 2 | 3 | 4;

interface ProjectFormData {
  // 기본 정보
  name: string;
  description: string;
  category: string;

  // 일정 정보
  startDate: string;
  endDate: string;
  draftDeadline: string;
  firstReviewDeadline: string;
  finalReviewDeadline: string;

  // 프로젝트 조건
  estimatedPrice: number;
  totalModificationCount: number;

  // 요구사항 및 자료
  requirements: string;
  attachedFiles: File[];
  contractFile?: File;

  // 클라이언트 정보
  clientEmail: string;
  clientName: string;
  clientCompany: string;

  // 결제 조건
  paymentTerms: string;
}

export default function ProjectCreatePage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    draftDeadline: "",
    firstReviewDeadline: "",
    finalReviewDeadline: "",
    estimatedPrice: 0,
    totalModificationCount: 3,
    requirements: "",
    attachedFiles: [],
    clientEmail: "",
    clientName: "",
    clientCompany: "",
    paymentTerms: "",
  });

  const userRole = "designer" as const;

  const updateFormData = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = () => {
    // TODO: API 호출로 프로젝트 생성 및 클라이언트에게 검토 요청
    console.log("프로젝트 생성 데이터:", formData);
    alert(
      "프로젝트가 생성되었습니다! 클라이언트에게 검토 요청을 발송했습니다."
    );
  };

  const stepTitles = {
    1: "기본 정보",
    2: "일정 및 조건",
    3: "요구사항 및 자료",
    4: "클라이언트 정보 및 검토",
  };

  return (
    <DashboardLayout title="새 프로젝트 생성" userRole={userRole}>
      <div className="max-w-2xl mx-auto">
        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <ul className="steps w-full">
            {[1, 2, 3, 4].map((step) => (
              <li
                key={step}
                className={`step ${currentStep >= step ? "step-primary" : ""}`}
                data-content={currentStep > step ? "✓" : step}
              >
                {stepTitles[step as Step]}
              </li>
            ))}
          </ul>
        </div>

        {/* 폼 카드 */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-8">
            <h2 className="card-title text-2xl mb-8 text-center">
              {stepTitles[currentStep]}
            </h2>

            {/* Step 1: 기본 정보 */}
            {currentStep === 1 && (
              <div className="w-full">
                <div className="space-y-6">
                  {/* 프로젝트명 */}
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      프로젝트명 <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full h-12 text-base"
                      placeholder="예: 브랜드 로고 디자인"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                    />
                  </div>

                  {/* 카테고리 */}
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      카테고리 <span className="text-error">*</span>
                    </label>
                    <select
                      className="select select-bordered w-full h-12 text-base"
                      value={formData.category}
                      onChange={(e) =>
                        updateFormData("category", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        카테고리를 선택해주세요
                      </option>
                      <option value="logo">🎨 로고 디자인</option>
                      <option value="web">💻 웹 디자인</option>
                      <option value="branding">✨ 브랜딩</option>
                      <option value="app">📱 앱 디자인</option>
                      <option value="print">📄 인쇄물 디자인</option>
                      <option value="other">🔗 기타</option>
                    </select>
                  </div>

                  {/* 프로젝트 설명 */}
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      프로젝트 설명 <span className="text-error">*</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full h-32 text-base resize-none"
                      placeholder="프로젝트에 대한 상세한 설명을 입력해주세요..."
                      value={formData.description}
                      onChange={(e) =>
                        updateFormData("description", e.target.value)
                      }
                    />
                    <div className="text-xs text-base-content/60 mt-1">
                      클라이언트가 이해하기 쉽도록 구체적으로 작성해주세요.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: 일정 및 조건 */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* 프로젝트 기간 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2">
                    프로젝트 기간
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        시작일 <span className="text-error">*</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full h-12"
                        value={formData.startDate}
                        onChange={(e) =>
                          updateFormData("startDate", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        마감일 <span className="text-error">*</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full h-12"
                        value={formData.endDate}
                        onChange={(e) =>
                          updateFormData("endDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 보고 일정 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2">
                    보고 일정
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        초안 제출일 <span className="text-error">*</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full h-12"
                        value={formData.draftDeadline}
                        onChange={(e) =>
                          updateFormData("draftDeadline", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        1차 검토일 <span className="text-error">*</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full h-12"
                        value={formData.firstReviewDeadline}
                        onChange={(e) =>
                          updateFormData("firstReviewDeadline", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        최종 검토일 <span className="text-error">*</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full h-12"
                        value={formData.finalReviewDeadline}
                        onChange={(e) =>
                          updateFormData("finalReviewDeadline", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 프로젝트 조건 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2">
                    프로젝트 조건
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        예상 견적 (원) <span className="text-error">*</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full h-12"
                        placeholder="2,000,000"
                        value={formData.estimatedPrice}
                        onChange={(e) =>
                          updateFormData(
                            "estimatedPrice",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        총 수정 횟수 <span className="text-error">*</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full h-12"
                        min="1"
                        max="10"
                        value={formData.totalModificationCount}
                        onChange={(e) =>
                          updateFormData(
                            "totalModificationCount",
                            parseInt(e.target.value) || 3
                          )
                        }
                      />
                      <div className="text-xs text-base-content/60 mt-1">
                        권장: 3회
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: 요구사항 및 자료 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="w-full">
                  <label className="block text-sm font-semibold text-base-content mb-2">
                    상세 요구사항 <span className="text-error">*</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-40 text-base resize-none"
                    placeholder="클라이언트의 구체적인 요구사항을 입력하세요..."
                    value={formData.requirements}
                    onChange={(e) =>
                      updateFormData("requirements", e.target.value)
                    }
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold text-base-content mb-2">
                    참고 자료 첨부
                  </label>
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      updateFormData("attachedFiles", files);
                    }}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    이미지, PDF, 문서 파일을 첨부할 수 있습니다.
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold text-base-content mb-2">
                    계약서 첨부
                  </label>
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      updateFormData("contractFile", file);
                    }}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    PDF 또는 문서 파일로 계약서를 첨부하세요.
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-semibold text-base-content mb-2">
                    결제 조건 <span className="text-error">*</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-24 text-base resize-none"
                    placeholder="예: 계약금 50% 선입금, 완료 후 잔금 50% 지급"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      updateFormData("paymentTerms", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 4: 클라이언트 정보 및 검토 */}
            {currentStep === 4 && (
              <div className="space-y-8">
                {/* 클라이언트 정보 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2">
                    클라이언트 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        클라이언트 이름 <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full h-12"
                        placeholder="홍길동"
                        value={formData.clientName}
                        onChange={(e) =>
                          updateFormData("clientName", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        클라이언트 이메일 <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered w-full h-12"
                        placeholder="client@example.com"
                        value={formData.clientEmail}
                        onChange={(e) =>
                          updateFormData("clientEmail", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      회사명
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full h-12"
                      placeholder="회사명 (선택사항)"
                      value={formData.clientCompany}
                      onChange={(e) =>
                        updateFormData("clientCompany", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* 프로젝트 요약 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2">
                    프로젝트 요약
                  </h3>
                  <div className="bg-base-200 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>프로젝트명:</strong> {formData.name || "미입력"}
                      </div>
                      <div>
                        <strong>카테고리:</strong>{" "}
                        {formData.category || "미입력"}
                      </div>
                      <div>
                        <strong>예상 견적:</strong>{" "}
                        {formData.estimatedPrice.toLocaleString()}원
                      </div>
                      <div>
                        <strong>수정 횟수:</strong>{" "}
                        {formData.totalModificationCount}회
                      </div>
                      <div>
                        <strong>시작일:</strong>{" "}
                        {formData.startDate || "미입력"}
                      </div>
                      <div>
                        <strong>마감일:</strong> {formData.endDate || "미입력"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    프로젝트 생성 후 클라이언트에게 검토 요청 이메일이
                    발송됩니다.
                  </span>
                </div>
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-base-300">
              <button
                className="btn btn-outline btn-lg"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                이전
              </button>

              <div className="flex gap-3">
                <button className="btn btn-ghost btn-lg">임시저장</button>
                {currentStep < 4 ? (
                  <button className="btn btn-primary btn-lg" onClick={nextStep}>
                    다음
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmit}
                  >
                    프로젝트 생성 및 검토 요청
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
