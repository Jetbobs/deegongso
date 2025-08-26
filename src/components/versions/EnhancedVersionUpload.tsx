"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { VersionManager, ImageUtils } from '@/lib/versionManager';
import { DesignVersion } from '@/types';

interface EnhancedVersionUploadProps {
  projectId: string;
  currentUserId: string;
  onVersionCreated?: (version: DesignVersion) => void;
  onError?: (error: string) => void;
  maxFileSize?: number; // MB
  maxFiles?: number;
  acceptedTypes?: string[];
}

interface PreviewFile extends File {
  preview?: string;
  thumbnail?: string;
  isProcessing?: boolean;
}

export default function EnhancedVersionUpload({
  projectId,
  currentUserId,
  onVersionCreated,
  onError,
  maxFileSize = 10,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/x-photoshop']
}: EnhancedVersionUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 처리
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 파일 수 제한 확인
    if (files.length > maxFiles) {
      onError?.(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 크기 및 타입 확인
    const validFiles: PreviewFile[] = [];
    
    for (const file of files) {
      // 크기 확인
      if (file.size > maxFileSize * 1024 * 1024) {
        onError?.(`${file.name}은(는) ${maxFileSize}MB를 초과합니다.`);
        continue;
      }

      // 타입 확인
      if (!acceptedTypes.includes(file.type)) {
        onError?.(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`);
        continue;
      }

      const previewFile = file as PreviewFile;
      previewFile.isProcessing = true;
      
      // 이미지 파일인 경우 미리보기 생성
      if (ImageUtils.isImageFile(file)) {
        try {
          previewFile.preview = URL.createObjectURL(file);
          previewFile.thumbnail = await ImageUtils.generateThumbnail(file, 200, 150);
        } catch (error) {
          console.error('미리보기 생성 실패:', error);
        }
      }
      
      previewFile.isProcessing = false;
      validFiles.push(previewFile);
    }

    setSelectedFiles(validFiles);
  };

  // 파일 제거
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  // 파일 순서 변경
  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...selectedFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setSelectedFiles(newFiles);
  };

  // 업로드 처리
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      onError?.('업로드할 파일을 선택해주세요.');
      return;
    }

    if (!title.trim()) {
      onError?.('시안 제목을 입력해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // 실제 버전 생성
      const newVersion = VersionManager.createVersion(
        projectId,
        selectedFiles,
        currentUserId,
        title.trim(),
        description.trim() || undefined
      );

      // 완료
      setUploadProgress(100);
      setTimeout(() => {
        onVersionCreated?.(newVersion);
        
        // 폼 초기화
        setSelectedFiles([]);
        setTitle('');
        setDescription('');
        setUploadProgress(0);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);

    } catch (error) {
      console.error('업로드 실패:', error);
      onError?.('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const fakeEvent = {
      target: { files }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleFileSelect(fakeEvent);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <span>📤</span>
          <span>새 시안 업로드</span>
        </h3>
        <div className="text-sm text-base-content/60">
          {selectedFiles.length}/{maxFiles} 파일
        </div>
      </div>

      {/* 기본 정보 입력 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">시안 제목 *</label>
            <input
              type="text"
              placeholder="예: 로고 디자인 최종안"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">설명</label>
            <textarea
              placeholder="이번 시안의 특징이나 변경사항을 설명해주세요..."
              className="textarea textarea-bordered h-24 w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      {/* 파일 업로드 영역 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div
            className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-6xl">📁</div>
              <div>
                <p className="text-lg font-medium mb-2">파일을 드래그하거나 클릭하여 선택</p>
                <p className="text-sm text-base-content/60">
                  지원 형식: JPG, PNG, WebP, PDF, PSD • 최대 {maxFileSize}MB • {maxFiles}개까지
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                파일 선택
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* 선택된 파일 미리보기 */}
      {selectedFiles.length > 0 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">선택된 파일 ({selectedFiles.length}개)</h4>
              <p className="text-sm text-base-content/60">
                드래그하여 순서 변경 가능
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-base-200 rounded-lg"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    moveFile(fromIndex, index);
                  }}
                >
                  {/* 파일 미리보기 */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <Image
                        src={file.thumbnail || file.preview}
                        alt={file.name}
                        width={60}
                        height={45}
                        className="w-15 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-15 h-12 bg-base-300 rounded border flex items-center justify-center">
                        <span className="text-2xl">
                          {file.type.includes('pdf') ? '📄' : '📁'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 파일 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-base-content/60">
                      <span>{ImageUtils.formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{index === 0 ? '대표 이미지' : `이미지 ${index + 1}`}</span>
                    </div>
                  </div>

                  {/* 순서 표시 */}
                  <div className="flex items-center space-x-2">
                    <div className="badge badge-primary badge-sm">{index + 1}</div>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 업로드 진행률 */}
      {isUploading && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="loading loading-spinner loading-sm"></div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>업로드 중...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={uploadProgress} 
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 업로드 버튼 */}
      <div className="flex justify-end space-x-2">
        <button
          className="btn btn-ghost"
          onClick={() => {
            setSelectedFiles([]);
            setTitle('');
            setDescription('');
          }}
          disabled={isUploading || selectedFiles.length === 0}
        >
          초기화
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0 || !title.trim()}
        >
          {isUploading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              업로드 중...
            </>
          ) : (
            <>
              📤 업로드 ({selectedFiles.length}개 파일)
            </>
          )}
        </button>
      </div>
    </div>
  );
}