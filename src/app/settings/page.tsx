"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type SettingsSection =
  | "profile"
  | "account"
  | "notifications"
  | "security"
  | "payment"
  | "subscription";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar: string;
  role: "client" | "designer";
  address: string;
  position?: string; // 클라이언트 전용
  specialties?: string[]; // 디자이너 전용
  portfolioLinks?: string[]; // 디자이너 전용
  bio?: string; // 디자이너 전용
  hourlyRate?: number; // 디자이너 전용
}

const mockUserProfile: UserProfile = {
  name: "홍길동",
  email: "hong@company.com",
  phone: "010-1234-5678",
  company: "테크 스타트업",
  avatar: "",
  role: "client",
  address: "서울시 강남구 테헤란로 123",
  position: "마케팅 팀장",
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const userRole = userProfile.role;

  const menuItems = [
    {
      category: "계정",
      items: [
        { id: "profile" as const, label: "프로필 정보", icon: "👤" },
        { id: "account" as const, label: "계정 설정", icon: "⚙️" },
        { id: "security" as const, label: "보안 설정", icon: "🔒" },
      ],
    },
    {
      category: "서비스",
      items: [
        { id: "notifications" as const, label: "알림 설정", icon: "🔔" },
        { id: "payment" as const, label: "결제 정보", icon: "💳" },
        { id: "subscription" as const, label: "구독/플랜", icon: "💎" },
      ],
    },
  ];

  const saveChanges = () => {
    // 실제로는 API 호출
    setIsEditing(false);
    setHasChanges(false);
    // 성공 토스트 표시
    alert("변경사항이 저장되었습니다.");
  };

  const cancelChanges = () => {
    setIsEditing(false);
    setHasChanges(false);
    // 변경사항 원복
  };

  return (
    <DashboardLayout title="설정" userRole={userRole}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 좌측 서브메뉴 */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-sm sticky top-4">
              <div className="card-body p-0">
                <ul className="menu">
                  {menuItems.map((category) => (
                    <div key={category.category}>
                      <li className="menu-title">{category.category}</li>
                      {category.items.map((item) => (
                        <li
                          key={item.id}
                          style={{
                            display: [
                              "security",
                              "payment",
                              "subscription",
                            ].includes(item.id)
                              ? "none"
                              : "block",
                          }}
                        >
                          <a
                            className={`${
                              activeSection === item.id ? "active" : ""
                            } flex items-center gap-2`}
                            onClick={() => setActiveSection(item.id)}
                          >
                            <span>{item.icon}</span>
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 우측 컨텐츠 영역 */}
          <div className="lg:col-span-3">
            {activeSection === "profile" && (
              <ProfileSection
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                hasChanges={hasChanges}
                setHasChanges={setHasChanges}
                onSave={saveChanges}
                onCancel={cancelChanges}
              />
            )}
            {activeSection === "account" && <AccountSection />}
            {activeSection === "notifications" && <NotificationsSection />}
            <div style={{ display: "none" }}>
              {activeSection === "security" && <SecuritySection />}
              {activeSection === "payment" && (
                <PaymentSection userRole={userRole} />
              )}
              {activeSection === "subscription" && <SubscriptionSection />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// 프로필 정보 섹션
function ProfileSection({
  userProfile,
  setUserProfile,
  isEditing,
  setIsEditing,
  hasChanges,
  setHasChanges,
  onSave,
  onCancel,
}: {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  hasChanges: boolean;
  setHasChanges: (changes: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const updateProfile = (field: keyof UserProfile, value: any) => {
    setUserProfile({ ...userProfile, [field]: value });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">프로필 정보</h2>
              <p className="text-base-content/60">
                계정의 기본 정보를 관리합니다
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ 편집
                </button>
              ) : (
                <>
                  <button className="btn btn-ghost" onClick={onCancel}>
                    취소
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={onSave}
                    disabled={!hasChanges}
                  >
                    💾 저장
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="text-lg font-bold mb-4">기본 정보</h3>

          {/* 프로필 사진 */}
          <div className="flex items-center gap-6 mb-6">
            <div className="avatar">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="프로필" />
                ) : (
                  userProfile.name.charAt(0)
                )}
              </div>
            </div>
            {isEditing && (
              <div>
                <button className="btn btn-outline btn-sm">사진 변경</button>
                <div className="text-xs text-base-content/60 mt-1">
                  권장: 400x400px, 5MB 이하
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-medium">이름 *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={userProfile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-medium">이메일 *</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={userProfile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                disabled={!isEditing}
              />
              {isEditing && (
                <div className="label pt-1">
                  <span className="label-text-alt text-warning">
                    이메일 변경 시 인증이 필요합니다
                  </span>
                </div>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-medium">전화번호</span>
              </label>
              <input
                type="tel"
                className="input input-bordered w-full"
                value={userProfile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-medium">
                  {userProfile.role === "client" ? "회사명" : "스튜디오/상호"}
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={userProfile.company}
                onChange={(e) => updateProfile("company", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="form-control w-full md:col-span-2">
              <label className="label pb-1">
                <span className="label-text font-medium">주소</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={userProfile.address}
                onChange={(e) => updateProfile("address", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-medium">계정 유형</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-base-200 w-full"
                value={
                  userProfile.role === "client" ? "클라이언트" : "디자이너"
                }
                disabled
              />
              <div className="label pt-1">
                <span className="label-text-alt">
                  계정 유형 변경은 고객지원에 문의하세요
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 역할별 추가 정보 */}
      {userProfile.role === "designer" ? (
        <DesignerAdditionalInfo
          userProfile={userProfile}
          updateProfile={updateProfile}
          isEditing={isEditing}
        />
      ) : (
        <ClientAdditionalInfo
          userProfile={userProfile}
          updateProfile={updateProfile}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}

// 디자이너 추가 정보
function DesignerAdditionalInfo({
  userProfile,
  updateProfile,
  isEditing,
}: {
  userProfile: UserProfile;
  updateProfile: (field: keyof UserProfile, value: any) => void;
  isEditing: boolean;
}) {
  const specialtyOptions = [
    "로고 디자인",
    "브랜딩",
    "UI/UX 디자인",
    "웹 디자인",
    "인쇄물 디자인",
    "일러스트레이션",
    "패키지 디자인",
    "영상 디자인",
  ];

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="text-lg font-bold mb-4">디자이너 전문 정보</h3>

        <div className="space-y-6">
          {/* 전문 분야 */}
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text font-medium">전문 분야</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((specialty) => (
                <div key={specialty} className="form-control">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={userProfile.specialties?.includes(specialty)}
                      onChange={(e) => {
                        const current = userProfile.specialties || [];
                        if (e.target.checked) {
                          updateProfile("specialties", [...current, specialty]);
                        } else {
                          updateProfile(
                            "specialties",
                            current.filter((s) => s !== specialty)
                          );
                        }
                      }}
                      disabled={!isEditing}
                    />
                    <span className="label-text text-sm">{specialty}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 포트폴리오 링크 */}
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text font-medium">포트폴리오 링크</span>
            </label>
            <div className="space-y-2">
              <input
                type="url"
                className="input input-bordered w-full"
                placeholder="https://behance.net/yourprofile"
                disabled={!isEditing}
              />
              <input
                type="url"
                className="input input-bordered w-full"
                placeholder="https://dribbble.com/yourprofile"
                disabled={!isEditing}
              />
              {isEditing && (
                <button className="btn btn-outline btn-sm">+ 링크 추가</button>
              )}
            </div>
          </div>

          {/* 자기소개 */}
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text font-medium">자기소개 / 경력</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 w-full"
              placeholder="디자이너로서의 경험과 강점을 소개해주세요..."
              value={userProfile.bio || ""}
              onChange={(e) => updateProfile("bio", e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {/* 평균 요율 */}
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text font-medium">
                평균 요율 (선택사항)
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="join">
                <input
                  type="number"
                  className="input input-bordered join-item flex-1"
                  placeholder="시간당 요율"
                  value={userProfile.hourlyRate || ""}
                  onChange={(e) =>
                    updateProfile("hourlyRate", Number(e.target.value))
                  }
                  disabled={!isEditing}
                />
                <span className="btn btn-outline join-item">원/시간</span>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer gap-2">
                  <span className="label-text text-sm">요율 공개</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    disabled={!isEditing}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 클라이언트 추가 정보
function ClientAdditionalInfo({
  userProfile,
  updateProfile,
  isEditing,
}: {
  userProfile: UserProfile;
  updateProfile: (field: keyof UserProfile, value: any) => void;
  isEditing: boolean;
}) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="text-lg font-bold mb-4">클라이언트 추가 정보</h3>

        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-medium">담당 부서 / 직책</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="예: 마케팅팀 과장"
            value={userProfile.position || ""}
            onChange={(e) => updateProfile("position", e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
}

// 계정 설정 섹션
function AccountSection() {
  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">계정 설정</h2>

          <div className="space-y-6">
            {/* 비밀번호 변경 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">비밀번호 변경</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <label className="label pb-1">
                      <span className="label-text">현재 비밀번호</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label pb-1">
                      <span className="label-text">새 비밀번호</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control w-full md:col-span-2">
                    <label className="label pb-1">
                      <span className="label-text">새 비밀번호 확인</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary">비밀번호 변경</button>
                </div>
              </div>
            </div>

            {/* 연결된 소셜 계정 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">연결된 소셜 계정</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                        G
                      </div>
                      <div>
                        <div className="font-medium">Google</div>
                        <div className="text-sm text-base-content/60">
                          hong@gmail.com
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm text-error">
                      연결 해제
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
                        K
                      </div>
                      <div>
                        <div className="font-medium">Kakao</div>
                        <div className="text-sm text-base-content/60">
                          연결되지 않음
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm">연결</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 계정 비활성화 */}
            <div className="card bg-error/10 border border-error/20">
              <div className="card-body">
                <h3 className="font-bold mb-4 text-error">위험 구역</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">계정 비활성화</h4>
                    <p className="text-sm text-base-content/60 mb-2">
                      계정을 일시적으로 비활성화합니다. 언제든 다시 활성화할 수
                      있습니다.
                    </p>
                    <button className="btn btn-outline btn-warning">
                      계정 비활성화
                    </button>
                  </div>
                  <div className="divider"></div>
                  <div>
                    <h4 className="font-medium">계정 삭제</h4>
                    <p className="text-sm text-base-content/60 mb-2">
                      계정과 모든 데이터가 영구적으로 삭제됩니다. 이 작업은
                      되돌릴 수 없습니다.
                    </p>
                    <button className="btn btn-error">계정 삭제</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 알림 설정 섹션
function NotificationsSection() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    newMessage: true,
    reportUpload: true,
    feedbackRequest: true,
    modificationComplete: true,
    scheduleChange: true,
    deadlineReminder: true,
    paymentNotification: true,
    serviceUpdates: false,
  });

  const updateNotification = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">알림 설정</h2>

          <div className="space-y-6">
            {/* 알림 수신 방식 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">알림 수신 방식</h3>
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">📧 이메일 알림</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.email}
                        onChange={(e) =>
                          updateNotification("email", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">🔔 앱 푸시 알림</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.push}
                        onChange={(e) =>
                          updateNotification("push", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">📱 SMS 알림</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.sms}
                        onChange={(e) =>
                          updateNotification("sms", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 알림 종류별 설정 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">알림 종류별 설정</h3>
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">💬 새 메시지 도착</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.newMessage}
                        onChange={(e) =>
                          updateNotification("newMessage", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">📎 보고서 업로드</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.reportUpload}
                        onChange={(e) =>
                          updateNotification("reportUpload", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">📝 피드백 요청/제출</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.feedbackRequest}
                        onChange={(e) =>
                          updateNotification(
                            "feedbackRequest",
                            e.target.checked
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">✅ 수정 완료</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.modificationComplete}
                        onChange={(e) =>
                          updateNotification(
                            "modificationComplete",
                            e.target.checked
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">📅 일정 변경 요청/승인</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.scheduleChange}
                        onChange={(e) =>
                          updateNotification("scheduleChange", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">⏰ 마감일 임박</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.deadlineReminder}
                        onChange={(e) =>
                          updateNotification(
                            "deadlineReminder",
                            e.target.checked
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">💳 결제 관련</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.paymentNotification}
                        onChange={(e) =>
                          updateNotification(
                            "paymentNotification",
                            e.target.checked
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-between w-full">
                      <span className="label-text">
                        📢 서비스 업데이트 및 이벤트
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notifications.serviceUpdates}
                        onChange={(e) =>
                          updateNotification("serviceUpdates", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 마감일 알림 설정 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">마감일 알림 설정</h3>
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text">
                      마감일 며칠 전에 알림을 받으시겠습니까?
                    </span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option>1일 전</option>
                    <option>2일 전</option>
                    <option selected>3일 전</option>
                    <option>5일 전</option>
                    <option>7일 전</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-actions justify-end">
              <button className="btn btn-primary">설정 저장</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 보안 설정 섹션
function SecuritySection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const loginHistory = [
    {
      device: "Chrome on Windows",
      location: "서울, 대한민국",
      time: "2024-01-20 14:30",
      current: true,
    },
    {
      device: "Safari on iPhone",
      location: "서울, 대한민국",
      time: "2024-01-19 09:15",
      current: false,
    },
    {
      device: "Chrome on Mac",
      location: "부산, 대한민국",
      time: "2024-01-18 16:45",
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">보안 설정</h2>

          <div className="space-y-6">
            {/* 2단계 인증 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">2단계 인증 (2FA)</h3>
                    <p className="text-sm text-base-content/60">
                      계정 보안을 강화하기 위해 2단계 인증을 활성화하세요
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-lg"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  />
                </div>
                {twoFactorEnabled && (
                  <div className="space-y-4">
                    <div className="alert alert-info">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>QR 코드를 스캔하여 인증 앱을 설정하세요</span>
                    </div>
                    <div className="flex gap-4">
                      <button className="btn btn-outline">QR 코드 보기</button>
                      <button className="btn btn-outline">
                        백업 코드 생성
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 로그인 기록 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">로그인 기록</h3>
                <div className="space-y-3">
                  {loginHistory.map((login, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-base-100 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          💻
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {login.device}
                            {login.current && (
                              <span className="badge badge-success badge-sm">
                                현재 세션
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-base-content/60">
                            {login.location} • {login.time}
                          </div>
                        </div>
                      </div>
                      {!login.current && (
                        <button className="btn btn-ghost btn-sm text-error">
                          세션 종료
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-outline">모든 세션 종료</button>
                </div>
              </div>
            </div>

            {/* 연결된 앱 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">연결된 앱 및 서비스</h3>
                <div className="text-center py-8 text-base-content/60">
                  연결된 외부 앱이 없습니다
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 결제 정보 섹션
function PaymentSection({ userRole }: { userRole: "client" | "designer" }) {
  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">결제 정보</h2>

          <div className="space-y-6">
            {userRole === "designer" ? (
              /* 디자이너용 정산 정보 */
              <>
                <div className="card bg-base-50">
                  <div className="card-body">
                    <h3 className="font-bold mb-4">정산 계좌 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control w-full">
                        <label className="label pb-1">
                          <span className="label-text">은행명</span>
                        </label>
                        <select className="select select-bordered w-full">
                          <option>은행을 선택하세요</option>
                          <option>국민은행</option>
                          <option>신한은행</option>
                          <option>우리은행</option>
                          <option>하나은행</option>
                        </select>
                      </div>
                      <div className="form-control w-full">
                        <label className="label pb-1">
                          <span className="label-text">계좌번호</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          placeholder="계좌번호 입력"
                        />
                      </div>
                      <div className="form-control w-full md:col-span-2">
                        <label className="label pb-1">
                          <span className="label-text">예금주</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          placeholder="예금주명 입력"
                        />
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <button className="btn btn-primary">
                        계좌 정보 저장
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-50">
                  <div className="card-body">
                    <h3 className="font-bold mb-4">세금 정보</h3>
                    <div className="form-control w-full">
                      <label className="label pb-1">
                        <span className="label-text">사업자 구분</span>
                      </label>
                      <div className="join">
                        <input
                          className="join-item btn"
                          type="radio"
                          name="business-type"
                          aria-label="개인사업자"
                        />
                        <input
                          className="join-item btn"
                          type="radio"
                          name="business-type"
                          aria-label="법인사업자"
                        />
                        <input
                          className="join-item btn"
                          type="radio"
                          name="business-type"
                          aria-label="프리랜서"
                        />
                      </div>
                    </div>
                    <div className="form-control w-full mt-4">
                      <label className="label pb-1">
                        <span className="label-text">
                          사업자등록번호 (선택)
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="000-00-00000"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* 클라이언트용 결제 수단 */
              <div className="card bg-base-50">
                <div className="card-body">
                  <h3 className="font-bold mb-4">등록된 결제 수단</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                          💳
                        </div>
                        <div>
                          <div className="font-medium">신한카드</div>
                          <div className="text-sm text-base-content/60">
                            **** **** **** 1234
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm">편집</button>
                        <button className="btn btn-ghost btn-sm text-error">
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-outline">
                      + 결제 수단 추가
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 결제 내역 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">
                    {userRole === "designer" ? "정산 내역" : "결제 내역"}
                  </h3>
                  <button className="btn btn-outline btn-sm">
                    전체 내역 보기
                  </button>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-base-100 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {userRole === "designer"
                            ? "로고 디자인 프로젝트 정산"
                            : "로고 디자인 프로젝트 결제"}
                        </div>
                        <div className="text-sm text-base-content/60">
                          2024-01-{20 - i}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {userRole === "designer"
                            ? "+1,200,000원"
                            : "-1,500,000원"}
                        </div>
                        <div className="text-sm text-success">완료</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 구독/플랜 섹션
function SubscriptionSection() {
  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">구독 / 플랜</h2>

          <div className="space-y-6">
            {/* 현재 플랜 */}
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">프리미엄 플랜</h3>
                    <p className="text-base-content/60">
                      무제한 프로젝트 및 고급 기능
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">29,900원</div>
                    <div className="text-sm text-base-content/60">/월</div>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-base-content/60">다음 결제일:</span>
                    <div className="font-medium">2024-02-20</div>
                  </div>
                  <div>
                    <span className="text-base-content/60">결제 방법:</span>
                    <div className="font-medium">신한카드 ****1234</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 플랜 변경 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">플랜 변경</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card bg-base-100 border">
                    <div className="card-body text-center">
                      <h4 className="font-bold">베이직</h4>
                      <div className="text-2xl font-bold my-2">무료</div>
                      <ul className="text-sm space-y-1 text-left">
                        <li>✓ 월 3개 프로젝트</li>
                        <li>✓ 기본 피드백</li>
                        <li>✗ 고급 도구</li>
                      </ul>
                      <button className="btn btn-outline btn-sm mt-4">
                        다운그레이드
                      </button>
                    </div>
                  </div>
                  <div className="card bg-primary/10 border border-primary">
                    <div className="card-body text-center">
                      <div className="badge badge-primary">현재 플랜</div>
                      <h4 className="font-bold">프리미엄</h4>
                      <div className="text-2xl font-bold my-2">29,900원</div>
                      <ul className="text-sm space-y-1 text-left">
                        <li>✓ 무제한 프로젝트</li>
                        <li>✓ 고급 피드백 도구</li>
                        <li>✓ 우선 고객지원</li>
                      </ul>
                      <button className="btn btn-primary btn-sm mt-4" disabled>
                        현재 플랜
                      </button>
                    </div>
                  </div>
                  <div className="card bg-base-100 border">
                    <div className="card-body text-center">
                      <h4 className="font-bold">엔터프라이즈</h4>
                      <div className="text-2xl font-bold my-2">99,900원</div>
                      <ul className="text-sm space-y-1 text-left">
                        <li>✓ 무제한 프로젝트</li>
                        <li>✓ 팀 관리 기능</li>
                        <li>✓ API 접근</li>
                      </ul>
                      <button className="btn btn-primary btn-sm mt-4">
                        업그레이드
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 구독 관리 */}
            <div className="card bg-base-50">
              <div className="card-body">
                <h3 className="font-bold mb-4">구독 관리</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>자동 갱신</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>결제 실패 시 이메일 알림</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked
                    />
                  </div>
                </div>
                <div className="divider"></div>
                <div className="card-actions justify-end">
                  <button className="btn btn-ghost">구독 일시중지</button>
                  <button className="btn btn-error">구독 취소</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
