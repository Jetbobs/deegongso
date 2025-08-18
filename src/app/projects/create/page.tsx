"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { UserRole, ProjectProposal } from "@/types";
import DesignerProposalForm from "@/components/project/DesignerProposalForm";

// 단계 타입 정의
type Step = 1 | 2 | 3 | 4;

// 결제 방식 타입 정의
type PaymentType = "two_part" | "three_part" | "lump_sum" | "custom";

// 결제 시점 타입 정의
type PaymentTiming =
  | "contract_approval"
  | "project_start"
  | "first_report"
  | "milestone"
  | "final_delivery"
  | "project_completion";

// 결제 조건 상세 구조
interface PaymentTerms {
  type: PaymentType;

  // 선급금/잔금 분할
  twoPartTerms?: {
    advancePayment: {
      amount: number;
      unit: "percent" | "amount";
      timing: PaymentTiming;
    };
    finalPayment: {
      amount: number;
      unit: "percent" | "amount";
      timing: PaymentTiming;
    };
  };

  // 선급금/중도금/잔금 분할
  threePartTerms?: {
    advancePayment: {
      amount: number;
      unit: "percent" | "amount";
      timing: PaymentTiming;
    };
    intermediatePayment: {
      amount: number;
      unit: "percent" | "amount";
      timing: PaymentTiming;
    };
    finalPayment: {
      amount: number;
      unit: "percent" | "amount";
      timing: PaymentTiming;
    };
  };

  // 일시불
  lumpSumTerms?: {
    timing: "prepayment" | "postpayment";
    paymentTiming: PaymentTiming;
  };

  // 기타 (자유 입력)
  customTerms?: string;
}

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
  clientCompany: string;

  // 결제 조건 (구조화된 방식)
  paymentTerms: PaymentTerms;
}

