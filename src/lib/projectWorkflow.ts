import { ProjectStatus } from "@/types";

export interface WorkflowTransition {
  from: ProjectStatus;
  to: ProjectStatus;
  label: string;
  description: string;
  requiredRole: "client" | "designer" | "both";
  validationRules?: string[];
  autoProgress?: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface WorkflowAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  variant: "primary" | "secondary" | "warning" | "success" | "error";
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  // 프로젝트 생성 단계
  {
    from: "creation_pending",
    to: "review_requested", 
    label: "검토 요청",
    description: "클라이언트에게 프로젝트 승인 요청",
    requiredRole: "designer"
  },
  {
    from: "creation_pending",
    to: "cancelled",
    label: "프로젝트 취소",
    description: "프로젝트 생성을 취소합니다",
    requiredRole: "both"
  },
  
  // 검토 요청 단계
  {
    from: "review_requested",
    to: "client_review_pending",
    label: "승인 대기",
    description: "클라이언트 승인 대기 상태로 전환",
    requiredRole: "designer",
    autoProgress: true
  },
  
  // 클라이언트 검토 단계
  {
    from: "client_review_pending",
    to: "in_progress",
    label: "프로젝트 승인",
    description: "프로젝트를 승인하고 진행을 시작합니다",
    requiredRole: "client"
  },
  {
    from: "client_review_pending", 
    to: "creation_pending",
    label: "수정 요청",
    description: "프로젝트 내용 수정을 요청합니다",
    requiredRole: "client"
  },
  {
    from: "client_review_pending",
    to: "cancelled",
    label: "프로젝트 거절",
    description: "프로젝트를 거절합니다",
    requiredRole: "client"
  },
  
  // 진행 중 단계
  {
    from: "in_progress",
    to: "feedback_period",
    label: "피드백 요청",
    description: "초안 제출 및 피드백 요청",
    requiredRole: "designer",
    validationRules: ["draft_files_required"]
  },
  {
    from: "in_progress",
    to: "completion_requested",
    label: "완료 요청",
    description: "프로젝트 완료를 요청합니다",
    requiredRole: "designer",
    validationRules: ["final_deliverables_required"]
  },
  
  // 피드백 기간
  {
    from: "feedback_period",
    to: "modification_in_progress",
    label: "수정 진행",
    description: "피드백을 바탕으로 수정 작업 시작",
    requiredRole: "designer",
    validationRules: ["feedback_received"]
  },
  {
    from: "feedback_period",
    to: "completion_requested",
    label: "완료 요청",
    description: "추가 수정 없이 완료 요청",
    requiredRole: "designer"
  },
  
  // 수정 진행 중
  {
    from: "modification_in_progress",
    to: "feedback_period",
    label: "재검토 요청",
    description: "수정된 내용에 대한 재검토 요청",
    requiredRole: "designer"
  },
  {
    from: "modification_in_progress",
    to: "completion_requested",
    label: "완료 요청",
    description: "수정 완료 후 프로젝트 완료 요청",
    requiredRole: "designer"
  },
  
  // 완료 요청 단계
  {
    from: "completion_requested",
    to: "completed",
    label: "프로젝트 승인",
    description: "프로젝트를 완료 승인합니다",
    requiredRole: "client"
  },
  {
    from: "completion_requested",
    to: "modification_in_progress",
    label: "추가 수정 요청",
    description: "추가 수정사항을 요청합니다",
    requiredRole: "client",
    validationRules: ["modification_count_available"]
  },
  
  // 완료 단계
  {
    from: "completed",
    to: "archived",
    label: "아카이브",
    description: "완료된 프로젝트를 아카이브합니다",
    requiredRole: "both"
  }
];

