"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { UserRole } from "@/types";

export default function ContractsPage() {
  const { user } = useAuth();
  const userRole: UserRole = user?.role ?? user?.userType ?? "client";

  return (
    <AuthWrapper requireAuth>
      <DashboardLayout title="계약 관리" userRole={userRole}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">계약 관리</h1>
            <p className="text-base-content/60">
              클라이언트와의 계약서를 관리하고 추적하세요.
            </p>
          </div>
          <button className="btn btn-primary">새 계약서 작성</button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/60">
                총 계약
              </h2>
              <div className="text-3xl font-bold text-primary">24</div>
              <div className="text-sm text-base-content/60">이번 년도</div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/60">
                진행 중
              </h2>
              <div className="text-3xl font-bold text-info">8</div>
              <div className="text-sm text-base-content/60">활성 프로젝트</div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/60">
                서명 대기
              </h2>
              <div className="text-3xl font-bold text-warning">3</div>
              <div className="text-sm text-base-content/60">
                클라이언트 확인 필요
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/60">
                총 수익
              </h2>
              <div className="text-3xl font-bold text-success">₩12.5M</div>
              <div className="text-sm text-base-content/60">이번 년도</div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="계약서 검색..."
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex gap-2">
                <select className="select select-bordered">
                  <option>모든 상태</option>
                  <option>서명 대기</option>
                  <option>진행 중</option>
                  <option>완료</option>
                  <option>취소</option>
                </select>
                <select className="select select-bordered">
                  <option>모든 기간</option>
                  <option>이번 달</option>
                  <option>지난 달</option>
                  <option>3개월</option>
                  <option>6개월</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 계약서 목록 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>계약서</th>
                    <th>클라이언트</th>
                    <th>금액</th>
                    <th>상태</th>
                    <th>계약일</th>
                    <th>마감일</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div>
                        <div className="font-bold">로고 디자인 계약서</div>
                        <div className="text-sm opacity-50">
                          브랜드 아이덴티티 디자인
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-8 h-8">
                            <div className="bg-neutral text-neutral-content w-8 h-8 flex items-center justify-center text-xs">
                              홍
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">홍길동</div>
                          <div className="text-sm opacity-50">데오 컴퍼니</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">₩2,500,000</div>
                      <div className="text-sm opacity-50">VAT 포함</div>
                    </td>
                    <td>
                      <span className="badge badge-info">진행 중</span>
                    </td>
                    <td>2024-01-15</td>
                    <td>2024-02-15</td>
                    <td>
                      <div className="flex space-x-2">
                        <button className="btn btn-sm btn-outline">보기</button>
                        <button className="btn btn-sm btn-primary">관리</button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div>
                        <div className="font-bold">웹사이트 UI/UX 계약서</div>
                        <div className="text-sm opacity-50">
                          반응형 웹 디자인
                        </div>
                      </div>
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
                          <div className="font-bold">김철수</div>
                          <div className="text-sm opacity-50">스타트업 A</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">₩4,800,000</div>
                      <div className="text-sm opacity-50">VAT 포함</div>
                    </td>
                    <td>
                      <span className="badge badge-warning">서명 대기</span>
                    </td>
                    <td>-</td>
                    <td>2024-02-28</td>
                    <td>
                      <div className="flex space-x-2">
                        <button className="btn btn-sm btn-outline">보기</button>
                        <button className="btn btn-sm btn-warning">
                          리마인드
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div>
                        <div className="font-bold">브랜딩 패키지 계약서</div>
                        <div className="text-sm opacity-50">
                          로고, 명함, 브로셔 디자인
                        </div>
                      </div>
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
                          <div className="font-bold">박영희</div>
                          <div className="text-sm opacity-50">브랜드 B</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">₩3,200,000</div>
                      <div className="text-sm opacity-50">VAT 포함</div>
                    </td>
                    <td>
                      <span className="badge badge-success">완료</span>
                    </td>
                    <td>2023-12-01</td>
                    <td>2024-01-10</td>
                    <td>
                      <div className="flex space-x-2">
                        <button className="btn btn-sm btn-outline">보기</button>
                        <button className="btn btn-sm btn-ghost">
                          다운로드
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div>
                        <div className="font-bold">앱 UI 디자인 계약서</div>
                        <div className="text-sm opacity-50">
                          모바일 앱 인터페이스
                        </div>
                      </div>
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
                          <div className="font-bold">이민수</div>
                          <div className="text-sm opacity-50">테크 C</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">₩6,000,000</div>
                      <div className="text-sm opacity-50">VAT 포함</div>
                    </td>
                    <td>
                      <span className="badge badge-warning">서명 대기</span>
                    </td>
                    <td>-</td>
                    <td>2024-03-15</td>
                    <td>
                      <div className="flex space-x-2">
                        <button className="btn btn-sm btn-outline">수정</button>
                        <button className="btn btn-sm btn-warning">발송</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 계약서 템플릿 (향후 지원 예정) - UI 비노출 */}
        {false && (
          <div className="card bg-base-100 shadow-sm mt-6">
            <div className="card-body">
              <h2 className="card-title">계약서 템플릿</h2>
              <p className="text-base-content/60 mb-4">
                자주 사용하는 계약서 템플릿을 관리하세요.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-base">로고 디자인 템플릿</h3>
                    <p className="text-sm text-base-content/60">
                      브랜드 로고 디자인 계약서
                    </p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-sm btn-primary">사용</button>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-base">웹 디자인 템플릿</h3>
                    <p className="text-sm text-base-content/60">
                      웹사이트 UI/UX 계약서
                    </p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-sm btn-primary">사용</button>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-base">브랜딩 템플릿</h3>
                    <p className="text-sm text-base-content/60">
                      종합 브랜딩 패키지 계약서
                    </p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-sm btn-primary">사용</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthWrapper>
  );
}
