"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientUser, DesignerUser } from "@/types";

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<"client" | "designer">("client");
  const [savedUserInfo, setSavedUserInfo] = useState<any>(null);

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const storedRole = localStorage.getItem("userRole") as
      | "client"
      | "designer";
    const storedUserInfo = localStorage.getItem("userInfo");

    if (storedRole) {
      setUserRole(storedRole);
    }

    if (storedUserInfo) {
      setSavedUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  // 클라이언트 기본 정보 (localStorage에 정보가 없을 때 사용)
  const defaultClientUser: ClientUser = {
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

  // 디자이너 기본 정보 (localStorage에 정보가 없을 때 사용)
  const defaultDesignerUser: DesignerUser = {
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

  // localStorage 정보가 있으면 사용, 없으면 기본값 사용
  let userInfo: ClientUser | DesignerUser;

  if (savedUserInfo) {
    if (userRole === "client") {
      userInfo = {
        id: "1",
        name: savedUserInfo.name || defaultClientUser.name,
        email: savedUserInfo.email || defaultClientUser.email,
        phone: savedUserInfo.phone || defaultClientUser.phone,
        role: "client",
        company: savedUserInfo.company || undefined,
        department: savedUserInfo.department || undefined,
        created_at: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString().split("T")[0],
      };
    } else {
      userInfo = {
        id: "2",
        name: savedUserInfo.name || defaultDesignerUser.name,
        email: savedUserInfo.email || defaultDesignerUser.email,
        phone: savedUserInfo.phone || defaultDesignerUser.phone,
        role: "designer",
        experience: savedUserInfo.experience || undefined,
        specialization: savedUserInfo.specialization || [],
        portfolio_url: savedUserInfo.portfolio_url || undefined,
        created_at: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString().split("T")[0],
      };
    }
  } else {
    userInfo = userRole === "client" ? defaultClientUser : defaultDesignerUser;
  }

  const avatar = userInfo.name.charAt(0) + userInfo.name.charAt(1);

  return (
    <DashboardLayout title="프로필" userRole={userRole}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 프로필 헤더 */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="avatar placeholder">
                <div
                  className={`${
                    userInfo.role === "designer" ? "bg-secondary" : "bg-primary"
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
                <div className="text-sm font-medium text-base-content/70">
                  이메일
                </div>
                <div className="text-base font-semibold">{userInfo.email}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-base-content/70">
                  연락처
                </div>
                <div className="text-base font-semibold">{userInfo.phone}</div>
              </div>

              {/* 클라이언트용 정보 */}
              {userInfo.role === "client" && (
                <>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-base-content/70">
                      회사
                    </div>
                    <div className="text-base font-semibold">
                      {userInfo.company || "미입력"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-base-content/70">
                      부서
                    </div>
                    <div className="text-base font-semibold">
                      {userInfo.department || "미입력"}
                    </div>
                  </div>
                </>
              )}

              {/* 디자이너용 정보 */}
              {userInfo.role === "designer" && (
                <>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-base-content/70">
                      경력
                    </div>
                    <div className="text-base font-semibold">
                      {userInfo.experience || "미입력"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-base-content/70">
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

                  <div className="space-y-2 md:col-span-2">
                    <div className="text-sm font-medium text-base-content/70">
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
  );
}
