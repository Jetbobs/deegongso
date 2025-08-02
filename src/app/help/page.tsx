"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  isPopular?: boolean;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    category: "일반",
    question: "DEEO는 어떤 서비스인가요?",
    answer:
      "DEEO는 클라이언트와 전문 디자이너를 연결하는 디자인 프로젝트 플랫폼입니다. 로고, 웹사이트, 브랜딩, 패키지 디자인 등 다양한 디자인 서비스를 제공합니다.",
    isPopular: true,
  },
  {
    id: "2",
    category: "프로젝트",
    question: "프로젝트는 어떻게 진행되나요?",
    answer:
      "1) 프로젝트 생성 및 디자이너 선택 → 2) 계약 체결 → 3) 디자이너 작업 → 4) 보고물 제출 → 5) 피드백 및 수정 → 6) 최종 완료 순으로 진행됩니다.",
    isPopular: true,
  },
  {
    id: "3",
    category: "결제",
    question: "결제는 언제 이루어지나요?",
    answer:
      "계약금(50%)은 프로젝트 시작 시, 잔금(50%)은 프로젝트 완료 및 최종 산출물 전달 시 결제됩니다.",
    isPopular: true,
  },
  {
    id: "4",
    category: "수정",
    question: "수정은 몇 번까지 가능한가요?",
    answer:
      "프로젝트별로 수정 횟수가 정해져 있습니다. 일반적으로 3회의 수정 기회가 제공되며, 계약 시 협의를 통해 조정 가능합니다.",
  },
  {
    id: "5",
    category: "프로젝트",
    question: "프로젝트 기간은 어떻게 정해지나요?",
    answer:
      "프로젝트 복잡도와 범위에 따라 디자이너와 협의하여 결정됩니다. 일반적으로 로고는 1-2주, 웹사이트는 2-4주 정도 소요됩니다.",
  },
  {
    id: "6",
    category: "디자이너",
    question: "디자이너는 어떻게 선택하나요?",
    answer:
      "포트폴리오, 평점, 리뷰, 전문 분야, 가격대 등을 종합적으로 검토하여 선택할 수 있습니다. 프로젝트 의뢰 전 메시지로 상담도 가능합니다.",
  },
  {
    id: "7",
    category: "결제",
    question: "환불은 가능한가요?",
    answer:
      "프로젝트 시작 전에는 전액 환불이 가능합니다. 진행 중인 프로젝트의 경우, 진행 상황에 따라 부분 환불이 가능합니다.",
  },
  {
    id: "8",
    category: "수정",
    question: "수정 횟수를 초과하면 어떻게 되나요?",
    answer:
      "추가 수정이 필요한 경우, 디자이너와 별도 협의를 통해 추가 비용으로 진행할 수 있습니다.",
  },
  {
    id: "9",
    category: "일반",
    question: "분쟁이 발생하면 어떻게 해결하나요?",
    answer:
      "DEEO 고객지원팀이 중재 역할을 합니다. 양측의 의견을 듣고 공정한 해결책을 제시하며, 필요시 전문가 검토도 진행합니다.",
  },
  {
    id: "10",
    category: "디자이너",
    question: "디자이너와 직접 만날 수 있나요?",
    answer:
      "플랫폼 내에서는 메시지와 화상통화를 통한 소통을 권장합니다. 직접 만남이 필요한 경우 양측 합의 하에 가능합니다.",
  },
];

