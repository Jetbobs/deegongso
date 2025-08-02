"use client";

import { useState, useEffect } from "react";

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: "client" | "designer";
}

const clientTourSteps: TourStep[] = [
  {
    id: "welcome",
    target: "",
    title: "환영합니다! 🎉",
    content:
      "DEEO에 오신 것을 환영합니다! 전문 디자이너들과 함께 프로젝트를 성공적으로 완료하는 방법을 알아보세요.",
    position: "bottom",
  },
  {
    id: "sidebar",
    target: "[data-tour='sidebar']",
    title: "사이드바 메뉴",
    content:
      "여기서 프로젝트 관리, 메시지, 디자이너 찾기 등 모든 기능에 접근할 수 있습니다.",
    position: "right",
  },
  {
    id: "projects",
    target: "[data-tour='projects']",
    title: "내 프로젝트",
    content:
      "진행 중인 프로젝트와 완료된 프로젝트를 한눈에 확인하고 관리하세요.",
    position: "right",
  },
  {
    id: "messages",
    target: "[data-tour='messages']",
    title: "메시지",
    content:
      "디자이너와의 소통은 메시지를 통해 이루어집니다. 파일 공유와 실시간 채팅이 가능합니다.",
    position: "right",
  },
  {
    id: "designers",
    target: "[data-tour='designers']",
    title: "디자이너 찾기",
    content:
      "전문 분야, 경력, 가격대 등으로 필터링하여 원하는 디자이너를 찾아보세요.",
    position: "right",
  },
  {
    id: "profile",
    target: "[data-tour='profile']",
    title: "프로필 관리",
    content:
      "프로필 이미지를 클릭하여 계정 설정, 프로필 수정, 로그아웃 등을 할 수 있습니다.",
    position: "bottom",
  },
];

const designerTourSteps: TourStep[] = [
  {
    id: "welcome",
    target: "",
    title: "디자이너님 환영합니다! 👨‍🎨",
    content: "DEEO에서 클라이언트들과 함께 멋진 프로젝트를 진행해보세요!",
    position: "bottom",
  },
  {
    id: "projects",
    target: "[data-tour='projects']",
    title: "프로젝트 관리",
    content: "의뢰받은 프로젝트들을 관리하고, 진행 상황을 체크하세요.",
    position: "right",
  },
  {
    id: "upload",
    target: "[data-tour='upload']",
    title: "작업물 업로드",
    content: "완성된 디자인 작업물을 업로드하고 클라이언트와 공유하세요.",
    position: "right",
  },
  {
    id: "feedback",
    target: "[data-tour='feedback']",
    title: "피드백 관리",
    content: "클라이언트의 피드백을 확인하고 수정 작업을 진행하세요.",
    position: "right",
  },
];

export default function OnboardingTour({
  isOpen,
  onClose,
  userRole,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(
    null
  );

  const tourSteps = userRole === "client" ? clientTourSteps : designerTourSteps;

  useEffect(() => {
    if (isOpen && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep];
      if (step.target) {
        const element = document.querySelector(step.target) as HTMLElement;
        if (element) {
          setHighlightElement(element);
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        setHighlightElement(null);
      }
    }
  }, [isOpen, currentStep, tourSteps]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    // 투어 완료 상태를 로컬 스토리지에 저장
    localStorage.setItem("onboarding_completed", "true");
    onClose();
  };

  const getTooltipPosition = () => {
    if (!highlightElement || !currentStepData.target) {
      // 중앙 모달 스타일
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
      };
    }

    const rect = highlightElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let top = 0;
    let left = 0;

    switch (currentStepData.position) {
      case "top":
        top = rect.top - tooltipHeight - 10;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 10;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 10;
        break;
    }

    // 화면 경계 체크 및 조정
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10)
      left = window.innerWidth - tooltipWidth - 10;
    if (top < 10) top = 10;
    if (top + tooltipHeight > window.innerHeight - 10)
      top = window.innerHeight - tooltipHeight - 10;

    return {
      position: "fixed" as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1001,
    };
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-1000"
        onClick={onClose}
      />

      {/* 하이라이트 */}
      {highlightElement && (
        <div
          className="fixed border-4 border-primary rounded-lg pointer-events-none z-1000"
          style={{
            top: highlightElement.offsetTop - 4,
            left: highlightElement.offsetLeft - 4,
            width: highlightElement.offsetWidth + 8,
            height: highlightElement.offsetHeight + 8,
          }}
        />
      )}

      {/* 툴팁 */}
      <div
        className="bg-base-100 rounded-lg shadow-xl border border-base-300 w-80 z-1001"
        style={getTooltipPosition()}
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-base-content/60">
              {currentStep + 1} / {tourSteps.length}
            </div>
            <button className="btn btn-ghost btn-xs" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">{currentStepData.title}</h3>
            <p className="text-sm text-base-content/80">
              {currentStepData.content}
            </p>
          </div>

          {/* 진행률 바 */}
          <div className="mb-4">
            <progress
              className="progress progress-primary w-full h-2"
              value={currentStep + 1}
              max={tourSteps.length}
            />
          </div>

          {/* 버튼들 */}
          <div className="flex items-center justify-between">
            <button className="btn btn-ghost btn-sm" onClick={skipTour}>
              건너뛰기
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button className="btn btn-outline btn-sm" onClick={prevStep}>
                  이전
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={nextStep}>
                {isLastStep ? "완료" : "다음"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
