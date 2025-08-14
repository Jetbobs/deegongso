"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface SearchResult {
  id: string;
  type: "project" | "message" | "user" | "file";
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon: string;
}

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: "project-1",
    type: "project",
    title: "로고 디자인 프로젝트",
    subtitle: "김디자이너",
    description: "브랜드 아이덴티티를 위한 로고 디자인",
    url: "/projects/1",
    icon: "🎨",
  },
  {
    id: "project-2",
    type: "project",
    title: "웹사이트 UI/UX 디자인",
    subtitle: "이디자이너",
    description: "반응형 웹사이트 UI/UX 디자인 프로젝트",
    url: "/projects/2",
    icon: "💻",
  },
  {
    id: "message-1",
    type: "message",
    title: "로고 디자인 초안을 업로드했습니다",
    subtitle: "김디자이너",
    description: "1시간 전 • 로고 프로젝트",
    url: "/messages?conversation=1",
    icon: "💬",
  },
  {
    id: "file-1",
    type: "file",
    title: "logo_design_v1.pdf",
    subtitle: "2.3MB",
    description: "로고 디자인 프로젝트에서",
    url: "/projects/1?tab=files",
    icon: "📄",
  },
  {
    id: "user-1",
    type: "user",
    title: "김디자이너",
    subtitle: "디자이너",
    description: "로고 디자인 전문가",
    url: "/designers/1",
    icon: "👤",
  },
];

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  showShortcut?: boolean;
}

export default function GlobalSearch({
  placeholder = "프로젝트, 메시지, 파일 검색...",
  className = "",
  showShortcut = true,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 검색 실행
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // 검색 시뮬레이션
    setTimeout(() => {
      const filtered = MOCK_SEARCH_RESULTS.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(filtered);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 300);
  };

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    const debounce = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K 또는 Cmd+K로 검색 열기
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }

      // ESC로 검색 닫기
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setResults([]);
      }

      // 검색이 열려있을 때 방향키 처리
      if (isOpen && results.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === 0 ? results.length - 1 : prev - 1
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleResultSelect(results[selectedIndex]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultSelect = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "project":
        return "🎨";
      case "message":
        return "💬";
      case "file":
        return "📄";
      case "user":
        return "👤";
      default:
        return "📋";
    }
  };

  const getResultTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "project":
        return "프로젝트";
      case "message":
        return "메시지";
      case "file":
        return "파일";
      case "user":
        return "사용자";
      default:
        return "";
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* 검색 입력 */}
      <div className="relative">
        <div
          className="input input-bordered w-full pr-16 cursor-text flex items-center"
          onClick={() => setIsOpen(true)}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {showShortcut && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.42zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z" />
            </svg>
          </div>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="loading loading-spinner loading-sm mr-2"></div>
              검색 중...
            </div>
          ) : results.length === 0 ? (
            query.trim() ? (
              <div className="p-4 text-center text-base-content/60">
                <div className="text-4xl mb-2">🔍</div>
                <p>'{query}'에 대한 검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="p-4 text-center text-base-content/60">
                <div className="text-4xl mb-2">⌨️</div>
                <p>검색어를 입력해주세요</p>
                <div className="text-xs mt-2">
                  <kbd className="kbd kbd-xs">⌘</kbd> +{" "}
                  <kbd className="kbd kbd-xs">K</kbd> 또는 클릭하여 검색
                </div>
              </div>
            )
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  className={`w-full text-left px-4 py-3 hover:bg-base-200 transition-colors flex items-center space-x-3 ${
                    index === selectedIndex ? "bg-base-200" : ""
                  }`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="text-2xl">{result.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium truncate">
                        {result.title}
                      </span>
                      <span className="badge badge-ghost badge-xs">
                        {getResultTypeLabel(result.type)}
                      </span>
                    </div>
                    {result.subtitle && (
                      <p className="text-sm text-base-content/60 truncate">
                        {result.subtitle}
                      </p>
                    )}
                    {result.description && (
                      <p className="text-xs text-base-content/50 truncate">
                        {result.description}
                      </p>
                    )}
                  </div>
                  <div className="text-base-content/40">→</div>
                </button>
              ))}

              {/* 검색 팁 */}
              <div className="border-t border-base-300 p-3 text-xs text-base-content/60">
                <div className="flex justify-between items-center">
                  <span>총 {results.length}개 결과</span>
                  <div className="flex space-x-2">
                    <span>
                      <kbd className="kbd kbd-xs">↑</kbd>
                      <kbd className="kbd kbd-xs">↓</kbd> 이동
                    </span>
                    <span>
                      <kbd className="kbd kbd-xs">Enter</kbd> 선택
                    </span>
                    <span>
                      <kbd className="kbd kbd-xs">Esc</kbd> 닫기
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