export const WORKFLOW_ACTIONS: Record<ProjectStatus, WorkflowAction[]> = {
  creation_pending: [
    {
      id: "request_review",
      label: "검토 요청",
      description: "클라이언트에게 프로젝트 승인을 요청합니다",
      icon: "📋",
      variant: "primary"
    },
    {
      id: "cancel_project",
      label: "취소",
      description: "프로젝트 생성을 취소합니다",
      icon: "❌", 
      variant: "error",
      requiresConfirmation: true,
      confirmationMessage: "정말로 프로젝트를 취소하시겠습니까?"
    }
  ],
  
  review_requested: [
    {
      id: "auto_progress",
      label: "승인 대기 중",
      description: "클라이언트 승인을 기다리고 있습니다",
      icon: "⏳",
      variant: "secondary"
    }
  ],
  
  client_review_pending: [
    {
      id: "approve_project",
      label: "프로젝트 승인",
      description: "프로젝트를 승인하고 작업을 시작합니다",
      icon: "✅",
      variant: "success"
    },
    {
      id: "request_modification",
      label: "수정 요청",
      description: "프로젝트 내용의 수정을 요청합니다",
      icon: "✏️",
      variant: "warning"
    },
    {
      id: "reject_project",
      label: "프로젝트 거절",
      description: "프로젝트를 거절합니다",
      icon: "❌",
      variant: "error",
      requiresConfirmation: true,
      confirmationMessage: "프로젝트를 거절하시겠습니까?"
    }
  ],
  
  designer_review_pending: [
    {
      id: "start_work",
      label: "작업 시작",
      description: "프로젝트 작업을 시작합니다",
      icon: "🎨",
      variant: "primary"
    }
  ],
  
  in_progress: [
    {
      id: "request_feedback",
      label: "피드백 요청",
      description: "초안을 제출하고 피드백을 요청합니다",
      icon: "💬",
      variant: "primary"
    },
    {
      id: "request_completion",
      label: "완료 요청",
      description: "프로젝트 완료를 요청합니다",
      icon: "🎯",
      variant: "success"
    }
  ],
  
  feedback_period: [
    {
      id: "start_modification",
      label: "수정 시작",
      description: "피드백을 바탕으로 수정 작업을 시작합니다",
      icon: "🔧",
      variant: "warning"
    },
    {
      id: "request_completion",
      label: "완료 요청",
      description: "추가 수정 없이 완료를 요청합니다",
      icon: "🎯",
      variant: "success"
    }
  ],
  
  modification_in_progress: [
    {
      id: "request_feedback",
      label: "재검토 요청",
      description: "수정된 내용에 대한 재검토를 요청합니다",
      icon: "🔄",
      variant: "primary"
    },
    {
      id: "request_completion",
      label: "완료 요청",
      description: "수정 완료 후 프로젝트 완료를 요청합니다",
      icon: "✨",
      variant: "success"
    }
  ],
  
  completion_requested: [
    {
      id: "approve_completion",
      label: "완료 승인",
      description: "프로젝트 완료를 승인합니다",
      icon: "🎉",
      variant: "success"
    },
    {
      id: "request_more_changes",
      label: "추가 수정",
      description: "추가 수정사항을 요청합니다",
      icon: "📝",
      variant: "warning"
    }
  ],
  
  completed: [
    {
      id: "archive_project",
      label: "아카이브",
      description: "완료된 프로젝트를 아카이브합니다",
      icon: "📦",
      variant: "secondary"
    }
  ],
  
  archived: [],
  cancelled: []
};

export class ProjectWorkflowManager {
  static getAvailableTransitions(
    currentStatus: ProjectStatus, 
    userRole: "client" | "designer"
  ): WorkflowTransition[] {
    return WORKFLOW_TRANSITIONS.filter(
      transition => 
        transition.from === currentStatus && 
        (transition.requiredRole === userRole || transition.requiredRole === "both")
    );
  }
  
  static getAvailableActions(
    status: ProjectStatus,
    userRole: "client" | "designer"
  ): WorkflowAction[] {
    const actions = WORKFLOW_ACTIONS[status] || [];
    const transitions = this.getAvailableTransitions(status, userRole);
    
    return actions.filter(action => 
      transitions.some(t => this.actionMatchesTransition(action.id, t))
    );
  }
  
  private static actionMatchesTransition(actionId: string, transition: WorkflowTransition): boolean {
    const actionTransitionMap: Record<string, string> = {
      request_review: "review_requested",
      cancel_project: "cancelled", 
      approve_project: "in_progress",
      request_modification: "creation_pending",
      reject_project: "cancelled",
      start_work: "in_progress",
      request_feedback: "feedback_period",
      request_completion: "completion_requested",
      start_modification: "modification_in_progress",
      approve_completion: "completed",
      request_more_changes: "modification_in_progress",
      archive_project: "archived"
    };
    
    return actionTransitionMap[actionId] === transition.to;
  }
  
