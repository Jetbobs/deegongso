"use client";

import { useState, useEffect } from "react";

// Mock 사용자 타입
interface User {
  id: string;
  email: string;
  name: string;
  userType: "client" | "designer";
  phone?: string;
  company?: string;
  experience?: string;
  avatar?: string;
}

// Mock 데이터
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "client@gmail.com",
    name: "김클라이언트",
    userType: "client",
    phone: "010-1234-5678",
    company: "스타트업 ABC",
  },
  {
    id: "2",
    email: "designer@gmail.com",
    name: "박디자이너",
    userType: "designer",
    phone: "010-9876-5432",
    experience: "3-5년",
  },
];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 초기에는 로딩 상태
  const [isHydrated, setIsHydrated] = useState(false);

  // 클라이언트 사이드 hydration 완료 확인
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 로컬스토리지에서 사용자 정보 복원 (hydration 이후에만)
  useEffect(() => {
    if (isHydrated) {
      setLoading(true);
      const savedUser = localStorage.getItem("deeo_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("사용자 정보 복원 실패:", error);
          localStorage.removeItem("deeo_user");
        }
      }
      setLoading(false); // 로컬스토리지 체크 완료
    }
  }, [isHydrated]);

  // Gmail 로그인 시뮬레이션
  const signInWithGoogle = async (email: string = "new@gmail.com") => {
    setLoading(true);

    // 실제로는 Google OAuth 처리
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 기존 사용자 찾기
    const existingUser = MOCK_USERS.find((u) => u.email === email);

    if (existingUser) {
      setUser(existingUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("deeo_user", JSON.stringify(existingUser));
      }
    } else {
      // 새 사용자 - 추가 정보 입력 필요
      const newUser: Partial<User> = {
        id: Date.now().toString(),
        email,
        name: email.split("@")[0],
      };
      setLoading(false);
      return { needsSignup: true, tempUser: newUser };
    }

    setLoading(false);
    return { needsSignup: false };
  };

  // 회원가입 완료
  const completeSignup = async (userData: Omit<User, "id">) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };

    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("deeo_user", JSON.stringify(newUser));
    }
    setLoading(false);
  };

  // 로그아웃
  const signOut = async () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("deeo_user");
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    completeSignup,
    signOut,
  };
}
