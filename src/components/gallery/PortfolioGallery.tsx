"use client";

import { useState } from "react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  completedAt: string;
  clientName?: string;
  projectDuration: string;
  tools: string[];
  featured: boolean;
  likes: number;
  views: number;
}

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  isOwner?: boolean;
  onItemClick?: (item: PortfolioItem) => void;
  onAddNew?: () => void;
}

const mockPortfolioItems: PortfolioItem[] = [
  {
    id: "1",
    title: "모던 브랜딩 시스템",
    description: "테크 스타트업을 위한 완전한 브랜딩 솔루션. 로고, 명함, 프레젠테이션 템플릿 등 일관된 브랜드 아이덴티티를 구축했습니다.",
    category: "브랜딩",
    tags: ["로고", "브랜딩", "아이덴티티"],
    images: ["/mock-portfolio-1.jpg"],
    completedAt: "2024-01-15",
    clientName: "테크스타트업 A",
    projectDuration: "3주",
    tools: ["Illustrator", "Photoshop", "InDesign"],
    featured: true,
    likes: 124,
    views: 2840
  },
  {
    id: "2",
    title: "이커머스 웹사이트 UI/UX",
    description: "사용자 중심의 직관적인 쇼핑 경험을 제공하는 이커머스 플랫폼 디자인. 컨버전율 향상을 위한 UX 최적화를 진행했습니다.",
    category: "웹디자인",
    tags: ["UI", "UX", "이커머스"],
    images: ["/mock-portfolio-2.jpg"],
    completedAt: "2024-01-08",
    clientName: "온라인샵 B",
    projectDuration: "4주",
    tools: ["Figma", "Principle", "Zeplin"],
    featured: true,
    likes: 89,
    views: 1920
  },
  {
    id: "3",
    title: "모바일 금융 앱 디자인",
    description: "보안성과 사용성을 모두 고려한 핀테크 앱 디자인. 복잡한 금융 서비스를 간단하고 직관적으로 이용할 수 있도록 설계했습니다.",
    category: "앱디자인",
    tags: ["모바일", "핀테크", "UX"],
    images: ["/mock-portfolio-3.jpg"],
    completedAt: "2023-12-20",
    clientName: "핀테크 C",
    projectDuration: "6주",
    tools: ["Sketch", "Principle", "Marvel"],
    featured: false,
    likes: 156,
    views: 3240
  },
  {
    id: "4",
    title: "레스토랑 브랜딩 패키지",
    description: "고급 레스토랑의 브랜드 아이덴티티와 메뉴 디자인. 우아하고 세련된 느낌을 강조한 일관된 브랜딩을 구현했습니다.",
    category: "브랜딩",
    tags: ["레스토랑", "메뉴", "브랜딩"],
    images: ["/mock-portfolio-4.jpg"],
    completedAt: "2023-12-10",
    clientName: "레스토랑 D",
    projectDuration: "2주",
    tools: ["Illustrator", "InDesign"],
    featured: false,
    likes: 67,
    views: 1450
  },
  {
    id: "5",
    title: "부동산 플랫폼 디자인",
    description: "부동산 검색과 거래를 위한 웹 플랫폼 UI/UX 디자인. 사용자가 원하는 매물을 쉽게 찾을 수 있는 검색 UX를 중점적으로 개선했습니다.",
    category: "웹디자인",
    tags: ["부동산", "플랫폼", "검색"],
    images: ["/mock-portfolio-5.jpg"],
    completedAt: "2023-11-25",
    clientName: "부동산플랫폼 E",
    projectDuration: "5주",
    tools: ["Figma", "Adobe XD"],
    featured: false,
    likes: 43,
    views: 890
  },
  {
    id: "6",
    title: "헬스케어 앱 UI 리뉴얼",
    description: "기존 헬스케어 앱의 사용성 개선을 위한 UI 리뉴얼 프로젝트. 중장년층 사용자를 고려한 접근성과 가독성을 향상시켰습니다.",
    category: "앱디자인",
    tags: ["헬스케어", "리뉴얼", "접근성"],
    images: ["/mock-portfolio-6.jpg"],
    completedAt: "2023-11-15",
    clientName: "헬스케어 F",
    projectDuration: "4주",
    tools: ["Figma", "Principle"],
    featured: false,
    likes: 92,
    views: 1680
  }
];

const categories = ["전체", "브랜딩", "웹디자인", "앱디자인", "그래픽"];
const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "views", label: "조회순" }
];

