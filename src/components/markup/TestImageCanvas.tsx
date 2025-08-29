"use client";

import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Circle, Rect, Text, Arrow } from "react-konva";
import { ImageMarkup, MarkupType, KonvaStage } from "@/types";
import { MarkupManager, MARKUP_TOOLS } from "@/lib/markupManager";
import ImageUploadSection from "./ImageUploadSection";

interface TestImageCanvasProps {
  projectId: string;
  versionId: string;
  selectedTool: MarkupType | null;
  isMarkupMode: boolean;
  onMarkupClick: (markup: ImageMarkup) => void;
  onMarkupCreate: (markup: ImageMarkup) => void;
  currentUserId: string;
  className?: string;
}

export default function TestImageCanvas({
  projectId,
  versionId,
  selectedTool,
  isMarkupMode,
  onMarkupClick,
  onMarkupCreate,
  currentUserId,
  className = ""
}: TestImageCanvasProps) {
  const [markups, setMarkups] = useState<ImageMarkup[]>([]);
  const [stageDimensions] = useState({ width: 800, height: 600 });
  const [testImage, setTestImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const stageRef = useRef<KonvaStage | null>(null);

  // 간단한 테스트 이미지 생성
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // 배경 그라디언트
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
      
      // 격자 패턴
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 800; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();
      }
      for (let i = 0; i < 600; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(800, i);
        ctx.stroke();
      }
      
      // 중앙 원
      ctx.beginPath();
      ctx.arc(400, 300, 100, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 제목 텍스트
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('마크업 테스트 이미지', 400, 250);
      
      // 부제목
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText('이미지를 클릭하여 마크업을 추가하세요', 400, 350);
      
      // 이미지 객체 생성
      const img = new Image();
      img.onload = () => setTestImage(img);
      img.src = canvas.toDataURL();
    }
  }, []);

  // 마크업 데이터 로드
  useEffect(() => {
    const versionMarkups = MarkupManager.getVersionMarkups(versionId);
    setMarkups(versionMarkups);
  }, [versionId]);

  // 이미지 업로드 핸들러
  const handleImageChange = (image: HTMLImageElement | null, imageUrl: string) => {
    setUploadedImage(image);
    setUploadedImageUrl(imageUrl);
  };

  // 현재 표시할 이미지 결정 (업로드된 이미지가 있으면 우선, 없으면 테스트 이미지)
  const currentImage = uploadedImage || testImage;

  // Stage 클릭 핸들러
  const handleStageClick = (e: { target: { getStage: () => KonvaStage }; evt: MouseEvent }) => {
    if (!isMarkupMode || !selectedTool) return;
    
    // 기존 마크업을 클릭한 경우는 제외
    if (e.target.attrs && (e.target.attrs.key || e.target.attrs.id)) {
      return;
    }

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;

    const x = (pointer.x / stageDimensions.width) * 100;
    const y = (pointer.y / stageDimensions.height) * 100;

    console.log('Creating markup at:', { x, y, selectedTool }); // 디버깅용

    const newMarkup = MarkupManager.createMarkup(
      versionId,
      x,
      y,
      selectedTool,
      currentUserId
    );

    setMarkups(prev => [...prev, newMarkup]);
    onMarkupCreate(newMarkup);
  };

  // 마크업 렌더링
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
          />
        );

      default:
        return null;
    }
  };

  // 마크업 번호 렌더링
  const renderMarkupNumber = (markup: ImageMarkup) => {
    if (markup.type === 'point' || markup.type === 'text') return null;

    const x = (markup.x / 100) * stageDimensions.width;
    const y = (markup.y / 100) * stageDimensions.height;

    return (
      <>
        <Circle
          key={`${markup.id}-number`}
          x={x}
          y={y}
          radius={12}
          fill="white"
          stroke={markup.color || '#ef4444'}
          strokeWidth={2}
          onClick={() => onMarkupClick(markup)}
        />
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
      </>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 이미지 업로드 섹션 */}
      <ImageUploadSection
        onImageChange={handleImageChange}
        currentImageUrl={uploadedImageUrl}
      />
      
      {/* 캔버스 */}
      <div className="relative bg-base-200 rounded-lg overflow-hidden">
        <Stage
          ref={stageRef}
          width={stageDimensions.width}
          height={stageDimensions.height}
          onClick={handleStageClick}
          className={isMarkupMode && selectedTool ? 'cursor-crosshair' : 'cursor-default'}
        >
          {/* 배경 이미지 레이어 */}
          <Layer>
            {currentImage && (
              <KonvaImage
                image={currentImage}
                width={stageDimensions.width}
                height={stageDimensions.height}
              />
            )}
          </Layer>

        {/* 마크업 레이어 */}
        <Layer>
          {markups.map(markup => renderMarkup(markup))}
          {markups.map(markup => renderMarkupNumber(markup))}
        </Layer>
      </Stage>

      {/* 마크업 모드 표시 */}
      {isMarkupMode && selectedTool && (
        <div className="absolute top-2 left-2 bg-primary text-primary-content px-3 py-1 rounded-full text-sm font-medium">
          {MARKUP_TOOLS.find(t => t.type === selectedTool)?.icon} {selectedTool} 도구 활성
        </div>
      )}

      {/* 마크업 개수 표시 */}
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        마크업 {markups.length}개
      </div>

      {/* 이미지 타입 표시 */}
      <div className="absolute bottom-2 left-2 bg-success text-success-content px-2 py-1 rounded text-xs">
        {uploadedImage ? '📁 업로드된 이미지' : '✅ 로컬 생성 이미지'}
      </div>

        {/* 이미지 없을 때 */}
        {!currentImage && (
          <div className="absolute inset-0 flex items-center justify-center text-base-content/50 bg-base-200">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
              <div>
                {uploadedImageUrl ? '업로드한 이미지 로드 중...' : '테스트 이미지 생성 중...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}