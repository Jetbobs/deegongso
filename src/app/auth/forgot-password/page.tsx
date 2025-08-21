"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Mock API 호출
    setTimeout(() => {
      if (email && email.includes("@")) {
        setStatus("sent");
        setCountdown(300); // 5분 카운트다운
        startCountdown();
      } else {
        setStatus("error");
      }
    }, 2000);
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === "sent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl">
          <div className="card-body p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-green-600 mb-2">이메일 전송 완료!</h1>
            <p className="text-gray-600 mb-4">
              비밀번호 재설정 링크가 전송되었습니다.
            </p>
            <div className="bg-base-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{email}</span><br />
                이메일을 확인해주세요.
              </p>
            </div>

            {countdown > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  링크 만료까지: <span className="font-mono font-bold">{formatTime(countdown)}</span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => setStatus("idle")}
                className="btn btn-outline w-full"
              >
                다른 이메일로 재전송
              </button>
              <Link href="/login" className="btn btn-primary w-full">
                로그인 페이지로
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>이메일이 오지 않았나요?</p>
              <p>스팸 폴더를 확인하거나 몇 분 후 다시 시도해보세요.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 찾기</h1>
            <p className="text-gray-600">
              가입하신 이메일 주소를 입력하면<br />
              비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">이메일 주소</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
              />
            </div>

            {status === "error" && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>올바른 이메일 주소를 입력해주세요.</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={status === "loading" || !email}
            >
              {status === "loading" ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  전송 중...
                </>
              ) : (
                "재설정 링크 전송"
              )}
            </button>
          </form>

          <div className="divider text-sm">또는</div>

          <div className="text-center space-y-2">
            <Link href="/login" className="btn btn-ghost w-full">
              로그인 페이지로 돌아가기
            </Link>
            <Link href="/signup" className="link link-primary text-sm">
              계정이 없으신가요? 회원가입
            </Link>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 도움말</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 이메일이 오지 않으면 스팸 폴더를 확인해주세요</li>
              <li>• 링크는 5분간 유효합니다</li>
              <li>• 여전히 문제가 있다면 고객지원에 문의하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}