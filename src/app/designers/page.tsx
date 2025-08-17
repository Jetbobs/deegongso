"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { UserRole } from "@/types";

// 디자이너 관련 타입 정의
interface Designer {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  experience: number; // 년수
  rating: number; // 1-5
  reviewCount: number;
  completedProjects: number;
  responseTime: string; // "1시간 이내", "24시간 이내" 등
  priceRange: {
    min: number;
    max: number;
  };
  portfolio: {
    title: string;
    image: string;
    category: string;
  }[];
  isVerified: boolean;
  isOnline: boolean;
  location: string;
  description: string;
  skills: string[];
}

// 모의 디자이너 데이터
const mockDesigners: Designer[] = [
  {
    id: "designer-1",
    name: "김디자이너",
    avatar: "김",
    specialties: ["로고 디자인", "브랜드 아이덴티티"],
    experience: 5,
    rating: 4.8,
    reviewCount: 127,
    completedProjects: 89,
    responseTime: "1시간 이내",
    priceRange: { min: 300000, max: 1500000 },
    portfolio: [
      { title: "스타트업 로고", image: "logo1.jpg", category: "로고" },
      { title: "카페 브랜딩", image: "brand1.jpg", category: "브랜딩" },
    ],
    isVerified: true,
    isOnline: true,
    location: "서울",
    description:
      "5년간 100여개의 브랜드 아이덴티티 작업을 진행했습니다. 클라이언트와의 소통을 중시하며, 트렌디하면서도 시대를 아우르는 디자인을 추구합니다.",
    skills: ["Illustrator", "Photoshop", "Figma", "브랜딩"],
  },
  {
    id: "designer-2",
    name: "이디자이너",
    avatar: "이",
    specialties: ["웹 UI/UX", "모바일 앱 디자인"],
    experience: 3,
    rating: 4.6,
    reviewCount: 89,
    completedProjects: 64,
    responseTime: "24시간 이내",
    priceRange: { min: 500000, max: 3000000 },
    portfolio: [
      { title: "E-커머스 웹사이트", image: "web1.jpg", category: "웹디자인" },
      { title: "금융 모바일 앱", image: "app1.jpg", category: "앱디자인" },
    ],
    isVerified: true,
    isOnline: false,
    location: "부산",
    description:
      "사용자 중심의 UI/UX 디자인을 전문으로 합니다. 데이터 기반의 디자인 결정을 통해 사용성과 전환율을 높이는 것이 목표입니다.",
    skills: ["Figma", "Sketch", "Adobe XD", "프로토타이핑"],
  },
  {
    id: "designer-3",
    name: "박디자이너",
    avatar: "박",
    specialties: ["패키지 디자인", "인쇄물 디자인"],
    experience: 7,
    rating: 4.9,
    reviewCount: 203,
    completedProjects: 156,
    responseTime: "2시간 이내",
    priceRange: { min: 200000, max: 2000000 },
    portfolio: [
      { title: "화장품 패키지", image: "pack1.jpg", category: "패키지" },
      { title: "카탈로그 디자인", image: "print1.jpg", category: "인쇄물" },
    ],
    isVerified: true,
    isOnline: true,
    location: "서울",
    description:
      "패키지와 인쇄물 디자인 7년 경력입니다. 브랜드의 가치를 물리적 매체에 효과적으로 담아내는 것을 전문으로 합니다.",
    skills: ["Illustrator", "InDesign", "Photoshop", "3D 모델링"],
  },
  {
    id: "designer-4",
    name: "최디자이너",
    avatar: "최",
    specialties: ["일러스트레이션", "캐릭터 디자인"],
    experience: 4,
    rating: 4.7,
    reviewCount: 156,
    completedProjects: 78,
    responseTime: "12시간 이내",
    priceRange: { min: 150000, max: 800000 },
    portfolio: [
      { title: "웹툰 캐릭터", image: "char1.jpg", category: "캐릭터" },
      { title: "광고 일러스트", image: "illust1.jpg", category: "일러스트" },
    ],
    isVerified: false,
    isOnline: true,
    location: "대구",
    description:
      "감성적이고 독창적인 일러스트레이션과 캐릭터 디자인을 전문으로 합니다. 다양한 스타일의 작업이 가능합니다.",
    skills: ["Procreate", "Illustrator", "Photoshop", "클립스튜디오"],
  },
];

