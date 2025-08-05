"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types/database.types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    // 15초 후 강제로 loading false (무한 로딩 방지)
    const forceLoadingTimeout = setTimeout(() => {
      console.log("⏰ 15초 경과, 강제로 loading 상태 해제");
      setAuthState((prev) => ({ ...prev, loading: false }));
    }, 15000);

    // 현재 세션 가져오기
    const getSession = async () => {
      console.log("🔄 세션 가져오기 시작...");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ 세션 가져오기 오류:", error);
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
        });

        // 오류 발생 시에도 타임아웃 취소
        clearTimeout(forceLoadingTimeout);
        return;
      }

      console.log("📋 세션 상태:", {
        hasSession: !!session,
        userId: session?.user?.id,
      });

      if (session?.user) {
        console.log("👤 사용자 발견, 프로필 가져오기 중...");

        // 사용자 프로필 가져오기
        let profile = null;
        try {
          console.log("🔄 프로필 조회 시작, User ID:", session.user.id);

          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          console.log("📊 프로필 조회 결과:", { data, error });

          if (error) {
            console.error("❌ 프로필 가져오기 오류:", error);
            console.error("🔍 세부사항:", {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            });
          } else if (data) {
            profile = data;
            console.log("✅ 프로필 로드 완료!");
            console.log("📋 프로필 상세 정보:", {
              id: profile.id,
              full_name: profile.full_name,
              role: profile.role,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              profileType: typeof profile,
              isObject: profile !== null && typeof profile === "object",
            });
          } else {
            console.log("⚠️ 프로필이 존재하지 않습니다. 생성이 필요합니다.");
            console.log("🔍 데이터 상태:", {
              data,
              hasData: !!data,
              dataType: typeof data,
            });
          }
        } catch (unexpectedError) {
          console.error("💥 예상치 못한 오류:", unexpectedError);
        }

        console.log("🔄 getSession에서 AuthState 업데이트:", {
          hasUser: !!session.user,
          hasProfile: !!(profile || null),
          profileData: profile || null,
          willSetProfile: profile || null,
        });

        setAuthState({
          user: session.user,
          profile: profile || null,
          session,
          loading: false,
        });

        // 성공적으로 로드되면 강제 타임아웃 취소
        clearTimeout(forceLoadingTimeout);
      } else {
        console.log("🚫 세션 없음, 로그인 필요");
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
        });

        // 세션 없음도 완료된 상태이므로 타임아웃 취소
        clearTimeout(forceLoadingTimeout);
      }
    };

    getSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 인증 상태 변경:", event, { hasSession: !!session });

      if (session?.user) {
        console.log("👤 리스너에서 사용자 발견, 프로필 가져오기 중...");

        // 사용자 프로필 가져오기
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        console.log("📊 리스너 프로필 조회 결과:", {
          profile,
          error: profileError,
        });

        if (profileError) {
          console.error("❌ 리스너에서 프로필 가져오기 오류:", profileError);
          console.error("🔍 리스너 오류 세부사항:", {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
          });
        } else if (profile) {
          console.log("✅ 리스너에서 프로필 로드 완료!");
          console.log("📋 리스너 프로필 상세 정보:", {
            id: profile.id,
            full_name: profile.full_name,
            role: profile.role,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            profileType: typeof profile,
            isObject: profile !== null && typeof profile === "object",
          });
        } else {
          console.log("⚠️ 리스너에서 프로필이 존재하지 않습니다.");
          console.log("🔍 리스너 데이터 상태:", {
            profile,
            hasProfile: !!profile,
            profileType: typeof profile,
          });
        }

        console.log("🔄 리스너에서 AuthState 업데이트:", {
          hasUser: !!session.user,
          hasProfile: !!(profile || null),
          profileData: profile || null,
          willSetProfile: profile || null,
        });

        setAuthState({
          user: session.user,
          profile: profile || null,
          session,
          loading: false,
        });
      } else {
        console.log("🚫 리스너에서 세션 없음");
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(forceLoadingTimeout);
    };
  }, [supabase]);

  // 로그인
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // 회원가입
  const signUp = async (
    email: string,
    password: string,
    userData: {
      full_name: string;
      role: "client" | "designer";
      company_name?: string;
      bio?: string;
      location?: string;
      skills?: string[];
      hourly_rate?: number;
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      throw error;
    }

    // 회원가입 성공 시 user_profiles 테이블에 프로필 생성
    if (data.user) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: userData.full_name,
          role: userData.role,
          company_name: userData.company_name,
          bio: userData.bio,
          location: userData.location,
          skills: userData.skills,
          hourly_rate: userData.hourly_rate,
        });

      if (profileError) {
        console.error("프로필 생성 오류:", profileError);
        // 프로필 생성 실패해도 회원가입은 성공으로 처리
      }
    }

    return data;
  };

  // 로그아웃
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // 이메일 확인 재전송
  const resendConfirmation = async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmation,
    isAuthenticated: !!authState.user,
    isClient: authState.profile?.role === "client",
    isDesigner: authState.profile?.role === "designer",
  };
}
