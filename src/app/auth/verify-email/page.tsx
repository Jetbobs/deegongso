"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token) {
      // Mock 이메일 인증 로직
      setTimeout(() => {
        if (token === "valid-token") {
          setStatus("success");
        } else if (token === "expired-token") {
          setStatus("expired");
        } else {
          setStatus("error");
        }
      }, 2000);
    } else {
      setStatus("error");
    }
  }, [token]);

  // 재전송 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    setCanResend(false);
    setCountdown(60);
    // Mock 재전송 로직
    alert("인증 이메일이 재전송되었습니다.");
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">이메일 인증 중...</h1>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">이메일 인증 완료!</h1>
            <p className="text-gray-600 mb-6">
              계정이 성공적으로 인증되었습니다.<br />
              이제 모든 서비스를 이용하실 수 있습니다.
            </p>
            <button 
              onClick={() => router.push("/dashboard")}
              className="btn btn-primary"
            >
              대시보드로 이동
            </button>
          </div>
        );

      case "expired":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-yellow-600 mb-2">인증 링크 만료</h1>
            <p className="text-gray-600 mb-6">
              인증 링크가 만료되었습니다.<br />
              새로운 인증 이메일을 받아보세요.
            </p>
            <div className="space-y-3">
              {canResend ? (
                <button 
                  onClick={handleResendEmail}
                  className="btn btn-primary"
                >
                  인증 이메일 재전송
                </button>
              ) : (
                <button className="btn btn-disabled">
                  재전송 가능까지 {countdown}초
                </button>
              )}
              <div>
                <Link href="/login" className="btn btn-outline">
                  로그인 페이지로
                </Link>
              </div>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">인증 실패</h1>
            <p className="text-gray-600 mb-6">
              잘못된 인증 링크이거나 이미 사용된 링크입니다.<br />
              다시 시도해주세요.
            </p>
            <div className="space-y-3">
              {canResend ? (
                <button 
                  onClick={handleResendEmail}
                  className="btn btn-primary"
                >
                  인증 이메일 재전송
                </button>
              ) : (
                <button className="btn btn-disabled">
                  재전송 가능까지 {countdown}초
                </button>
              )}
              <div>
                <Link href="/login" className="btn btn-outline">
                  로그인 페이지로
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body p-8">
          {renderContent()}
          
          {email && (
            <div className="mt-6 p-4 bg-base-200 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                인증 이메일: <span className="font-medium">{email}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}