export default function DesignersPage() {
  const { user } = useAuth();
  const userRole: UserRole = user?.role ?? user?.userType ?? "client";

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [onlineFilter, setOnlineFilter] = useState(false);
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [sortBy, setSortBy] = useState("rating_desc");

  // 필터링된 디자이너 목록
  const filteredDesigners = useMemo(() => {
    const filtered = mockDesigners.filter((designer) => {
      // 검색어 필터
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = designer.name.toLowerCase().includes(searchLower);
        const matchesSpecialty = designer.specialties.some((s) =>
          s.toLowerCase().includes(searchLower)
        );
        const matchesSkill = designer.skills.some((s) =>
          s.toLowerCase().includes(searchLower)
        );
        const matchesDescription = designer.description
          .toLowerCase()
          .includes(searchLower);

        if (
          !matchesName &&
          !matchesSpecialty &&
          !matchesSkill &&
          !matchesDescription
        ) {
          return false;
        }
      }

      // 전문 분야 필터
      if (specialtyFilter !== "all") {
        if (!designer.specialties.some((s) => s.includes(specialtyFilter))) {
          return false;
        }
      }

      // 가격대 필터
      if (priceRangeFilter !== "all") {
        const [min, max] = priceRangeFilter.split("-").map(Number);
        if (designer.priceRange.min > max || designer.priceRange.max < min) {
          return false;
        }
      }

      // 평점 필터
      if (ratingFilter !== "all") {
        const minRating = Number(ratingFilter);
        if (designer.rating < minRating) {
          return false;
        }
      }

      // 경력 필터
      if (experienceFilter !== "all") {
        const minExperience = Number(experienceFilter);
        if (designer.experience < minExperience) {
          return false;
        }
      }

      // 지역 필터
      if (locationFilter !== "all" && designer.location !== locationFilter) {
        return false;
      }

      // 온라인 상태 필터
      if (onlineFilter && !designer.isOnline) {
        return false;
      }

      // 인증 필터
      if (verifiedFilter && !designer.isVerified) {
        return false;
      }

      return true;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating_desc":
          return b.rating - a.rating;
        case "rating_asc":
          return a.rating - b.rating;
        case "experience_desc":
          return b.experience - a.experience;
        case "experience_asc":
          return a.experience - b.experience;
        case "price_asc":
          return a.priceRange.min - b.priceRange.min;
        case "price_desc":
          return b.priceRange.min - a.priceRange.min;
        case "projects_desc":
          return b.completedProjects - a.completedProjects;
        case "name_asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    searchTerm,
    specialtyFilter,
    priceRangeFilter,
    ratingFilter,
    experienceFilter,
    locationFilter,
    onlineFilter,
    verifiedFilter,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSpecialtyFilter("all");
    setPriceRangeFilter("all");
    setRatingFilter("all");
    setExperienceFilter("all");
    setLocationFilter("all");
    setOnlineFilter(false);
    setVerifiedFilter(false);
    setSortBy("rating_desc");
  };

  const formatPriceRange = (min: number, max: number) => {
    return `${(min / 10000).toFixed(0)}만원 ~ ${(max / 10000).toFixed(0)}만원`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ⭐
      </span>
    ));
  };

  return (
    <AuthWrapper requireAuth>
      <DashboardLayout title="디자이너 찾기" userRole={userRole}>
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">디자이너 탐색</h1>
              <p className="text-base-content/60">
                전문 디자이너들과 함께 프로젝트를 시작하세요.
              </p>
            </div>
            {(searchTerm ||
              specialtyFilter !== "all" ||
              priceRangeFilter !== "all" ||
              ratingFilter !== "all" ||
              experienceFilter !== "all" ||
              locationFilter !== "all" ||
              onlineFilter ||
              verifiedFilter) && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                🗑️ 필터 초기화
              </button>
            )}
          </div>

          {/* 고급 검색 및 필터 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* 검색 */}
                <div className="lg:col-span-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">검색</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="디자이너명, 전문분야, 스킬..."
                        className="input input-bordered flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSearchTerm("")}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 전문 분야 */}
                <div className="lg:col-span-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">전문 분야</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={specialtyFilter}
                      onChange={(e) => setSpecialtyFilter(e.target.value)}
                    >
                      <option value="all">모든 분야</option>
                      <option value="로고">로고 디자인</option>
                      <option value="브랜드">브랜드 아이덴티티</option>
                      <option value="웹">웹 UI/UX</option>
                      <option value="앱">모바일 앱</option>
                      <option value="패키지">패키지 디자인</option>
                      <option value="일러스트">일러스트레이션</option>
                    </select>
                  </div>
                </div>

                {/* 가격대 */}
                <div className="lg:col-span-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">가격대</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={priceRangeFilter}
                      onChange={(e) => setPriceRangeFilter(e.target.value)}
                    >
                      <option value="all">모든 가격</option>
                      <option value="0-500000">50만원 이하</option>
                      <option value="500000-1000000">50만원 ~ 100만원</option>
                      <option value="1000000-2000000">100만원 ~ 200만원</option>
                      <option value="2000000-99999999">200만원 이상</option>
                    </select>
                  </div>
                </div>

                {/* 평점 */}
                <div className="lg:col-span-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">평점</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                    >
                      <option value="all">모든 평점</option>
                      <option value="4.5">4.5 이상</option>
                      <option value="4.0">4.0 이상</option>
                      <option value="3.5">3.5 이상</option>
                    </select>
                  </div>
                </div>

                {/* 정렬 */}
                <div className="lg:col-span-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">정렬</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="rating_desc">높은 평점순</option>
                      <option value="rating_asc">낮은 평점순</option>
                      <option value="experience_desc">많은 경력순</option>
                      <option value="experience_asc">적은 경력순</option>
                      <option value="price_asc">낮은 가격순</option>
                      <option value="price_desc">높은 가격순</option>
                      <option value="projects_desc">많은 프로젝트순</option>
                      <option value="name_asc">이름순</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 추가 필터 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">경력</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                  >
                    <option value="all">모든 경력</option>
                    <option value="1">1년 이상</option>
                    <option value="3">3년 이상</option>
                    <option value="5">5년 이상</option>
                    <option value="10">10년 이상</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">지역</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="all">모든 지역</option>
                    <option value="서울">서울</option>
                    <option value="부산">부산</option>
                    <option value="대구">대구</option>
                    <option value="인천">인천</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">온라인만</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={onlineFilter}
                      onChange={(e) => setOnlineFilter(e.target.checked)}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">인증된 디자이너만</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={verifiedFilter}
                      onChange={(e) => setVerifiedFilter(e.target.checked)}
                    />
                  </label>
                </div>
              </div>

              {/* 검색 결과 요약 */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-base-content/60">
                  총 {filteredDesigners.length}명의 디자이너
                  {searchTerm && ` · "${searchTerm}" 검색 결과`}
                  {specialtyFilter !== "all" && ` · ${specialtyFilter} 전문`}
                  {onlineFilter && " · 온라인만"}
                  {verifiedFilter && " · 인증됨"}
                </div>
              </div>
            </div>
          </div>

          {/* 디자이너 목록 */}
          {filteredDesigners.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">검색 결과가 없습니다</h3>
              <p className="text-base-content/60 mb-6">
                다른 검색어로 시도해보거나 필터를 조정해보세요.
              </p>
              <button className="btn btn-primary" onClick={clearFilters}>
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDesigners.map((designer) => (
                <div
                  key={designer.id}
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="card-body">
                    {/* 디자이너 헤더 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="w-16 rounded-full bg-primary text-primary-content flex items-center justify-center relative">
                            <span className="text-lg font-bold">
                              {designer.avatar}
                            </span>
                            {designer.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-100"></div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">
                              {designer.name}
                            </h3>
                            {designer.isVerified && (
                              <span className="badge badge-primary badge-sm">
                                ✓ 인증
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-base-content/60">
                            {designer.location} · {designer.experience}년 경력
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(designer.rating)}
                            <span className="text-sm font-medium ml-1">
                              {designer.rating} ({designer.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-base-content/60">
                          응답 시간
                        </div>
                        <div className="font-medium">
                          {designer.responseTime}
                        </div>
                      </div>
                    </div>

                    {/* 전문 분야 */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {designer.specialties.map((specialty, index) => (
                          <span key={index} className="badge badge-outline">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 설명 */}
                    <p className="text-sm text-base-content/80 mb-4 line-clamp-2">
                      {designer.description}
                    </p>

                    {/* 스킬 */}
                    <div className="mb-4">
                      <div className="text-xs text-base-content/60 mb-2">
                        주요 스킬
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {designer.skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="badge badge-ghost badge-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {designer.skills.length > 4 && (
                          <span className="badge badge-ghost badge-xs">
                            +{designer.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 통계 및 가격 */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                      <div>
                        <div className="font-bold text-lg">
                          {designer.completedProjects}
                        </div>
                        <div className="text-xs text-base-content/60">
                          완료 프로젝트
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-primary">
                          {formatPriceRange(
                            designer.priceRange.min,
                            designer.priceRange.max
                          )}
                        </div>
                        <div className="text-xs text-base-content/60">
                          예상 가격대
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="card-actions justify-between">
                      <button className="btn btn-outline btn-sm">
                        포트폴리오 보기
                      </button>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm">
                          💬 문의
                        </button>
                        <button className="btn btn-primary btn-sm">
                          프로젝트 의뢰
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthWrapper>
  );
}
