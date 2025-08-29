"use client";

import { useState, useRef } from "react";
import { ProjectProposal } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface ClientInputFormProps {
  proposal: ProjectProposal;
  onSubmit: (updatedProposal: ProjectProposal) => void;
  onComment: (comment: string) => void;
}

export default function ClientInputForm({
  proposal,
  onSubmit,
  onComment
}: ClientInputFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [clientData, setClientData] = useState({
    detailed_requirements: proposal.client_section?.detailed_requirements || "",
    preferred_start_date: proposal.client_section?.preferred_timeline?.start_date || "",
    preferred_end_date: proposal.client_section?.preferred_timeline?.end_date || "",
    special_deadlines: proposal.client_section?.preferred_timeline?.special_deadlines || "",
    budget_acceptable: proposal.client_section?.budget_feedback?.is_acceptable ?? true,
    counter_offer: proposal.client_section?.budget_feedback?.counter_offer || "",
    budget_notes: proposal.client_section?.budget_feedback?.budget_notes || "",
    additional_requests: proposal.client_section?.additional_requests || "",
    client_notes: proposal.client_section?.client_notes || ""
  });

  const updateClientData = (field: keyof typeof clientData, value: string | boolean) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    const updatedProposal: ProjectProposal = {
      ...proposal,
      client_section: {
        detailed_requirements: clientData.detailed_requirements,
        reference_materials: attachedFiles.map(f => f.name), // 실제로는 업로드된 파일 경로
        preferred_timeline: {
          start_date: clientData.preferred_start_date,
          end_date: clientData.preferred_end_date,
          special_deadlines: clientData.special_deadlines
        },
        budget_feedback: {
          is_acceptable: clientData.budget_acceptable,
          counter_offer: clientData.counter_offer ? parseInt(String(clientData.counter_offer)) : undefined,
          budget_notes: clientData.budget_notes
        },
        additional_requests: clientData.additional_requests,
        client_notes: clientData.client_notes
      },
      collaboration_status: "designer_review",
      last_modified_by: "client",
      updated_at: new Date().toISOString()
    };

    onSubmit(updatedProposal);
    setIsSubmitting(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onComment(newComment.trim());
      setNewComment("");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 제안서 요약 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{proposal.name}</h2>
            <div className="badge badge-info">클라이언트 정보 입력</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-base-content/70">카테고리</div>
                <div>{proposal.category}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-base-content/70">예상 견적</div>
                <div className="text-lg font-bold text-primary">
                  {formatPrice(proposal.designer_section.estimated_price)}원
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-base-content/70">작업 기간</div>
                <div>{proposal.designer_section.suggested_timeline.total_duration}일</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-base-content/70">수정 횟수</div>
                <div>{proposal.designer_section.total_modification_count}회</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-base-content/70">결제 조건</div>
                <div>선급금/잔금 분할</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-base-content/70">서비스 범위</div>
                <div className="text-xs line-clamp-3">{proposal.designer_section.service_scope}</div>
              </div>
            </div>
          </div>

          {proposal.designer_section.designer_notes && (
            <div className="mt-4 p-3 bg-info/10 rounded-lg">
              <div className="font-medium text-sm mb-1">💬 디자이너 메시지</div>
              <div className="text-sm">{proposal.designer_section.designer_notes}</div>
            </div>
          )}
        </div>
      </div>

      {/* 클라이언트 정보 입력 폼 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-6">📝 추가 정보 입력</h3>

          <div className="space-y-6">
            {/* 구체적 요구사항 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                구체적인 요구사항 *
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-32"
                placeholder="프로젝트에 대한 구체적인 요구사항을 상세히 작성해주세요...&#10;&#10;예시:&#10;- 브랜드 컬러: 파란색 계열 선호&#10;- 스타일: 모던하고 심플한 느낌&#10;- 타겟 연령대: 20-30대&#10;- 참고하고 싶은 브랜드: Apple, Google"
                value={clientData.detailed_requirements}
                onChange={(e) => updateClientData("detailed_requirements", e.target.value)}
              />
            </div>

            {/* 참고자료 업로드 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                참고자료 첨부
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline btn-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                파일 첨부
              </button>

              {attachedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">첨부된 파일 ({attachedFiles.length}개)</div>
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-base-50 border border-base-300 rounded-lg">
                      <div className="flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <div className="w-12 h-12 bg-base-200 rounded border overflow-hidden">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-base-200 rounded border flex items-center justify-center text-xl">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{file.name}</div>
                        <div className="text-xs text-base-content/60">
                          {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 text-error hover:bg-error/10 p-1 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 희망 일정 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                희망 일정
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">희망 시작일</label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full"
                    value={clientData.preferred_start_date}
                    onChange={(e) => updateClientData("preferred_start_date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">희망 완료일</label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full"
                    value={clientData.preferred_end_date}
                    onChange={(e) => updateClientData("preferred_end_date", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1">특별한 마감일정</label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="예: 출시일 맞춰서 3월 15일까지 완료 필요"
                  value={clientData.special_deadlines}
                  onChange={(e) => updateClientData("special_deadlines", e.target.value)}
                />
              </div>
            </div>

            {/* 예산 관련 */}
            <div className="border border-base-300 rounded-lg p-4">
              <h4 className="font-medium mb-3">💰 예산 검토</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    제안된 견적 ({formatPrice(proposal.designer_section.estimated_price)}원)에 대해
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="budget"
                        className="radio radio-primary radio-sm"
                        checked={clientData.budget_acceptable}
                        onChange={() => updateClientData("budget_acceptable", true)}
                      />
                      <span className="ml-2 text-sm">✅ 적정합니다</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="budget"
                        className="radio radio-primary radio-sm"
                        checked={!clientData.budget_acceptable}
                        onChange={() => updateClientData("budget_acceptable", false)}
                      />
                      <span className="ml-2 text-sm">💭 다른 제안이 있습니다</span>
                    </label>
                  </div>
                </div>

                {!clientData.budget_acceptable && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">희망 예산 (원)</label>
                      <input
                        type="number"
                        className="input input-bordered input-sm w-full"
                        placeholder="1500000"
                        value={clientData.counter_offer}
                        onChange={(e) => updateClientData("counter_offer", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">예산 관련 메모</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full"
                        placeholder="예산 조정 사유를 간략히 설명해주세요"
                        value={clientData.budget_notes}
                        onChange={(e) => updateClientData("budget_notes", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 추가 요청사항 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                추가 요청사항
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-20"
                placeholder="제안서에 포함되지 않은 추가 요청사항이 있다면 입력해주세요..."
                value={clientData.additional_requests}
                onChange={(e) => updateClientData("additional_requests", e.target.value)}
              />
            </div>

            {/* 클라이언트 메모 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                디자이너에게 전달할 메시지
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-20"
                placeholder="디자이너에게 전달하고 싶은 메시지나 질문이 있다면 작성해주세요..."
                value={clientData.client_notes}
                onChange={(e) => updateClientData("client_notes", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">💬 질문 & 답변</h3>
          
          {/* 기존 댓글들 */}
          <div className="space-y-3 mb-4">
            {proposal.comments.map((comment, index) => (
              <div key={index} className={`chat ${comment.author_type === 'client' ? 'chat-end' : 'chat-start'}`}>
                <div className="chat-bubble">
                  <div className="text-xs opacity-70 mb-1">
                    {comment.author_type === 'designer' ? '👨‍🎨 디자이너' : '👤 클라이언트'}
                  </div>
                  {comment.content}
                </div>
              </div>
            ))}
          </div>

          {/* 새 댓글 입력 */}
          <div className="flex space-x-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="궁금한 점을 질문해주세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              className="btn btn-primary btn-sm"
              disabled={!newComment.trim()}
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-lg"
          disabled={isSubmitting || !clientData.detailed_requirements}
        >
          {isSubmitting ? (
            <div className="loading loading-spinner loading-sm" />
          ) : (
            "정보 제출 및 디자이너에게 검토 요청"
          )}
        </button>
      </div>
    </div>
  );
}