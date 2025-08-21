"use client";

import { useState } from "react";
import { Announcement, AnnouncementFormData } from "@/types";

export default function AdminAnnouncementManagement() {
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "scheduled">("all");
  const [filterTarget, setFilterTarget] = useState<"all" | "client" | "designer">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock 공지사항 데이터
  const mockAnnouncements: Announcement[] = [
    {
      id: "ANN-001",
      title: "시스템 점검 안내",
      content: "2025년 8월 25일 오전 2시부터 4시까지 시스템 점검이 진행됩니다. 점검 중에는 서비스 이용이 제한될 수 있습니다.",
      content_html: "<p>2025년 8월 25일 오전 2시부터 4시까지 시스템 점검이 진행됩니다.</p><p>점검 중에는 서비스 이용이 제한될 수 있습니다.</p>",
      status: "published",
      priority: "important",
      target_audience: "all",
      total_recipients: 1247,
      read_count: 892,
      read_rate: 71.5,
      created_by: "admin-1",
      created_at: "2025-08-20T10:00:00Z",
      updated_at: "2025-08-20T10:30:00Z",
      published_at: "2025-08-20T10:30:00Z",
      is_pinned: true,
      allow_comments: false,
      send_push: true,
      send_email: true
    },
    {
      id: "ANN-002",
      title: "신규 결제 방식 추가",
      content: "이제 가상계좌 결제가 가능합니다. 더욱 편리한 결제 서비스를 이용해보세요.",
      content_html: "<p>이제 가상계좌 결제가 가능합니다.</p><p>더욱 편리한 결제 서비스를 이용해보세요.</p>",
      status: "published",
      priority: "normal",
      target_audience: "client",
      total_recipients: 758,
      read_count: 623,
      read_rate: 82.2,
      created_by: "admin-1",
      created_at: "2025-08-18T14:00:00Z",
      updated_at: "2025-08-18T14:00:00Z",
      published_at: "2025-08-18T14:00:00Z",
      is_pinned: false,
      allow_comments: true,
      send_push: true,
      send_email: false
    },
    {
      id: "ANN-003",
      title: "디자이너 포트폴리오 업로드 기능 개선",
      content: "포트폴리오 업로드 시 더 많은 파일 형식을 지원하며, 용량 제한이 확대되었습니다.",
      content_html: "<p>포트폴리오 업로드 시 더 많은 파일 형식을 지원하며, 용량 제한이 확대되었습니다.</p>",
      status: "scheduled",
      priority: "normal",
      target_audience: "designer",
      publish_at: "2025-08-22T09:00:00Z",
      total_recipients: 489,
      read_count: 0,
      read_rate: 0,
      created_by: "admin-2",
      created_at: "2025-08-19T16:30:00Z",
      updated_at: "2025-08-19T16:30:00Z",
      is_pinned: false,
      allow_comments: true,
      send_push: true,
      send_email: true
    },
    {
      id: "ANN-004",
      title: "긴급: 보안 업데이트 적용",
      content: "보안 강화를 위한 업데이트가 진행되었습니다. 모든 사용자는 비밀번호를 변경해주시기 바랍니다.",
      content_html: "<p><strong>보안 강화를 위한 업데이트가 진행되었습니다.</strong></p><p>모든 사용자는 비밀번호를 변경해주시기 바랍니다.</p>",
      status: "published",
      priority: "urgent",
      target_audience: "all",
      total_recipients: 1247,
      read_count: 1156,
      read_rate: 92.7,
      created_by: "admin-1",
      created_at: "2025-08-17T08:00:00Z",
      updated_at: "2025-08-17T08:00:00Z",
      published_at: "2025-08-17T08:00:00Z",
      is_pinned: true,
      allow_comments: false,
      send_push: true,
      send_email: true
    }
  ];

  const filteredAnnouncements = mockAnnouncements.filter(announcement => {
    const matchesStatus = filterStatus === "all" || announcement.status === filterStatus;
    const matchesTarget = filterTarget === "all" || announcement.target_audience === filterTarget;
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesTarget && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "published": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "deleted": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white";
      case "important": return "bg-yellow-500 text-white";
      case "normal": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case "all": return "전체";
      case "client": return "클라이언트";
      case "designer": return "디자이너";
      default: return "전체";
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      // TODO: 삭제 로직
      console.log("Delete announcement:", id);
    }
  };

  const AnnouncementModal = ({ isEdit = false }: { isEdit?: boolean }) => {
    const [formData, setFormData] = useState<AnnouncementFormData>({
      title: isEdit ? selectedAnnouncement?.title || "" : "",
      content: isEdit ? selectedAnnouncement?.content || "" : "",
      priority: isEdit ? selectedAnnouncement?.priority || "normal" : "normal",
      target_audience: isEdit ? selectedAnnouncement?.target_audience || "all" : "all",
      publish_at: isEdit ? selectedAnnouncement?.publish_at : undefined,
      expires_at: isEdit ? selectedAnnouncement?.expires_at : undefined,
      is_pinned: isEdit ? selectedAnnouncement?.is_pinned || false : false,
      allow_comments: isEdit ? selectedAnnouncement?.allow_comments || false : false,
      send_push: isEdit ? selectedAnnouncement?.send_push || false : true,
      send_email: isEdit ? selectedAnnouncement?.send_email || false : false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // TODO: 저장 로직
      console.log("Save announcement:", formData);
      if (isEdit) {
        setShowEditModal(false);
        setSelectedAnnouncement(null);
      } else {
        setShowCreateModal(false);
      }
    };

    const closeModal = () => {
      if (isEdit) {
        setShowEditModal(false);
        setSelectedAnnouncement(null);
      } else {
        setShowCreateModal(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {isEdit ? "공지사항 수정" : "새 공지사항 작성"}
            </h3>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="공지사항 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-md h-32"
                placeholder="공지사항 내용을 입력하세요"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({...prev, priority: e.target.value as any}))}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="normal">일반</option>
                  <option value="important">중요</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">발송 대상</label>
                <select
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({...prev, target_audience: e.target.value as any}))}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="all">전체 사용자</option>
                  <option value="client">클라이언트만</option>
                  <option value="designer">디자이너만</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예약 발송 (선택사항)
              </label>
              <input
                type="datetime-local"
                value={formData.publish_at ? new Date(formData.publish_at).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  publish_at: e.target.value ? new Date(e.target.value).toISOString() : undefined
                }))}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                설정하지 않으면 즉시 발송됩니다
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData(prev => ({...prev, is_pinned: e.target.checked}))}
                  className="mr-2"
                />
                <label htmlFor="is_pinned" className="text-sm text-gray-700">
                  상단 고정
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allow_comments"
                  checked={formData.allow_comments}
                  onChange={(e) => setFormData(prev => ({...prev, allow_comments: e.target.checked}))}
                  className="mr-2"
                />
                <label htmlFor="allow_comments" className="text-sm text-gray-700">
                  댓글 허용
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="send_push"
                  checked={formData.send_push}
                  onChange={(e) => setFormData(prev => ({...prev, send_push: e.target.checked}))}
                  className="mr-2"
                />
                <label htmlFor="send_push" className="text-sm text-gray-700">
                  푸시 알림 발송
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="send_email"
                  checked={formData.send_email}
                  onChange={(e) => setFormData(prev => ({...prev, send_email: e.target.checked}))}
                  className="mr-2"
                />
                <label htmlFor="send_email" className="text-sm text-gray-700">
                  이메일 발송
                </label>
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {isEdit ? "수정" : "작성"} 완료
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          📝 새 공지사항 작성
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">전체 공지사항</h3>
          <p className="text-2xl font-bold text-gray-900">{mockAnnouncements.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">발송됨</h3>
          <p className="text-2xl font-bold text-green-600">
            {mockAnnouncements.filter(a => a.status === 'published').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">예약됨</h3>
          <p className="text-2xl font-bold text-blue-600">
            {mockAnnouncements.filter(a => a.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">평균 읽음률</h3>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(mockAnnouncements.reduce((acc, a) => acc + a.read_rate, 0) / mockAnnouncements.length)}%
          </p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="제목이나 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">모든 상태</option>
              <option value="draft">임시저장</option>
              <option value="published">발송됨</option>
              <option value="scheduled">예약됨</option>
            </select>
          </div>
          <div>
            <select
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">모든 대상</option>
              <option value="client">클라이언트</option>
              <option value="designer">디자이너</option>
            </select>
          </div>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  공지사항
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대상
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  읽음률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnnouncements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">
                          {announcement.title}
                        </div>
                        {announcement.is_pinned && (
                          <span className="text-yellow-500 text-sm">📌</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {announcement.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                      {announcement.status === 'draft' ? '임시저장' :
                       announcement.status === 'published' ? '발송됨' :
                       announcement.status === 'scheduled' ? '예약됨' : '삭제됨'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTargetLabel(announcement.target_audience)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority === 'urgent' ? '긴급' :
                       announcement.priority === 'important' ? '중요' : '일반'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {announcement.read_rate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {announcement.read_count}/{announcement.total_recipients}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(announcement.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEdit(announcement)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모달들 */}
      {showCreateModal && <AnnouncementModal />}
      {showEditModal && <AnnouncementModal isEdit={true} />}
    </div>
  );
}