export default function HelpPage() {
  const userRole = "client" as const;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories = ["all", "일반", "프로젝트", "디자이너", "결제", "수정"];
  const categoryLabels = {
    all: "전체",
    일반: "일반",
    프로젝트: "프로젝트",
    디자이너: "디자이너",
    결제: "결제",
    수정: "수정/피드백",
  };

  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const popularFAQs = faqData.filter((item) => item.isPopular);

  return (
    <DashboardLayout title="도움말" userRole={userRole}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">도움말 센터</h1>
          <p className="text-lg text-base-content/70">
            궁금한 점이 있으시면 아래에서 답을 찾아보세요
          </p>
        </div>

        {/* 빠른 지원 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-primary text-primary-content">
            <div className="card-body text-center">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="card-title justify-center mb-2">실시간 채팅</h3>
              <p className="text-sm opacity-90 mb-4">
                평일 09:00-18:00
                <br />
                즉시 답변
              </p>
              <button className="btn btn-sm bg-white text-primary hover:bg-gray-100">
                채팅 시작
              </button>
            </div>
          </div>

          <div className="card bg-secondary text-secondary-content">
            <div className="card-body text-center">
              <div className="text-4xl mb-2">📧</div>
              <h3 className="card-title justify-center mb-2">이메일 문의</h3>
              <p className="text-sm opacity-90 mb-4">
                24시간 접수
                <br />
                24시간 내 답변
              </p>
              <button className="btn btn-sm bg-white text-secondary hover:bg-gray-100">
                이메일 보내기
              </button>
            </div>
          </div>

          <div className="card bg-accent text-accent-content">
            <div className="card-body text-center">
              <div className="text-4xl mb-2">📞</div>
              <h3 className="card-title justify-center mb-2">전화 상담</h3>
              <p className="text-sm opacity-90 mb-4">
                평일 09:00-18:00
                <br />
                1588-1234
              </p>
              <button className="btn btn-sm bg-white text-accent hover:bg-gray-100">
                전화 걸기
              </button>
            </div>
          </div>
        </div>

        {/* 인기 FAQ */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">자주 묻는 질문</h2>
            <div className="space-y-3">
              {popularFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="collapse collapse-arrow bg-base-200"
                >
                  <input
                    type="radio"
                    name="popular-faq"
                    onChange={() =>
                      setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                    }
                  />
                  <div className="collapse-title font-medium">
                    <span className="badge badge-primary badge-sm mr-2">
                      인기
                    </span>
                    {faq.question}
                  </div>
                  <div className="collapse-content">
                    <p className="text-sm text-base-content/80">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 전체 FAQ */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <h2 className="card-title text-xl mb-4">전체 FAQ</h2>

                {/* 검색 */}
                <div className="input-group mb-4">
                  <input
                    type="text"
                    placeholder="질문이나 키워드를 검색하세요..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => setSearchTerm("")}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 카테고리 필터 */}
                <div className="tabs tabs-boxed mb-6">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`tab ${
                        selectedCategory === category ? "tab-active" : ""
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ 목록 */}
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">검색 결과가 없습니다</h3>
                <p className="text-base-content/60">
                  다른 키워드로 검색하거나 카테고리를 변경해보세요.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-base-content/60 mb-4">
                  {filteredFAQs.length}개의 FAQ
                  {searchTerm && ` · "${searchTerm}" 검색 결과`}
                  {selectedCategory !== "all" &&
                    ` · ${
                      categoryLabels[
                        selectedCategory as keyof typeof categoryLabels
                      ]
                    } 카테고리`}
                </div>

                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="collapse collapse-arrow bg-base-200"
                  >
                    <input
                      type="radio"
                      name="all-faq"
                      onChange={() =>
                        setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                      }
                    />
                    <div className="collapse-title font-medium">
                      <span className={`badge badge-outline badge-sm mr-2`}>
                        {faq.category}
                      </span>
                      {faq.isPopular && (
                        <span className="badge badge-primary badge-sm mr-2">
                          인기
                        </span>
                      )}
                      {faq.question}
                    </div>
                    <div className="collapse-content">
                      <p className="text-sm text-base-content/80">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 추가 지원 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">추가 지원</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2">🎓 사용법 가이드</h3>
                <p className="text-sm text-base-content/80 mb-3">
                  DEEO 플랫폼 사용법을 단계별로 알아보세요.
                </p>
                <button className="btn btn-outline btn-sm">가이드 보기</button>
              </div>

              <div>
                <h3 className="font-bold mb-2">🎥 동영상 튜토리얼</h3>
                <p className="text-sm text-base-content/80 mb-3">
                  동영상으로 쉽게 따라하는 사용법 강의입니다.
                </p>
                <button className="btn btn-outline btn-sm">동영상 보기</button>
              </div>

              <div>
                <h3 className="font-bold mb-2">💡 팁 & 트릭</h3>
                <p className="text-sm text-base-content/80 mb-3">
                  더 효과적인 프로젝트 진행을 위한 유용한 팁들입니다.
                </p>
                <button className="btn btn-outline btn-sm">팁 보기</button>
              </div>

              <div>
                <h3 className="font-bold mb-2">🔗 커뮤니티</h3>
                <p className="text-sm text-base-content/80 mb-3">
                  다른 사용자들과 경험을 공유하고 도움을 받으세요.
                </p>
                <button className="btn btn-outline btn-sm">
                  커뮤니티 가기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 문제 해결되지 않았나요? */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-2xl mb-4">
              문제가 해결되지 않았나요?
            </h2>
            <p className="text-lg opacity-90 mb-6">
              저희 고객지원팀이 직접 도움을 드리겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-lg bg-white text-primary hover:bg-gray-100">
                💬 실시간 채팅
              </button>
              <button className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary">
                📧 이메일 문의
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
