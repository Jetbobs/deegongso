"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FeedbackAnnotation } from "@/types";

interface ImageAnnotationProps {
  imageUrl: string;
  imageAlt?: string;
  annotations?: FeedbackAnnotation[];
  onAnnotationAdd?: (annotation: Omit<FeedbackAnnotation, 'id' | 'feedback_id' | 'created_at'>) => void;
  onAnnotationEdit?: (annotationId: string, content: string) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  editable?: boolean;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

interface AnnotationTool {
  type: FeedbackAnnotation['annotation_type'];
  isActive: boolean;
}

export default function ImageAnnotation({
  imageUrl,
  imageAlt = "이미지",
  annotations = [],
  onAnnotationAdd,
  onAnnotationEdit,
  onAnnotationDelete,
  editable = true,
  className = ""
}: ImageAnnotationProps) {
  const [currentTool, setCurrentTool] = useState<AnnotationTool>({ type: 'point', isActive: false });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentArea, setCurrentArea] = useState<{ start: Point; end: Point } | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const getRelativePosition = useCallback((clientX: number, clientY: number): Point | null => {
    if (!imageRef.current || !containerRef.current) return null;
    
    const imageRect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const x = ((clientX - imageRect.left) / imageRect.width) * 100;
    const y = ((clientY - imageRect.top) / imageRect.height) * 100;
    
    // 이미지 영역 내에서만 주석 허용
    if (x < 0 || x > 100 || y < 0 || y > 100) return null;
    
    return { x, y };
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!editable || !currentTool.isActive) return;
    
    event.preventDefault();
    const position = getRelativePosition(event.clientX, event.clientY);
    if (!position) return;

    if (currentTool.type === 'point') {
      // 포인트 주석은 즉시 생성
      const content = prompt("주석 내용을 입력하세요:");
      if (content && onAnnotationAdd) {
        onAnnotationAdd({
          target_file_id: "image", // 실제로는 파일 ID를 사용
          annotation_type: 'point',
          position_x: position.x,
          position_y: position.y,
          content
        });
      }
      setCurrentTool({ ...currentTool, isActive: false });
    } else if (currentTool.type === 'area') {
      // 영역 주석 시작
      setIsDrawing(true);
      setStartPoint(position);
      setCurrentArea({ start: position, end: position });
    }
  }, [editable, currentTool, getRelativePosition, onAnnotationAdd]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const position = getRelativePosition(event.clientX, event.clientY);
    if (!position) return;

