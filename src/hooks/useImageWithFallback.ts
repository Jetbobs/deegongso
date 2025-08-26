"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface UseImageWithFallbackResult {
  image: HTMLImageElement | null;
  status: 'loading' | 'loaded' | 'failed';
  currentUrl: string | null;
  error: string | null;
  debugInfo: {
    attemptedUrls: string[];
    failureReasons: Array<{ url: string; reason: string; timestamp: string }>;
    totalAttempts: number;
  };
}

/**
 * 여러 이미지 URL을 시도하며 fallback을 제공하는 hook
 */
export function useImageWithFallback(
  urls: string[], 
  crossOrigin?: string
): UseImageWithFallbackResult {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    attemptedUrls: [] as string[],
    failureReasons: [] as Array<{ url: string; reason: string; timestamp: string }>,
    totalAttempts: 0
  });
  
  // 현재 진행 중인 이미지 로딩을 추적하기 위한 ref
  const currentImageRef = useRef<HTMLImageElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // URLs를 memoize하여 불필요한 재렌더링 방지
  const memoizedUrls = useMemo(() => urls, [JSON.stringify(urls)]);

  useEffect(() => {
    if (!memoizedUrls || memoizedUrls.length === 0) {
      setStatus('failed');
      setError('이미지 URL이 제공되지 않았습니다');
      return;
    }

    // 초기화
    setStatus('loading');
    setError(null);
    setImage(null);
    setUrlIndex(0);
    setDebugInfo({
      attemptedUrls: [],
      failureReasons: [],
      totalAttempts: 0
    });
  }, [memoizedUrls]);

  useEffect(() => {
    if (!memoizedUrls || memoizedUrls.length === 0 || urlIndex >= memoizedUrls.length) {
      if (urlIndex >= memoizedUrls.length) {
        setStatus('failed');
        setError('모든 이미지 URL 로드에 실패했습니다');
      }
      return;
    }

    const url = memoizedUrls[urlIndex];
    
    // URL이 유효하지 않으면 다음으로 넘어감
    if (!url || url.trim() === '') {
      console.warn(`Invalid URL at index ${urlIndex}:`, url);
      if (urlIndex < memoizedUrls.length - 1) {
        setUrlIndex(prev => prev + 1);
      } else {
        setStatus('failed');
        setError('유효한 이미지 URL이 없습니다');
      }
      return;
    }

    // 이미 처리 중인 경우 중복 실행 방지
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    setCurrentUrl(url);
    
    // 디버그 정보 업데이트 (함수형 업데이트로 의존성 제거)
    setDebugInfo(prev => {
      // 이미 시도한 URL인 경우 중복 추가 방지
      if (prev.attemptedUrls.includes(url)) {
        return prev;
      }
      return {
        ...prev,
        attemptedUrls: [...prev.attemptedUrls, url],
        totalAttempts: prev.totalAttempts + 1
      };
    });
    
    const img = new Image();
    
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }

    const handleLoad = () => {
      console.log(`✅ 이미지 로드 성공: ${url}`);
      setImage(img);
      setStatus('loaded');
      setError(null);
      setIsProcessing(false);
    };

    const addFailureReason = (reason: string) => {
      setDebugInfo(prev => {
        // 같은 URL에 대한 중복 실패 이유 방지
        const existingFailure = prev.failureReasons.find(f => f.url === url);
        if (existingFailure) {
          return prev;
        }
        return {
          ...prev,
          failureReasons: [...prev.failureReasons, {
            url,
            reason,
            timestamp: new Date().toISOString()
          }]
        };
      });
    };

    const handleError = (e: Event | string) => {
      let errorReason = '';
      let errorDetails: any = {};
      
      if (typeof e === 'string') {
        errorReason = e;
        errorDetails.type = 'timeout';
      } else if (e instanceof ErrorEvent) {
        errorReason = `ErrorEvent: ${e.message}`;
        errorDetails = {
          type: 'ErrorEvent',
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno
        };
      } else if (e.target instanceof HTMLImageElement) {
        const imgElement = e.target;
        errorReason = `Image load error - naturalWidth: ${imgElement.naturalWidth}, naturalHeight: ${imgElement.naturalHeight}, complete: ${imgElement.complete}`;
        
        // 더 상세한 오류 정보 수집
        errorDetails = {
          type: 'HTMLImageElement error',
          naturalWidth: imgElement.naturalWidth,
          naturalHeight: imgElement.naturalHeight,
          complete: imgElement.complete,
          currentSrc: imgElement.currentSrc,
          crossOrigin: imgElement.crossOrigin,
          networkState: navigator.onLine ? 'online' : 'offline',
          userAgent: navigator.userAgent,
          cookieEnabled: navigator.cookieEnabled,
          url: url,
          urlType: url.startsWith('data:') ? 'data' : url.startsWith('http') ? 'external' : 'other'
        };
        
        // 네트워크 상태 확인
        if (!navigator.onLine) {
          errorReason += ' (Network offline)';
        }
        
        // URL 유형별 분석
        if (url.startsWith('data:')) {
          errorReason += ' (Data URL issue)';
          // Data URL 길이 확인
          if (url.length > 2000000) { // 2MB
            errorReason += ' - URL too long';
            errorDetails.dataUrlLength = url.length;
          }
        } else if (url.startsWith('http://') || url.startsWith('https://')) {
          errorReason += ' (External URL issue - CORS/Network)';
          
          // 추가 네트워크 진단
          if (url.includes('localhost') || url.includes('127.0.0.1')) {
            errorReason += ' - Local server';
          } else if (url.includes('placeholder') || url.includes('picsum') || url.includes('dummyimage')) {
            errorReason += ' - External placeholder service';
          }
        }
        
        // HTTPS/HTTP 혼용 문제 확인
        if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http:')) {
          errorReason += ' (Mixed content - HTTPS page loading HTTP resource)';
          errorDetails.mixedContent = true;
        }
      } else {
        errorReason = `Unknown error: ${e.type || 'Unknown type'}`;
        errorDetails = {
          type: 'unknown',
          event: e,
          eventType: e.type || 'no type'
        };
      }
      
      console.error(`❌ 이미지 로드 실패 (${urlIndex + 1}/${memoizedUrls.length}): ${url}`, {
        reason: errorReason,
        details: errorDetails,
        event: e,
        timestamp: new Date().toISOString()
      });
      
      addFailureReason(errorReason);
      setIsProcessing(false);
      
      // 다음 URL 시도
      if (urlIndex < memoizedUrls.length - 1) {
        setTimeout(() => {
          setUrlIndex(prev => prev + 1);
        }, 100); // 작은 지연으로 무한루프 방지
      } else {
        // 모든 URL 실패
        setStatus('failed');
        setError(`모든 이미지 로드 실패. 마지막 시도: ${url}`);
        setImage(null);
      }
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    
    // 타임아웃 설정 (5초로 단축)
    const timeoutId = setTimeout(() => {
      console.warn(`이미지 로드 타임아웃: ${url}`);
      handleError('timeout');
    }, 5000);
    
    // 이미지 로드 시작
    img.src = url;

    return () => {
      clearTimeout(timeoutId);
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      setIsProcessing(false);
      // 이미지 로딩 중단
      img.src = '';
    };
  }, [memoizedUrls, urlIndex, crossOrigin]);

  return { image, status, currentUrl, error, debugInfo };
}
