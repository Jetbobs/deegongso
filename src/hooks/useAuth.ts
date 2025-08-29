"use client";

import { useState, useEffect } from "react";
import { TempUser, UserRole } from "@/types";

// Mock 사용자 타입
interface User {
  id: string;
  email: string;
  name: string;
  userType: "client" | "designer" | "admin";
  // 타입 일관화를 위해 role을 함께 노출 (userType과 동일 값)
  role?: "client" | "designer" | "admin";
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
    role: "client",
    phone: "010-1234-5678",
    company: "스타트업 ABC",
  },
  {
    id: "2",
    email: "designer@gmail.com",
    name: "박디자이너",
    userType: "designer",
    role: "designer",
    phone: "010-9876-5432",
    experience: "3-5년",
  },
  {
    id: "3",
    email: "admin@gmail.com",
    name: "관리자",
    userType: "admin",
    role: "admin",
    phone: "010-0000-0000",
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
          const parsed = JSON.parse(savedUser);
          // role 필드가 없으면 userType을 기준으로 보강 후 저장
          const hydrated: User = {
            ...parsed,
            id: String(parsed.id),
            role: parsed.role ?? parsed.userType,
          };
          setUser(hydrated);
          localStorage.setItem("deeo_user", JSON.stringify(hydrated));
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
      // 테스트를 위해 특정 이메일에 고정 ID 할당
      let userId = "1"; // 기본값: 클라이언트 ID
      if (email.includes("designer") || email.includes("디자이너")) {
        userId = "2"; // 디자이너 ID
      } else if (email.includes("client") || email.includes("클라이언트")) {
        userId = "1"; // 클라이언트 ID (명시적)
      }
      // 기타 모든 이메일은 기본적으로 클라이언트(ID: "1")로 처리

      const newUser: TempUser = {
        id: userId,
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

    // 테스트를 위해 특정 이메일에 고정 ID 할당
    let userId = "1"; // 기본값: 클라이언트 ID
    if (
      userData.email.includes("designer") ||
      userData.email.includes("디자이너")
    ) {
      userId = "2"; // 디자이너 ID
    } else if (
      userData.email.includes("client") ||
      userData.email.includes("클라이언트")
    ) {
      userId = "1"; // 클라이언트 ID (명시적)
    }
    // 기타 모든 이메일은 기본적으로 클라이언트(ID: "1")로 처리

    const userType = 'userType' in userData ? (userData as { userType: UserRole }).userType : 'client';
    const roleFromType: "client" | "designer" = userType === "designer" ? "designer" : "client";

    const newUser: User = {
      ...userData,
      id: userId,
      userType: userType ?? roleFromType,
      role: roleFromType,
    } as User;

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
