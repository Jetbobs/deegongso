"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FileWithPreview } from "@/types";

interface FileUploadManagerProps {
  projectId: string;
  allowedTypes?: string[];
  maxFileSize?: number; // MB
  maxFiles?: number;
  onFilesUploaded?: (files: FileWithPreview[]) => void;
}

interface UploadedFile extends FileWithPreview {
  id: string;
  uploadProgress: number;
  status: "uploading" | "completed" | "error";
  version: number;
}

export default function FileUploadManager({
  projectId,
  allowedTypes = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".ai", ".psd", ".sketch", ".figma"],
  maxFileSize = 50,
  maxFiles = 10,
  onFilesUploaded
}: FileUploadManagerProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles: UploadedFile[] = [];

    fileArray.forEach((file) => {
      // 파일 검증
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        alert(`지원하지 않는 파일 형식입니다: ${file.name}`);
        return;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`파일 크기가 너무 큽니다: ${file.name} (최대 ${maxFileSize}MB)`);
        return;
      }

      if (files.length + validFiles.length >= maxFiles) {
        alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        return;
      }

      // 미리보기 생성
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const uploadFile: UploadedFile = {
            ...file,
            id: `file-${Date.now()}-${Math.random()}`,
            preview: e.target?.result as string,
            uploadProgress: 0,
            status: "uploading",
            version: 1
          };
          
          validFiles.push(uploadFile);
          if (validFiles.length === fileArray.length) {
            setFiles(prev => [...prev, ...validFiles]);
            simulateUpload(validFiles);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const uploadFile: UploadedFile = {
          ...file,
          id: `file-${Date.now()}-${Math.random()}`,
          uploadProgress: 0,
          status: "uploading",
          version: 1
        };
        
        validFiles.push(uploadFile);
        setFiles(prev => [...prev, ...validFiles]);
        simulateUpload([uploadFile]);
      }
    });
  };

  const simulateUpload = (uploadFiles: UploadedFile[]) => {
    uploadFiles.forEach((file) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === file.id) {
            const newProgress = Math.min(f.uploadProgress + Math.random() * 30, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, uploadProgress: 100, status: "completed" };
            }
            return { ...f, uploadProgress: newProgress };
          }
          return f;
        }));
      }, 200);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const downloadFile = (file: UploadedFile) => {
    // Mock 다운로드
    alert(`다운로드: ${file.name}`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'ai':
        return '🎨';
      case 'psd':
        return '🖌️';
      case 'sketch':
        return '✏️';
      case 'figma':
        return '🎯';
      default:
        return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              파일을 드래그하거나 클릭하여 업로드
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              지원 형식: {allowedTypes.join(', ')} | 최대 {maxFileSize}MB | 최대 {maxFiles}개
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
            >
              파일 선택
            </button>
          </div>
        </div>
      </div>

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            업로드된 파일 ({files.length}/{maxFiles})
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg"
              >
                {/* 파일 아이콘/미리보기 */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded text-xl">
                      {getFileIcon(file.name)}
                    </div>
                  )}
                </div>

                {/* 파일 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      {file.status === "completed" && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                      {file.status === "error" && (
                        <span className="text-red-500 text-sm">✗</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">
                    {formatFileSize(file.size)} • v{file.version}
                  </p>
                  
                  {/* 진행률 바 */}
                  {file.status === "uploading" && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center space-x-2">
                  {file.status === "completed" && (
                    <>
                      <button
                        onClick={() => downloadFile(file)}
                        className="btn btn-ghost btn-sm"
                        title="다운로드"
                      >
                        📥
                      </button>
                      <button
                        onClick={() => {/* 새 버전 업로드 */}}
                        className="btn btn-ghost btn-sm"
                        title="새 버전 업로드"
                      >
                        🔄
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="btn btn-ghost btn-sm text-red-500"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 파일 관리 옵션 */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            총 {files.length}개 파일 • 
            총 용량: {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
          </div>
          <div className="flex space-x-2">
            <button className="btn btn-outline btn-sm">
              전체 다운로드
            </button>
            <button className="btn btn-error btn-sm">
              전체 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}