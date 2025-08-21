"use client";

import { useState } from "react";
import { User } from "@/types";

interface PublicProfileProps {
  designer: User & { role: "designer" };
  isOwner?: boolean;
}

const mockPortfolio = [
  {
    id: "1",
    title: "브랜딩 패키지 디자인",
    description: "스타트업을 위한 완전한 브랜딩 솔루션",
    images: ["/mock-portfolio-1.jpg"],
    category: "브랜딩",
    completedAt: "2024-12-15",
    client: "테크스타트업 A",
    tags: ["로고", "명함", "브랜딩"]
  },
  {
    id: "2", 
    title: "웹사이트 UI/UX 디자인",
    description: "모던하고 사용자 친화적인 웹사이트 디자인",
    images: ["/mock-portfolio-2.jpg"],
    category: "웹디자인",
    completedAt: "2024-11-20",
    client: "이커머스 B",
    tags: ["UI", "UX", "웹디자인"]
  },
  {
    id: "3",
    title: "모바일 앱 디자인",
    description: "직관적인 사용자 경험의 모바일 앱",
    images: ["/mock-portfolio-3.jpg"],
    category: "앱디자인",
    completedAt: "2024-10-30",
    client: "핀테크 C",
    tags: ["모바일", "앱", "UX"]
  }
];

const mockReviews = [
  {
    id: "1",
    clientName: "김민수",
    rating: 5,
    comment: "정말 만족스러운 작업이었습니다. 세심한 배려와 빠른 응답으로 프로젝트가 순조롭게 진행되었어요.",
    projectTitle: "브랜딩 패키지 디자인",
    createdAt: "2024-12-20",
    verified: true
  },
  {
    id: "2",
    clientName: "이지영",
    rating: 5,
    comment: "기대 이상의 퀄리티! 디자인 센스가 뛰어나고 커뮤니케이션도 원활했습니다.",
    projectTitle: "웹사이트 UI/UX 디자인",
    createdAt: "2024-11-25",
    verified: true
  },
  {
    id: "3",
    clientName: "박준호",
    rating: 4,
    comment: "전문적이고 체계적인 접근이 인상적이었습니다. 다음에도 다시 의뢰하고 싶어요.",
    projectTitle: "모바일 앱 디자인",
    createdAt: "2024-11-05",
    verified: true
  }
];

