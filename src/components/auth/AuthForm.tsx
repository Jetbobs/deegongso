"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/database.types";

interface AuthFormProps {
  initialMode?: "login" | "signup";
}

export default function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: "client" as "client" | "designer",
    company_name: "",
    bio: "",
    location: "",
    skills: [] as string[],
    hourly_rate: 0,
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signUp, resendConfirmation } = useAuth();
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourly_rate" ? Number(value) : value,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await resendConfirmation(formData.email);
      alert("확인 이메일이 재전송되었습니다. 이메일을 확인해주세요.");
    } catch (err: any) {
      setError(err.message || "이메일 재전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(formData.email, formData.password);
        router.push("/dashboard");
      } else {
        // 회원가입 검증
        if (formData.password !== formData.confirmPassword) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }
        if (formData.password.length < 6) {
          throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
        }
        if (!formData.full_name.trim()) {
          throw new Error("이름을 입력해주세요.");
        }

        await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          role: formData.role,
          company_name: formData.company_name || undefined,
          bio: formData.bio || undefined,
          location: formData.location || undefined,
          skills: formData.skills.length > 0 ? formData.skills : undefined,
          hourly_rate:
            formData.role === "designer" && formData.hourly_rate > 0
              ? formData.hourly_rate
              : undefined,
        });

        // 회원가입 성공
        setMode("login");
        setError("");
        alert(
          "회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화한 후 로그인해주세요."
        );
      }
    } catch (err: any) {
      console.error("Auth error:", err);

      // 이메일 확인 오류 처리
      if (err.message?.includes("Email not confirmed")) {
        setError(
          "이메일 확인이 필요합니다. 회원가입 시 받은 이메일을 확인하고 인증 링크를 클릭해주세요."
        );
      } else if (err.message?.includes("Invalid login credentials")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError(err.message || "오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {mode === "login" ? "로그인" : "회원가입"}
            </h1>
            <p className="text-base-content/60">
              {mode === "login"
                ? "디오 플랫폼에 오신 것을 환영합니다"
                : "새로운 계정을 만들어보세요"}
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="alert alert-error mb-4">
              <div className="flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
              {/* 이메일 확인 오류 시 재전송 버튼 */}
              {error.includes("이메일 확인이 필요합니다") && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="btn btn-sm btn-outline"
                  disabled={loading}
                >
                  이메일 재전송
                </button>
              )}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            {/* 기본 로그인 정보 */}
            <div className="flex flex-col space-y-4">
              {/* 이메일 */}
              <div className="flex flex-col space-y-2 w-full">
                <label className="text-sm font-medium text-base-content">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* 비밀번호 */}
              <div className="flex flex-col space-y-2 w-full">
                <label className="text-sm font-medium text-base-content">
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="최소 6자 이상"
                  required
                />
              </div>
            </div>

            {/* 회원가입 추가 필드들 */}
            {mode === "signup" && (
              <div className="flex flex-col space-y-4">
                {/* 비밀번호 확인 */}
                <div className="flex flex-col space-y-2 w-full">
                  <label className="text-sm font-medium text-base-content">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input input-bordered w-full focus:input-primary"
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                </div>

                {/* 이름 */}
                <div className="flex flex-col space-y-2 w-full">
                  <label className="text-sm font-medium text-base-content">
                    이름
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="input input-bordered w-full focus:input-primary"
                    placeholder="홍길동"
                    required
                  />
                </div>

                {/* 역할 선택 */}
                <div className="flex flex-col space-y-2 w-full">
                  <label className="text-sm font-medium text-base-content">
                    역할
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="select select-bordered w-full focus:select-primary"
                    required
                  >
                    <option value="client">클라이언트 (프로젝트 의뢰자)</option>
                    <option value="designer">디자이너 (프로젝트 수행자)</option>
                  </select>
                </div>

                {/* 클라이언트 전용 필드 */}
                {formData.role === "client" && (
                  <div className="flex flex-col space-y-2 w-full">
                    <label className="text-sm font-medium text-base-content">
                      회사명 (선택)
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="input input-bordered w-full focus:input-primary"
                      placeholder="회사명을 입력하세요"
                    />
                  </div>
                )}

                {/* 디자이너 전용 필드 */}
                {formData.role === "designer" && (
                  <>
                    <div className="flex flex-col space-y-2 w-full">
                      <label className="text-sm font-medium text-base-content">
                        시간당 요금 (원)
                      </label>
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        className="input input-bordered w-full focus:input-primary"
                        placeholder="50000"
                        min="0"
                      />
                    </div>

                    {/* 스킬 추가 */}
                    <div className="flex flex-col space-y-2 w-full">
                      <label className="text-sm font-medium text-base-content">
                        스킬
                      </label>
                      <div className="join w-full">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          className="input input-bordered join-item flex-1 focus:input-primary"
                          placeholder="스킬을 입력하세요 (예: UI/UX, Figma)"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addSkill())
                          }
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="btn btn-primary join-item"
                        >
                          추가
                        </button>
                      </div>
                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.skills.map((skill, index) => (
                            <div
                              key={index}
                              className="badge badge-primary gap-2 text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="btn btn-ghost btn-xs hover:btn-error"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* 공통 선택 필드 */}
                <div className="flex flex-col space-y-2 w-full">
                  <label className="text-sm font-medium text-base-content">
                    지역 (선택)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input input-bordered w-full focus:input-primary"
                    placeholder="서울, 부산, 원격 등"
                  />
                </div>

                <div className="flex flex-col space-y-2 w-full">
                  <label className="text-sm font-medium text-base-content">
                    자기소개 (선택)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-20 w-full focus:textarea-primary resize-none"
                    placeholder="간단한 자기소개를 입력하세요"
                  />
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="form-control mt-6 flex justify-center">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading
                  ? "처리 중..."
                  : mode === "login"
                  ? "로그인"
                  : "회원가입"}
              </button>
            </div>
          </form>

          {/* 모드 전환 */}
          <div className="divider">또는</div>
          <div className="text-center">
            <p className="text-sm text-base-content/60">
              {mode === "login"
                ? "아직 계정이 없으신가요?"
                : "이미 계정이 있으신가요?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="btn btn-link btn-sm"
            >
              {mode === "login" ? "회원가입하기" : "로그인하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