    setCurrentArea({ start: startPoint, end: position });
  }, [isDrawing, startPoint, getRelativePosition]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isDrawing || !currentArea) return;
    
    const position = getRelativePosition(event.clientX, event.clientY);
    if (!position) return;

    setIsDrawing(false);
    
    const width = Math.abs(currentArea.end.x - currentArea.start.x);
    const height = Math.abs(currentArea.end.y - currentArea.start.y);
    
    // 최소 크기 검증
    if (width < 2 || height < 2) {
      setCurrentArea(null);
      setStartPoint(null);
      return;
    }

    const content = prompt("영역 주석 내용을 입력하세요:");
    if (content && onAnnotationAdd) {
      onAnnotationAdd({
        target_file_id: "image",
        annotation_type: 'area',
        position_x: Math.min(currentArea.start.x, currentArea.end.x),
        position_y: Math.min(currentArea.start.y, currentArea.end.y),
        width,
        height,
        content
      });
    }
    
    setCurrentArea(null);
    setStartPoint(null);
    setCurrentTool({ ...currentTool, isActive: false });
  }, [isDrawing, currentArea, getRelativePosition, onAnnotationAdd, currentTool]);

  const handleAnnotationClick = (annotation: FeedbackAnnotation) => {
    if (selectedAnnotation === annotation.id) {
      setSelectedAnnotation(null);
    } else {
      setSelectedAnnotation(annotation.id);
    }
  };

  const startEditAnnotation = (annotation: FeedbackAnnotation) => {
    setEditingAnnotation(annotation.id);
    setEditContent(annotation.content);
    setSelectedAnnotation(null);
  };

  const saveAnnotationEdit = () => {
    if (editingAnnotation && editContent.trim() && onAnnotationEdit) {
      onAnnotationEdit(editingAnnotation, editContent.trim());
    }
    setEditingAnnotation(null);
    setEditContent("");
  };

  const cancelAnnotationEdit = () => {
    setEditingAnnotation(null);
    setEditContent("");
  };

  const deleteAnnotation = (annotationId: string) => {
    if (confirm("주석을 삭제하시겠습니까?") && onAnnotationDelete) {
      onAnnotationDelete(annotationId);
      setSelectedAnnotation(null);
    }
  };

  const renderAnnotation = (annotation: FeedbackAnnotation) => {
    const isSelected = selectedAnnotation === annotation.id;
    const isEditing = editingAnnotation === annotation.id;

    if (annotation.annotation_type === 'point') {
      return (
        <div
          key={annotation.id}
          className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 ${
            isSelected ? 'animate-pulse' : ''
          }`}
          style={{
            left: `${annotation.position_x}%`,
            top: `${annotation.position_y}%`
          }}
          onClick={() => handleAnnotationClick(annotation)}
        >
          <div className={`w-full h-full rounded-full border-2 ${
            isSelected 
              ? 'bg-primary border-primary-content shadow-lg scale-110' 
              : 'bg-warning border-warning-content hover:scale-110'
          } transition-all flex items-center justify-center text-xs font-bold`}>
            📍
          </div>
          
          {isSelected && !isEditing && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 min-w-48 z-20">
              <p className="text-sm mb-2">{annotation.content}</p>
              <div className="flex items-center justify-end space-x-1">
                {editable && (
                  <>
                    <button
                      onClick={() => startEditAnnotation(annotation)}
                      className="btn btn-ghost btn-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteAnnotation(annotation.id)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      🗑️
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedAnnotation(null)}
                  className="btn btn-ghost btn-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {isEditing && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 min-w-64 z-20">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="textarea textarea-bordered textarea-sm w-full mb-2"
                rows={3}
                placeholder="주석 내용 수정..."
                autoFocus
              />
              <div className="flex items-center justify-end space-x-1">
                <button
                  onClick={saveAnnotationEdit}
                  className="btn btn-primary btn-xs"
                  disabled={!editContent.trim()}
                >
                  저장
                </button>
                <button
                  onClick={cancelAnnotationEdit}
                  className="btn btn-ghost btn-xs"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (annotation.annotation_type === 'area') {
      return (
        <div
          key={annotation.id}
          className={`absolute border-2 cursor-pointer z-10 ${
            isSelected 
              ? 'border-primary bg-primary/20 animate-pulse' 
              : 'border-warning bg-warning/20 hover:bg-warning/30'
          } transition-all`}
          style={{
            left: `${annotation.position_x}%`,
            top: `${annotation.position_y}%`,
            width: `${annotation.width || 0}%`,
            height: `${annotation.height || 0}%`
          }}
          onClick={() => handleAnnotationClick(annotation)}
        >
          {isSelected && !isEditing && (
            <div className="absolute -top-2 -right-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 min-w-48 z-20">
              <p className="text-sm mb-2">{annotation.content}</p>
              <div className="flex items-center justify-end space-x-1">
                {editable && (
                  <>
                    <button
                      onClick={() => startEditAnnotation(annotation)}
                      className="btn btn-ghost btn-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteAnnotation(annotation.id)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      🗑️
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedAnnotation(null)}
                  className="btn btn-ghost btn-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {isEditing && (
            <div className="absolute -top-2 -right-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 min-w-64 z-20">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="textarea textarea-bordered textarea-sm w-full mb-2"
                rows={3}
                placeholder="주석 내용 수정..."
                autoFocus
              />
              <div className="flex items-center justify-end space-x-1">
                <button
                  onClick={saveAnnotationEdit}
                  className="btn btn-primary btn-xs"
                  disabled={!editContent.trim()}
                >
                  저장
                </button>
                <button
                  onClick={cancelAnnotationEdit}
                  className="btn btn-ghost btn-xs"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`relative ${className}`}>
      {/* 도구 모음 */}
      {editable && (
        <div className="flex items-center justify-between mb-4 p-3 bg-base-100 rounded-lg border border-base-300">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">주석 도구:</span>
            <button
              onClick={() => setCurrentTool({ type: 'point', isActive: !currentTool.isActive || currentTool.type !== 'point' })}
              className={`btn btn-sm ${currentTool.isActive && currentTool.type === 'point' ? 'btn-primary' : 'btn-outline'}`}
            >
              📍 포인트
            </button>
            <button
              onClick={() => setCurrentTool({ type: 'area', isActive: !currentTool.isActive || currentTool.type !== 'area' })}
              className={`btn btn-sm ${currentTool.isActive && currentTool.type === 'area' ? 'btn-primary' : 'btn-outline'}`}
            >
              ⬜ 영역
            </button>
            {currentTool.isActive && (
              <button
                onClick={() => setCurrentTool({ ...currentTool, isActive: false })}
                className="btn btn-sm btn-ghost text-error"
              >
                ✕ 취소
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={showAnnotations}
                onChange={(e) => setShowAnnotations(e.target.checked)}
              />
              <span className="label-text ml-2 text-sm">주석 표시</span>
            </label>
            <span className="badge badge-ghost badge-sm">
              {annotations.length}개
            </span>
          </div>
        </div>
      )}

      {/* 이미지 컨테이너 */}
      <div
        ref={containerRef}
        className="relative inline-block max-w-full overflow-hidden rounded-lg border border-base-300"
        style={{ cursor: currentTool.isActive ? 'crosshair' : 'default' }}
      >
        <Image
          ref={imageRef}
          src={imageUrl}
          alt={imageAlt || ""}
          width={800}
          height={600}
          className="max-w-full h-auto block"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)} // 에러가 발생해도 로딩 상태 해제
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          draggable={false}
        />
        
        {/* 로딩 상태 */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-base-200 flex items-center justify-center">
            <div className="loading loading-spinner loading-lg" />
          </div>
        )}
        
        {/* 주석들 */}
        {imageLoaded && showAnnotations && annotations.map(renderAnnotation)}
        
        {/* 현재 그리고 있는 영역 */}
        {currentArea && isDrawing && (
          <div
            className="absolute border-2 border-dashed border-primary bg-primary/10 z-10"
            style={{
              left: `${Math.min(currentArea.start.x, currentArea.end.x)}%`,
              top: `${Math.min(currentArea.start.y, currentArea.end.y)}%`,
              width: `${Math.abs(currentArea.end.x - currentArea.start.x)}%`,
              height: `${Math.abs(currentArea.end.y - currentArea.start.y)}%`
            }}
          />
        )}
        
        {/* 사용 안내 */}
        {currentTool.isActive && (
          <div className="absolute top-2 left-2 bg-base-100/90 px-3 py-1 rounded text-sm">
            {currentTool.type === 'point' ? '이미지를 클릭하여 포인트 주석 추가' : '드래그하여 영역 주석 추가'}
          </div>
        )}
      </div>
      
      {/* 주석 목록 */}
      {annotations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">주석 목록</h4>
          <div className="space-y-2">
            {annotations.map((annotation, index) => (
              <div
                key={annotation.id}
                className={`p-2 bg-base-200 rounded cursor-pointer hover:bg-base-300 transition-colors ${
                  selectedAnnotation === annotation.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleAnnotationClick(annotation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs badge badge-ghost">
                        {annotation.annotation_type === 'point' ? '📍' : '⬜'} #{index + 1}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {annotation.annotation_type === 'point' 
                          ? `(${annotation.position_x.toFixed(1)}%, ${annotation.position_y.toFixed(1)}%)`
                          : `영역: ${(annotation.width || 0).toFixed(1)}% × ${(annotation.height || 0).toFixed(1)}%`
                        }
                      </span>
                    </div>
                    <p className="text-sm">{annotation.content}</p>
                  </div>
                  {editable && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditAnnotation(annotation);
                        }}
                        className="btn btn-ghost btn-xs"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnotation(annotation.id);
                        }}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}