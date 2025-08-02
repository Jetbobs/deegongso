"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProfilePage() {
  // 임시 사용자 정보 (실제로는 인증된 사용자 정보에서 가져올 것)
  const userRole = "client" as "client" | "designer";

  const userInfo = {
    name: "홍길동",
    email: "hong@company.com",
    phone: "010-1234-5678",
    company: "ABC 회사",
    department: "마케팅팀",
    role: userRole === "client" ? "클라이언트" : "디자이너",
    joinDate: "2024-01-01",
    avatar: "JD",
  };

  return (
    <DashboardLayout title="프로필" userRole={userRole}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 프로필 헤더 */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-24">
                  <span className="text-2xl font-bold">{userInfo.avatar}</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{userInfo.name}</h1>
                <p className="text-lg text-base-content/70 mb-1">
                  {userInfo.role}
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

              <div className="space-y-2">
                <div className="text-sm font-medium text-base-content/70">
                  회사
                </div>
                <div className="text-base font-semibold">
                  {userInfo.company}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-base-content/70">
                  부서
                </div>
                <div className="text-base font-semibold">
                  {userInfo.department}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-base-content/70">
                  가입일
                </div>
                <div className="text-base font-semibold">
                  {userInfo.joinDate}
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
