import { createServerComponentClient } from "@/lib/supabase/server";

export default async function TestDBPage() {
  let connectionStatus = "테스트 중...";
  let tableCount = 0;
  let error: string | null = null;
  let testResults: string[] = [];

  try {
    const supabase = await createServerComponentClient();
    testResults.push("✅ Supabase 클라이언트 생성 성공");

    // 1. 간단한 테이블 조회 테스트
    const { data: userProfiles, error: userProfilesError } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);

    if (userProfilesError) {
      testResults.push(
        `❌ user_profiles 테이블 접근 실패: ${userProfilesError.message}`
      );
      throw new Error(
        `user_profiles 테이블 접근 실패: ${userProfilesError.message}`
      );
    }

    testResults.push("✅ user_profiles 테이블 접근 성공");

    // 2. 모든 주요 테이블들 확인 (10개 전체)
    const tablesToCheck = [
      "projects",
      "contracts",
      "messages",
      "notifications",
      "project_applications",
      "contract_milestones",
      "files",
      "payments",
      "reviews",
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { error: tableError } = await supabase
          .from(tableName)
          .select("count")
          .limit(1);

        if (tableError) {
          testResults.push(
            `❌ ${tableName} 테이블 접근 실패: ${tableError.message}`
          );
        } else {
          testResults.push(`✅ ${tableName} 테이블 접근 성공`);
          tableCount++;
        }
      } catch (err: any) {
        testResults.push(`❌ ${tableName} 테이블 확인 중 오류: ${err.message}`);
      }
    }

    connectionStatus =
      tableCount === 9
        ? "✅ 모든 테이블 접근 성공!"
        : tableCount > 0
        ? "⚠️ 일부 테이블만 접근 가능"
        : "❌ 테이블 접근 실패";
  } catch (err: any) {
    connectionStatus = "❌ 연결 실패";
    error = err.message;
    testResults.push(`❌ 전체 테스트 실패: ${err.message}`);
  }

  // user_profiles도 포함하여 총 개수 계산
  const totalAccessibleTables =
    tableCount +
    (testResults.some((r) => r.includes("user_profiles 테이블 접근 성공"))
      ? 1
      : 0);

  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-3xl mb-6">
              🔍 Supabase 연결 테스트
            </h1>

            {/* 연결 상태 */}
            <div className="stats shadow mb-6">
              <div className="stat">
                <div className="stat-title">연결 상태</div>
                <div className="stat-value text-2xl">{connectionStatus}</div>
                <div className="stat-desc">데이터베이스 연결 확인</div>
              </div>

              <div className="stat">
                <div className="stat-title">접근 가능한 테이블</div>
                <div className="stat-value text-primary">
                  {totalAccessibleTables}/10
                </div>
                <div className="stat-desc">전체 테이블 중 접근 가능한 개수</div>
              </div>

              <div className="stat">
                <div className="stat-title">완성도</div>
                <div className="stat-value text-secondary">
                  {Math.round((totalAccessibleTables / 10) * 100)}%
                </div>
                <div className="stat-desc">데이터베이스 설정 완성도</div>
              </div>
            </div>

            {/* 테스트 결과 */}
            <div className="card bg-base-300 mb-6">
              <div className="card-body">
                <h2 className="card-title">🧪 테스트 결과</h2>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`text-sm flex items-center gap-2 ${
                        result.includes("✅") ? "text-success" : "text-error"
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="alert alert-error mb-6">
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
                <div>
                  <h3 className="font-bold">연결 오류!</h3>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* 환경변수 체크 */}
            <div className="card bg-base-300 mb-6">
              <div className="card-body">
                <h2 className="card-title">🔧 환경변수 상태</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        process.env.NEXT_PUBLIC_SUPABASE_URL
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      NEXT_PUBLIC_SUPABASE_URL
                    </span>
                    <span className="text-sm opacity-70">
                      {process.env.NEXT_PUBLIC_SUPABASE_URL
                        ? "설정됨"
                        : "설정 필요"}
                    </span>
                    {process.env.NEXT_PUBLIC_SUPABASE_URL && (
                      <span className="text-xs opacity-50">
                        {process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30)}...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </span>
                    <span className="text-sm opacity-70">
                      {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                        ? "설정됨"
                        : "설정 필요"}
                    </span>
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
                      <span className="text-xs opacity-50">
                        {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 20)}
                        ...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 예상 테이블 목록 */}
            <div className="card bg-base-300 mb-6">
              <div className="card-body">
                <h2 className="card-title">📋 전체 테이블 목록 (10개)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "user_profiles",
                    "projects",
                    "project_applications",
                    "contracts",
                    "contract_milestones",
                    "messages",
                    "files",
                    "payments",
                    "reviews",
                    "notifications",
                  ].map((tableName) => {
                    const isAccessible = testResults.some((r) =>
                      r.includes(`${tableName} 테이블 접근 성공`)
                    );
                    return (
                      <div
                        key={tableName}
                        className={`badge p-3 ${
                          isAccessible ? "badge-success" : "badge-outline"
                        }`}
                      >
                        {isAccessible ? "✅" : "❌"} {tableName}
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm opacity-70 mt-4">
                  💡 모든 테이블이 생성되어야 완전한 시스템이 됩니다.
                </div>
              </div>
            </div>

            {/* 진행 상황에 따른 다음 단계 안내 */}
            {totalAccessibleTables === 10 ? (
              <div className="alert alert-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <h3 className="font-bold">🎉 모든 테이블 접근 성공!</h3>
                  <div className="text-sm">
                    다음 단계: 샘플 데이터 삽입 → 인증 시스템 구현 → 실제 기능
                    개발
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
                <div>
                  <h3 className="font-bold">
                    ⚠️ 일부 테이블에 접근할 수 없습니다
                  </h3>
                  <div className="text-sm">
                    누락된 테이블들을 생성하기 위해 Supabase SQL Editor에서
                    missing-tables.sql을 실행하세요.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