export default function PortfolioGallery({ 
  items = mockPortfolioItems, 
  isOwner = false, 
  onItemClick,
  onAddNew 
}: PortfolioGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const filteredItems = items
    .filter(item => selectedCategory === "전체" || item.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.likes - a.likes;
        case "views":
          return b.views - a.views;
        case "latest":
        default:
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      }
    });

  const featuredItems = items.filter(item => item.featured);

  const handleItemClick = (item: PortfolioItem) => {
    setSelectedItem(item);
    onItemClick?.(item);
  };

  const renderGridItem = (item: PortfolioItem) => (
    <div key={item.id} className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <figure className="relative aspect-video bg-gray-200 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-100 to-purple-100">
          🎨
        </div>
        {item.featured && (
          <div className="absolute top-3 left-3 badge badge-warning">⭐ Featured</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <button 
            onClick={() => handleItemClick(item)}
            className="btn btn-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            자세히 보기
          </button>
        </div>
      </figure>
      
      <div className="card-body p-4">
        <h3 className="card-title text-lg line-clamp-2">{item.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge badge-outline badge-sm">
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="badge badge-ghost badge-sm">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>{new Date(item.completedAt).toLocaleDateString("ko-KR")}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              👁️ {item.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              ❤️ {item.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListItem = (item: PortfolioItem) => (
    <div key={item.id} className="card bg-white shadow hover:shadow-lg transition-shadow cursor-pointer">
      <div className="card-body">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-48 aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-2xl bg-gradient-to-br from-blue-100 to-purple-100 relative">
            🎨
            {item.featured && (
              <div className="absolute top-2 left-2 badge badge-warning badge-sm">⭐</div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <span className="badge badge-outline">{item.category}</span>
            </div>
            
            <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map(tag => (
                <span key={tag} className="badge badge-outline badge-sm">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>📅 {new Date(item.completedAt).toLocaleDateString("ko-KR")}</span>
                <span>⏱️ {item.projectDuration}</span>
                {item.clientName && <span>👤 {item.clientName}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span>👁️ {item.views.toLocaleString()}</span>
                <span>❤️ {item.likes}</span>
                <button 
                  onClick={() => handleItemClick(item)}
                  className="btn btn-primary btn-sm"
                >
                  보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Featured 섹션 */}
      {featuredItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">⭐ 주요 작품</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.slice(0, 3).map(renderGridItem)}
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">포트폴리오</h2>
          <p className="text-gray-600">총 {filteredItems.length}개의 작품</p>
        </div>
        
        {isOwner && (
          <button onClick={onAddNew} className="btn btn-primary">
            ➕ 새 작품 추가
          </button>
        )}
      </div>

      {/* 필터 및 정렬 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              className={`btn btn-sm ${selectedCategory === category ? "btn-primary" : "btn-outline"}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="join">
            <button 
              className={`join-item btn btn-sm ${viewMode === "grid" ? "btn-active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              ⚏
            </button>
            <button 
              className={`join-item btn btn-sm ${viewMode === "list" ? "btn-active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* 포트폴리오 아이템들 */}
      {filteredItems.length > 0 ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredItems.map(item => 
            viewMode === "grid" ? renderGridItem(item) : renderListItem(item)
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">작품이 없습니다</h3>
          <p className="text-gray-600 mb-6">
            {selectedCategory === "전체" 
              ? "아직 업로드된 작품이 없습니다."
              : `${selectedCategory} 카테고리에 작품이 없습니다.`
            }
          </p>
          {isOwner && (
            <button onClick={onAddNew} className="btn btn-primary">
              첫 번째 작품 업로드하기
            </button>
          )}
        </div>
      )}

      {/* 포트폴리오 상세 모달 */}
      {selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold">{selectedItem.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="badge badge-outline">{selectedItem.category}</span>
                  <span>📅 {new Date(selectedItem.completedAt).toLocaleDateString("ko-KR")}</span>
                  <span>⏱️ {selectedItem.projectDuration}</span>
                </div>
              </div>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 이미지 */}
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-6xl bg-gradient-to-br from-blue-100 to-purple-100">
                🎨
              </div>

              {/* 상세 정보 */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">프로젝트 설명</h4>
                  <p className="text-gray-700">{selectedItem.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">사용 도구</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tools.map(tool => (
                      <span key={tool} className="badge badge-secondary badge-sm">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">태그</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map(tag => (
                      <span key={tag} className="badge badge-outline badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>👁️ {selectedItem.views.toLocaleString()}</span>
                    <span>❤️ {selectedItem.likes}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm">🔗 공유</button>
                    <button className="btn btn-primary btn-sm">💬 문의하기</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedItem(null)}></div>
        </div>
      )}
    </div>
  );
}