"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Circle, Rect, Text, Arrow, Line } from "react-konva";
import { ImageMarkup, MarkupType, DesignVersion } from "@/types";
import { MarkupManager } from "@/lib/markupManager";
import { useImageWithFallback } from "@/hooks/useImageWithFallback";

interface ImageMarkupCanvasProps {
  version: DesignVersion;
  selectedTool: MarkupType | null;
  isMarkupMode: boolean;
  onMarkupClick: (markup: ImageMarkup) => void;
  onMarkupCreate: (markup: ImageMarkup) => void;
  currentUserId: string;
  className?: string;
}

export default function ImageMarkupCanvas({
  version,
  selectedTool,
  isMarkupMode,
  onMarkupClick,
  onMarkupCreate,
  currentUserId,
  className = ""
}: ImageMarkupCanvasProps) {
  const [markups, setMarkups] = useState<ImageMarkup[]>([]);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  const [imageScale, setImageScale] = useState({ x: 1, y: 1 });
  const stageRef = useRef<any>(null);
  
  // 첫 번째 파일의 이미지 로드 (여러 fallback URL 사용)
  const primaryUrl = version.files[0]?.file_url;
  
  // fallback URLs를 memoize하여 무한루프 방지
  const fallbackUrls = useMemo(() => {
    console.log('🔄 Fallback URLs 생성 중...', { primaryUrl });
    
    // Canvas를 이용한 가장 안정적인 fallback (우선순위)
    const createCanvasFallback = (text: string, bgColor: string = '#f3f4f6', textColor: string = '#6b7280') => {
      try {
        console.log(`🎨 Canvas fallback 생성 시도: ${text}`);
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.warn('Canvas context를 가져올 수 없습니다');
          return null;
        }
        
        // 배경
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 800, 600);
        
        // 테두리
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 780, 580);
        
        // 메인 텍스트
        ctx.fillStyle = textColor;
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 400, 280);
        
        // 부제목
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('로컬 생성 이미지', 400, 320);
        
        // 추가 정보
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('마크업 도구 테스트용', 400, 350);
        
        const dataUrl = canvas.toDataURL('image/png');
        console.log(`✅ Canvas fallback 생성 성공: ${text}, 길이: ${dataUrl.length}`);
        return dataUrl;
      } catch (error) {
        console.error('Canvas fallback 생성 실패:', error);
        return null;
      }
    };

    // 매우 간단한 SVG (최소한의 fallback)
    const createSimpleSvg = (text: string, bgColor: string = '#f8fafc') => {
      try {
        console.log(`🎨 SVG fallback 생성 시도: ${text}`);
        const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${bgColor}" stroke="#e2e8f0" stroke-width="2"/>
          <text x="400" y="260" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#64748b" text-anchor="middle">${text}</text>
          <text x="400" y="300" font-family="Arial,sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">로컬 생성 이미지</text>
          <text x="400" y="330" font-family="Arial,sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">마크업 도구 테스트용</text>
        </svg>`;
        const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        console.log(`✅ SVG fallback 생성 성공: ${text}, 길이: ${dataUrl.length}`);
        return dataUrl;
      } catch (error) {
        console.error('SVG fallback 생성 실패:', error);
        return null;
      }
    };

    // 더 간단한 최종 fallback
    const createBasicSvg = () => {
      const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="400" y="300" font-family="Arial" font-size="24" fill="#64748b" text-anchor="middle">로딩 실패</text></svg>`;
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    // 로컬 이미지들 생성
    const canvasFallback1 = createCanvasFallback('디자인 미리보기', '#f3f4f6', '#6b7280');
    const canvasFallback2 = createCanvasFallback('대체 이미지', '#e5e7eb', '#9ca3af');
    const svgFallback1 = createSimpleSvg('디자인 미리보기');
    const svgFallback2 = createSimpleSvg('대체 이미지', '#f1f5f9');
    const basicSvg = createBasicSvg();

    const urls = [
      primaryUrl, // 원본 URL
      canvasFallback1, // Canvas 1
      canvasFallback2, // Canvas 2  
      svgFallback1, // SVG 1
      svgFallback2, // SVG 2
      basicSvg // 가장 기본적인 SVG
    ].filter(Boolean); // null/undefined 제거

    console.log('📋 생성된 fallback URLs:', {
      total: urls.length,
      primary: !!primaryUrl,
      canvas1: !!canvasFallback1,
      canvas2: !!canvasFallback2,
      svg1: !!svgFallback1,
      svg2: !!svgFallback2,
      basic: !!basicSvg
    });

    return urls;
  }, [primaryUrl]);

  const { image, status, currentUrl, error, debugInfo } = useImageWithFallback(fallbackUrls, 'anonymous');

  // 디버깅을 위한 로그 (상태 변경 시에만, debugInfo 의존성 제거)
  useEffect(() => {
    if (status === 'loaded' || status === 'failed') {
      console.log('🔍 ImageMarkupCanvas - Final Status:', {
        status,
        primaryUrl,
        currentUrl,
        error,
        hasImage: !!image,
        debugInfo
      });
    }
  }, [status, primaryUrl, currentUrl, error, image]); // debugInfo 제거

  // 마크업 데이터 로드
  useEffect(() => {
    const versionMarkups = MarkupManager.getVersionMarkups(version.id);
    setMarkups(versionMarkups);
  }, [version.id]);

  // 이미지 크기에 맞춰 Stage 크기 조정
  useEffect(() => {
    if (image) {
      const maxWidth = 800;
      const maxHeight = 600;
      
      const imageAspectRatio = image.width / image.height;
      const containerAspectRatio = maxWidth / maxHeight;
      
      let newWidth, newHeight, scaleX, scaleY;
      
      if (imageAspectRatio > containerAspectRatio) {
        // 이미지가 더 가로로 긺
        newWidth = maxWidth;
        newHeight = maxWidth / imageAspectRatio;
        scaleX = newWidth / image.width;
        scaleY = newHeight / image.height;
      } else {
        // 이미지가 더 세로로 길거나 같음
        newHeight = maxHeight;
        newWidth = maxHeight * imageAspectRatio;
        scaleX = newWidth / image.width;
        scaleY = newHeight / image.height;
      }
      
      setStageDimensions({ width: newWidth, height: newHeight });
      setImageScale({ x: scaleX, y: scaleY });
    }
  }, [image]);

  // Stage 클릭 핸들러
  const handleStageClick = (e: any) => {
    // 마크업 모드가 아니거나 선택된 도구가 없으면 무시
    if (!isMarkupMode || !selectedTool) return;

    // 마크업을 클릭한 경우는 무시
    if (e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;

    // 백분율로 좌표 변환
    const x = (pointer.x / stageDimensions.width) * 100;
    const y = (pointer.y / stageDimensions.height) * 100;

    // 새 마크업 생성
    const newMarkup = MarkupManager.createMarkup(
      version.id,
      x,
      y,
      selectedTool,
      currentUserId
    );

    setMarkups(prev => [...prev, newMarkup]);
    onMarkupCreate(newMarkup);
  };

  // 마크업 렌더링 함수
  const renderMarkup = (markup: ImageMarkup) => {
    const x = (markup.x / 100) * stageDimensions.width;
    const y = (markup.y / 100) * stageDimensions.height;
    const color = markup.color || '#ef4444';
    const size = markup.size || 12;

    const commonProps = {
      key: markup.id,
      onClick: () => onMarkupClick(markup),
      fill: color,
      stroke: color,
      strokeWidth: 2,
      opacity: 0.8,
    };

    switch (markup.type) {
      case 'point':
        return (
          <Circle
            {...commonProps}
            x={x}
            y={y}
            radius={size}
            shadowColor="black"
            shadowOpacity={0.3}
            shadowOffsetX={2}
            shadowOffsetY={2}
            shadowBlur={4}
          />
        );

      case 'circle':
        return (
          <Circle
            {...commonProps}
            x={x}
            y={y}
            radius={size}
            fill="transparent"
            strokeWidth={3}
            shadowColor="black"
            shadowOpacity={0.3}
            shadowOffsetX={2}
            shadowOffsetY={2}
            shadowBlur={4}
          />
        );

      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            x={x - size}
            y={y - size}
            width={size * 2}
            height={size * 2}
            fill="transparent"
            strokeWidth={3}
            shadowColor="black"
            shadowOpacity={0.3}
            shadowOffsetX={2}
            shadowOffsetY={2}
            shadowBlur={4}
          />
        );

      case 'arrow':
        return (
          <Arrow
            {...commonProps}
            x={x}
            y={y}
            points={[0, 0, 30, 0]}
            pointerLength={8}
            pointerWidth={8}
            shadowColor="black"
            shadowOpacity={0.3}
            shadowOffsetX={2}
            shadowOffsetY={2}
            shadowBlur={4}
          />
        );

      case 'text':
        return (
          <Text
            {...commonProps}
            x={x - 10}
            y={y - size / 2}
            text={markup.number.toString()}
            fontSize={size}
            fontFamily="Arial"
            align="center"
            fill="white"
            stroke={color}
            strokeWidth={1}
            shadowColor="black"
            shadowOpacity={0.5}
            shadowOffsetX={1}
            shadowOffsetY={1}
            shadowBlur={2}
          />
        );

      default:
        return null;
    }
  };

  // 마크업 번호 렌더링 (point와 text 제외)
  const renderMarkupNumber = (markup: ImageMarkup) => {
    if (markup.type === 'point' || markup.type === 'text') return null;

    const x = (markup.x / 100) * stageDimensions.width;
    const y = (markup.y / 100) * stageDimensions.height;

    return (
      <Circle
        key={`${markup.id}-number`}
        x={x}
        y={y}
        radius={12}
        fill="white"
        stroke={markup.color || '#ef4444'}
        strokeWidth={2}
        shadowColor="black"
        shadowOpacity={0.3}
        shadowOffsetX={1}
        shadowOffsetY={1}
        shadowBlur={3}
        onClick={() => onMarkupClick(markup)}
      />
    );
  };

  const renderMarkupNumberText = (markup: ImageMarkup) => {
    if (markup.type === 'point' || markup.type === 'text') return null;

    const x = (markup.x / 100) * stageDimensions.width;
    const y = (markup.y / 100) * stageDimensions.height;

    return (
      <Text
        key={`${markup.id}-number-text`}
        x={x}
        y={y}
        text={markup.number.toString()}
        fontSize={12}
        fontFamily="Arial"
        fill={markup.color || '#ef4444'}
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        offsetX={6}
        offsetY={6}
        onClick={() => onMarkupClick(markup)}
      />
    );
  };

  return (
    <div className={`relative bg-base-200 rounded-lg overflow-hidden ${className}`}>
      <Stage
        ref={stageRef}
        width={stageDimensions.width}
        height={stageDimensions.height}
        onClick={handleStageClick}
        className={isMarkupMode && selectedTool ? 'cursor-crosshair' : 'cursor-default'}
      >
        {/* 배경 이미지 레이어 */}
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={stageDimensions.width}
              height={stageDimensions.height}
            />
          )}
        </Layer>

        {/* 마크업 레이어 */}
        <Layer>
          {markups.map(markup => renderMarkup(markup))}
          {markups.map(markup => renderMarkupNumber(markup))}
          {markups.map(markup => renderMarkupNumberText(markup))}
        </Layer>
      </Stage>

      {/* 마크업 모드 표시 */}
      {isMarkupMode && selectedTool && (
        <div className="absolute top-2 left-2 bg-primary text-primary-content px-3 py-1 rounded-full text-sm font-medium">
          📍 {selectedTool} 도구 활성
        </div>
      )}

      {/* 마크업 개수 표시 */}
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        마크업 {markups.length}개
      </div>

      {/* Fallback 이미지 사용 중 표시 */}
      {image && currentUrl !== primaryUrl && (
        <div className="absolute top-2 left-2 bg-info text-info-content px-3 py-1 rounded text-sm font-medium">
          {currentUrl.startsWith('data:image/png') ? '🎨 로컬 Canvas 이미지' :
           currentUrl.startsWith('data:image/svg') ? '🖼️ 로컬 SVG 이미지' :
           '⚠️ 대체 이미지 사용중'}
        </div>
      )}

      {/* 이미지 로딩 상태 */}
      {!image && (
        <div className="absolute inset-0 flex items-center justify-center text-base-content/50 bg-base-200">
          <div className="text-center">
            {status === 'loading' ? (
              <>
                <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                <div className="font-medium">이미지를 불러오는 중...</div>
                <div className="text-xs mt-2 text-base-content/60">
                  현재 시도: {currentUrl}
                </div>
              </>
            ) : status === 'failed' ? (
              <>
                <div className="text-4xl mb-4">❌</div>
                <div className="font-medium text-error mb-2">이미지 로드 실패</div>
                <div className="text-xs text-base-content/60 mb-2">
                  원본 URL: {primaryUrl}
                </div>
                {error && (
                  <div className="text-xs text-error/80 mb-4 p-2 bg-error/10 rounded max-w-md">
                    {error}
                  </div>
                )}
                
                {/* 상세 디버그 정보 */}
                <details className="mb-4 text-xs">
                  <summary className="cursor-pointer text-base-content/70 hover:text-base-content">
                    🔍 상세 오류 정보 (총 {debugInfo.totalAttempts}회 시도)
                  </summary>
                  <div className="mt-2 p-3 bg-base-200 rounded text-left max-w-md max-h-32 overflow-y-auto">
                    <div className="mb-2">
                      <strong>시도한 URL들:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {debugInfo.attemptedUrls.map((url, i) => (
                          <li key={i} className="break-all text-xs">
                            {i + 1}. {url.length > 80 ? url.substring(0, 80) + '...' : url}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <strong>실패 원인들:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {debugInfo.failureReasons.map((failure, i) => (
                          <li key={i} className="break-all text-xs">
                            <span className="font-medium">{failure.url.length > 40 ? failure.url.substring(0, 40) + '...' : failure.url}:</span>
                            <br />
                            <span className="text-error/80">{failure.reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-base-300">
                      <strong>환경 정보:</strong>
                      <div>네트워크: {navigator.onLine ? '온라인' : '오프라인'}</div>
                      <div>브라우저: {navigator.userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || 'Unknown'}</div>
                    </div>
                  </div>
                </details>
                
                <div className="flex gap-2 justify-center">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => window.location.reload()}
                  >
                    🔄 새로고침
                  </button>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      localStorage.removeItem(`project_versions_${version.project_id}`);
                      window.location.reload();
                    }}
                  >
                    🗑️ 캐시 초기화
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      console.group('🔍 완전한 디버그 정보');
                      console.log('기본 정보:', {
                        primaryUrl,
                        fallbackUrls,
                        debugInfo,
                        version
                      });
                      console.log('브라우저 환경:', {
                        userAgent: navigator.userAgent,
                        onLine: navigator.onLine,
                        cookieEnabled: navigator.cookieEnabled,
                        language: navigator.language,
                        platform: navigator.platform,
                        windowLocation: window.location.href,
                        protocol: window.location.protocol,
                        host: window.location.host
                      });
                      console.log('이미지 로드 테스트:', '다음 URL들을 개별적으로 테스트합니다...');
                      
                      // 각 fallback URL을 개별적으로 테스트
                      fallbackUrls.forEach((url, index) => {
                        if (url) {
                          console.log(`테스트 ${index + 1}: ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`);
                          
                          const testImg = new Image();
                          testImg.onload = () => {
                            console.log(`✅ 테스트 ${index + 1} 성공:`, {
                              url: url.substring(0, 100),
                              naturalWidth: testImg.naturalWidth,
                              naturalHeight: testImg.naturalHeight
                            });
                          };
                          testImg.onerror = (e) => {
                            console.error(`❌ 테스트 ${index + 1} 실패:`, {
                              url: url.substring(0, 100),
                              error: e
                            });
                          };
                          
                          setTimeout(() => {
                            testImg.src = url;
                          }, index * 500); // 각 테스트를 0.5초씩 지연
                        }
                      });
                      
                      console.groupEnd();
                      alert('상세 디버그 정보와 개별 URL 테스트가 콘솔에서 진행됩니다. F12를 눌러 확인하세요.');
                    }}
                  >
                    🐛 디버그 정보
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🖼️</div>
                <div>이미지 대기 중...</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}