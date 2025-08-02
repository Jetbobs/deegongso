"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// 메시지 관련 타입 정의
interface Message {
  id: string;
  sender: "me" | "other";
  content: string;
  timestamp: string;
  file?: {
    name: string;
    size: string;
    type: string;
  };
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
  };
  project: {
    id: string;
    name: string;
    color: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    sender: "me" | "other";
  };
  unreadCount: number;
  messages: Message[];
}

// 모의 대화 데이터
const mockConversations: Conversation[] = [
  {
    id: "1",
    participant: {
      id: "designer-1",
      name: "김디자이너",
      avatar: "김",
    },
    project: {
      id: "project-1",
      name: "로고 프로젝트",
      color: "primary",
    },
    lastMessage: {
      content: "로고 디자인 초안을 업로드했습니다.",
      timestamp: "2024-01-20T10:30:00Z",
      sender: "other",
    },
    unreadCount: 3,
    messages: [
      {
        id: "msg-1",
        sender: "other",
        content:
          "안녕하세요! 로고 디자인 초안을 완성했습니다. 확인 후 피드백 부탁드립니다.",
        timestamp: "2024-01-20T10:30:00Z",
      },
      {
        id: "msg-2",
        sender: "other",
        content: "첨부파일을 확인해주세요.",
        timestamp: "2024-01-20T10:31:00Z",
        file: {
          name: "logo_design_v1.pdf",
          size: "2.3 MB",
          type: "pdf",
        },
      },
      {
        id: "msg-3",
        sender: "me",
        content:
          "네, 확인했습니다! 전체적인 디자인은 마음에 들어요. 다만 컬러를 조금 더 밝게 할 수 있을까요?",
        timestamp: "2024-01-20T11:15:00Z",
      },
      {
        id: "msg-4",
        sender: "other",
        content:
          "물론입니다! 어떤 컬러 톤을 원하시는지 좀 더 구체적으로 알려주시면 반영해서 수정해드릴게요.",
        timestamp: "2024-01-20T11:30:00Z",
      },
    ],
  },
  {
    id: "2",
    participant: {
      id: "designer-2",
      name: "이디자이너",
      avatar: "이",
    },
    project: {
      id: "project-2",
      name: "웹사이트 프로젝트",
      color: "secondary",
    },
    lastMessage: {
      content: "일정 변경이 필요할 것 같습니다.",
      timestamp: "2024-01-20T08:00:00Z",
      sender: "other",
    },
    unreadCount: 0,
    messages: [
      {
        id: "msg-5",
        sender: "other",
        content:
          "일정 변경이 필요할 것 같습니다. 다음 주 월요일까지 완료 가능할까요?",
        timestamp: "2024-01-20T08:00:00Z",
      },
      {
        id: "msg-6",
        sender: "me",
        content: "네, 괜찮습니다. 일정 변경 요청 드릴게요.",
        timestamp: "2024-01-20T09:00:00Z",
      },
    ],
  },
  {
    id: "3",
    participant: {
      id: "designer-3",
      name: "박디자이너",
      avatar: "박",
    },
    project: {
      id: "project-3",
      name: "브랜딩 프로젝트",
      color: "accent",
    },
    lastMessage: {
      content: "프로젝트가 성공적으로 완료되었습니다!",
      timestamp: "2024-01-19T15:00:00Z",
      sender: "other",
    },
    unreadCount: 0,
    messages: [
      {
        id: "msg-7",
        sender: "other",
        content:
          "프로젝트가 성공적으로 완료되었습니다! 협업해주셔서 감사합니다.",
        timestamp: "2024-01-19T15:00:00Z",
      },
      {
        id: "msg-8",
        sender: "me",
        content: "저도 감사합니다! 결과물이 정말 마음에 들어요.",
        timestamp: "2024-01-19T15:30:00Z",
      },
    ],
  },
];

