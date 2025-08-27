"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { UserAnnouncement, AnnouncementCategory } from "@/types";

// Mock 데이터 (실제로는 API에서 가져와야 함)
const mockNewsData: Record<string, UserAnnouncement & { fullContent: string }> = {
  "1": {
    id: "1",
    title: "시스템 정기 점검 안내",
    content: "매주 일요일 오전 2시~6시까지 시스템 정기 점검이 진행됩니다.",
    content_html: "<p>매주 일요일 오전 2시~6시까지 시스템 정기 점검이 진행됩니다.</p>",
    fullContent: `
안녕하세요. 디고 플랫폼을 이용해 주시는 모든 분들께 감사드립니다.

서비스 안정성 향상을 위해 아래와 같이 정기 점검을 실시하고 있습니다.

**점검 일시**
- 매주 일요일 오전 2시 ~ 오전 6시 (약 4시간)

**점검 내용**
- 서버 상태 점검
- 데이터베이스 최적화
- 보안 업데이트 적용

**영향을 받는 서비스**
- 프로젝트 업로드/다운로드
- 실시간 채팅 및 알림
- 결제 시스템

점검 중에는 일시적으로 서비스 이용이 제한될 수 있습니다.
사용자 여러분께 불편을 드려 죄송하며, 더 나은 서비스 제공을 위한 점검임을 양해 부탁드립니다.

감사합니다.
    `,
    category: "general",
    priority: "important",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    is_read: false,
    is_pinned: true,
  },
  "2": {
    id: "2",
    title: "개인정보처리방침 개정 안내",
    content: "2024년 12월 20일부터 새로운 개인정보처리방침이 적용됩니다.",
    content_html: "<p>2024년 12월 20일부터 새로운 개인정보처리방침이 적용됩니다.</p>",
    fullContent: `
안녕하세요!

개인정보보호법 개정에 따라 개인정보처리방침을 개정하게 되었습니다.

**주요 변경사항**

1. **개인정보 수집 및 이용 목적 명확화**
   - 서비스 제공을 위한 필수 정보와 선택 정보 구분
   - 마케팅 활용 목적 별도 동의 절차 추가

2. **개인정보 보관 기간 조정**
   - 회원 탈퇴 후 즉시 삭제 원칙
   - 법정 보관 의무 기간 명시

3. **개인정보 처리 위탁 업체 현행화**
   - 새로운 협력사 추가
   - 위탁 업무 내용 및 보관 기간 명시

**시행일**
2024년 12월 20일부터 적용됩니다.

개정된 개인정보처리방침은 사이트 하단 링크에서 확인하실 수 있습니다.

문의사항이 있으시면 고객지원팀으로 연락 주세요.

감사합니다.
    `,
    category: "general",
    priority: "normal",
    created_at: "2024-12-10T14:30:00Z",
    updated_at: "2024-12-10T14:30:00Z",
    published_at: "2024-12-10T14:30:00Z",
    is_read: true,
    read_at: "2024-12-11T09:15:00Z",
    is_pinned: false,
  },
  "3": {
    id: "3",
    title: "새로운 마크업 도구 업데이트",
    content: "더욱 향상된 마크업 도구가 업데이트되었습니다.",
    content_html: "<p>더욱 향상된 마크업 도구가 업데이트되었습니다.</p>",
    fullContent: `
안녕하세요!

사용자 여러분의 소중한 피드백을 바탕으로 마크업 도구가 대폭 업데이트되었습니다.

**주요 개선사항**

1. **향상된 정밀도**
   - 더욱 정확한 좌표 시스템
   - 픽셀 단위 정밀 마크업 가능

2. **새로운 도구 추가**
   - 자유형 그리기 도구
   - 텍스트 하이라이트 기능
   - 화살표 및 도형 그리기

3. **협업 기능 강화**
   - 실시간 공동 편집
   - 댓글 스레드 기능
   - 버전 히스토리 관리

4. **모바일 최적화**
   - 태블릿 터치 입력 지원
   - 반응형 인터페이스

**사용 방법**
프로젝트 상세 페이지의 "마크업 도구" 탭에서 새로운 기능을 확인하실 수 있습니다.

문의사항이 있으시면 언제든 고객지원팀으로 연락 주세요.

감사합니다.
    `,
    category: "update",
    priority: "normal",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    is_pinned: false,
  },
  "5": {
    id: "5",
    title: "연말 특별 이벤트 - 디자인 요청 20% 할인",
    content: "12월 한 달간 모든 디자인 요청에 20% 할인 혜택을 드립니다.",
    content_html: "<p>12월 한 달간 모든 디자인 요청에 20% 할인 혜택을 드립니다.</p>",
    fullContent: `
🎉 연말 특별 이벤트 안내 🎉

한 해 동안 디고 플랫폼을 이용해 주신 모든 분들께 감사드리며, 특별한 혜택을 준비했습니다!

**이벤트 내용**
- 모든 디자인 요청 20% 할인
- 추가 수정 요청 무료 제공 (2회까지)
- 빠른 작업 완료 시 추가 5% 할인

**이벤트 기간**
2024년 12월 1일 ~ 12월 31일

**참여 방법**
1. 새 프로젝트 생성 시 할인 코드 'YEAR2024' 입력
2. 기존 진행 중인 프로젝트는 추가 수정 요청 시 자동 적용

**주의사항**
- 다른 할인 혜택과 중복 적용 불가
- 12월 31일 23:59까지 프로젝트 생성분에 한함
- 일부 프리미엄 서비스는 할인 대상에서 제외

이번 기회를 놓치지 마시고, 더욱 저렴하게 고품질 디자인 서비스를 이용해보세요!

문의: support@deego.kr

감사합니다.
    `,
    category: "event",
    priority: "normal",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    is_pinned: false,
  },
};

