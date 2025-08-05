"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthFormProps {
  onNeedsSignup: (tempUser: any) => void;
}

export default function AuthForm({ onNeedsSignup }: AuthFormProps) {
  const { signInWithGoogle, loading } = useAuth();
  const [demoEmail, setDemoEmail] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle(demoEmail || "new@gmail.com");
      if (result?.needsSignup) {
        onNeedsSignup(result.tempUser);
      }
    } catch (error) {
      console.error("로그인 오류:", error);
    }
  };

  const handleDemoLogin = async (email: string) => {
    await signInWithGoogle(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body p-8">
          {/* 로고/헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Deeo</h1>
            <p className="text-base-content/70">
              프로젝트를 더 투명하게, 더 신뢰할 수 있게
            </p>
          </div>

          {/* Google 로그인 버튼 */}
          <button
            className={`btn btn-outline btn-lg w-full mb-4 ${
              loading ? "loading" : ""
            }`}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {!loading && (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285f4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34a853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fbbc05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google로 계속하기
          </button>

          <div className="divider text-xs">데모 계정으로 체험하기</div>

          {/* 데모 계정들 */}
          <div className="space-y-2">
            <button
              className="btn btn-ghost btn-sm w-full justify-start"
              onClick={() => handleDemoLogin("client@gmail.com")}
            >
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-6">
                  <span className="text-xs">C</span>
                </div>
              </div>
              클라이언트로 체험하기
            </button>

            <button
              className="btn btn-ghost btn-sm w-full justify-start"
              onClick={() => handleDemoLogin("designer@gmail.com")}
            >
              <div className="avatar placeholder">
                <div className="bg-secondary text-secondary-content rounded-full w-6">
                  <span className="text-xs">D</span>
                </div>
              </div>
              디자이너로 체험하기
            </button>
          </div>

          {/* 커스텀 이메일 테스트 */}
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <p className="text-sm text-base-content/70 mb-2">
              새 사용자 체험 (회원가입 플로우)
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="test@example.com"
                className="input input-sm flex-1"
                value={demoEmail}
                onChange={(e) => setDemoEmail(e.target.value)}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={handleGoogleSignIn}
              >
                체험
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
