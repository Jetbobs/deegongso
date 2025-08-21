"use client";

import { useState } from "react";
import { PlatformSetting } from "@/types";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"platform" | "payment" | "notifications" | "security">("platform");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Mock 플랫폼 설정 데이터
  const [platformSettings, setPlatformSettings] = useState<PlatformSetting[]>([
    {
      id: "1",
      setting_key: "platform_fee_rate",
      setting_value: 0.03,
      description: "플랫폼 수수료율 (3%)",
      updated_by: "admin-1",
      updated_at: "2025-08-20T10:00:00Z"
    },
    {
      id: "2",
      setting_key: "max_modification_count",
      setting_value: 3,
      description: "기본 수정 횟수 제한",
      updated_by: "admin-1", 
      updated_at: "2025-08-15T14:30:00Z"
    },
    {
      id: "3",
      setting_key: "project_auto_close_days",
      setting_value: 30,
      description: "프로젝트 자동 종료 일수",
      updated_by: "admin-2",
      updated_at: "2025-08-10T09:15:00Z"
    }
  ]);

  const [paymentSettings, setPaymentSettings] = useState({
    escrow_enabled: true,
    auto_release_days: 7,
    refund_period_days: 14,
    minimum_project_amount: 50000,
    payment_methods: ["card", "bank_transfer", "virtual_account"]
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    admin_alerts: true,
    dispute_notifications: true,
    maintenance_notifications: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    session_timeout: 30,
    max_login_attempts: 5,
    password_min_length: 8,
    require_2fa_admin: true,
    ip_whitelist_enabled: false,
    audit_log_retention_days: 365
  });

  const tabs = [
    { id: "platform", label: "플랫폼 설정", icon: "⚙️" },
    { id: "payment", label: "결제 설정", icon: "💳" },
    { id: "notifications", label: "알림 설정", icon: "🔔" },
    { id: "security", label: "보안 설정", icon: "🔒" }
  ];

  const handleSavePlatformSetting = (key: string, value: any) => {
    setPlatformSettings(prev => 
      prev.map(setting => 
        setting.setting_key === key 
          ? { ...setting, setting_value: value, updated_at: new Date().toISOString() }
          : setting
      )
    );
  };

  const PlatformSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 설정</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              플랫폼 수수료율 (%)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={(platformSettings.find(s => s.setting_key === 'platform_fee_rate')?.setting_value as number) * 100}
                onChange={(e) => handleSavePlatformSetting('platform_fee_rate', parseFloat(e.target.value) / 100)}
                className="w-24 p-2 border border-gray-300 rounded-md"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">프로젝트 완료 시 디자이너에게 부과되는 수수료</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기본 수정 횟수
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={platformSettings.find(s => s.setting_key === 'max_modification_count')?.setting_value as number}
              onChange={(e) => handleSavePlatformSetting('max_modification_count', parseInt(e.target.value))}
              className="w-24 p-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-400 mt-1">프로젝트당 기본으로 제공되는 수정 횟수</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 자동 종료 일수
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="7"
                max="90"
                value={platformSettings.find(s => s.setting_key === 'project_auto_close_days')?.setting_value as number}
                onChange={(e) => handleSavePlatformSetting('project_auto_close_days', parseInt(e.target.value))}
                className="w-24 p-2 border border-gray-300 rounded-md"
              />
              <span className="text-sm text-gray-500">일</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">완료 요청 후 클라이언트 미응답 시 자동 종료되는 기간</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">콘텐츠 관리</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">자동 콘텐츠 필터링</p>
              <p className="text-xs text-gray-400">부적절한 콘텐츠 자동 감지 및 차단</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">사용자 리뷰 자동 승인</p>
              <p className="text-xs text-gray-400">관리자 검토 없이 리뷰 자동 게시</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 관리</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">에스크로 서비스</p>
              <p className="text-xs text-gray-400">안전한 거래를 위한 중간 결제 서비스</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={paymentSettings.escrow_enabled}
                onChange={(e) => setPaymentSettings(prev => ({...prev, escrow_enabled: e.target.checked}))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자동 정산 일수
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="30"
                value={paymentSettings.auto_release_days}
                onChange={(e) => setPaymentSettings(prev => ({...prev, auto_release_days: parseInt(e.target.value)}))}
                className="w-24 p-2 border border-gray-300 rounded-md"
              />
              <span className="text-sm text-gray-500">일</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">프로젝트 완료 후 자동으로 디자이너에게 정산되는 기간</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 프로젝트 금액
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="10000"
                step="10000"
                value={paymentSettings.minimum_project_amount}
                onChange={(e) => setPaymentSettings(prev => ({...prev, minimum_project_amount: parseInt(e.target.value)}))}
                className="w-32 p-2 border border-gray-300 rounded-md"
              />
              <span className="text-sm text-gray-500">원</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">지원 결제 방법</h3>
        <div className="space-y-3">
          {[
            { id: "card", label: "신용/체크카드", icon: "💳" },
            { id: "bank_transfer", label: "계좌이체", icon: "🏦" },
            { id: "virtual_account", label: "가상계좌", icon: "📱" },
            { id: "paypal", label: "PayPal", icon: "🌐" }
          ].map((method) => (
            <div key={method.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{method.icon}</span>
                <span className="text-sm font-medium text-gray-700">{method.label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={paymentSettings.payment_methods.includes(method.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPaymentSettings(prev => ({
                        ...prev, 
                        payment_methods: [...prev.payment_methods, method.id]
                      }));
                    } else {
                      setPaymentSettings(prev => ({
                        ...prev,
                        payment_methods: prev.payment_methods.filter(m => m !== method.id)
                      }));
                    }
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const NotificationsSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 알림 설정</h3>
        <div className="space-y-4">
          {[
            { key: "email_notifications", label: "이메일 알림", desc: "중요한 이벤트를 이메일로 발송" },
            { key: "sms_notifications", label: "SMS 알림", desc: "긴급 알림을 문자메시지로 발송" },
            { key: "push_notifications", label: "푸시 알림", desc: "모바일 앱 푸시 알림" }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{setting.label}</p>
                <p className="text-xs text-gray-400">{setting.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev, 
                    [setting.key]: e.target.checked
                  }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">관리자 알림 설정</h3>
        <div className="space-y-4">
          {[
            { key: "admin_alerts", label: "관리자 알림", desc: "시스템 이벤트 및 중요 알림" },
            { key: "dispute_notifications", label: "분쟁 알림", desc: "새로운 분쟁 발생 시 즉시 알림" },
            { key: "maintenance_notifications", label: "점검 알림", desc: "시스템 점검 및 업데이트 알림" }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{setting.label}</p>
                <p className="text-xs text-gray-400">{setting.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev, 
                    [setting.key]: e.target.checked
                  }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecuritySettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 보안</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              세션 타임아웃 (분)
            </label>
            <input
              type="number"
              min="5"
              max="240"
              value={securitySettings.session_timeout}
              onChange={(e) => setSecuritySettings(prev => ({...prev, session_timeout: parseInt(e.target.value)}))}
              className="w-24 p-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-400 mt-1">비활성 상태에서 자동 로그아웃되는 시간</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 로그인 시도 횟수
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={securitySettings.max_login_attempts}
              onChange={(e) => setSecuritySettings(prev => ({...prev, max_login_attempts: parseInt(e.target.value)}))}
              className="w-24 p-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-400 mt-1">계정 잠금 전 허용되는 실패 횟수</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">관리자 2단계 인증 필수</p>
              <p className="text-xs text-gray-400">모든 관리자 계정에 2FA 강제 적용</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={securitySettings.require_2fa_admin}
                onChange={(e) => setSecuritySettings(prev => ({...prev, require_2fa_admin: e.target.checked}))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">감사 로그</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              로그 보관 기간 (일)
            </label>
            <input
              type="number"
              min="30"
              max="1095"
              value={securitySettings.audit_log_retention_days}
              onChange={(e) => setSecuritySettings(prev => ({...prev, audit_log_retention_days: parseInt(e.target.value)}))}
              className="w-32 p-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-400 mt-1">시스템 감사 로그 보관 기간</p>
          </div>

          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              로그 다운로드
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              로그 분석
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "platform": return <PlatformSettingsTab />;
      case "payment": return <PaymentSettingsTab />;
      case "notifications": return <NotificationsSettingsTab />;
      case "security": return <SecuritySettingsTab />;
      default: return <PlatformSettingsTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
        <button 
          onClick={() => setShowSaveModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          변경사항 저장
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* 저장 확인 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">변경사항 저장</h3>
            <p className="text-sm text-gray-600 mb-6">
              현재 설정을 저장하시겠습니까? 일부 변경사항은 즉시 적용됩니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: 설정 저장 로직
                  setShowSaveModal(false);
                }}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}