"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClientComponentClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Project, UserProfile } from "@/types/database.types";
import { UserRole } from "@/types";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingFeedback: number;
  upcomingDeadlines: number;
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingFeedback: 0,
    upcomingDeadlines: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [forceShowDashboard, setForceShowDashboard] = useState(false);

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log("🔍 Dashboard 상태:", {
      loading,
      user: !!user,
      profile: !!profile,
      forceShowDashboard,
      statsLoading,
    });
    if (user) console.log("👤 사용자:", user.email);
    if (profile) console.log("📝 프로필:", profile.full_name, profile.role);
  }, [loading, user, profile, forceShowDashboard, statsLoading]);

  // 프로젝트 로딩 상태 추적
  useEffect(() => {
    console.log("📊 프로젝트 로딩 상태 변경:", statsLoading);
  }, [statsLoading]);

  // 프로필 상태 변경 추적
  useEffect(() => {
    console.log("👤 대시보드에서 프로필 상태 변경 감지:", {
      profile,
      hasProfile: !!profile,
      profileType: typeof profile,
      profileFull_name: profile?.full_name,
      profileRole: profile?.role,
      isProfileNull: profile === null,
      isProfileUndefined: profile === undefined,
    });
  }, [profile]);

  // 20초 후 강제로 대시보드 표시 (무한 로딩 방지)
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("⏰ 20초 경과, 강제로 대시보드 표시");
      setForceShowDashboard(true);
    }, 20000);

    return () => clearTimeout(timeout);
  }, []);

  // 30초 후 프로젝트 로딩도 강제 해제 (최후의 안전장치)
  useEffect(() => {
    const statsTimeout = setTimeout(() => {
      console.log("⏰ 30초 경과, 프로젝트 로딩도 강제 해제");
      setStatsLoading(false);
    }, 30000);

    return () => clearTimeout(statsTimeout);
  }, []);

  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log("📊 프로젝트 데이터 로드 조건 확인:", {
      user: !!user,
      profile: !!profile,
      userRole: profile?.role,
      userId: user?.id,
    });

    if (!user) {
      console.log("❌ 사용자 없음 - 프로젝트 로드 중단");
      return;
    }

    const fetchDashboardData = async () => {
      console.log("🔄 프로젝트 데이터 가져오기 시작...");
      setStatsLoading(true);

      try {
        // 사용자 역할에 따라 다른 쿼리 실행
        let projectsQuery = supabase.from("projects").select("*");

        if (profile?.role === "client") {
          console.log("👤 클라이언트용 프로젝트 조회");
          projectsQuery = projectsQuery.eq("client_id", user.id);
        } else if (profile?.role === "designer") {
          console.log("🎨 디자이너용 프로젝트 조회");
          projectsQuery = projectsQuery.eq("designer_id", user.id);
        } else {
          console.log("⚠️ 프로필 없음 - 모든 사용자 프로젝트 조회");
          // 프로필이 없어도 사용자 ID로 프로젝트 찾기 시도
          projectsQuery = projectsQuery.or(
            `client_id.eq.${user.id},designer_id.eq.${user.id}`
          );
        }

        console.log("📡 프로젝트 쿼리 실행 중...");
        const { data: projects, error } = await projectsQuery.order(
          "created_at",
          { ascending: false }
        );

        console.log("📊 프로젝트 조회 결과:", {
          projectCount: projects?.length || 0,
          error: error?.message,
          projects: projects?.slice(0, 3), // 첫 3개만 로그
        });

        if (error) {
          console.error("❌ 프로젝트 데이터 가져오기 오류:", error);
          console.error("🔍 오류 세부사항:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          return;
        }

        // 통계 계산
        const activeProjects =
          projects?.filter((p) => p.status === "in_progress").length || 0;
        const completedProjects =
          projects?.filter((p) => p.status === "completed").length || 0;

        setStats({
          totalProjects: projects?.length || 0,
          activeProjects,
          completedProjects,
          pendingFeedback:
            projects?.filter((p) => p.status === "review").length || 0,
          upcomingDeadlines:
            projects?.filter((p) => {
              if (!p.deadline) return false;
              const deadline = new Date(p.deadline);
              const now = new Date();
              const threeDaysFromNow = new Date(
                now.getTime() + 3 * 24 * 60 * 60 * 1000
              );
              return deadline <= threeDaysFromNow && deadline >= now;
            }).length || 0,
        });

        // 최근 프로젝트 5개
        setRecentProjects(projects?.slice(0, 5) || []);
      } catch (error: any) {
        console.error("💥 대시보드 데이터 로딩 오류:", error);
        console.error("🔍 예상치 못한 오류 세부사항:", {
          message: error?.message || "알 수 없는 오류",
          code: error?.code,
          stack: error?.stack,
        });
      } finally {
        console.log("✅ 프로젝트 데이터 로딩 완료");
        setStatsLoading(false);
      }
    };

    // 10초 후 강제로 로딩 해제 (프로젝트 로딩 무한 방지)
    const projectTimeout = setTimeout(() => {
      console.log("⏰ 10초 경과, 프로젝트 로딩 강제 해제");
      setStatsLoading(false);
    }, 10000);

    fetchDashboardData().finally(() => {
      clearTimeout(projectTimeout);
    });

    // 클린업
    return () => {
      clearTimeout(projectTimeout);
    };
  }, [user, profile, supabase]);

  // 로딩 중 (강제 표시나 user가 있으면 표시)
  if ((loading || !user) && !forceShowDashboard) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">대시보드 로딩 중...</p>
          {/* 디버깅 정보 */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-left max-w-md">
            <p>
              <strong>디버깅 정보:</strong>
            </p>
            <p>• Loading: {loading ? "✅" : "❌"}</p>
            <p>• User: {user ? "✅" : "❌"}</p>
            <p>• Profile: {profile ? "✅" : "❌"}</p>
            <p>• Force Show: {forceShowDashboard ? "✅" : "❌"}</p>
            {user && <p>• Email: {user.email}</p>}
            {profile && <p>• Name: {profile.full_name}</p>}

            {/* 강제 표시 버튼 */}
            {!forceShowDashboard && (
              <button
                className="btn btn-sm btn-accent mt-2"
                onClick={() => {
                  console.log("🚀 수동으로 대시보드 강제 표시");
                  setForceShowDashboard(true);
                }}
              >
                🚀 강제로 대시보드 표시
              </button>
            )}

            {user && !profile && (
              <div className="mt-2 p-2 bg-yellow-100 rounded border">
                <p className="text-yellow-800 font-medium">
                  ⚠️ 프로필이 없습니다!
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={async () => {
                      try {
                        console.log("🔍 테이블 존재 확인 중...");
                        const { data, error } = await supabase
                          .from("user_profiles")
                          .select("count", { count: "exact" })
                          .limit(1);

                        console.log("📊 테이블 확인 결과:", { data, error });

                        if (error) {
                          alert("❌ 테이블 확인 실패: " + error.message);
                        } else {
                          alert("✅ user_profiles 테이블이 존재합니다!");
                        }
                      } catch (err: any) {
                        console.error("테이블 확인 중 오류:", err);
                        alert(
                          "테이블 확인 중 오류: " +
                            (err?.message || "알 수 없는 오류")
                        );
                      }
                    }}
                  >
                    DB 테이블 확인
                  </button>

                  <button
                    className="btn btn-sm btn-warning"
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from("user_profiles")
                          .insert({
                            id: user.id,
                            email: user.email!,
                            full_name: user.email!.split("@")[0], // 임시 이름
                            role: "client", // 기본 역할
                          });

                        if (error) {
                          console.error("프로필 생성 오류:", error);
                          alert("프로필 생성 실패: " + error.message);
                        } else {
                          alert(
                            "프로필이 생성되었습니다. 페이지를 새로고침하세요."
                          );
                          window.location.reload();
                        }
                      } catch (err: any) {
                        console.error("프로필 생성 중 오류:", err);
                        alert(
                          "프로필 생성 중 오류: " +
                            (err?.message || "알 수 없는 오류")
                        );
                      }
                    }}
                  >
                    프로필 생성하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 프로젝트 상태 라벨
  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { class: "badge-ghost", text: "초안" },
      published: { class: "badge-info", text: "모집중" },
      in_progress: { class: "badge-primary", text: "진행중" },
      review: { class: "badge-warning", text: "검토중" },
      completed: { class: "badge-success", text: "완료" },
      cancelled: { class: "badge-error", text: "취소" },
    };
    const config = statusMap[status as keyof typeof statusMap] || {
      class: "badge-ghost",
      text: status,
    };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <DashboardLayout
      title="대시보드"
      userRole={(profile?.role as UserRole) || "client"}
    >
      {/* 사용자 환영 메시지 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          안녕하세요, {profile?.full_name || user?.email || "사용자"}님! 👋
        </h1>
        <p className="text-base-content/60">
          {!user
            ? "사용자 정보를 불러오는 중입니다..."
            : !profile
            ? "프로필을 설정하여 서비스를 시작해보세요."
            : profile.role === "client"
            ? "오늘도 멋진 프로젝트를 만들어보세요."
            : "창의적인 작업으로 클라이언트를 만족시켜보세요!"}
        </p>

        {/* 프로필 상태 디버깅 정보 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <p className="font-medium text-blue-800 mb-2">🔍 현재 프로필 상태:</p>
          <div className="space-y-1 text-blue-700">
            <p>• Profile 객체: {profile ? "✅ 존재함" : "❌ null/undefined"}</p>
            {profile && (
              <>
                <p>• 이름: {profile.full_name || "없음"}</p>
                <p>• 역할: {profile.role || "없음"}</p>
                <p>• ID: {profile.id?.slice(0, 8) || "없음"}...</p>
                <p>
                  • 생성일:{" "}
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "없음"}
                </p>
              </>
            )}
            <p>
              • 프로필 판정:{" "}
              {!profile ? "❌ 프로필 없음으로 판정" : "✅ 프로필 있음으로 판정"}
            </p>
          </div>

          {/* 프로필 관리 버튼들 */}
          <div className="mt-3 space-y-2">
            <button
              className="btn btn-sm btn-primary w-full"
              onClick={async () => {
                try {
                  console.log("🔄 수동으로 프로필 다시 로드 시작...");
                  const { data, error } = await supabase
                    .from("user_profiles")
                    .select("*")
                    .eq("id", user?.id)
                    .maybeSingle();

                  console.log("📊 수동 프로필 로드 결과:", { data, error });

                  if (error) {
                    alert(`❌ 프로필 로드 오류: ${error.message}`);
                  } else if (data) {
                    alert(
                      `✅ 프로필 발견!\n이름: ${data.full_name}\n역할: ${data.role}`
                    );
                    // 페이지 새로고침으로 useAuth 갱신
                    window.location.reload();
                  } else {
                    alert("⚠️ 프로필이 데이터베이스에 없습니다.");
                  }
                } catch (err: any) {
                  console.error("💥 수동 프로필 로드 오류:", err);
                  alert(`💥 오류: ${err?.message || "알 수 없는 오류"}`);
                }
              }}
            >
              🔄 프로필 다시 로드
            </button>

            <button
              className="btn btn-sm btn-info w-full"
              onClick={async () => {
                try {
                  console.log("🔍 데이터베이스 프로필 조회 시작...");
                  const { data, error, count } = await supabase
                    .from("user_profiles")
                    .select("*", { count: "exact" })
                    .eq("id", user?.id);

                  console.log("📊 데이터베이스 프로필 조회 결과:", {
                    data,
                    error,
                    count,
                  });

                  if (error) {
                    alert(`❌ 조회 오류: ${error.message}`);
                  } else {
                    const profileData = data?.[0];
                    alert(
                      `📊 데이터베이스 상태:\n` +
                        `• 프로필 개수: ${count}개\n` +
                        `• 프로필 존재: ${profileData ? "✅" : "❌"}\n` +
                        `${
                          profileData
                            ? `• 이름: ${profileData.full_name}\n• 역할: ${profileData.role}`
                            : ""
                        }`
                    );
                  }
                } catch (err: any) {
                  console.error("💥 데이터베이스 조회 오류:", err);
                  alert(`💥 오류: ${err?.message || "알 수 없는 오류"}`);
                }
              }}
            >
              🔍 DB에서 프로필 확인
            </button>
          </div>
        </div>
        {!user && forceShowDashboard && (
          <div className="alert alert-error mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.</span>
          </div>
        )}
        {user && !profile && (
          <div className="alert alert-warning mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.662-.833-2.464 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>
              프로필이 생성되지 않았습니다. 설정에서 프로필을 완성해주세요.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 통계 카드들 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/60">
              총 프로젝트
            </h2>
            <div className="text-3xl font-bold text-primary">
              {statsLoading ? "-" : stats.totalProjects}
            </div>
            <div className="text-sm text-base-content/60">전체</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/60">
              진행 중인 프로젝트
            </h2>
            <div className="text-3xl font-bold text-info">
              {statsLoading ? "-" : stats.activeProjects}
            </div>
            <div className="text-sm text-base-content/60">활성화</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/60">
              완료된 프로젝트
            </h2>
            <div className="text-3xl font-bold text-success">
              {statsLoading ? "-" : stats.completedProjects}
            </div>
            <div className="text-sm text-base-content/60">성공</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/60">
              마감 임박
            </h2>
            <div className="text-3xl font-bold text-error">
              {statsLoading ? "-" : stats.upcomingDeadlines}
            </div>
            <div className="text-sm text-base-content/60">3일 이내</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 프로필 정보 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">프로필 정보</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-16">
                    <span className="text-2xl">
                      {profile?.full_name
                        ? profile.full_name[0]
                        : user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {profile?.full_name ||
                      user?.email?.split("@")[0] ||
                      "이름 없음"}
                  </h3>
                  <p className="text-base-content/60">
                    {user?.email || "이메일 없음"}
                  </p>
                  <div className="badge badge-primary">
                    {profile?.role === "client"
                      ? "클라이언트"
                      : profile?.role === "designer"
                      ? "디자이너"
                      : "미설정"}
                  </div>
                </div>
              </div>

              {profile?.bio && (
                <div>
                  <h4 className="font-medium mb-1">자기소개</h4>
                  <p className="text-sm text-base-content/70">{profile.bio}</p>
                </div>
              )}

              {profile?.location && (
                <div>
                  <h4 className="font-medium mb-1">위치</h4>
                  <p className="text-sm text-base-content/70">
                    {profile.location}
                  </p>
                </div>
              )}

              {profile?.skills && profile.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">스킬</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="badge badge-outline">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile?.hourly_rate && profile?.role === "designer" && (
                <div>
                  <h4 className="font-medium mb-1">시간당 요금</h4>
                  <p className="text-sm text-base-content/70">
                    {profile.hourly_rate.toLocaleString()}원/시간
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 간단한 통계 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">나의 성과</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>평균 평점</span>
                <div className="flex items-center space-x-2">
                  <div className="rating rating-sm">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        type="radio"
                        className={`mask mask-star-2 ${
                          i <= Math.floor(profile?.rating || 0)
                            ? "bg-yellow-400"
                            : "bg-gray-200"
                        }`}
                        disabled
                      />
                    ))}
                  </div>
                  <span className="text-sm">
                    ({(profile?.rating || 0).toFixed(1)})
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>총 프로젝트</span>
                <span className="font-bold">
                  {profile?.total_projects || 0}개
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>가입일</span>
                <span className="text-sm text-base-content/60">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "미설정"}
                </span>
              </div>

              {profile?.is_verified && (
                <div className="flex justify-between items-center">
                  <span>인증 상태</span>
                  <span className="badge badge-success">인증 완료</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 프로젝트 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">최근 프로젝트</h2>
            <button className="btn btn-sm btn-primary">전체 보기</button>
          </div>

          {statsLoading ? (
            <div className="text-center py-8">
              <div className="loading loading-spinner loading-md"></div>
              <p className="mt-2 text-base-content/60">
                프로젝트를 불러오는 중...
              </p>

              {/* 프로젝트 로딩 디버깅 정보 */}
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-left max-w-md mx-auto">
                <p className="font-medium mb-2">🔍 프로젝트 로딩 상태:</p>
                <p>• 사용자: {user ? "✅" : "❌"}</p>
                <p>• 프로필: {profile ? "✅" : "❌"}</p>
                <p>• 역할: {profile?.role || "없음"}</p>
                <p>• User ID: {user?.id?.slice(0, 8) || "없음"}...</p>

                <div className="space-y-2">
                  <button
                    className="btn btn-sm btn-warning w-full"
                    onClick={() => {
                      console.log("🚀 수동으로 프로젝트 로딩 해제");
                      setStatsLoading(false);
                    }}
                  >
                    🚀 프로젝트 로딩 강제 해제
                  </button>

                  <button
                    className="btn btn-sm btn-info w-full"
                    onClick={async () => {
                      try {
                        console.log("🔍 프로젝트 테이블 테스트 시작...");
                        const { data, error, count } = await supabase
                          .from("projects")
                          .select("*", { count: "exact" })
                          .limit(1);

                        console.log("📊 프로젝트 테이블 테스트 결과:", {
                          data,
                          error,
                          count,
                          hasData: !!data,
                          dataLength: data?.length,
                        });

                        if (error) {
                          alert(`❌ 프로젝트 테이블 오류: ${error.message}`);
                        } else {
                          alert(
                            `✅ 프로젝트 테이블 정상\n총 ${count}개 프로젝트 존재`
                          );
                        }
                      } catch (err: any) {
                        console.error("💥 프로젝트 테이블 테스트 오류:", err);
                        alert(
                          `💥 테스트 오류: ${err?.message || "알 수 없는 오류"}`
                        );
                      }
                    }}
                  >
                    🔍 프로젝트 테이블 테스트
                  </button>
                </div>
              </div>
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>프로젝트명</th>
                    <th>카테고리</th>
                    <th>상태</th>
                    <th>우선순위</th>
                    <th>생성일</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div>
                          <div className="font-bold">{project.title}</div>
                          <div className="text-sm opacity-50 line-clamp-1">
                            {project.description}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ghost">
                          {project.category.replace("_", " ")}
                        </span>
                      </td>
                      <td>{getStatusBadge(project.status)}</td>
                      <td>
                        <span
                          className={`badge ${
                            project.priority === "high"
                              ? "badge-error"
                              : project.priority === "medium"
                              ? "badge-warning"
                              : "badge-info"
                          }`}
                        >
                          {project.priority}
                        </span>
                      </td>
                      <td>
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary">보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-base-content/60">아직 프로젝트가 없습니다.</p>
              <button className="btn btn-primary btn-sm mt-4">
                {profile?.role === "client"
                  ? "프로젝트 생성하기"
                  : "프로젝트 찾아보기"}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