export default function MessagesPage() {
  const userRole = "client" as const;

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string>("1");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");
  const [messageSearchTerm, setMessageSearchTerm] = useState("");

  // 필터링된 대화 목록
  const filteredConversations = useMemo(() => {
    let filtered = mockConversations.filter((conversation) => {
      // 읽지 않은 메시지만 보기 필터
      if (showUnreadOnly && conversation.unreadCount === 0) {
        return false;
      }

      // 프로젝트 필터
      if (
        projectFilter !== "all" &&
        conversation.project.id !== projectFilter
      ) {
        return false;
      }

      // 검색어 필터
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesParticipant = conversation.participant.name
          .toLowerCase()
          .includes(searchLower);
        const matchesProject = conversation.project.name
          .toLowerCase()
          .includes(searchLower);
        const matchesLastMessage = conversation.lastMessage.content
          .toLowerCase()
          .includes(searchLower);

        if (!matchesParticipant && !matchesProject && !matchesLastMessage) {
          return false;
        }
      }

      return true;
    });

    // 최근 메시지 순으로 정렬
    filtered.sort(
      (a, b) =>
        new Date(b.lastMessage.timestamp).getTime() -
        new Date(a.lastMessage.timestamp).getTime()
    );

    return filtered;
  }, [searchTerm, showUnreadOnly, projectFilter]);

  // 선택된 대화의 메시지 필터링
  const currentConversation = mockConversations.find(
    (c) => c.id === selectedConversation
  );
  const filteredMessages = useMemo(() => {
    if (!currentConversation || !messageSearchTerm) {
      return currentConversation?.messages || [];
    }

    return currentConversation.messages.filter(
      (message) =>
        message.content
          .toLowerCase()
          .includes(messageSearchTerm.toLowerCase()) ||
        message.file?.name
          .toLowerCase()
          .includes(messageSearchTerm.toLowerCase())
    );
  }, [currentConversation, messageSearchTerm]);

  // 시간 포맷팅 함수
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 0 ? "방금 전" : `${diffMinutes}분 전`;
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setShowUnreadOnly(false);
    setProjectFilter("all");
    setMessageSearchTerm("");
  };

  const totalUnreadCount = mockConversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  return (
    <DashboardLayout title="메시지" userRole={userRole}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* 대화 목록 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm h-full">
            <div className="card-body p-0">
              <div className="p-4 border-b border-base-300">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="card-title">
                    대화 목록
                    {totalUnreadCount > 0 && (
                      <span className="badge badge-primary">
                        {totalUnreadCount}
                      </span>
                    )}
                  </h2>
                  {(searchTerm ||
                    showUnreadOnly ||
                    projectFilter !== "all") && (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={clearFilters}
                    >
                      🗑️ 초기화
                    </button>
                  )}
                </div>

                {/* 검색 */}
                <div className="space-y-2">
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      placeholder="대화 상대, 프로젝트, 메시지 검색..."
                      className="input input-bordered input-sm flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSearchTerm("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* 필터 */}
                  <div className="flex gap-2">
                    <select
                      className="select select-bordered select-xs flex-1"
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                    >
                      <option value="all">모든 프로젝트</option>
                      <option value="project-1">로고 프로젝트</option>
                      <option value="project-2">웹사이트 프로젝트</option>
                      <option value="project-3">브랜딩 프로젝트</option>
                    </select>

                    <button
                      className={`btn btn-xs ${
                        showUnreadOnly ? "btn-primary" : "btn-outline"
                      }`}
                      onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    >
                      읽지 않음
                    </button>
                  </div>

                  {/* 검색 결과 요약 */}
                  {(searchTerm ||
                    showUnreadOnly ||
                    projectFilter !== "all") && (
                    <div className="text-xs text-base-content/60">
                      {filteredConversations.length}개의 대화
                      {searchTerm && ` · "${searchTerm}" 검색`}
                      {showUnreadOnly && " · 읽지 않음만"}
                      {projectFilter !== "all" && " · 프로젝트 필터"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">
                      {showUnreadOnly ? "📬" : searchTerm ? "🔍" : "💬"}
                    </div>
                    <p className="text-sm text-base-content/60">
                      {showUnreadOnly
                        ? "읽지 않은 메시지가 없습니다"
                        : searchTerm
                        ? "검색 결과가 없습니다"
                        : "대화가 없습니다"}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center space-x-3 p-4 hover:bg-base-200 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? "border-l-4 border-primary bg-base-200"
                          : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="avatar">
                        <div
                          className={`w-12 rounded-full bg-${conversation.project.color} text-${conversation.project.color}-content flex items-center justify-center`}
                        >
                          <span className="text-sm">
                            {conversation.participant.avatar}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {conversation.participant.name}
                          </p>
                          <span className="text-xs text-base-content/60">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate ${
                            conversation.unreadCount > 0
                              ? "font-medium text-base-content"
                              : "text-base-content/60"
                          }`}
                        >
                          {conversation.lastMessage.sender === "me" && "나: "}
                          {conversation.lastMessage.content}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xs bg-${conversation.project.color} text-${conversation.project.color}-content px-2 py-1 rounded`}
                          >
                            {conversation.project.name}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="badge badge-primary badge-xs">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 대화 영역 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm h-full">
            <div className="card-body p-0 flex flex-col">
              {/* 대화 헤더 */}
              <div className="p-4 border-b border-base-300">
                <div className="flex items-center justify-between mb-3">
                  {currentConversation ? (
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div
                          className={`w-10 rounded-full bg-${currentConversation.project.color} text-${currentConversation.project.color}-content flex items-center justify-center`}
                        >
                          <span className="text-sm">
                            {currentConversation.participant.avatar}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">
                          {currentConversation.participant.name}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {currentConversation.project.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-base-300"></div>
                      <div>
                        <p className="font-medium">대화를 선택해주세요</p>
                        <p className="text-xs text-base-content/60">메시지</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {currentConversation && (
                      <>
                        <button className="btn btn-ghost btn-sm">
                          📹 화상통화
                        </button>
                        <button className="btn btn-ghost btn-sm">
                          📋 프로젝트 보기
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 메시지 검색 */}
                {currentConversation && (
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      placeholder="메시지 내용 검색..."
                      className="input input-bordered input-sm flex-1"
                      value={messageSearchTerm}
                      onChange={(e) => setMessageSearchTerm(e.target.value)}
                    />
                    {messageSearchTerm && (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setMessageSearchTerm("")}
                        >
                          ✕
                        </button>
                        <span className="btn btn-ghost btn-sm pointer-events-none">
                          {filteredMessages.length}개 결과
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!currentConversation ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-bold mb-2">
                      대화를 선택해주세요
                    </h3>
                    <p className="text-base-content/60">
                      왼쪽에서 대화를 선택하면 메시지를 확인할 수 있습니다.
                    </p>
                  </div>
                ) : filteredMessages.length === 0 && messageSearchTerm ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold mb-2">
                      검색 결과가 없습니다
                    </h3>
                    <p className="text-base-content/60">
                      "{messageSearchTerm}"에 대한 메시지를 찾을 수 없습니다.
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.sender === "me" ? "justify-end" : ""
                      }`}
                    >
                      {message.sender === "other" && (
                        <div className="avatar">
                          <div
                            className={`w-8 rounded-full bg-${currentConversation.project.color} text-${currentConversation.project.color}-content flex items-center justify-center`}
                          >
                            <span className="text-xs">
                              {currentConversation.participant.avatar}
                            </span>
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex-1 ${
                          message.sender === "me" ? "max-w-xs ml-auto" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center space-x-2 mb-1 ${
                            message.sender === "me" ? "justify-end" : ""
                          }`}
                        >
                          {message.sender === "me" && (
                            <span className="text-xs text-base-content/60">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          )}
                          <span className="text-sm font-medium">
                            {message.sender === "me"
                              ? "나"
                              : currentConversation.participant.name}
                          </span>
                          {message.sender === "other" && (
                            <span className="text-xs text-base-content/60">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          )}
                        </div>

                        <div
                          className={`rounded-lg p-3 max-w-xs ${
                            message.sender === "me"
                              ? "bg-primary text-primary-content ml-auto"
                              : "bg-base-200"
                          }`}
                        >
                          {message.file ? (
                            <div className="flex items-center space-x-3 p-3 bg-base-100 rounded border">
                              <div className="text-2xl">
                                {message.file.type === "pdf" ? "📄" : "🎨"}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-base-content">
                                  {message.file.name}
                                </p>
                                <p className="text-sm text-base-content/60">
                                  {message.file.size}
                                </p>
                              </div>
                              <button className="btn btn-sm btn-primary">
                                다운로드
                              </button>
                            </div>
                          ) : (
                            <span
                              className={
                                messageSearchTerm &&
                                message.content
                                  .toLowerCase()
                                  .includes(messageSearchTerm.toLowerCase())
                                  ? "bg-yellow-200 text-base-content px-1 rounded"
                                  : ""
                              }
                            >
                              {message.content}
                            </span>
                          )}
                        </div>
                      </div>

                      {message.sender === "me" && (
                        <div className="avatar">
                          <div className="w-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                            <span className="text-xs">나</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 메시지 입력 영역 */}
              <div className="p-4 border-t border-base-300">
                <div className="flex space-x-2">
                  <button className="btn btn-ghost btn-sm">📎</button>
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="input input-bordered flex-1"
                  />
                  <button className="btn btn-primary">전송</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
