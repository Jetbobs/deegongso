"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientUser, DesignerUser, UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import AuthWrapper from "@/components/auth/AuthWrapper";
import UserMarkupStatsComponent from "@/components/markup/UserMarkupStats";

// 기본 사용자 정보들 (컴포넌트 외부로 이동)
const DEFAULT_CLIENT_USER: ClientUser = {
  id: "1",
  name: "홍길동",
  email: "hong@company.com",
  phone: "010-1234-5678",
  role: "client",
  company: "ABC 회사",
  department: "마케팅팀",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

const DEFAULT_DESIGNER_USER: DesignerUser = {
  id: "2",
  name: "김디자인",
  email: "designer@example.com",
  phone: "010-9876-5432",
  role: "designer",
  experience: "3-5년",
  specialization: ["브랜딩", "웹 디자인", "UI/UX"],
  portfolio_url: "https://portfolio.example.com",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [savedUserInfo, setSavedUserInfo] = useState<Record<
    string,
    unknown
  > | null>(null);

  const userRole: UserRole = user?.role ?? user?.userType ?? "client";

  useEffect(() => {
    // 회원가입 단계에서 저장한 사용자 추가 정보 로드
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) setSavedUserInfo(JSON.parse(storedUserInfo));
  }, []);

  // 표시용 유저 정보 구성: useAuth 사용자 + 저장된 추가정보를 병합
  const userInfo: ClientUser | DesignerUser = useMemo(() => {
    if (userRole === "client") {
      return {
        id: user?.id || DEFAULT_CLIENT_USER.id,
        name: user?.name || DEFAULT_CLIENT_USER.name,
        email: user?.email || DEFAULT_CLIENT_USER.email,
        phone: user?.phone || DEFAULT_CLIENT_USER.phone,
        role: "client",
        company:
          savedUserInfo?.company ??
          user?.company ??
          DEFAULT_CLIENT_USER.company,
        department: savedUserInfo?.department ?? DEFAULT_CLIENT_USER.department,
        title: savedUserInfo?.title, // 직책(선택)
        created_at: DEFAULT_CLIENT_USER.created_at,
        updated_at: DEFAULT_CLIENT_USER.updated_at,
      } as ClientUser;
    }
    return {
      id: user?.id || DEFAULT_DESIGNER_USER.id,
      name: user?.name || DEFAULT_DESIGNER_USER.name,
      email: user?.email || DEFAULT_DESIGNER_USER.email,
      phone: user?.phone || DEFAULT_DESIGNER_USER.phone,
      role: "designer",
      experience:
        savedUserInfo?.experience ??
        user?.experience ??
        DEFAULT_DESIGNER_USER.experience,
      specialization:
        savedUserInfo?.specialization ?? DEFAULT_DESIGNER_USER.specialization,
      strengths: savedUserInfo?.strengths ?? [],
      portfolio_url:
        savedUserInfo?.portfolio_url ?? DEFAULT_DESIGNER_USER.portfolio_url,
      created_at: DEFAULT_DESIGNER_USER.created_at,
      updated_at: DEFAULT_DESIGNER_USER.updated_at,
    } as DesignerUser;
  }, [user, userRole, savedUserInfo]);

  const avatar = userInfo.name.charAt(0) + userInfo.name.charAt(1);

  return (
    <AuthWrapper requireAuth>
      <DashboardLayout title="프로필" userRole={userRole}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 프로필 헤더 */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="avatar placeholder">
                  <div
                    className={`${
                      userInfo.role === "designer"
                        ? "bg-secondary"
                        : "bg-primary"
                    } text-primary-content rounded-full w-24`}
                  >
                    <span className="text-2xl font-bold">{avatar}</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{userInfo.name}</h1>
                  <p className="text-lg text-base-content/70 mb-1">
                    {userInfo.role === "client" ? "클라이언트" : "디자이너"}
                    {userInfo.role === "client" &&
                      userInfo.company &&
                      ` · ${userInfo.company}`}
                    {userInfo.role === "designer" &&
                      userInfo.experience &&
                      ` · ${userInfo.experience}`}
                  </p>
                  <p className="text-base-content/60">{userInfo.email}</p>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-primary">프로필 수정</button>
                  <button className="btn btn-outline">비밀번호 변경</button>
                </div>
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">기본 정보</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-base-content/70">
                    이름
                  </div>
                  <div className="text-base font-semibold">{userInfo.name}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-mac-secondary">
                    이메일
                  </div>
                  <div className="text-base font-semibold">
                    {userInfo.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-mac-secondary">
                    연락처
                  </div>
                  <div className="text-base font-semibold">
                    {userInfo.phone}
                  </div>
                </div>

                {/* 클라이언트용 정보 */}
                {userInfo.role === "client" && (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-mac-secondary">
                        회사
                      </div>
                      <div className="text-base font-semibold">
                        {userInfo.company || "미입력"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-mac-secondary">
                        부서
                      </div>
                      <div className="text-base font-semibold">
                        {userInfo.department || "미입력"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-mac-secondary">
                        직책
                      </div>
                      <div className="text-base font-semibold">
                        {(userInfo as ClientUser).title || "미입력"}
                      </div>
                    </div>
                  </>
                )}

                {/* 디자이너용 정보 */}
                {userInfo.role === "designer" && (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-mac-secondary">
                        경력
                      </div>
                      <div className="text-base font-semibold">
                        {userInfo.experience || "미입력"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-mac-secondary">
                        전문분야
                      </div>
                      <div className="text-base font-semibold">
                        {userInfo.specialization &&
                        userInfo.specialization.length > 0
                          ? userInfo.specialization.map((spec) => (
                              <span
                                key={spec}
                                className="badge badge-outline mr-1"
                              >
                                {spec}
                              </span>
                            ))
                          : "미입력"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-mac-secondary">
                        강점
                      </div>
                      <div className="text-base font-semibold">
                        {(userInfo as DesignerUser).strengths &&
                        (userInfo as DesignerUser).strengths!.length > 0
                          ? (userInfo as DesignerUser).strengths!.map((s) => (
                              <span key={s} className="badge badge-ghost mr-1">
                                {s}
                              </span>
                            ))
                          : "미입력"}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="text-sm font-medium text-mac-secondary">
                        포트폴리오
                      </div>
                      <div className="text-base font-semibold">
                        {userInfo.portfolio_url ? (
                          <a
                            href={userInfo.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                          >
                            {userInfo.portfolio_url}
                          </a>
                        ) : (
                          "미입력"
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <div className="text-sm font-medium text-base-content/70">
                    가입일
                  </div>
                  <div className="text-base font-semibold">
                    {userInfo.created_at}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 계정 통계 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">계정 통계</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat">
                  <div className="stat-title">총 프로젝트</div>
                  <div className="stat-value text-primary">12</div>
                  <div className="stat-desc">완료된 프로젝트 포함</div>
                </div>

                <div className="stat">
                  <div className="stat-title">진행 중인 프로젝트</div>
                  <div className="stat-value text-secondary">3</div>
                  <div className="stat-desc">현재 활성 상태</div>
                </div>

                <div className="stat">
                  <div className="stat-title">평균 평점</div>
                  <div className="stat-value text-accent">4.8</div>
                  <div className="stat-desc">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
          </div>

          {/* 마크업 통계 */}
          <UserMarkupStatsComponent 
            userId={user?.id || displayUser.id} 
            showDetailedStats={true}
            showRecentActivity={true}
            className="mb-6"
          />

          {/* 최근 활동 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">최근 활동</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">
                      로고 디자인 프로젝트 - 피드백 제출
                    </p>
                    <p className="text-sm text-base-content/60">2시간 전</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                  <div className="w-2 h-2 bg-info rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">
                      웹사이트 리디자인 프로젝트 - 새 메시지
                    </p>
                    <p className="text-sm text-base-content/60">1일 전</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">
                      브랜딩 가이드 프로젝트 - 계약 체결
                    </p>
                    <p className="text-sm text-base-content/60">3일 전</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthWrapper>
  );
}
