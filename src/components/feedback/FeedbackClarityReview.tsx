"use client";

import { useState, useEffect } from "react";
import { ModificationRequest, Feedback, ClarificationRequest, FeedbackClarityAssessment, ClarityIssue } from "@/types";
import { ModificationManager } from "@/lib/modificationManager";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackClarityReviewProps {
  modificationRequest: ModificationRequest;
  feedbacks: Feedback[];
  onApprove: (requestId: string) => void;
  onRequestClarification: (requestId: string, clarificationRequests: ClarificationRequest[]) => void;
  onReject: (requestId: string, reason: string) => void;
}

interface FeedbackReview {
  feedback: Feedback;
  isClarity: boolean;
  clarityScore: number;
  issues: ClarityIssue[];
  clarificationQuestion?: string;
}

export default function FeedbackClarityReview({
  modificationRequest,
  feedbacks,
  onApprove,
  onRequestClarification,
  onReject
}: FeedbackClarityReviewProps) {
  const { user } = useAuth();
  const [feedbackReviews, setFeedbackReviews] = useState<FeedbackReview[]>([]);
  const [overallDecision, setOverallDecision] = useState<'approve' | 'clarify' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 피드백 리뷰 초기화
  useEffect(() => {
    const initialReviews = feedbacks
      .filter(feedback => modificationRequest.feedback_ids.includes(feedback.id))
      .map(feedback => ({
        feedback,
        isClarity: true,
        clarityScore: 5,
        issues: [],
        clarificationQuestion: ""
      }));
    setFeedbackReviews(initialReviews);
  }, [feedbacks, modificationRequest.feedback_ids]);

  const updateFeedbackReview = (feedbackId: string, updates: Partial<FeedbackReview>) => {
    setFeedbackReviews(prev => prev.map(review => 
      review.feedback.id === feedbackId 
        ? { ...review, ...updates }
        : review
    ));
  };

  const addIssue = (feedbackId: string, issue: ClarityIssue) => {
    setFeedbackReviews(prev => prev.map(review => 
      review.feedback.id === feedbackId 
        ? { ...review, issues: [...review.issues, issue] }
        : review
    ));
  };

  const removeIssue = (feedbackId: string, issueIndex: number) => {
    setFeedbackReviews(prev => prev.map(review => 
      review.feedback.id === feedbackId 
        ? { ...review, issues: review.issues.filter((_, index) => index !== issueIndex) }
        : review
    ));
  };

  const handleSubmit = async () => {
    if (!overallDecision) return;
    
    setIsSubmitting(true);
    
    try {
      if (overallDecision === 'approve') {
        // 모든 피드백 명확성 평가 저장
        feedbackReviews.forEach(review => {
          ModificationManager.assessFeedbackClarity(
            review.feedback.id,
            user?.id || "",
            {
              is_clear: review.isClarity,
              clarity_score: review.clarityScore,
              issues: review.issues,
              suggestions: review.issues.length > 0 ? "개선이 필요하지만 작업 진행 가능" : undefined
            }
          );
        });
        onApprove(modificationRequest.id);
      } 
      else if (overallDecision === 'clarify') {
        // 세부 설명이 필요한 피드백들에 대해 재요청 생성
        const clarificationRequests: ClarificationRequest[] = [];
        
        for (const review of feedbackReviews) {
          if (!review.isClarity && review.clarificationQuestion) {
            const clarificationRequest = ModificationManager.requestClarification(
              modificationRequest.id,
              review.feedback.id,
              review.clarificationQuestion,
              user?.id || ""
            );
            clarificationRequests.push(clarificationRequest);
          }
        }
        
        onRequestClarification(modificationRequest.id, clarificationRequests);
      } 
      else if (overallDecision === 'reject') {
        onReject(modificationRequest.id, rejectionReason);
      }
    } catch (error) {
      console.error('피드백 검토 처리 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIssueTypeInfo = (type: ClarityIssue['type']) => {
    const info = {
      vague: { label: "모호함", color: "warning", description: "내용이 구체적이지 않음" },
      missing_details: { label: "세부사항 부족", color: "error", description: "중요한 세부사항이 누락됨" },
      conflicting: { label: "상충", color: "error", description: "다른 요구사항과 상충됨" },
      technical_unclear: { label: "기술적 불명확", color: "warning", description: "기술적 구현 방법이 불분명" },
      reference_needed: { label: "참고자료 필요", color: "info", description: "예시나 참고자료가 필요함" }
    };
    return info[type];
  };

  const hasUnclearFeedbacks = feedbackReviews.some(review => !review.isClarity);
  const hasClarificationQuestions = feedbackReviews.some(review => !review.isClarity && review.clarificationQuestion);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">🔍 피드백 명확성 검토</h2>
        <p className="text-sm text-base-content/60">
          수정 요청의 각 피드백을 검토하고, 명확하지 않은 부분에 대해 세부 설명을 요청하거나 승인/거절하세요.
        </p>
      </div>

      {/* 수정 요청 정보 */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">수정 요청 #{modificationRequest.request_number}</h3>
            <span className="badge badge-warning">검토 필요</span>
          </div>
          <p className="text-sm text-base-content/70">{modificationRequest.description}</p>
          <div className="text-xs text-base-content/50 mt-2">
            📅 요청일: {new Date(modificationRequest.requested_at).toLocaleString('ko-KR')}
            {modificationRequest.urgency === 'urgent' && (
              <span className="ml-2 badge badge-error badge-xs">🔥 긴급</span>
            )}
          </div>
        </div>
      </div>

      {/* 피드백 검토 */}
      <div className="space-y-4 mb-6">
        {feedbackReviews.map((review, index) => (
          <div key={review.feedback.id} className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">📝 피드백 #{index + 1}</h4>
                  <div className="bg-base-50 p-3 rounded-lg mb-3">
                    <div dangerouslySetInnerHTML={{ __html: review.feedback.content_html }} />
                    {review.feedback.attachments && review.feedback.attachments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-base-300">
                        <span className="text-xs text-base-content/60">
                          📎 첨부파일 {review.feedback.attachments.length}개
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 명확성 평가 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">이 피드백이 명확합니까?</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`clarity-${review.feedback.id}`}
                        checked={review.isClarity}
                        onChange={() => updateFeedbackReview(review.feedback.id, { isClarity: true })}
                        className="radio radio-success radio-sm"
                      />
                      <span className="text-sm">✅ 명확함</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`clarity-${review.feedback.id}`}
                        checked={!review.isClarity}
                        onChange={() => updateFeedbackReview(review.feedback.id, { isClarity: false })}
                        className="radio radio-warning radio-sm"
                      />
                      <span className="text-sm">🤔 불명확함</span>
                    </label>
                  </div>
                </div>

                {/* 명확성 점수 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">명확성 점수 (1-5점)</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={review.clarityScore}
                    onChange={(e) => updateFeedbackReview(review.feedback.id, { clarityScore: parseInt(e.target.value) })}
                    className="range range-sm w-32"
                  />
                  <span className="text-sm font-bold w-8">{review.clarityScore}점</span>
                </div>

                {/* 불명확한 경우 세부 설명 요청 */}
                {!review.isClarity && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                    <h5 className="font-medium text-warning mb-2">🤔 세부 설명 요청</h5>
                    <textarea
                      className="textarea textarea-bordered w-full h-20 text-sm"
                      placeholder="어떤 부분이 불명확한지, 어떤 세부 정보가 필요한지 구체적으로 질문해주세요..."
                      value={review.clarificationQuestion}
                      onChange={(e) => updateFeedbackReview(review.feedback.id, { clarificationQuestion: e.target.value })}
                    />
                  </div>
                )}

                {/* 문제점 태그 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">문제점 태그</label>
                    <select
                      className="select select-bordered select-sm"
                      onChange={(e) => {
                        const issueType = e.target.value as ClarityIssue['type'];
                        if (issueType) {
                          addIssue(review.feedback.id, {
                            type: issueType,
                            description: getIssueTypeInfo(issueType).description
                          });
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">문제점 추가</option>
                      <option value="vague">모호함</option>
                      <option value="missing_details">세부사항 부족</option>
                      <option value="conflicting">상충</option>
                      <option value="technical_unclear">기술적 불명확</option>
                      <option value="reference_needed">참고자료 필요</option>
                    </select>
                  </div>
                  {review.issues.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.issues.map((issue, issueIndex) => (
                        <span
                          key={issueIndex}
                          className={`badge badge-${getIssueTypeInfo(issue.type).color} gap-2`}
                        >
                          {getIssueTypeInfo(issue.type).label}
                          <button
                            onClick={() => removeIssue(review.feedback.id, issueIndex)}
                            className="btn btn-ghost btn-xs p-0 min-h-0 h-4 w-4"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 결정 */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body p-4">
          <h4 className="font-semibold mb-4">📋 전체 결정</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="card bg-success/10 border border-success/30 cursor-pointer hover:bg-success/20">
              <div className="card-body p-4 text-center">
                <input
                  type="radio"
                  name="overall-decision"
                  value="approve"
                  checked={overallDecision === 'approve'}
                  onChange={(e) => setOverallDecision(e.target.value as 'approve')}
                  className="radio radio-success mb-2"
                />
                <div className="text-2xl mb-1">✅</div>
                <div className="font-medium">승인</div>
                <div className="text-xs text-base-content/60">
                  모든 피드백이 충분히 명확하여 작업 진행 가능
                </div>
              </div>
            </label>

            <label className="card bg-warning/10 border border-warning/30 cursor-pointer hover:bg-warning/20">
              <div className="card-body p-4 text-center">
                <input
                  type="radio"
                  name="overall-decision"
                  value="clarify"
                  checked={overallDecision === 'clarify'}
                  onChange={(e) => setOverallDecision(e.target.value as 'clarify')}
                  className="radio radio-warning mb-2"
                  disabled={!hasUnclearFeedbacks || !hasClarificationQuestions}
                />
                <div className="text-2xl mb-1">🤔</div>
                <div className="font-medium">세부 설명 요청</div>
                <div className="text-xs text-base-content/60">
                  불명확한 부분에 대해 클라이언트에게 질문
                </div>
              </div>
            </label>

            <label className="card bg-error/10 border border-error/30 cursor-pointer hover:bg-error/20">
              <div className="card-body p-4 text-center">
                <input
                  type="radio"
                  name="overall-decision"
                  value="reject"
                  checked={overallDecision === 'reject'}
                  onChange={(e) => setOverallDecision(e.target.value as 'reject')}
                  className="radio radio-error mb-2"
                />
                <div className="text-2xl mb-1">❌</div>
                <div className="font-medium">거절</div>
                <div className="text-xs text-base-content/60">
                  요구사항이 불합리하거나 작업 불가능
                </div>
              </div>
            </label>
          </div>

          {/* 거절 사유 */}
          {overallDecision === 'reject' && (
            <div className="mt-4">
              <label className="label">
                <span className="label-text font-medium">거절 사유</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                placeholder="거절 사유를 구체적으로 설명해주세요..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-end space-x-3">
        <button
          className="btn btn-ghost"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          className={`btn ${
            overallDecision === 'approve' ? 'btn-success' :
            overallDecision === 'clarify' ? 'btn-warning' :
            overallDecision === 'reject' ? 'btn-error' : 'btn-disabled'
          }`}
          onClick={handleSubmit}
          disabled={!overallDecision || isSubmitting || (overallDecision === 'reject' && !rejectionReason.trim())}
        >
          {isSubmitting ? (
            <div className="loading loading-spinner loading-sm" />
          ) : overallDecision === 'approve' ? '✅ 승인하기' :
            overallDecision === 'clarify' ? '🤔 세부 설명 요청' :
            overallDecision === 'reject' ? '❌ 거절하기' : '결정 선택'}
        </button>
      </div>
    </div>
  );
}