export default function ProjectCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [guardChecked, setGuardChecked] = useState(false);
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
    clientCompany: "",
    paymentTerms: {
      type: "two_part",
      twoPartTerms: {
        advancePayment: {
          amount: 50,
          unit: "percent",
          timing: "contract_approval",
        },
        finalPayment: {
          amount: 50,
          unit: "percent",
          timing: "project_completion",
        },
      },
    },
  });

  const userRole: UserRole = user?.role ?? user?.userType ?? "designer";

  // 디자이너 전용 접근 가드
  useEffect(() => {
    // 로딩 상태는 AuthWrapper가 처리하므로 여기서는 간단히 가드만
    if (!guardChecked) {
      setGuardChecked(true);
      if (user && (user.role ?? user.userType) !== "designer") {
        alert("해당 페이지는 디자이너만 접근 가능합니다.");
        router.replace("/projects");
      }
    }
  }, [user, guardChecked, router]);

  const updateFormData = (field: keyof ProjectFormData, value: ProjectFormData[keyof ProjectFormData]) => {
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
    router.push("/projects");
  };

  const handleTempSave = () => {
    // TODO: API 호출로 프로젝트 임시저장
    console.log("임시저장 데이터:", formData);
    localStorage.setItem("temp_project_data", JSON.stringify(formData));
    alert("프로젝트가 임시저장되었습니다.");
  };

  const stepTitles = {
    1: "기본 정보",
    2: "일정 및 조건",
    3: "요구사항 및 자료",
    4: "클라이언트 정보 및 검토",
  };

  return (
    <AuthWrapper requireAuth>
      <DashboardLayout title="새 프로젝트 생성" userRole={userRole}>
        <div className="max-w-2xl mx-auto">
          {/* 진행 단계 표시 */}
          <div className="mb-8">
            <ul className="steps w-full">
              {[1, 2, 3, 4].map((step) => (
                <li
                  key={step}
                  className={`step ${
                    currentStep >= step ? "step-primary" : ""
                  }`}
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
                            updateFormData(
                              "firstReviewDeadline",
                              e.target.value
                            )
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
                            updateFormData(
                              "finalReviewDeadline",
                              e.target.value
                            )
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

                  <PaymentTermsInput
                    paymentTerms={formData.paymentTerms}
                    estimatedPrice={formData.estimatedPrice}
                    onChange={(terms) => updateFormData("paymentTerms", terms)}
                  />
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
                          <strong>프로젝트명:</strong>{" "}
                          {formData.name || "미입력"}
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
                          <strong>마감일:</strong>{" "}
                          {formData.endDate || "미입력"}
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
                  <button 
                    className="btn btn-ghost btn-lg"
                    onClick={handleTempSave}
                  >
                    임시저장
                  </button>
                  {currentStep < 4 ? (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={nextStep}
                    >
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
    </AuthWrapper>
  );
}

// 결제 조건 입력 컴포넌트
function PaymentTermsInput({
  paymentTerms,
  estimatedPrice,
  onChange,
}: {
  paymentTerms: PaymentTerms;
  estimatedPrice: number;
  onChange: (terms: PaymentTerms) => void;
}) {
  const paymentTimingLabels: Record<PaymentTiming, string> = {
    contract_approval: "계약 승인 시점",
    project_start: "프로젝트 시작 시점",
    first_report: "1차 보고물 제출 시점",
    milestone: "중간 마일스톤 달성 시",
    final_delivery: "최종 산출물 제출 시점",
    project_completion: "프로젝트 완료 승인 시",
  };

  const calculateAmount = (
    amount: number,
    unit: "percent" | "amount",
    price: number
  ) => {
    if (unit === "percent") {
      return Math.round((price * amount) / 100);
    }
    return amount;
  };


  const updatePaymentTerms = (updates: Partial<PaymentTerms>) => {
    onChange({ ...paymentTerms, ...updates });
  };

  const updateTwoPartTerms = (
    field: keyof NonNullable<PaymentTerms["twoPartTerms"]>,
    value: NonNullable<PaymentTerms["twoPartTerms"]>[keyof NonNullable<PaymentTerms["twoPartTerms"]>]
  ) => {
    const current = paymentTerms.twoPartTerms || {
      advancePayment: {
        amount: 50,
        unit: "percent",
        timing: "contract_approval",
      },
      finalPayment: {
        amount: 50,
        unit: "percent",
        timing: "project_completion",
      },
    };

    updatePaymentTerms({
      twoPartTerms: {
        ...current,
        [field]: value,
      },
    });
  };

  const updateThreePartTerms = (
    field: keyof NonNullable<PaymentTerms["threePartTerms"]>,
    value: NonNullable<PaymentTerms["threePartTerms"]>[keyof NonNullable<PaymentTerms["threePartTerms"]>]
  ) => {
    const current = paymentTerms.threePartTerms || {
      advancePayment: {
        amount: 30,
        unit: "percent",
        timing: "contract_approval",
      },
      intermediatePayment: {
        amount: 30,
        unit: "percent",
        timing: "first_report",
      },
      finalPayment: {
        amount: 40,
        unit: "percent",
        timing: "project_completion",
      },
    };

    updatePaymentTerms({
      threePartTerms: {
        ...current,
        [field]: value,
      },
    });
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-base-content mb-4">
        결제 조건 <span className="text-error">*</span>
      </label>

      {/* 1단계: 결제 방식 선택 */}
      <div className="mb-6">
        <div className="text-sm font-medium mb-3">결제 방식 선택</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`btn ${
              paymentTerms.type === "two_part" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() =>
              updatePaymentTerms({
                type: "two_part",
                twoPartTerms: {
                  advancePayment: {
                    amount: 50,
                    unit: "percent",
                    timing: "contract_approval",
                  },
                  finalPayment: {
                    amount: 50,
                    unit: "percent",
                    timing: "project_completion",
                  },
                },
              })
            }
          >
            선급금/잔금 분할
          </button>

          <button
            type="button"
            className={`btn ${
              paymentTerms.type === "three_part" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() =>
              updatePaymentTerms({
                type: "three_part",
                threePartTerms: {
                  advancePayment: {
                    amount: 30,
                    unit: "percent",
                    timing: "contract_approval",
                  },
                  intermediatePayment: {
                    amount: 30,
                    unit: "percent",
                    timing: "first_report",
                  },
                  finalPayment: {
                    amount: 40,
                    unit: "percent",
                    timing: "project_completion",
                  },
                },
              })
            }
          >
            선급금/중도금/잔금 분할
          </button>

          <button
            type="button"
            className={`btn ${
              paymentTerms.type === "lump_sum" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() =>
              updatePaymentTerms({
                type: "lump_sum",
                lumpSumTerms: {
                  timing: "postpayment",
                  paymentTiming: "project_completion",
                },
              })
            }
          >
            일시불
          </button>

          <button
            type="button"
            className={`btn ${
              paymentTerms.type === "custom" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() =>
              updatePaymentTerms({
                type: "custom",
                customTerms: "",
              })
            }
          >
            기타
          </button>
        </div>
      </div>

      {/* 2단계: 세부 조건 입력 */}
      {paymentTerms.type === "two_part" && paymentTerms.twoPartTerms && (
        <div className="space-y-4">
          <div className="text-sm font-medium">선급금/잔금 비율 및 시점</div>

          {/* 선급금 */}
          <div className="card bg-base-50 p-4">
            <div className="text-sm font-medium mb-3">📋 선급금</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <input
                    type="number"
                    className="input input-bordered w-full pr-8 no-spinner"
                    placeholder="50"
                    value={paymentTerms.twoPartTerms.advancePayment.amount}
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      updateTwoPartTerms("advancePayment", {
                        ...paymentTerms.twoPartTerms!.advancePayment,
                        amount,
                        unit: "percent",
                      });
                    }}
                    onBlur={(e) => {
                      const amount = Number(e.target.value);
                      // 잔금 자동 계산 (포커스 아웃 시)
                      updateTwoPartTerms("finalPayment", {
                        ...paymentTerms.twoPartTerms!.finalPayment,
                        amount: 100 - amount,
                        unit: "percent",
                      });
                    }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 percentage-indicator">
                    %
                  </span>
                </div>
              </div>
              <div>
                <select
                  className="select select-bordered w-full"
                  value={paymentTerms.twoPartTerms.advancePayment.timing}
                  onChange={(e) =>
                    updateTwoPartTerms("advancePayment", {
                      ...paymentTerms.twoPartTerms!.advancePayment,
                      timing: e.target.value as PaymentTiming,
                    })
                  }
                >
                  {Object.entries(paymentTimingLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">
              약{" "}
              {calculateAmount(
                paymentTerms.twoPartTerms.advancePayment.amount,
                "percent",
                estimatedPrice
              ).toLocaleString()}
              원
            </div>
          </div>

          {/* 잔금 */}
          <div className="card bg-base-50 p-4">
            <div className="text-sm font-medium mb-3">💰 잔금</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <input
                    type="number"
                    className="input input-bordered w-full pr-8 no-spinner"
                    placeholder="50"
                    value={paymentTerms.twoPartTerms.finalPayment.amount}
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      updateTwoPartTerms("finalPayment", {
                        ...paymentTerms.twoPartTerms!.finalPayment,
                        amount,
                        unit: "percent",
                      });
                    }}
                    onBlur={(e) => {
                      const amount = Number(e.target.value);
                      // 선급금 자동 계산 (포커스 아웃 시)
                      updateTwoPartTerms("advancePayment", {
                        ...paymentTerms.twoPartTerms!.advancePayment,
                        amount: 100 - amount,
                        unit: "percent",
                      });
                    }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 percentage-indicator">
                    %
                  </span>
                </div>
              </div>
              <div>
                <select
                  className="select select-bordered w-full"
                  value={paymentTerms.twoPartTerms.finalPayment.timing}
                  onChange={(e) =>
                    updateTwoPartTerms("finalPayment", {
                      ...paymentTerms.twoPartTerms!.finalPayment,
                      timing: e.target.value as PaymentTiming,
                    })
                  }
                >
                  {Object.entries(paymentTimingLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">
              약{" "}
              {calculateAmount(
                paymentTerms.twoPartTerms.finalPayment.amount,
                "percent",
                estimatedPrice
              ).toLocaleString()}
              원
            </div>
          </div>
        </div>
      )}

      {paymentTerms.type === "three_part" && paymentTerms.threePartTerms && (
        <div className="space-y-4">
          <div className="text-sm font-medium">
            선급금/중도금/잔금 비율 및 시점
          </div>

          {/* 선급금 */}
          <div className="card bg-base-50 p-4">
            <div className="text-sm font-medium mb-3">📋 선급금</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  className="input input-bordered pr-8 no-spinner"
                  placeholder="30"
                  value={paymentTerms.threePartTerms.advancePayment.amount}
                  onChange={(e) =>
                    updateThreePartTerms("advancePayment", {
                      ...paymentTerms.threePartTerms!.advancePayment,
                      amount: Number(e.target.value),
                      unit: "percent",
                    })
                  }
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
                  %
                </span>
              </div>
              <select
                className="select select-bordered"
                value={paymentTerms.threePartTerms.advancePayment.timing}
                onChange={(e) =>
                  updateThreePartTerms("advancePayment", {
                    ...paymentTerms.threePartTerms!.advancePayment,
                    timing: e.target.value as PaymentTiming,
                  })
                }
              >
                {Object.entries(paymentTimingLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 중도금 */}
          <div className="card bg-base-50 p-4">
            <div className="text-sm font-medium mb-3">🔄 중도금</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  className="input input-bordered pr-8 no-spinner"
                  placeholder="30"
                  value={paymentTerms.threePartTerms.intermediatePayment.amount}
                  onChange={(e) =>
                    updateThreePartTerms("intermediatePayment", {
                      ...paymentTerms.threePartTerms!.intermediatePayment,
                      amount: Number(e.target.value),
                      unit: "percent",
                    })
                  }
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
                  %
                </span>
              </div>
              <select
                className="select select-bordered"
                value={paymentTerms.threePartTerms.intermediatePayment.timing}
                onChange={(e) =>
                  updateThreePartTerms("intermediatePayment", {
                    ...paymentTerms.threePartTerms!.intermediatePayment,
                    timing: e.target.value as PaymentTiming,
                  })
                }
              >
                {Object.entries(paymentTimingLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 잔금 */}
          <div className="card bg-base-50 p-4">
            <div className="text-sm font-medium mb-3">💰 잔금</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  className="input input-bordered pr-8 no-spinner"
                  placeholder="40"
                  value={paymentTerms.threePartTerms.finalPayment.amount}
                  onChange={(e) =>
                    updateThreePartTerms("finalPayment", {
                      ...paymentTerms.threePartTerms!.finalPayment,
                      amount: Number(e.target.value),
                      unit: "percent",
                    })
                  }
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
                  %
                </span>
              </div>
              <select
                className="select select-bordered"
                value={paymentTerms.threePartTerms.finalPayment.timing}
                onChange={(e) =>
                  updateThreePartTerms("finalPayment", {
                    ...paymentTerms.threePartTerms!.finalPayment,
                    timing: e.target.value as PaymentTiming,
                  })
                }
              >
                {Object.entries(paymentTimingLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3분할 합계 검증 */}
          <div className="mt-4 p-4 border rounded-lg">
            <div className="text-sm font-medium mb-2">
              💯 결제 비율 합계 검증
            </div>
            {(() => {
              const total =
                paymentTerms.threePartTerms.advancePayment.amount +
                paymentTerms.threePartTerms.intermediatePayment.amount +
                paymentTerms.threePartTerms.finalPayment.amount;

              const isValid = total === 100;
              const isOver = total > 100;

              return (
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">
                    선급금 {paymentTerms.threePartTerms.advancePayment.amount}%
                    + 중도금{" "}
                    {paymentTerms.threePartTerms.intermediatePayment.amount}% +
                    잔금 {paymentTerms.threePartTerms.finalPayment.amount}% =
                    <span
                      className={`ml-2 ${
                        isValid
                          ? "text-success"
                          : isOver
                          ? "text-error"
                          : "text-warning"
                      }`}
                    >
                      {total}%
                    </span>
                  </div>
                  <div
                    className={`badge text-xs ${
                      isValid
                        ? "badge-success"
                        : isOver
                        ? "badge-error"
                        : "badge-warning"
                    }`}
                  >
                    {isValid ? "✅ 정상" : isOver ? "❌ 초과" : "⚠️ 부족"}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {paymentTerms.type === "lump_sum" && paymentTerms.lumpSumTerms && (
        <div className="space-y-4">
          <div className="text-sm font-medium">일시불 조건</div>
          <div className="card bg-base-50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-2">
                  결제 방식
                </label>
                <select
                  className="select select-bordered w-full"
                  value={paymentTerms.lumpSumTerms.timing}
                  onChange={(e) =>
                    updatePaymentTerms({
                      lumpSumTerms: {
                        ...paymentTerms.lumpSumTerms!,
                        timing: e.target.value as "prepayment" | "postpayment",
                      },
                    })
                  }
                >
                  <option value="prepayment">전액 선결제</option>
                  <option value="postpayment">전액 후결제</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2">
                  결제 시점
                </label>
                <select
                  className="select select-bordered w-full"
                  value={paymentTerms.lumpSumTerms.paymentTiming}
                  onChange={(e) =>
                    updatePaymentTerms({
                      lumpSumTerms: {
                        ...paymentTerms.lumpSumTerms!,
                        paymentTiming: e.target.value as PaymentTiming,
                      },
                    })
                  }
                >
                  {Object.entries(paymentTimingLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentTerms.type === "custom" && (
        <div className="space-y-4">
          <div className="text-sm font-medium">기타 결제 조건</div>
          <textarea
            className="textarea textarea-bordered w-full h-24"
            placeholder="결제 조건을 자유롭게 입력하세요..."
            value={paymentTerms.customTerms || ""}
            onChange={(e) =>
              updatePaymentTerms({
                customTerms: e.target.value,
              })
            }
          />
        </div>
      )}

      {/* 결제 조건 요약 */}
      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <div className="text-sm font-medium mb-2">📋 결제 조건 요약</div>
        <div className="text-sm text-base-content/80">
          {paymentTerms.type === "two_part" && paymentTerms.twoPartTerms && (
            <div>
              • 선급금: {paymentTerms.twoPartTerms.advancePayment.amount}% (
              {
                paymentTimingLabels[
                  paymentTerms.twoPartTerms.advancePayment.timing
                ]
              }
              )
              <br />• 잔금: {paymentTerms.twoPartTerms.finalPayment.amount}% (
              {
                paymentTimingLabels[
                  paymentTerms.twoPartTerms.finalPayment.timing
                ]
              }
              )
            </div>
          )}
          {paymentTerms.type === "three_part" &&
            paymentTerms.threePartTerms && (
              <div>
                • 선급금: {paymentTerms.threePartTerms.advancePayment.amount}% (
                {
                  paymentTimingLabels[
                    paymentTerms.threePartTerms.advancePayment.timing
                  ]
                }
                )
                <br />• 중도금:{" "}
                {paymentTerms.threePartTerms.intermediatePayment.amount}% (
                {
                  paymentTimingLabels[
                    paymentTerms.threePartTerms.intermediatePayment.timing
                  ]
                }
                )
                <br />• 잔금: {paymentTerms.threePartTerms.finalPayment.amount}%
                (
                {
                  paymentTimingLabels[
                    paymentTerms.threePartTerms.finalPayment.timing
                  ]
                }
                )
                <br />• 총 합계:{" "}
                {paymentTerms.threePartTerms.advancePayment.amount +
                  paymentTerms.threePartTerms.intermediatePayment.amount +
                  paymentTerms.threePartTerms.finalPayment.amount}
                %
                <span
                  className={`ml-2 font-semibold ${
                    paymentTerms.threePartTerms.advancePayment.amount +
                      paymentTerms.threePartTerms.intermediatePayment.amount +
                      paymentTerms.threePartTerms.finalPayment.amount ===
                    100
                      ? "text-success"
                      : paymentTerms.threePartTerms.advancePayment.amount +
                          paymentTerms.threePartTerms.intermediatePayment
                            .amount +
                          paymentTerms.threePartTerms.finalPayment.amount >
                        100
                      ? "text-error"
                      : "text-warning"
                  }`}
                >
                  {paymentTerms.threePartTerms.advancePayment.amount +
                    paymentTerms.threePartTerms.intermediatePayment.amount +
                    paymentTerms.threePartTerms.finalPayment.amount ===
                  100
                    ? "(정상)"
                    : paymentTerms.threePartTerms.advancePayment.amount +
                        paymentTerms.threePartTerms.intermediatePayment.amount +
                        paymentTerms.threePartTerms.finalPayment.amount >
                      100
                    ? "(초과)"
                    : "(부족)"}
                </span>
              </div>
            )}
          {paymentTerms.type === "lump_sum" && paymentTerms.lumpSumTerms && (
            <div>
              •{" "}
              {paymentTerms.lumpSumTerms.timing === "prepayment"
                ? "전액 선결제"
                : "전액 후결제"}
              ({paymentTimingLabels[paymentTerms.lumpSumTerms.paymentTiming]})
            </div>
          )}
          {paymentTerms.type === "custom" && (
            <div>• {paymentTerms.customTerms}</div>
          )}
        </div>
      </div>
    </div>
  );
}
