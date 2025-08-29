"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ImageUtils } from "@/lib/versionManager";

interface VersionUploadProps {
  onUpload: (files: File[], title?: string, description?: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function VersionUpload({ onUpload, onCancel, isLoading }: VersionUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 처리
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 이미지 파일만 필터링
    const imageFiles = files.filter(file => ImageUtils.isImageFile(file));
    
    if (imageFiles.length !== files.length) {
      alert('이미지 파일만 업로드 가능합니다.');
    }

    if (imageFiles.length === 0) return;

    setSelectedFiles(imageFiles);

    // 미리보기 생성
    const previewUrls = await Promise.all(
      imageFiles.map(file => ImageUtils.generateThumbnail(file))
    );
    setPreviews(previewUrls);
  };

  // 파일 제거
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => ImageUtils.isImageFile(file));
    
    if (imageFiles.length === 0) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedFiles(imageFiles);

    // 미리보기 생성
    const previewUrls = await Promise.all(
      imageFiles.map(file => ImageUtils.generateThumbnail(file))
    );
    setPreviews(previewUrls);
  };

  // 업로드 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    await onUpload(selectedFiles, title || undefined, description || undefined);
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 파일 업로드 영역 */}
          <div>
            <label className="label">
              <span className="label-text font-medium">시안 파일 업로드 *</span>
            </label>
            
            <div
              className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center transition-colors hover:border-primary"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFiles.length === 0 ? (
                <div>
                  <div className="text-4xl mb-4">📎</div>
                  <p className="text-lg font-medium mb-2">
                    시안 파일을 드래그하거나 클릭하여 선택
                  </p>
                  <p className="text-base-content/60 mb-4">
                    JPG, PNG, GIF 형식 지원 • 최대 10MB
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    파일 선택
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-2">✅</div>
                  <p className="font-medium">
                    {selectedFiles.length}개 파일 선택됨
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    파일 변경
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* 선택된 파일 미리보기 */}
          {selectedFiles.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">선택된 파일 ({selectedFiles.length}개)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-base-200 rounded-lg overflow-hidden">
                      <Image
                        src={previews[index]}
                        alt={file.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {ImageUtils.formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="absolute top-2 right-2 btn btn-circle btn-sm btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 버전 정보 입력 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">버전 제목</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 메인 로고 수정안"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">버전 설명</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이번 버전에서 수정된 내용이나 특징을 설명해주세요..."
            />
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || selectedFiles.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  업로드 중...
                </>
              ) : (
                '시안 업로드'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}