  static validateTransition(
    from: ProjectStatus,
    to: ProjectStatus,
    userRole: "client" | "designer",
    validationData?: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const transition = WORKFLOW_TRANSITIONS.find(t => t.from === from && t.to === to);
    
    if (!transition) {
      errors.push(`${from}에서 ${to}로의 전환은 허용되지 않습니다.`);
      return { valid: false, errors };
    }
    
    if (transition.requiredRole !== "both" && transition.requiredRole !== userRole) {
      errors.push(`이 작업은 ${transition.requiredRole} 권한이 필요합니다.`);
    }
    
    if (transition.validationRules && validationData) {
      for (const rule of transition.validationRules) {
        switch (rule) {
          case "draft_files_required":
            if (!validationData.hasDraftFiles) {
              errors.push("초안 파일을 업로드해야 합니다.");
            }
            break;
          case "final_deliverables_required":
            if (!validationData.hasFinalDeliverables) {
              errors.push("최종 산출물을 업로드해야 합니다.");
            }
            break;
          case "feedback_received":
            if (!validationData.hasFeedback) {
              errors.push("클라이언트 피드백이 필요합니다.");
            }
            break;
          case "modification_count_available":
            if (validationData.remainingModifications <= 0) {
              errors.push("남은 수정 횟수가 없습니다.");
            }
            break;
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  static calculateProgress(status: ProjectStatus, customData?: Record<string, any>): number {
    const baseProgress: Record<ProjectStatus, number> = {
      creation_pending: 5,
      review_requested: 10,
      client_review_pending: 15,
      designer_review_pending: 15, 
      in_progress: 30,
      feedback_period: 60,
      modification_in_progress: 75,
      completion_requested: 90,
      completed: 100,
      archived: 100,
      cancelled: 0
    };
    
    let progress = baseProgress[status] || 0;
    
    // 커스텀 데이터를 기반으로 진행률 조정
    if (customData) {
      if (status === "in_progress" && customData.milestonesCompleted) {
        const milestoneProgress = (customData.milestonesCompleted / customData.totalMilestones) * 30;
        progress = 30 + milestoneProgress;
      }
      
      if (status === "feedback_period" && customData.feedbackRounds) {
        progress += Math.min(customData.feedbackRounds * 5, 15);
      }
    }
    
    return Math.min(Math.max(progress, 0), 100);
  }
  
  static getStatusDisplayInfo(status: ProjectStatus) {
    const statusInfo: Record<ProjectStatus, { 
      label: string; 
      description: string; 
      color: string;
      icon: string;
    }> = {
      creation_pending: {
        label: "생성 대기중",
        description: "프로젝트 생성 승인 대기 중",
        color: "neutral",
        icon: "⏳"
      },
      review_requested: {
        label: "검토 요청 중", 
        description: "클라이언트 검토 요청됨",
        color: "warning",
        icon: "📋"
      },
      client_review_pending: {
        label: "클라이언트 검토 대기",
        description: "클라이언트의 승인을 기다리고 있습니다",
        color: "warning", 
        icon: "👤"
      },
      designer_review_pending: {
        label: "디자이너 검토 대기",
        description: "디자이너의 확인을 기다리고 있습니다",
        color: "info",
        icon: "🎨"
      },
      in_progress: {
        label: "진행 중",
        description: "프로젝트가 진행 중입니다",
        color: "primary",
        icon: "🚀"
      },
      feedback_period: {
        label: "피드백 정리 기간",
        description: "클라이언트 피드백 검토 및 정리 중",
        color: "accent",
        icon: "💬"
      },
      modification_in_progress: {
        label: "수정 작업 중",
        description: "피드백 반영 및 수정 작업 중",
        color: "secondary",
        icon: "🔧"
      },
      completion_requested: {
        label: "완료 승인 대기",
        description: "프로젝트 완료 승인을 기다리고 있습니다",
        color: "success",
        icon: "🎯"
      },
      completed: {
        label: "완료",
        description: "프로젝트가 성공적으로 완료되었습니다",
        color: "success",
        icon: "🎉"
      },
      archived: {
        label: "아카이브됨",
        description: "완료된 프로젝트가 아카이브되었습니다",
        color: "neutral",
        icon: "📦"
      },
      cancelled: {
        label: "취소",
        description: "프로젝트가 취소되었습니다",
        color: "error", 
        icon: "❌"
      }
    };
    
    return statusInfo[status];
  }
}