const categoryLabels: Record<AnnouncementCategory, { label: string; color: string }> = {
  general: { label: "공지사항", color: "badge-warning" },
  update: { label: "업데이트", color: "badge-info" },
  policy: { label: "정책/약관", color: "badge-error" },
  event: { label: "이벤트", color: "badge-success" },
};

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<(UserAnnouncement & { fullContent: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    
    // Mock 데이터에서 해당 뉴스 찾기
    const foundNews = mockNewsData[id];
    
    if (foundNews) {
      setNewsItem(foundNews);
      
      // 읽음 처리 (실제로는 API 호출)
      if (!foundNews.is_read) {
        foundNews.is_read = true;
      }
    }
    
    setLoading(false);
  }, [params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!newsItem) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-xl font-semibold mb-2">공지사항을 찾을 수 없습니다</h2>
          <p className="text-base-content/60 mb-4">
            요청하신 공지사항이 삭제되었거나 존재하지 않습니다.
          </p>
          <Link href="/news" className="btn btn-primary">
            공지사항 목록으로 돌아가기
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 네비게이션 */}
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <Link href="/news" className="hover:underline">
            공지사항
          </Link>
          <span>/</span>
          <span className="truncate">{newsItem.title}</span>
        </div>

        {/* 헤더 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`badge ${categoryLabels[newsItem.category].color}`}>
                    {categoryLabels[newsItem.category].label}
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold mb-3">{newsItem.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-base-content/60">
                  <span>작성일: {formatDate(newsItem.published_at)}</span>
                  {newsItem.updated_at !== newsItem.created_at && (
                    <span>수정일: {formatDate(newsItem.updated_at)}</span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => router.back()}
                className="btn btn-outline btn-sm"
              >
                ← 돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* 내용 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="prose max-w-none">
              {newsItem.fullContent.split('\n').map((line, index) => {
                if (line.trim() === '') {
                  return <br key={index} />;
                }
                
                // 볼드 텍스트 처리
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
                      {line.slice(2, -2)}
                    </h3>
                  );
                }
                
                // 리스트 아이템 처리
                if (line.trim().startsWith('- ')) {
                  return (
                    <li key={index} className="ml-4">
                      {line.trim().slice(2)}
                    </li>
                  );
                }
                
                // 번호 리스트 처리
                if (line.match(/^\d+\. /)) {
                  return (
                    <div key={index} className="ml-4 mb-2">
                      <strong>{line.match(/^\d+\./)?.[0]}</strong>
                      {line.replace(/^\d+\. /, ' ')}
                    </div>
                  );
                }
                
                return (
                  <p key={index} className="mb-2">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex justify-center">
          <Link href="/news" className="btn btn-outline">
            📰 공지사항 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
