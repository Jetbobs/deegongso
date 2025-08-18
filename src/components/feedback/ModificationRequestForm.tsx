"use client";

import { useState, useEffect, useRef } from "react";
import { ModificationRequestFormData, Feedback } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface ModificationRequestFormProps {
  projectId: string;
  availableFeedbacks: Feedback[]; // 선택 가능한 피드백들
  remainingModifications: number; // 남은 수정 횟수
  onSubmit: (data: ModificationRequestFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ModificationRequestForm({
  projectId,
  availableFeedbacks,
  remainingModifications,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ModificationRequestFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ModificationRequestFormData>({
    description: "",
    feedback_ids: [],
    urgency: "normal",
    estimated_completion_date: "",
    notes: ""
  });

  const [checklistItems, setChecklistItems] = useState<string[]>([""]);
  const [newItemInput, setNewItemInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdditionalCostWarning, setShowAdditionalCostWarning] = useState(false);

  useEffect(() => {
    setShowAdditionalCostWarning(remainingModifications <= 0);
  }, [remainingModifications]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = checklistItems.filter(item => item.trim());
    if (validItems.length === 0) {
      alert("최소 1개의 수정사항을 추가해주세요.");
      return;
    }

    // 체크리스트 항목들을 description으로 변환
    const description = validItems.map(item => `- ${item}`).join('\n');
    setFormData(prev => ({ ...prev, description }));

    if (remainingModifications <= 0) {
      const confirmMessage = "잔여 수정 횟수가 없어 추가 비용이 발생합니다. 계속하시겠습니까?";
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ModificationRequestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addChecklistItem = () => {
    if (newItemInput.trim()) {
      setChecklistItems(prev => [...prev.filter(item => item.trim()), newItemInput.trim()]);
      setNewItemInput("");
      updateFormDescription();
    }
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index));
    updateFormDescription();
  };

  const updateChecklistItem = (index: number, value: string) => {
    setChecklistItems(prev => {
      const newItems = [...prev];
      newItems[index] = value;
      return newItems;
    });
    updateFormDescription();
  };

  const updateFormDescription = () => {
    const validItems = checklistItems.filter(item => item.trim());
    const description = validItems.map(item => `- ${item}`).join('\n');
    setFormData(prev => ({
      ...prev,
      description
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addChecklistItem();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    
    // 파일 input 초기화
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

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">새 수정요청 작성</h3>
            <p className="text-sm text-base-content/60">
              잔여 수정 횟수: <span className={`font-medium ${remainingModifications > 0 ? 'text-success' : 'text-error'}`}>
                {remainingModifications}회
              </span>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* 추가 비용 경고 */}
        {showAdditionalCostWarning && (
          <div className="alert alert-warning mb-6">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="font-bold">추가 비용 발생 안내</h3>
                <div className="text-xs">잔여 수정 횟수가 없어 이 요청은 추가 비용이 발생합니다.</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 수정사항 체크리스트 */}
          <div className="mb-6">
            <div className="mb-4">
              <h4 className="text-base font-medium text-base-content">수정사항 체크리스트 *</h4>
              <p className="text-sm text-base-content/60">수정하고 싶은 항목들을 하나씩 추가해주세요</p>
            </div>
            
            {/* 기존 체크리스트 항목들 */}
            <div className="space-y-2 mb-4">
              {checklistItems.filter(item => item.trim()).map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-base-50 border border-base-300 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateChecklistItem(index, e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    placeholder="수정사항을 입력하세요..."
                    disabled={isSubmitting}
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(index)}
                    className="flex-shrink-0 text-error hover:bg-error/10 p-1 rounded"
                    disabled={isSubmitting}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            {/* 새 항목 추가 */}
            <div className="flex items-center space-x-3 p-3 border-2 border-dashed border-base-300 rounded-lg hover:border-primary/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 border-2 border-base-300 rounded"></div>
              </div>
              
              <input
                type="text"
                value={newItemInput}
                onChange={(e) => setNewItemInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent border-none outline-none text-sm"
                placeholder="새 수정사항을 입력하세요..."
                disabled={isSubmitting}
              />
              
              <button
                type="button"
                onClick={addChecklistItem}
                disabled={!newItemInput.trim() || isSubmitting}
                className="flex-shrink-0 btn btn-primary btn-sm btn-circle"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-base-content/50">
                💡 Enter 키를 누르거나 + 버튼을 클릭해서 항목을 추가하세요
              </p>
            </div>
          </div>

          {/* 파일 첨부 */}
          <div className="mb-6">
            <div className="mb-3">
              <h4 className="text-base font-medium text-base-content">참고 파일 첨부</h4>
              <p className="text-sm text-base-content/60">수정요청에 도움이 될 이미지나 파일을 첨부하세요 (선택사항)</p>
            </div>

            {/* 파일 업로드 버튼 */}
            <div className="mb-4">
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
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                파일 첨부
              </button>
            </div>

            {/* 첨부된 파일 목록 */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-base-content/70">
                  첨부된 파일 ({attachedFiles.length}개)
                </div>
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-base-50 border border-base-300 rounded-lg">
                    {/* 파일 미리보기/아이콘 */}
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

                    {/* 파일 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-base-content/60 mt-1">
                        {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 text-error hover:bg-error/10 p-1 rounded"
                      disabled={isSubmitting}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 파일 첨부 안내 */}
            <div className="mt-3 p-3 bg-info/5 border border-info/20 rounded-lg">
              <div className="flex items-start space-x-2 text-sm text-info">
                <span className="flex-shrink-0">💡</span>
                <div>
                  <div className="font-medium mb-1">파일 첨부 도움말</div>
                  <ul className="text-xs space-y-1 text-info/80">
                    <li>• 지원 형식: 이미지, PDF, Word, 텍스트 파일</li>
                    <li>• 최대 파일 크기: 10MB</li>
                    <li>• 참고 이미지나 예시 파일을 첨부하면 더 정확한 작업이 가능합니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>


          {/* 수정요청 미리보기 */}
          {(checklistItems.filter(item => item.trim()).length > 0 || attachedFiles.length > 0) && (
            <div className="mb-6">
              <div className="mb-2">
                <h4 className="text-base font-medium text-base-content">📋 수정요청 미리보기</h4>
              </div>
              
              <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                {/* 체크리스트 항목들 */}
                {checklistItems.filter(item => item.trim()).length > 0 && (
                  <div className="space-y-2 mb-4">
                    {checklistItems.filter(item => item.trim()).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-4 h-4 border border-primary rounded flex items-center justify-center">
                          <span className="text-primary text-xs">✓</span>
                        </div>
                        <span className="text-sm text-base-content">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 첨부파일 미리보기 */}
                {attachedFiles.length > 0 && (
                  <div className="pt-3 border-t border-base-300">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-base-content/70">📎 첨부파일</span>
                      <span className="text-xs text-base-content/50">({attachedFiles.length}개)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-base-200 px-3 py-1 rounded-full">
                          <span className="text-sm">{getFileIcon(file.type)}</span>
                          <span className="text-xs font-medium truncate max-w-24" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {remainingModifications <= 0 && (
                <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-warning">
                    <span>⚠️</span>
                    <span className="text-sm font-medium">잔여 수정횟수가 없어 추가 비용이 발생합니다</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="pt-4 border-t border-base-300">
            <div className="flex items-center justify-between">
              <div className="text-sm text-base-content/60">
                <div className="flex items-center space-x-3">
                  {checklistItems.filter(item => item.trim()).length > 0 && (
                    <span>
                      ✓ {checklistItems.filter(item => item.trim()).length}개 수정사항
                    </span>
                  )}
                  {attachedFiles.length > 0 && (
                    <span>
                      📎 {attachedFiles.length}개 파일
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={`btn btn-sm ${remainingModifications > 0 ? 'btn-primary' : 'btn-warning'}`}
                  disabled={isSubmitting || checklistItems.filter(item => item.trim()).length === 0}
                >
                  {isSubmitting ? (
                    <div className="loading loading-spinner loading-xs" />
                  ) : remainingModifications > 0 ? (
                    "수정요청 제출"
                  ) : (
                    "추가 비용으로 요청하기"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}