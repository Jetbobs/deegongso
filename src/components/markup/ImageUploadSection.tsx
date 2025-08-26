"use client";

import { useState, useRef } from "react";

interface ImageUploadSectionProps {
  onImageChange: (image: HTMLImageElement | null, imageUrl: string) => void;
  currentImageUrl?: string;
}

export default function ImageUploadSection({ 
  onImageChange, 
  currentImageUrl 
}: ImageUploadSectionProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      
      img.onload = () => {
        onImageChange(img, dataUrl);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        alert('이미지 로드에 실패했습니다.');
        setIsLoading(false);
      };
      
      img.src = dataUrl;
    };
    
    reader.onerror = () => {
      alert('파일 읽기에 실패했습니다.');
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  // URL로 이미지 로드
  const handleUrlLoad = () => {
    if (!imageUrl.trim()) {
      alert('이미지 URL을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const img = new Image();
    
    // CORS 정책을 위해 crossOrigin 설정
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      onImageChange(img, imageUrl);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      alert('이미지 로드에 실패했습니다. URL을 확인해주세요.');
      setIsLoading(false);
    };
    
    img.src = imageUrl;
  };

  // 기본 테스트 이미지로 되돌리기
  const handleUseTestImage = () => {
    onImageChange(null, '');
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <h4 className="card-title text-lg">이미지 업로드</h4>
        
        {/* 업로드 방법 선택 */}
        <div className="tabs tabs-boxed mb-4">
          <button 
            className={`tab ${uploadMethod === 'file' ? 'tab-active' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            📁 파일 업로드
          </button>
          <button 
            className={`tab ${uploadMethod === 'url' ? 'tab-active' : ''}`}
            onClick={() => setUploadMethod('url')}
          >
            🔗 URL 입력
          </button>
        </div>

        {/* 파일 업로드 */}
        {uploadMethod === 'file' && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-base-content/60">
              JPG, PNG, GIF, WEBP 파일을 업로드할 수 있습니다.
            </p>
          </div>
        )}

        {/* URL 입력 */}
        {uploadMethod === 'url' && (
          <div className="space-y-3">
            <div className="join w-full">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input input-bordered join-item flex-1"
                disabled={isLoading}
              />
              <button
                onClick={handleUrlLoad}
                disabled={isLoading || !imageUrl.trim()}
                className="btn btn-primary join-item"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  '불러오기'
                )}
              </button>
            </div>
            <p className="text-xs text-base-content/60">
              이미지 URL을 입력하고 불러오기 버튼을 클릭하세요.
            </p>
          </div>
        )}

        {/* 현재 이미지 정보 */}
        {currentImageUrl && (
          <div className="alert alert-info">
            <div className="flex items-center gap-2">
              <span className="text-sm">✅ 이미지가 로드되었습니다</span>
              <button
                onClick={handleUseTestImage}
                className="btn btn-xs btn-ghost"
              >
                테스트 이미지로 되돌리기
              </button>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="alert">
            <span className="loading loading-spinner loading-sm"></span>
            <span>이미지를 로드하는 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}