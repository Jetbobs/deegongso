"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "success" | "error">("loading");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token) {
      // Mock 토큰 검증
      setTimeout(() => {
        if (token === "valid-reset-token") {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      }, 2000);
    } else {
      setStatus("invalid");
    }
  }, [token]);

  // 비밀번호 강도 체크
  useEffect(() => {
    const { password } = formData;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setStatus("error");
      return;
    }

    if (passwordStrength < 3) {
      setStatus("error");
      return;
    }

    // Mock 비밀번호 재설정 API
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return "text-red-500";
      case 2: return "text-yellow-500";
      case 3: return "text-blue-500";
      case 4:
      case 5: return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return "매우 약함";
      case 2: return "약함";
      case 3: return "보통";
      case 4: return "강함";
      case 5: return "매우 강함";
      default: return "";
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl">
          <div className="card-body p-8 text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">링크 확인 중...</h1>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl">
          <div className="card-body p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">잘못된 링크</h1>
            <p className="text-gray-600 mb-6">
              비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.<br />
              새로운 링크를 요청해주세요.
            </p>
            <div className="space-y-3">
              <Link href="/auth/forgot-password" className="btn btn-primary w-full">
                새 링크 요청하기
              </Link>
              <Link href="/login" className="btn btn-outline w-full">
                로그인 페이지로
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl">
          <div className="card-body p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">비밀번호 변경 완료!</h1>
            <p className="text-gray-600 mb-6">
              새로운 비밀번호로 성공적으로 변경되었습니다.<br />
              이제 새 비밀번호로 로그인하실 수 있습니다.
            </p>
            <button 
              onClick={() => router.push("/login")}
              className="btn btn-primary w-full"
            >
              로그인 하러 가기
            </button>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">새 비밀번호 설정</h1>
            <p className="text-gray-600">
              안전한 새 비밀번호를 입력해주세요.
            </p>
            {email && (
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">{email}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">새 비밀번호</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-10"
                  placeholder="새 비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>비밀번호 강도:</span>
                    <span className={`font-medium ${getStrengthColor()}`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength <= 1 ? 'bg-red-500' :
                        passwordStrength === 2 ? 'bg-yellow-500' :
                        passwordStrength === 3 ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">비밀번호 확인</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">비밀번호가 일치하지 않습니다</span>
                </label>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">비밀번호 요구사항:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                  ✓ 8자 이상
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                  ✓ 대문자 포함
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                  ✓ 소문자 포함
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  ✓ 숫자 포함
                </li>
                <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  ✓ 특수문자 포함
                </li>
              </ul>
            </div>

            {status === "error" && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>비밀번호 요구사항을 확인하고 다시 시도해주세요.</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={
                !formData.password || 
                !formData.confirmPassword || 
                formData.password !== formData.confirmPassword ||
                passwordStrength < 3
              }
            >
              비밀번호 변경하기
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="link link-primary text-sm">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}