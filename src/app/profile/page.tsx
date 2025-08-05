"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // 로딩 중이거나 사용자가 없으면 로딩 화면 표시
  if (loading || !user) {
    return (
      <DashboardLayout title="프로필" userRole="client">
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-base-content/60">프로필 로딩 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const userRole = (profile?.role as "client" | "designer") || "client";

  const userInfo = {
    name: profile?.full_name || user.email?.split("@")[0] || "사용자",
    email: user.email || "",
    phone: profile?.phone || "등록되지 않음",
    company: profile?.company_name || "등록되지 않음",
    department: profile?.location || "등록되지 않음",
    role: userRole === "client" ? "클라이언트" : "디자이너",
    joinDate: profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString()
      : "알 수 없음",
    avatar:
      profile?.full_name?.charAt(0) ||
      user.email?.charAt(0)?.toUpperCase() ||
      "U",
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
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    console.log("🔄 설정 페이지로 이동");
                    alert("프로필 편집 페이지로 이동합니다!");
                    router.push("/settings");
                  }}
                >
                  ✏️ 프로필 수정
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    console.log("🔐 설정 페이지의 계정 섹션으로 이동");
                    alert("계정 설정 페이지로 이동합니다!");
                    router.push("/settings?section=account");
                  }}
                >
                  🔐 비밀번호 변경
                </button>
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

        {/* 프로필 상태 및 안내 */}
        {!profile && (
          <div className="card bg-warning/10 border border-warning/20 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="text-warning text-2xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-warning">
                    프로필 설정이 필요합니다
                  </h3>
                  <p className="text-sm text-base-content/70">
                    프로필을 완성하여 더 나은 서비스를 이용하세요.
                  </p>
                </div>
              </div>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => router.push("/settings")}
                >
                  지금 설정하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 계정 통계 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-xl mb-6">계정 통계</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat">
                <div className="stat-title">총 프로젝트</div>
                <div className="stat-value text-primary">
                  {profile?.total_projects || 0}
                </div>
                <div className="stat-desc">완료된 프로젝트 포함</div>
              </div>

              <div className="stat">
                <div className="stat-title">계정 등급</div>
                <div className="stat-value text-secondary">
                  {profile?.is_verified ? "인증됨" : "미인증"}
                </div>
                <div className="stat-desc">
                  {profile?.is_verified ? "✅ 인증된 계정" : "📝 인증 필요"}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">평균 평점</div>
                <div className="stat-value text-accent">
                  {profile?.rating || 0}
                </div>
                <div className="stat-desc">
                  {"⭐".repeat(Math.round(profile?.rating || 0))}
                  {profile?.rating ? ` (${profile.rating}/5)` : " (평가 없음)"}
                </div>
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
