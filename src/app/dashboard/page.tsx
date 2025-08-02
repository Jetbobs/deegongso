import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  // 임시로 클라이언트 역할 설정 (나중에 실제 사용자 정보로 대체)
  const userRole = "client" as const;

  return (
    <DashboardLayout title="대시보드" userRole={userRole}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 통계 카드들 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/60">
              진행 중인 프로젝트
            </h2>
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-base-content/60">전월 대비 +1</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/60">
              피드백 대기
            </h2>
            <div className="text-3xl font-bold text-warning">2</div>
            <div className="text-sm text-base-content/60">빠른 응답 필요</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/60">
              완료된 프로젝트
            </h2>
            <div className="text-3xl font-bold text-success">12</div>
            <div className="text-sm text-base-content/60">이번 달</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/60">
              마감 임박
            </h2>
            <div className="text-3xl font-bold text-error">1</div>
            <div className="text-sm text-base-content/60">3일 이내</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 최근 활동 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">최근 활동</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span className="text-xs">김</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    김디자이너가 로고 디자인 초안을 업로드했습니다.
                  </p>
                  <p className="text-xs text-base-content/60">2시간 전</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="avatar placeholder">
                  <div className="bg-secondary text-secondary-content rounded-full w-8">
                    <span className="text-xs">이</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    이디자이너의 일정 변경 요청이 승인되었습니다.
                  </p>
                  <p className="text-xs text-base-content/60">4시간 전</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="avatar placeholder">
                  <div className="bg-accent text-accent-content rounded-full w-8">
                    <span className="text-xs">박</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    박디자이너와의 브랜딩 프로젝트가 완료되었습니다.
                  </p>
                  <p className="text-xs text-base-content/60">1일 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 다가오는 마감일 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">다가오는 마감일</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-error/10 rounded-lg">
                <div>
                  <p className="font-medium">로고 디자인 피드백</p>
                  <p className="text-sm text-base-content/60">김디자이너</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-error">1월 20일</p>
                  <p className="text-xs text-base-content/60">2일 남음</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div>
                  <p className="font-medium">웹사이트 1차 검토</p>
                  <p className="text-sm text-base-content/60">이디자이너</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-warning">1월 25일</p>
                  <p className="text-xs text-base-content/60">7일 남음</p>
                </div>
              </div>
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
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>프로젝트명</th>
                  <th>상태</th>
                  <th>디자이너</th>
                  <th>진행률</th>
                  <th>마감일</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div>
                      <div className="font-bold">로고 디자인 프로젝트</div>
                      <div className="text-sm opacity-50">
                        브랜드 아이덴티티
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-warning">피드백 대기</span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-8 h-8">
                          <div className="bg-primary text-primary-content w-8 h-8 flex items-center justify-center text-xs">
                            김
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">김디자이너</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <progress
                        className="progress progress-primary w-16"
                        value="70"
                        max="100"
                      ></progress>
                      <span className="text-sm">70%</span>
                    </div>
                  </td>
                  <td>2024-01-20</td>
                  <td>
                    <button className="btn btn-sm btn-primary">보기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div>
                      <div className="font-bold">웹사이트 UI/UX</div>
                      <div className="text-sm opacity-50">반응형 웹 디자인</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">진행 중</span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-8 h-8">
                          <div className="bg-secondary text-secondary-content w-8 h-8 flex items-center justify-center text-xs">
                            이
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">이디자이너</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <progress
                        className="progress progress-info w-16"
                        value="45"
                        max="100"
                      ></progress>
                      <span className="text-sm">45%</span>
                    </div>
                  </td>
                  <td>2024-01-25</td>
                  <td>
                    <button className="btn btn-sm btn-primary">보기</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div>
                      <div className="font-bold">브랜딩 패키지</div>
                      <div className="text-sm opacity-50">
                        로고, 명함, 브로셔
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">완료</span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-8 h-8">
                          <div className="bg-accent text-accent-content w-8 h-8 flex items-center justify-center text-xs">
                            박
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">박디자이너</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <progress
                        className="progress progress-success w-16"
                        value="100"
                        max="100"
                      ></progress>
                      <span className="text-sm">100%</span>
                    </div>
                  </td>
                  <td>2024-01-15</td>
                  <td>
                    <button className="btn btn-sm btn-outline">보기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
