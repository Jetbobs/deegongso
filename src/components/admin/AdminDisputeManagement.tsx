"use client";

import { useState } from "react";
import { Dispute } from "@/types";

export default function AdminDisputeManagement() {
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "investigating" | "resolved" | "closed">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high" | "urgent">("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock 분쟁 데이터
  const mockDisputes: Dispute[] = [
    {
      id: "DIS-001",
      project_id: "PRJ-001",
      reporter_id: "client-1",
      reported_id: "designer-1",
      dispute_type: "quality",
      status: "open",
      priority: "high",
      description: "완성된 로고 디자인이 요구사항과 다릅니다. 색상과 폰트가 브리핑과 전혀 다르며, 수정 요청에도 불구하고 적절한 대응이 없었습니다.",
      evidence_files: ["logo_original.png", "requirements.pdf"],
      created_at: "2025-08-20T10:30:00Z",
      assigned_admin_id: "admin-1"
    },
    {
      id: "DIS-002", 
      project_id: "PRJ-002",
      reporter_id: "designer-2",
      reported_id: "client-2",
      dispute_type: "payment",
      status: "investigating",
      priority: "urgent",
      description: "프로젝트 완료 후 결제가 이루어지지 않고 있습니다. 클라이언트와 연락이 되지 않는 상황입니다.",
      evidence_files: ["project_completion.pdf", "payment_request.pdf"],
      admin_notes: "클라이언트 연락처 확인 중. 법무팀과 협의 필요.",
      created_at: "2025-08-19T14:20:00Z",
      assigned_admin_id: "admin-1"
    },
    {
      id: "DIS-003",
      project_id: "PRJ-003", 
      reporter_id: "client-3",
      reported_id: "designer-3",
      dispute_type: "deadline",
      status: "resolved",
      priority: "medium",
      description: "약속된 마감일을 2주나 넘겼습니다. 사전 고지도 없었습니다.",
      evidence_files: ["timeline.pdf"],
      resolution: "디자이너가 일정 지연에 대해 사과하고 추가 보상을 제공하기로 합의. 향후 프로젝트 관리 강화.",
      created_at: "2025-08-15T09:00:00Z",
      resolved_at: "2025-08-18T16:30:00Z",
      assigned_admin_id: "admin-2"
    }
  ];

  const filteredDisputes = mockDisputes.filter(dispute => {
    const matchesStatus = filterStatus === "all" || dispute.status === filterStatus;
    const matchesPriority = filterPriority === "all" || dispute.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800";
      case "investigating": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDisputeTypeLabel = (type: string) => {
    switch (type) {
      case "payment": return "결제 분쟁";
      case "quality": return "품질 분쟁";
      case "deadline": return "일정 분쟁";
      case "communication": return "소통 분쟁";
      default: return "기타";
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const handleViewDetail = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowDetailModal(true);
  };

  const DisputeDetailModal = () => {
    if (!selectedDispute) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">분쟁 상세 정보</h3>
            <button 
              onClick={() => setShowDetailModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">기본 정보</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>분쟁 ID:</strong> {selectedDispute.id}</p>
                  <p><strong>프로젝트 ID:</strong> {selectedDispute.project_id}</p>
                  <p><strong>분쟁 유형:</strong> {getDisputeTypeLabel(selectedDispute.dispute_type)}</p>
                  <p><strong>상태:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedDispute.status)}`}>
                      {selectedDispute.status}
                    </span>
                  </p>
                  <p><strong>우선순위:</strong>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedDispute.priority)}`}>
                      {selectedDispute.priority}
                    </span>
                  </p>
                  <p><strong>신고일:</strong> {formatDateTime(selectedDispute.created_at)}</p>
                </div>
              </div>

              {/* 증거 파일 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">증거 파일</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {selectedDispute.evidence_files.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedDispute.evidence_files.map((file, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span>📎</span>
                          <span className="text-blue-600 hover:underline cursor-pointer">{file}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">증거 파일이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 분쟁 내용 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">분쟁 내용</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedDispute.description}</p>
                </div>
              </div>

              {/* 관리자 메모 */}
              {selectedDispute.admin_notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">관리자 메모</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedDispute.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* 해결 내용 */}
              {selectedDispute.resolution && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">해결 내용</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedDispute.resolution}</p>
                    {selectedDispute.resolved_at && (
                      <p className="text-sm text-gray-500 mt-2">
                        해결일: {formatDateTime(selectedDispute.resolved_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3 mt-6 pt-6 border-t">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              담당자 지정
            </button>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
              조사 시작
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              해결 완료
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              메모 추가
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">분쟁 관리</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
            긴급 분쟁 처리
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            리포트 생성
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">전체 분쟁</h3>
          <p className="text-2xl font-bold text-gray-900">{mockDisputes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">처리 대기</h3>
          <p className="text-2xl font-bold text-red-600">
            {mockDisputes.filter(d => d.status === 'open').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">조사 중</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {mockDisputes.filter(d => d.status === 'investigating').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">해결 완료</h3>
          <p className="text-2xl font-bold text-green-600">
            {mockDisputes.filter(d => d.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">모든 상태</option>
              <option value="open">처리 대기</option>
              <option value="investigating">조사 중</option>
              <option value="resolved">해결됨</option>
              <option value="closed">종료됨</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">모든 우선순위</option>
              <option value="urgent">긴급</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
        </div>
      </div>

      {/* 분쟁 목록 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  분쟁 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신고일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {dispute.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        프로젝트: {dispute.project_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getDisputeTypeLabel(dispute.dispute_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(dispute.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewDetail(dispute)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      상세보기
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      처리
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && <DisputeDetailModal />}
    </div>
  );
}