"use client";

import { useState } from "react";
import { User, UserSanction } from "@/types";

export default function AdminUsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "client" | "designer" | "admin">("all");
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock 사용자 데이터
  const mockUsers: User[] = [
    {
      id: "1",
      email: "client1@example.com",
      name: "김클라이언트",
      phone: "010-1234-5678",
      role: "client",
      company: "(주)테크스타트업",
      department: "마케팅팀",
      title: "팀장",
      created_at: "2025-01-15T09:00:00Z",
      updated_at: "2025-08-20T10:30:00Z"
    },
    {
      id: "2", 
      email: "designer1@example.com",
      name: "이디자이너",
      phone: "010-9876-5432",
      role: "designer",
      experience: "5년",
      specialization: ["브랜딩", "UI/UX"],
      portfolio_url: "https://portfolio.com/designer1",
      strengths: ["창의성", "소통능력"],
      created_at: "2025-02-01T14:20:00Z",
      updated_at: "2025-08-19T16:45:00Z"
    },
    {
      id: "3",
      email: "client2@example.com", 
      name: "박대표",
      phone: "010-5555-1234",
      role: "client",
      company: "박스디자인",
      department: "경영진",
      title: "대표이사",
      created_at: "2025-03-10T11:30:00Z",
      updated_at: "2025-08-18T08:15:00Z"
    }
  ];

  // Mock 제재 데이터
  const mockSanctions: UserSanction[] = [
    {
      id: "s1",
      user_id: "2",
      sanction_type: "warning",
      reason: "부적절한 커뮤니케이션",
      start_date: "2025-08-15T00:00:00Z",
      is_active: true,
      issued_by: "admin-1",
      notes: "1차 경고"
    }
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getUserSanctions = (userId: string) => {
    return mockSanctions.filter(s => s.user_id === userId && s.is_active);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleSanctionUser = (user: User) => {
    setSelectedUser(user);
    setShowSanctionModal(true);
  };

  const SanctionModal = () => {
    const [sanctionType, setSanctionType] = useState<"warning" | "suspension" | "ban">("warning");
    const [reason, setReason] = useState("");

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">사용자 제재</h3>
          <p className="text-sm text-gray-600 mb-4">
            {selectedUser?.name} ({selectedUser?.email})
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제재 유형
              </label>
              <select 
                value={sanctionType}
                onChange={(e) => setSanctionType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="warning">경고</option>
                <option value="suspension">정지</option>
                <option value="ban">차단</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제재 사유
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md h-20"
                placeholder="제재 사유를 입력하세요..."
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowSanctionModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={() => {
                // TODO: 제재 처리 로직
                setShowSanctionModal(false);
              }}
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              제재 실행
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          사용자 추가
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="이름 또는 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">모든 역할</option>
              <option value="client">클라이언트</option>
              <option value="designer">디자이너</option>
              <option value="admin">관리자</option>
            </select>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const sanctions = getUserSanctions(user.id);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.role === 'client' && user.company && (
                            <div className="text-xs text-gray-400">
                              {user.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'client' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'designer' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.role === 'client' ? '클라이언트' :
                         user.role === 'designer' ? '디자이너' : '관리자'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sanctions.length > 0 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          제재중 ({sanctions.length})
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          정상
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        상세보기
                      </button>
                      <button 
                        onClick={() => handleSanctionUser(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        제재
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 사용자</h3>
          <p className="text-2xl font-bold text-gray-900">{mockUsers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">디자이너</h3>
          <p className="text-2xl font-bold text-green-600">
            {mockUsers.filter(u => u.role === 'designer').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">제재 중인 사용자</h3>
          <p className="text-2xl font-bold text-red-600">{mockSanctions.length}</p>
        </div>
      </div>

      {showSanctionModal && <SanctionModal />}
    </div>
  );
}