"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FeedbackAttachment } from "@/types";

interface FileUploadProps {
  onFilesUpload?: (files: UploadedFile[]) => void;
  onFileRemove?: (fileId: string) => void;
  maxFileSize?: number; // MB
  maxFiles?: number;
  acceptedTypes?: string[];
  showProgress?: boolean;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
  existingFiles?: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string; // 업로드 완료 후 URL
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export default function FileUpload({
  onFilesUpload,
  onFileRemove,
  maxFileSize = 10, // 10MB
  maxFiles = 5,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  showProgress = true,
  className = "",
  multiple = true,
  disabled = false,
  existingFiles = []
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 크기를 읽기 쉬운 형태로 변환
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 타입 검증
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. (${file.type})`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `파일 크기가 너무 큽니다. (최대: ${maxFileSize}MB)`;
    }

    return null;
  };

  // 이미지 미리보기 생성
  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  };

  // 파일 업로드 시뮬레이션 (실제로는 서버 API 호출)
  const simulateUpload = async (uploadedFile: UploadedFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { 
                  ...f, 
                  uploadProgress: 100, 
                  uploadStatus: 'completed',
                  url: `https://example.com/files/${f.id}` // Mock URL
                }
              : f
          ));
          resolve();
        } else {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, uploadProgress: progress }
              : f
          ));
        }
      }, 200 + Math.random() * 300);

      // 10% 확률로 에러 시뮬레이션
      if (Math.random() < 0.1) {
        setTimeout(() => {
          clearInterval(interval);
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, uploadStatus: 'error', error: '업로드 실패' }
              : f
          ));
          reject(new Error('Upload failed'));
        }, 1000 + Math.random() * 2000);
      }
    });
  };

  // 파일 처리
  const processFiles = useCallback(async (fileList: File[]) => {
    if (disabled) return;
    
    const remainingSlots = maxFiles - files.length;
    const filesToProcess = multiple 
      ? fileList.slice(0, remainingSlots)
      : [fileList[0]];

    if (!multiple && files.length > 0) {
      setFiles([]); // 단일 파일 모드에서는 기존 파일 제거
    }

    const newFiles: UploadedFile[] = [];

    for (const file of filesToProcess) {
      const validationError = validateFile(file);
      if (validationError) {
        // 에러 토스트 표시 (추후 Toast 시스템 연동)
        console.error(validationError);
        continue;
      }

      const preview = await createPreview(file);
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        uploadProgress: 0,
        uploadStatus: 'pending'
      };

      newFiles.push(uploadedFile);
    }

    if (newFiles.length > 0) {
      setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
      
      // 업로드 시작
      setIsUploading(true);
      for (const file of newFiles) {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, uploadStatus: 'uploading' } : f
        ));
        
        try {
          await simulateUpload(file);
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
        }
      }
      setIsUploading(false);

      // 부모 컴포넌트에 알림
      if (onFilesUpload) {
        onFilesUpload(newFiles);
      }
    }
  }, [files, disabled, maxFiles, maxFileSize, acceptedTypes, multiple, onFilesUpload]);

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // input 리셋
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 드래그 이벤트 핸들러
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  // 파일 제거
  const handleFileRemove = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (onFileRemove) {
      onFileRemove(fileId);
    }
  };

  // 파일 재업로드
  const handleFileRetry = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, uploadStatus: 'uploading', uploadProgress: 0, error: undefined }
        : f
    ));

    try {
      await simulateUpload(file);
    } catch (error) {
      console.error(`Retry upload failed for ${file.name}:`, error);
    }
  };

  // 파일 아이콘 결정
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    if (type === 'text/plain') return '📃';
    return '📁';
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/10' 
            : 'border-base-300 hover:border-primary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${!canAddMore ? 'opacity-50' : ''}
        `}
        onClick={() => canAddMore && !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || !canAddMore}
        />

        <div className="text-center">
          {isDragOver ? (
            <>
              <div className="text-4xl mb-2">⬇️</div>
              <p className="text-lg font-medium text-primary">파일을 여기에 놓으세요</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">📁</div>
              <p className="text-lg font-medium mb-2">
                {canAddMore 
                  ? `파일을 드래그하거나 클릭하여 업로드`
                  : `최대 ${maxFiles}개 파일까지 업로드 가능`
                }
              </p>
              <p className="text-sm text-base-content/60">
                지원 형식: {acceptedTypes.includes('image/jpeg') && '이미지'}{acceptedTypes.includes('application/pdf') && ', PDF'}{acceptedTypes.includes('text/plain') && ', 텍스트'} 등
                <br />
                최대 크기: {maxFileSize}MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">업로드된 파일 ({files.length}/{maxFiles})</h4>
            {isUploading && (
              <div className="flex items-center space-x-2 text-sm text-primary">
                <div className="loading loading-spinner loading-sm" />
                <span>업로드 중...</span>
              </div>
            )}
          </div>

          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-start space-x-4 p-4 bg-base-100 border border-base-300 rounded-lg"
            >
              {/* 파일 미리보기/아이콘 */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-base-200 rounded flex items-center justify-center text-2xl">
                    {getFileIcon(file.type)}
                  </div>
                )}
              </div>

              {/* 파일 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-sm text-base-content/60">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center space-x-2">
                    {file.uploadStatus === 'error' && (
                      <button
                        onClick={() => handleFileRetry(file.id)}
                        className="btn btn-ghost btn-sm text-warning hover:text-warning-content"
                        title="다시 업로드"
                      >
                        🔄
                      </button>
                    )}
                    <button
                      onClick={() => handleFileRemove(file.id)}
                      className="btn btn-ghost btn-sm text-error hover:text-error-content"
                      title="파일 제거"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* 상태 표시 */}
                <div className="space-y-2">
                  {file.uploadStatus === 'pending' && (
                    <div className="flex items-center space-x-2 text-sm text-base-content/60">
                      <div className="w-2 h-2 bg-base-300 rounded-full" />
                      <span>업로드 대기 중</span>
                    </div>
                  )}

                  {file.uploadStatus === 'uploading' && showProgress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-primary">업로드 중...</span>
                        <span className="text-primary">{Math.round(file.uploadProgress)}%</span>
                      </div>
                      <progress 
                        className="progress progress-primary w-full" 
                        value={file.uploadProgress} 
                        max="100"
                      />
                    </div>
                  )}

                  {file.uploadStatus === 'completed' && (
                    <div className="flex items-center space-x-2 text-sm text-success">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span>업로드 완료</span>
                      {file.url && (
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="link link-primary"
                        >
                          열기
                        </a>
                      )}
                    </div>
                  )}

                  {file.uploadStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-sm text-error">
                      <div className="w-2 h-2 bg-error rounded-full" />
                      <span>{file.error || '업로드 실패'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 도움말 */}
      {files.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-base-content/60">
            파일을 업로드하면 여기에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}