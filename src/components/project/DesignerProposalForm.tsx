"use client";

import { useState } from "react";
import { ProjectProposal } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface DesignerProposalFormProps {
  onSubmit: (proposal: Omit<ProjectProposal, "id" | "created_at" | "updated_at" | "comments" | "notifications">) => void;
  onSave?: (proposal: Omit<ProjectProposal, "id" | "created_at" | "updated_at" | "comments" | "notifications">) => void;
  initialData?: Partial<ProjectProposal>;
}

export default function DesignerProposalForm({
  onSubmit,
  onSave,
  initialData
}: DesignerProposalFormProps) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // 기본 정보
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    
    // 디자이너 섹션
    service_scope: initialData?.designer_section?.service_scope || "",
    estimated_price: initialData?.designer_section?.estimated_price || 0,
    total_modification_count: initialData?.designer_section?.total_modification_count || 3,
    total_duration: initialData?.designer_section?.suggested_timeline?.total_duration || 14,
    designer_notes: initialData?.designer_section?.designer_notes || "",
    portfolio_references: initialData?.designer_section?.portfolio_references || [],
    
    // 결제 조건
    payment_type: "two_part" as const,
    advance_payment: 50,
    final_payment: 50,
    
    // 클라이언트 정보
    client_email: initialData?.client_email || "",
    client_company: initialData?.client_company || ""
  });

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDeadlines = (startDate: Date, totalDuration: number) => {
    const draftDate = new Date(startDate);
    draftDate.setDate(startDate.getDate() + Math.floor(totalDuration * 0.4));
    
    const firstReviewDate = new Date(startDate);
    firstReviewDate.setDate(startDate.getDate() + Math.floor(totalDuration * 0.7));
    
    const finalDate = new Date(startDate);
    finalDate.setDate(startDate.getDate() + totalDuration);

    return {
      draft_deadline: draftDate.toISOString().split('T')[0],
      first_review_deadline: firstReviewDate.toISOString().split('T')[0],
      final_review_deadline: finalDate.toISOString().split('T')[0]
    };
  };

  const handleSubmit = (isDraft = false) => {
    setIsSubmitting(true);
    
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 3); // 3일 후 시작
    
    const deadlines = calculateDeadlines(baseDate, formData.total_duration);
    
    const proposal: Omit<ProjectProposal, "id" | "created_at" | "updated_at" | "comments" | "notifications"> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      collaboration_status: isDraft ? "draft" : "client_input_required",
      
      designer_section: {
        service_scope: formData.service_scope,
        estimated_price: formData.estimated_price,
        total_modification_count: formData.total_modification_count,
        suggested_timeline: {
          total_duration: formData.total_duration,
          ...deadlines
        },
        payment_terms: {
          type: formData.payment_type,
          twoPartTerms: {
            advancePayment: {
              amount: formData.advance_payment,
              unit: "percent",
              timing: "contract_approval"
            },
            finalPayment: {
              amount: formData.final_payment,
              unit: "percent", 
              timing: "project_completion"
            }
          }
        },
        designer_notes: formData.designer_notes,
        portfolio_references: formData.portfolio_references
      },
      
      client_email: formData.client_email,
      client_company: formData.client_company,
      designer_id: user?.id || "",
      
      designer_approved: false,
      client_approved: false,
      last_modified_by: "designer"
    };

    if (isDraft && onSave) {
      onSave(proposal);
    } else {
      onSubmit(proposal);
    }
    
    setIsSubmitting(false);
  };

  const nextStep = () => {
    if (activeStep < 3) setActiveStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 프로그레스 바 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">프로젝트 제안서 작성</h1>
          <div className="text-sm text-base-content/60">
            단계 {activeStep}/3
          </div>
        </div>
        
        <div className="w-full bg-base-300 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(activeStep / 3) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-base-content/60">
          <span className={activeStep >= 1 ? "text-primary font-medium" : ""}>기본 정보</span>
          <span className={activeStep >= 2 ? "text-primary font-medium" : ""}>서비스 조건</span>
          <span className={activeStep >= 3 ? "text-primary font-medium" : ""}>클라이언트 정보</span>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-8">
          
          {/* Step 1: 기본 정보 */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-6">📋 프로젝트 기본 정보</h2>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  프로젝트명 *
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="예: 브랜드 로고 리디자인"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  카테고리 *
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.category}
                  onChange={(e) => updateFormData("category", e.target.value)}
                >
                  <option value="">카테고리 선택</option>
                  <option value="logo">🎨 로고 디자인</option>
                  <option value="web">💻 웹 디자인</option>
                  <option value="branding">✨ 브랜딩</option>
                  <option value="app">📱 앱 디자인</option>
                  <option value="print">📄 인쇄물 디자인</option>
                  <option value="other">🔗 기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  프로젝트 개요 *
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="클라이언트에게 제안할 프로젝트의 간략한 개요를 작성해주세요..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  서비스 범위 *
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="제공할 서비스의 구체적인 범위를 설명해주세요&#10;&#10;예시:&#10;- 브랜드 로고 디자인 (3안 제시)&#10;- 명함/레터헤드 기본 세트&#10;- 브랜드 가이드라인 문서&#10;- 원본 파일 제공 (AI, PNG, SVG)"
                  value={formData.service_scope}
                  onChange={(e) => updateFormData("service_scope", e.target.value)}
                />
                <div className="text-xs text-base-content/60 mt-1">
                  💡 구체적으로 작성할수록 클라이언트의 이해도가 높아집니다
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 서비스 조건 */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-6">💰 서비스 조건 설정</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    예상 견적 (원) *
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="2000000"
                    value={formData.estimated_price}
                    onChange={(e) => updateFormData("estimated_price", parseInt(e.target.value) || 0)}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    약 {formatPrice(formData.estimated_price)}원
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    수정 횟수 *
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.total_modification_count}
                    onChange={(e) => updateFormData("total_modification_count", parseInt(e.target.value))}
                  >
                    <option value={1}>1회</option>
                    <option value={2}>2회</option>
                    <option value={3}>3회 (권장)</option>
                    <option value={4}>4회</option>
                    <option value={5}>5회</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  예상 작업 기간 *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <select
                      className="select select-bordered w-full"
                      value={formData.total_duration}
                      onChange={(e) => updateFormData("total_duration", parseInt(e.target.value))}
                    >
                      <option value={7}>1주일</option>
                      <option value={14}>2주일</option>
                      <option value={21}>3주일</option>
                      <option value={30}>1개월</option>
                      <option value={45}>1.5개월</option>
                      <option value={60}>2개월</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-base-content/70">
                      <div>📅 예상 일정:</div>
                      <div className="mt-1 text-xs">
                        • 초안: {Math.floor(formData.total_duration * 0.4)}일 후<br/>
                        • 1차 검토: {Math.floor(formData.total_duration * 0.7)}일 후<br/>
                        • 최종 완료: {formData.total_duration}일 후
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  결제 조건
                </label>
                <div className="grid grid-cols-2 gap-4 p-4 border border-base-300 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium mb-1">선급금</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="input input-bordered input-sm flex-1"
                        value={formData.advance_payment}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateFormData("advance_payment", value);
                          updateFormData("final_payment", 100 - value);
                        }}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">잔금</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="input input-bordered input-sm flex-1"
                        value={formData.final_payment}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateFormData("final_payment", value);
                          updateFormData("advance_payment", 100 - value);
                        }}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-base-content/60 mt-1">
                  계약 체결 시 {formData.advance_payment}%, 프로젝트 완료 시 {formData.final_payment}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  디자이너 메모
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-20"
                  placeholder="클라이언트에게 전달하고 싶은 추가 정보나 전문가 의견을 입력하세요..."
                  value={formData.designer_notes}
                  onChange={(e) => updateFormData("designer_notes", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: 클라이언트 정보 & 검토 */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-6">👤 클라이언트 정보</h2>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  클라이언트 이메일 *
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="client@company.com"
                  value={formData.client_email}
                  onChange={(e) => updateFormData("client_email", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  회사명
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="회사명 (선택사항)"
                  value={formData.client_company}
                  onChange={(e) => updateFormData("client_company", e.target.value)}
                />
              </div>

              {/* 제안서 미리보기 */}
              <div className="border border-base-300 rounded-lg p-6 bg-base-50">
                <h3 className="text-lg font-semibold mb-4">📋 제안서 미리보기</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>프로젝트:</strong> {formData.name}</div>
                    <div><strong>카테고리:</strong> {formData.category}</div>
                    <div><strong>예상 견적:</strong> {formatPrice(formData.estimated_price)}원</div>
                    <div><strong>작업 기간:</strong> {formData.total_duration}일</div>
                    <div><strong>수정 횟수:</strong> {formData.total_modification_count}회</div>
                    <div><strong>결제 조건:</strong> {formData.advance_payment}% + {formData.final_payment}%</div>
                  </div>
                  
                  {formData.service_scope && (
                    <div>
                      <strong>서비스 범위:</strong>
                      <div className="mt-1 p-2 bg-base-100 rounded whitespace-pre-line text-xs">
                        {formData.service_scope}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>제안서 전송 후 클라이언트가 추가 정보를 입력하고 양방향 검토가 진행됩니다.</span>
              </div>
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-base-300">
            <button
              className="btn btn-outline"
              onClick={prevStep}
              disabled={activeStep === 1 || isSubmitting}
            >
              이전
            </button>

            <div className="flex space-x-3">
              {activeStep === 3 && (
                <button
                  className="btn btn-ghost"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  임시저장
                </button>
              )}
              
              {activeStep < 3 ? (
                <button
                  className="btn btn-primary"
                  onClick={nextStep}
                  disabled={!formData.name || !formData.category}
                >
                  다음
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting || !formData.client_email}
                >
                  {isSubmitting ? (
                    <div className="loading loading-spinner loading-sm" />
                  ) : (
                    "제안서 전송"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}