"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import SignupForm from "@/components/auth/SignupForm";
import AuthWrapper from "@/components/auth/AuthWrapper";

export default function LoginPage() {
  const router = useRouter();
  const [showSignup, setShowSignup] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  const handleNeedsSignup = (tempUserData: any) => {
    setTempUser(tempUserData);
    setShowSignup(true);
  };

  const handleSignupComplete = () => {
    setShowSignup(false);
    router.push("/dashboard");
  };

  const handleBackToLogin = () => {
    setShowSignup(false);
    setTempUser(null);
  };

  return (
    <AuthWrapper requireAuth={false}>
      <div>
        {showSignup ? (
          <div>
            <SignupForm tempUser={tempUser} onComplete={handleSignupComplete} />
            <button
              className="absolute top-4 left-4 btn btn-ghost btn-sm"
              onClick={handleBackToLogin}
            >
              ← 로그인으로 돌아가기
            </button>
          </div>
        ) : (
          <AuthForm onNeedsSignup={handleNeedsSignup} />
        )}
      </div>
    </AuthWrapper>
  );
}
