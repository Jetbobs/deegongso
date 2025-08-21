"use client";

import { useState } from "react";

interface Review {
  id: string;
  projectId: string;
  clientId: string;
  designerId: string;
  rating: number;
  comment: string;
  aspects: {
    communication: number;
    quality: number;
    timeline: number;
    professionalism: number;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  projectTitle: string;
  clientName: string;
  designerName: string;
  verified: boolean;
}

interface ReviewFormData {
  rating: number;
  comment: string;
  aspects: {
    communication: number;
    quality: number;
    timeline: number;
    professionalism: number;
  };
  isPublic: boolean;
}

interface ReviewSystemProps {
  projectId: string;
  userRole: "client" | "designer";
  targetUserId: string;
  targetUserName: string;
  existingReview?: Review;
  onReviewSubmitted?: (review: Review) => void;
}

const aspectLabels = {
  communication: "소통",
  quality: "품질", 
  timeline: "일정 준수",
  professionalism: "전문성"
};

export default function ReviewSystem({ 
  projectId, 
  userRole, 
  targetUserId, 
  targetUserName, 
  existingReview,
  onReviewSubmitted 
}: ReviewSystemProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: existingReview?.rating || 5,
    comment: existingReview?.comment || "",
    aspects: existingReview?.aspects || {
      communication: 5,
      quality: 5,
      timeline: 5,
      professionalism: 5
    },
    isPublic: existingReview?.isPublic ?? true
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredAspect, setHoveredAspect] = useState<keyof typeof aspectLabels | null>(null);
  const [hoveredAspectRating, setHoveredAspectRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock API 호출
    const newReview: Review = {
      id: existingReview?.id || `review-${Date.now()}`,
      projectId,
      clientId: userRole === "client" ? "current-user" : "other-user",
      designerId: userRole === "designer" ? "current-user" : targetUserId,
      ...formData,
      createdAt: existingReview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectTitle: "프로젝트 제목",
      clientName: userRole === "client" ? "나" : "클라이언트",
      designerName: userRole === "designer" ? "나" : targetUserName,
      verified: true
    };

    // 제출 시뮬레이션
    setTimeout(() => {
      onReviewSubmitted?.(newReview);
      setIsWriting(false);
      alert(existingReview ? "리뷰가 수정되었습니다!" : "리뷰가 등록되었습니다!");
    }, 1000);
  };

