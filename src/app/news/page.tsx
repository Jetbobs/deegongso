"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserAnnouncement, AnnouncementCategory } from "@/types";

// Mock 데이터 (나중에 실제 API로 교체)
const mockNews: UserAnnouncement[] = [
  {
    id: "1",
    title: "시스템 정기 점검 안내",
    content: "매주 일요일 오전 2시~6시까지 시스템 정기 점검이 진행됩니다. 점검 시간 동안 서비스 이용에 제한이 있을 수 있습니다.",
    content_html: "<p>매주 일요일 오전 2시~6시까지 시스템 정기 점검이 진행됩니다. 점검 시간 동안 서비스 이용에 제한이 있을 수 있습니다.</p>",
    category: "general",
    priority: "important",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    is_read: false,
    is_pinned: true,
  },
  {
    id: "2",
    title: "개인정보처리방침 개정 안내",
    content: "2024년 12월 20일부터 새로운 개인정보처리방침이 적용됩니다. 주요 변경사항을 확인해 주세요.",
    content_html: "<p>2024년 12월 20일부터 새로운 개인정보처리방침이 적용됩니다. 주요 변경사항을 확인해 주세요.</p>",
    category: "general",
    priority: "normal",
    created_at: "2024-12-10T14:30:00Z",
    updated_at: "2024-12-10T14:30:00Z",
    published_at: "2024-12-10T14:30:00Z",
    is_read: true,
    read_at: "2024-12-11T09:15:00Z",
    is_pinned: false,
  },
  {
    id: "3",
    title: "새로운 마크업 도구 업데이트",
    content: "더욱 향상된 마크업 도구가 업데이트되었습니다. 새로운 기능들을 확인해보세요.",
    content_html: "<p>더욱 향상된 마크업 도구가 업데이트되었습니다. 새로운 기능들을 확인해보세요.</p>",
    category: "update",
    priority: "normal",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    is_pinned: false,
  },
  {
    id: "4",
    title: "서버 인프라 업그레이드 완료",
    content: "더 빠르고 안정적인 서비스를 위한 서버 인프라 업그레이드가 완료되었습니다.",
    content_html: "<p>더 빠르고 안정적인 서비스를 위한 서버 인프라 업그레이드가 완료되었습니다.</p>",
    category: "update",
    priority: "normal",
    created_at: "2024-12-05T16:00:00Z",
    updated_at: "2024-12-05T16:00:00Z",
    published_at: "2024-12-05T16:00:00Z",
    is_read: true,
    is_pinned: false,
  },
  {
    id: "5",
    title: "연말 특별 이벤트 - 디자인 요청 20% 할인",
    content: "12월 한 달간 모든 디자인 요청에 20% 할인 혜택을 드립니다. 이 기회를 놓치지 마세요!",
    content_html: "<p>12월 한 달간 모든 디자인 요청에 20% 할인 혜택을 드립니다. 이 기회를 놓치지 마세요!</p>",
    category: "event",
    priority: "normal",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    is_pinned: false,
  },
  {
    id: "6",
    title: "신규 회원 특별 혜택 안내",
    content: "새로 가입하신 회원분들을 위한 특별 혜택을 준비했습니다. 첫 프로젝트 30% 할인!",
    content_html: "<p>새로 가입하신 회원분들을 위한 특별 혜택을 준비했습니다. 첫 프로젝트 30% 할인!</p>",
    category: "event",
    priority: "normal",
    created_at: "2024-11-28T12:00:00Z",
    updated_at: "2024-11-28T12:00:00Z",
    published_at: "2024-11-28T12:00:00Z",
    is_read: true,
    is_pinned: false,
  },
];

type NewsTab = "all" | "general" | "update" | "event";

const newsTabConfig = {
  all: { label: "전체", category: undefined },
  general: { label: "공지사항", category: "general" as AnnouncementCategory },
  update: { label: "업데이트", category: "update" as AnnouncementCategory },
  event: { label: "이벤트", category: "event" as AnnouncementCategory },
};

const categoryLabels: Record<AnnouncementCategory, { label: string; color: string }> = {
  general: { label: "공지사항", color: "badge-warning" },
  update: { label: "업데이트", color: "badge-info" },
  policy: { label: "정책/약관", color: "badge-error" },
  event: { label: "이벤트", color: "badge-success" },
};

export default function NewsPage() {
  const router = useRouter();
  const [news] = useState<UserAnnouncement[]>(mockNews);
  const [activeTab, setActiveTab] = useState<NewsTab>("all");

  // 활성 탭에 따른 뉴스 필터링
  const filteredNews = news.filter((item) => {
    if (activeTab === "all") return true;
    const tabConfig = newsTabConfig[activeTab];
    return tabConfig.category && item.category === tabConfig.category;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 새 글인지 판별 (일주일 이내 작성된 글)
  const isNewNews = (publishedAt: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(publishedAt) > oneWeekAgo;
  };

  const handleNewsClick = (newsItem: UserAnnouncement) => {
    router.push(`/news/${newsItem.id}`);
  };

  return (
    <DashboardLayout title="공지사항" userRole="client">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📰 공지사항</h1>
          <p className="text-gray-600">플랫폼의 최신 소식과 중요한 안내사항을 확인하세요.</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-base-100 rounded-lg shadow-sm border border-base-300">
          <div className="flex justify-start gap-2 p-2">
            {Object.entries(newsTabConfig).map(([key, config]) => (
              <button
                key={key}
                className={`btn btn-ghost border-none ${
                  activeTab === key ? "bg-primary text-primary-content rounded-lg" : "hover:bg-base-200"
                }`}
                onClick={() => setActiveTab(key as NewsTab)}
              >
                {config.label}
                {key !== "all" && (
                  <span className="ml-2 badge badge-sm bg-base-300 text-base-content">
                    {news.filter(item => key === "general" ? item.category === "general" : 
                                         key === "update" ? item.category === "update" :
                                         key === "event" ? item.category === "event" : false).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 뉴스 목록 */}
        <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  <th>제목</th>
                  {activeTab === "all" && <th className="w-32">카테고리</th>}
                  <th className="w-32">작성일</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "all" ? 3 : 2} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-2">📰</div>
                        <p className="text-gray-500">표시할 공지사항이 없습니다.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((newsItem) => (
                    <tr
                      key={newsItem.id}
                      className="hover:bg-base-200 cursor-pointer"
                      onClick={() => handleNewsClick(newsItem)}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {newsItem.title}
                          </span>
                          {isNewNews(newsItem.published_at) && (
                            <span className="badge badge-primary badge-sm">NEW</span>
                          )}
                        </div>
                      </td>
                      {activeTab === "all" && (
                        <td>
                          <span className={`badge badge-sm ${categoryLabels[newsItem.category].color}`}>
                            {categoryLabels[newsItem.category].label}
                          </span>
                        </td>
                      )}
                      <td className="text-sm text-gray-500">
                        {formatDate(newsItem.published_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
