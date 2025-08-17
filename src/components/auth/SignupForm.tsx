"use client";

import { useState } from "react";
import type React from "react";
import { useAuth } from "@/hooks/useAuth";
import { TempUser, SignupFormData } from "@/types";

interface SignupFormProps {
  tempUser: TempUser | null;
  onComplete: () => void;
}

export default function SignupForm({ tempUser, onComplete }: SignupFormProps) {
  const { completeSignup, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    email: tempUser?.email || "",
    name: tempUser?.name || "",
    phone: "",
    userType: "",
    company: "",
    department: "",
    experience: "",
    specialization: [],
    portfolio_url: "",
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (formData.userType !== "") {
      // localStorage에 사용자 정보 저장
      localStorage.setItem("userRole", formData.userType);
      localStorage.setItem("userInfo", JSON.stringify(formData));

      const validFormData = {
        ...formData,
        userType: formData.userType as "client" | "designer"
      };

      await completeSignup(validFormData);
      onComplete();
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name && formData.phone;
      case 2:
        return formData.userType;
      case 3:
        return true; // 3단계는 모든 필드가 선택사항
      default:
        return false;
    }
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization?.includes(spec)
        ? prev.specialization.filter((s) => s !== spec)
        : [...(prev.specialization || []), spec],
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 추출
    let formattedValue = "";

    if (value.length <= 3) {
      formattedValue = value;
    } else if (value.length <= 7) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length <= 11) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(
        7
      )}`;
    } else {
      // 11자리 초과시 11자리까지만 사용
      const truncated = value.slice(0, 11);
      formattedValue = `${truncated.slice(0, 3)}-${truncated.slice(
        3,
        7
      )}-${truncated.slice(7)}`;
    }

    setFormData({ ...formData, phone: formattedValue });
  };

  const availableSpecializations = [
    "브랜딩",
    "로고 디자인",
    "웹 디자인",
    "UI/UX",
    "모바일 앱",
    "패키지 디자인",
    "편집 디자인",
    "일러스트레이션",
    "포스터",
    "명함",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl">
        <div className="card-body p-8">
          {/* 진행 단계 표시 */}
          <div className="flex justify-center mb-8">
            <ul className="steps steps-horizontal">
              <li className={`step ${step >= 1 ? "step-primary" : ""}`}>
                기본정보
              </li>
              <li className={`step ${step >= 2 ? "step-primary" : ""}`}>
                계정유형
              </li>
              <li className={`step ${step >= 3 ? "step-primary" : ""}`}>
                추가정보
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">
            {step === 1 && "기본 정보를 입력해주세요"}
            {step === 2 && "어떤 유형의 사용자인가요?"}
            {step === 3 && "마지막 단계예요!"}
          </h2>

          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="space-y-6 flex flex-col items-center">
              <div className="flex flex-col w-full max-w-md">
                <div className="mb-2">
                  <span className="font-medium text-base">이메일</span>
                </div>
                <input
                  type="email"
                  className="input input-bordered bg-gray-50 h-12 w-full"
                  value={formData.email}
                  disabled
                />
                <div className="mt-1">
                  <span className="text-sm text-gray-500">
                    Google 계정에서 가져온 이메일입니다
                  </span>
                </div>
              </div>

              <div className="flex flex-col w-full max-w-md">
                <div className="mb-2">
                  <span className="font-medium text-base">
                    이름 <span className="text-error">*</span>
                  </span>
                </div>
                <input
                  type="text"
                  className="input input-bordered h-12 w-full"
                  placeholder="실명을 입력해주세요"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <div className="mt-1">
                  <span className="text-sm text-gray-500">
                    프로젝트 관리 시 사용될 이름입니다
                  </span>
                </div>
              </div>

              <div className="flex flex-col w-full max-w-md">
                <div className="mb-2">
                  <span className="font-medium text-base">
                    전화번호 <span className="text-error">*</span>
                  </span>
                </div>
                <input
                  type="tel"
                  className="input input-bordered h-12 w-full"
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={13}
                />
                <div className="mt-1">
                  <span className="text-sm text-gray-500">
                    프로젝트 관련 연락을 위해 필요합니다
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 사용자 유형 선택 */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-center text-base-content/70 mb-6">
                Deeo에서 어떤 역할로 활동하실 예정인가요?
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div
                  className={`card cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                    formData.userType === "client"
                      ? "ring-2 ring-primary bg-primary/10 shadow-lg scale-105"
                      : "bg-base-200 hover:bg-base-300"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, userType: "client" })
                  }
                >
                  <div className="card-body items-center text-center p-8">
                    <div className="text-5xl mb-4">🏢</div>
                    <h3 className="font-bold text-xl mb-2">클라이언트</h3>
                    <p className="text-base-content/70 mb-4">
                      디자인 프로젝트를 의뢰하고 관리합니다
                    </p>
                    <ul className="text-sm text-base-content/60 text-left space-y-1">
                      <li>• 프로젝트 등록 및 관리</li>
                      <li>• 디자이너 선택 및 소통</li>
                      <li>• 결과물 검토 및 피드백</li>
                    </ul>
                    {formData.userType === "client" && (
                      <div className="badge badge-primary mt-4">선택됨</div>
                    )}
                  </div>
                </div>

                <div
                  className={`card cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                    formData.userType === "designer"
                      ? "ring-2 ring-secondary bg-secondary/10 shadow-lg scale-105"
                      : "bg-base-200 hover:bg-base-300"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, userType: "designer" })
                  }
                >
                  <div className="card-body items-center text-center p-8">
                    <div className="text-5xl mb-4">🎨</div>
                    <h3 className="font-bold text-xl mb-2">디자이너</h3>
                    <p className="text-base-content/70 mb-4">
                      디자인 서비스를 제공하고 프로젝트를 수행합니다
                    </p>
                    <ul className="text-sm text-base-content/60 text-left space-y-1">
                      <li>• 프로젝트 지원 및 수주</li>
                      <li>• 클라이언트와 협업</li>
                      <li>• 창의적인 결과물 제작</li>
                    </ul>
                    {formData.userType === "designer" && (
                      <div className="badge badge-secondary mt-4">선택됨</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 추가 정보 */}
          {step === 3 && (
            <div className="space-y-6">
              {formData.userType === "client" && (
                <>
                  <div className="flex flex-col">
                    <div className="mb-2">
                      <span className="font-medium text-base">
                        회사명 <span className="text-gray-500">(선택)</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered h-12"
                      placeholder="회사명을 입력해주세요"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">
                        프로젝트 관리 시 표시될 회사 정보입니다
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="mb-2">
                      <span className="font-medium text-base">
                        부서 <span className="text-gray-500">(선택)</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered h-12"
                      placeholder="부서명을 입력해주세요"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    />
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">
                        소속 부서나 팀 정보입니다
                      </span>
                    </div>
                  </div>
                </>
              )}

              {formData.userType === "designer" && (
                <>
                  <div className="flex flex-col">
                    <div className="mb-2">
                      <span className="font-medium text-base">
                        경력 <span className="text-gray-500">(선택)</span>
                      </span>
                    </div>
                    <select
                      className="select select-bordered h-12"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                    >
                      <option value="">경력을 선택해주세요</option>
                      <option value="1년 미만">1년 미만</option>
                      <option value="1-3년">1-3년</option>
                      <option value="3-5년">3-5년</option>
                      <option value="5년 이상">5년 이상</option>
                    </select>
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">
                        클라이언트가 디자이너를 선택할 때 참고 정보로 활용됩니다
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="mb-2">
                      <span className="font-medium text-base">
                        전문분야 <span className="text-gray-500">(선택)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSpecializations.map((spec) => (
                        <label key={spec} className="cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm mr-2"
                            checked={formData.specialization?.includes(spec) || false}
                            onChange={() => handleSpecializationToggle(spec)}
                          />
                          <span className="text-sm">{spec}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">
                        전문적으로 다루는 디자인 분야를 선택해주세요
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="mb-2">
                      <span className="font-medium text-base">
                        포트폴리오 URL{" "}
                        <span className="text-gray-500">(선택)</span>
                      </span>
                    </div>
                    <input
                      type="url"
                      className="input input-bordered h-12"
                      placeholder="https://portfolio.example.com"
                      value={formData.portfolio_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio_url: e.target.value,
                        })
                      }
                    />
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">
                        포트폴리오나 작업물을 볼 수 있는 웹사이트 주소
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="alert alert-info mt-8">
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
                <div>
                  <p className="font-medium">거의 다 완성되었습니다! 🎉</p>
                  <p className="text-sm mt-1">
                    이 정보는 나중에 프로필에서 언제든지 수정할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-between mt-8">
            <button
              className={`btn ${
                step === 1 ? "btn-ghost invisible" : "btn-ghost"
              }`}
              onClick={handleBack}
              disabled={loading}
            >
              이전
            </button>

            <button
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={!isStepValid() || loading}
            >
              {step === 3 ? "가입 완료" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