export default function PublicProfile({ designer, isOwner = false }: PublicProfileProps) {
  const [activeTab, setActiveTab] = useState<"portfolio" | "reviews" | "about">("portfolio");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "브랜딩", "웹디자인", "앱디자인", "그래픽"];
  const filteredPortfolio = selectedCategory === "all" 
    ? mockPortfolio 
    : mockPortfolio.filter(item => item.category === selectedCategory);

  const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* 프로필 이미지 */}
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white/20 flex items-center justify-center text-6xl">
                👩‍🎨
              </div>
              {designer.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                  ✓
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{designer.name}</h1>
              <p className="text-xl text-white/90 mb-4">{designer.title || "전문 디자이너"}</p>
              <p className="text-white/80 mb-6 max-w-2xl">
                {designer.bio || "창의적이고 전문적인 디자인 서비스를 제공합니다. 고객의 비전을 현실로 만들어드립니다."}
              </p>

              {/* 통계 */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{mockPortfolio.length}</div>
                  <div className="text-sm text-white/80">완료 프로젝트</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="text-sm text-white/80">평균 평점</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{mockReviews.length}</div>
                  <div className="text-sm text-white/80">리뷰 수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-white/80">만족도</div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                {!isOwner && (
                  <>
                    <button className="btn btn-primary btn-lg">
                      💬 채팅하기
                    </button>
                    <button className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-purple-700">
                      📝 프로젝트 의뢰
                    </button>
                  </>
                )}
                {isOwner && (
                  <button className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-purple-700">
                    ✏️ 프로필 편집
                  </button>
                )}
                <button className="btn btn-ghost btn-lg text-white">
                  🔗 공유하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="container mx-auto px-4 mt-8">
        <div className="tabs tabs-boxed">
          <button 
            className={`tab ${activeTab === "portfolio" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("portfolio")}
          >
            🎨 포트폴리오
          </button>
          <button 
            className={`tab ${activeTab === "reviews" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            ⭐ 리뷰 ({mockReviews.length})
          </button>
          <button 
            className={`tab ${activeTab === "about" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            👤 소개
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "portfolio" && (
          <div>
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <button
                  key={category}
                  className={`btn btn-sm ${selectedCategory === category ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "전체" : category}
                </button>
              ))}
            </div>

            {/* 포트폴리오 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolio.map(item => (
                <div key={item.id} className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <figure className="aspect-video bg-gray-200 flex items-center justify-center">
                    <div className="text-4xl">🖼️</div>
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map(tag => (
                        <span key={tag} className="badge badge-outline badge-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>클라이언트: {item.client}</span>
                      <span>{new Date(item.completedAt).toLocaleDateString("ko-KR")}</span>
                    </div>
                    
                    <div className="card-actions justify-end mt-4">
                      <button className="btn btn-primary btn-sm">자세히 보기</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPortfolio.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-2">해당 카테고리의 작품이 없습니다</h3>
                <p className="text-gray-600">다른 카테고리를 선택해보세요.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            {/* 리뷰 요약 */}
            <div className="card bg-white shadow-lg mb-6">
              <div className="card-body">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                    <div className="rating rating-lg">
                      {[1, 2, 3, 4, 5].map(star => (
                        <input
                          key={star}
                          type="radio"
                          className={`mask mask-star-2 ${star <= averageRating ? "bg-orange-400" : "bg-gray-300"}`}
                          disabled
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{mockReviews.length}개 리뷰</div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = mockReviews.filter(r => r.rating === star).length;
                      const percentage = (count / mockReviews.length) * 100;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm w-6">{star}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-400 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 리뷰 목록 */}
            <div className="space-y-4">
              {mockReviews.map(review => (
                <div key={review.id} className="card bg-white shadow">
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            <span className="text-sm">{review.clientName[0]}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{review.clientName}</h4>
                            {review.verified && (
                              <div className="badge badge-success badge-sm">인증됨</div>
                            )}
                          </div>
                          <div className="rating rating-sm">
                            {[1, 2, 3, 4, 5].map(star => (
                              <input
                                key={star}
                                type="radio"
                                className={`mask mask-star-2 ${star <= review.rating ? "bg-orange-400" : "bg-gray-300"}`}
                                disabled
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    
                    <div className="text-sm text-gray-500">
                      프로젝트: {review.projectTitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 소개 */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">👤 자기소개</h3>
                <p className="text-gray-700 leading-relaxed">
                  안녕하세요! 저는 8년 경력의 전문 디자이너입니다. 
                  브랜딩부터 웹/앱 디자인까지 다양한 분야에서 활동하고 있으며, 
                  클라이언트의 비전을 현실로 만들어드리는 것을 목표로 합니다.
                  <br /><br />
                  깔끔하고 모던한 디자인을 선호하며, 사용자 경험을 최우선으로 생각합니다. 
                  프로젝트마다 최선을 다해 최고의 결과물을 만들어드리겠습니다.
                </p>
              </div>
            </div>

            {/* 스킬 & 전문분야 */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">🛠️ 스킬 & 전문분야</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">전문 도구</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Adobe Photoshop", "Illustrator", "Figma", "Sketch", "InDesign"].map(skill => (
                        <span key={skill} className="badge badge-primary">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">전문 분야</h4>
                    <div className="flex flex-wrap gap-2">
                      {["브랜딩", "로고 디자인", "웹 UI/UX", "모바일 앱", "그래픽 디자인"].map(area => (
                        <span key={area} className="badge badge-secondary">{area}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 경력 & 학력 */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">🎓 경력 & 학력</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">시니어 디자이너</h4>
                    <p className="text-sm text-gray-600">테크컴퍼니 A • 2020 - 현재</p>
                    <p className="text-sm">브랜딩 및 디지털 디자인 업무 담당</p>
                  </div>
                  
                  <div className="border-l-4 border-secondary pl-4">
                    <h4 className="font-semibold">주니어 디자이너</h4>
                    <p className="text-sm text-gray-600">디자인 스튜디오 B • 2018 - 2020</p>
                    <p className="text-sm">웹/모바일 UI/UX 디자인</p>
                  </div>
                  
                  <div className="border-l-4 border-accent pl-4">
                    <h4 className="font-semibold">시각디자인학과 졸업</h4>
                    <p className="text-sm text-gray-600">서울대학교 • 2014 - 2018</p>
                    <p className="text-sm">우등 졸업, 디자인 공모전 다수 수상</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 연락처 & SNS */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">📞 연락처</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📧</span>
                    <span>{designer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌐</span>
                    <span>www.portfolio-site.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <span>@instagram_handle</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💼</span>
                    <span>linkedin.com/in/designer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}