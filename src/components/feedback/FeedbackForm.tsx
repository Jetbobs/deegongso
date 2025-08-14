"use client";

import { useState, useRef } from "react";
import { Feedback, FeedbackAttachment } from "@/types";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackFormProps {
  projectId: string;
  reportId: string;
  onSubmit: (
    feedback: Omit<Feedback, "id" | "submitted_at" | "updated_at" | "version">
  ) => void;
  onCancel: () => void;
  existingFeedback?: Feedback;
}

export default function FeedbackForm({
  projectId,
  reportId,
  onSubmit,
  onCancel,
  existingFeedback,
}: FeedbackFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(existingFeedback?.content_html || "");
  const [priority, setPriority] = useState<Feedback["priority"]>(
    existingFeedback?.priority || "medium"
  );
  const [category, setCategory] = useState<Feedback["category"]>(
    existingFeedback?.category || "design"
  );
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>(
    existingFeedback?.attachments || []
  );
  const [title, setTitle] = useState<string>(
    existingFeedback?.content?.split("\n")[0] || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      const attachment: FeedbackAttachment = {
        id: Date.now().toString() + Math.random(),
        feedback_id: "", // 나중에 설정됨
        file_name: file.name,
        file_url: URL.createObjectURL(file), // Mock URL
        file_type: file.type,
        file_size: file.size,
        thumbnail_url: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        uploaded_at: new Date().toISOString(),
      };

      setAttachments((prev) => [...prev, attachment]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!content.trim() && attachments.length === 0) {
      alert("피드백 내용을 입력하거나 파일을 첨부해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 제목이 있으면 내용 앞에 추가
      const finalContent = title.trim()
        ? `<h2>${title.trim()}</h2>${content}`
        : content;

      const feedbackData: Omit<
        Feedback,
        "id" | "submitted_at" | "updated_at" | "version"
      > = {
        project_id: projectId,
        report_id: reportId,
        content: finalContent.replace(/<[^>]*>/g, ""), // HTML 태그 제거
        content_html: finalContent,
        attachments,
        priority,
        category,
        is_official: !isDraft,
        status: isDraft ? "pending" : "pending",
        client_id: user?.id || "",
        parent_feedback_id: existingFeedback?.parent_feedback_id,
        revision_request_count: 0,
      };

      onSubmit(feedbackData);
    } catch (error) {
      console.error("피드백 제출 오류:", error);
      alert("피드백 제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityInfo = (priority: Feedback["priority"]) => {
    const info = {
      low: { label: "낮음", color: "success", icon: "⬇️" },
      medium: { label: "보통", color: "warning", icon: "➡️" },
      high: { label: "높음", color: "error", icon: "⬆️" },
      critical: { label: "긴급", color: "error", icon: "🔥" },
    };
    return info[priority];
  };

  const getCategoryInfo = (category: Feedback["category"]) => {
    const info = {
      design: { label: "디자인", icon: "🎨" },
      content: { label: "콘텐츠", icon: "📝" },
      functionality: { label: "기능", icon: "⚙️" },
      technical: { label: "기술", icon: "🔧" },
      other: { label: "기타", icon: "💬" },
    };
    return info[category];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {existingFeedback ? "피드백 수정" : "새 피드백 작성"}
          </h3>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* 제목 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">제목</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="피드백 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* 우선순위 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">우선순위</label>
          <select
            className="select select-bordered w-full"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as Feedback["priority"])
            }
            disabled={isSubmitting}
          >
            {(
              ["low", "medium", "high", "critical"] as Feedback["priority"][]
            ).map((priorityKey) => {
              const info = getPriorityInfo(priorityKey);
              return (
                <option key={priorityKey} value={priorityKey}>
                  {info.icon} {info.label}
                </option>
              );
            })}
          </select>
        </div>

        {/* 카테고리 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">카테고리</label>
          <select
            className="select select-bordered w-full"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as Feedback["category"])
            }
            disabled={isSubmitting}
          >
            {(
              [
                "design",
                "content",
                "functionality",
                "technical",
                "other",
              ] as Feedback["category"][]
            ).map((categoryKey) => {
              const info = getCategoryInfo(categoryKey);
              return (
                <option key={categoryKey} value={categoryKey}>
                  {info.icon} {info.label}
                </option>
              );
            })}
          </select>
        </div>

        {/* 리치 텍스트 에디터 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">피드백 내용</label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="피드백 내용을 자세히 작성해주세요..."
            minHeight="300px"
            editable={!isSubmitting}
          />
        </div>

        {/* 파일 첨부 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">첨부파일</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="file-input file-input-bordered flex-1"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              📎 파일 선택
            </button>
          </div>
        </div>

        {/* 첨부파일 목록 */}
        {attachments.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              첨부된 파일 ({attachments.length})
            </label>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {attachment.thumbnail_url ? (
                      <img
                        src={attachment.thumbnail_url}
                        alt={attachment.file_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-base-300 rounded flex items-center justify-center">
                        📄
                      </div>
                    )}
                    <div>
                      <p className="font-medium truncate max-w-48">
                        {attachment.file_name}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="btn btn-ghost btn-sm text-error"
                    disabled={isSubmitting}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-base-content/60">
              {(content.length > 0 || title.length > 0) &&
                `${(title + content).replace(/<[^>]*>/g, "").length}자`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSubmit(true)}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading loading-spinner loading-sm" />
              ) : (
                "임시저장"
              )}
            </button>
            <button
              onClick={onCancel}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading loading-spinner loading-sm" />
              ) : existingFeedback ? (
                "수정 완료"
              ) : (
                "피드백 제출"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