  const renderStarRating = (
    rating: number,
    onRate: (rating: number) => void,
    onHover?: (rating: number) => void,
    onLeave?: () => void,
    size: "sm" | "md" | "lg" = "md"
  ) => {
    const sizeClass = {
      sm: "mask-star text-lg",
      md: "mask-star-2 text-xl", 
      lg: "mask-star-2 text-2xl"
    }[size];

    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map(star => (
          <input
            key={star}
            type="radio"
            className={`mask ${sizeClass} bg-orange-400 cursor-pointer`}
            checked={rating === star}
            onChange={() => onRate(star)}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onLeave?.()}
          />
        ))}
      </div>
    );
  };

  if (!isWriting && !existingReview) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body text-center">
          <h3 className="card-title justify-center mb-4">
            {userRole === "client" ? "디자이너 평가하기" : "클라이언트 평가하기"}
          </h3>
          <p className="text-gray-600 mb-6">
            {targetUserName}님과의 프로젝트는 어떠셨나요?<br />
            솔직한 후기를 남겨주세요.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setIsWriting(true)}
          >
            ⭐ 리뷰 작성하기
          </button>
        </div>
      </div>
    );
  }

  if (!isWriting && existingReview) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex justify-between items-start mb-4">
            <h3 className="card-title">작성한 리뷰</h3>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setIsWriting(true)}
            >
              ✏️ 수정
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="rating">
              {[1, 2, 3, 4, 5].map(star => (
                <input
                  key={star}
                  type="radio"
                  className="mask mask-star-2 bg-orange-400"
                  checked={star <= existingReview.rating}
                  disabled
                />
              ))}
            </div>
            <span className="font-semibold">{existingReview.rating}.0</span>
            <span className="text-sm text-gray-500">
              {new Date(existingReview.updatedAt).toLocaleDateString("ko-KR")}
            </span>
          </div>

          <p className="text-gray-700 mb-4">{existingReview.comment}</p>

          {/* 세부 평가 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {Object.entries(existingReview.aspects).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm">{aspectLabels[key as keyof typeof aspectLabels]}</span>
                <div className="flex items-center gap-2">
                  <div className="rating rating-sm">
                    {[1, 2, 3, 4, 5].map(star => (
                      <input
                        key={star}
                        type="radio"
                        className="mask mask-star bg-orange-400"
                        checked={star <= value}
                        disabled
                      />
                    ))}
                  </div>
                  <span className="text-sm">{value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={existingReview.isPublic}
              disabled
              className="checkbox checkbox-sm"
            />
            <span className="text-sm text-gray-600">공개 리뷰</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title">
            {existingReview ? "리뷰 수정" : "리뷰 작성"}
          </h3>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setIsWriting(false)}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 전체 평점 */}
          <div className="text-center">
            <label className="label">
              <span className="label-text font-medium">전체 평점</span>
            </label>
            <div className="flex flex-col items-center gap-2">
              {renderStarRating(
                hoveredRating || formData.rating,
                (rating) => setFormData(prev => ({ ...prev, rating })),
                setHoveredRating,
                () => setHoveredRating(0),
                "lg"
              )}
              <span className="text-2xl font-bold text-primary">
                {hoveredRating || formData.rating}.0
              </span>
            </div>
          </div>

          {/* 세부 평가 */}
          <div>
            <label className="label">
              <span className="label-text font-medium">세부 평가</span>
            </label>
            <div className="space-y-4">
              {Object.entries(aspectLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-20">{label}</span>
                  <div className="flex items-center gap-3">
                    {renderStarRating(
                      (hoveredAspect === key ? hoveredAspectRating : 0) || formData.aspects[key as keyof typeof aspectLabels],
                      (rating) => setFormData(prev => ({
                        ...prev,
                        aspects: { ...prev.aspects, [key]: rating }
                      })),
                      (rating) => {
                        setHoveredAspect(key as keyof typeof aspectLabels);
                        setHoveredAspectRating(rating);
                      },
                      () => {
                        setHoveredAspect(null);
                        setHoveredAspectRating(0);
                      },
                      "sm"
                    )}
                    <span className="text-sm w-6">
                      {(hoveredAspect === key ? hoveredAspectRating : 0) || formData.aspects[key as keyof typeof aspectLabels]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">상세 후기</span>
              <span className="label-text-alt">{formData.comment.length}/500</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-32"
              placeholder={`${targetUserName}님과의 프로젝트 경험을 자세히 알려주세요.&#10;&#10;예시:&#10;- 소통이 원활했나요?&#10;- 결과물의 품질은 어떠했나요?&#10;- 일정은 잘 지켜졌나요?&#10;- 전반적인 만족도는 어떠했나요?`}
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                comment: e.target.value.slice(0, 500) 
              }))}
              required
              minLength={20}
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                최소 20자 이상 작성해주세요.
              </span>
            </label>
          </div>

          {/* 공개 설정 */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">
                <span className="font-medium">공개 리뷰</span>
                <span className="text-sm text-gray-500 block">
                  다른 사용자들이 이 리뷰를 볼 수 있습니다.
                </span>
              </span>
              <input
                type="checkbox"
                className="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isPublic: e.target.checked 
                }))}
              />
            </label>
          </div>

          {/* 제출 버튼 */}
          <div className="card-actions justify-end">
            <button type="button" className="btn btn-ghost" onClick={() => setIsWriting(false)}>
              취소
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={formData.comment.length < 20}
            >
              {existingReview ? "수정하기" : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}