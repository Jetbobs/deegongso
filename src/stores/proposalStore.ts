import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 제안서 타입 정의
export interface ProposalDraft {
  id: string;
  status: 'draft' | 'sent' | 'negotiating' | 'accepted' | 'completed';
  createdAt: string;
  updatedAt: string;
  
  // 프로젝트 기본 정보
  name: string;
  description: string;
  category: string;
  clientEmail: string;
  
  // 예산 및 일정
  estimatedPrice: number;
  totalModifications: number;
  additionalModificationFee: number;
  schedule: {
    startDate: string;
    draftDeadline: string;
    firstReviewDeadline: string;
    finalDeadline: string;
  };
  
  // 결제 조건
  paymentTerms: {
    method: 'lump_sum' | 'installment';
    installmentRatio?: number;
    installmentSchedule?: string;
  };
  
  // 첨부파일
  contractFile?: {
    name: string;
    size: number;
    type: string;
  };
  additionalFiles?: {
    name: string;
    size: number;
    type: string;
  }[];
  
  // 협상 관련
  negotiationHistory?: {
    round: number;
    clientFeedback?: string;
    designerResponse?: string;
    timestamp: string;
  }[];
}

// 클라이언트로부터 받은 요청
export interface ClientRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  description: string;
  budget?: {
    min: number;
    max: number;
  };
  deadline?: string;
  status: 'pending' | 'proposal_sent' | 'negotiating' | 'accepted' | 'declined';
  requestedAt: string;
}

interface ProposalStore {
  // 상태
  proposals: ProposalDraft[];
  clientRequests: ClientRequest[];
  currentProposal: ProposalDraft | null;
  
  // 액션들
  createNewProposal: () => string;
  updateCurrentProposal: (updates: Partial<ProposalDraft>) => void;
  saveCurrentProposal: () => void;
  sendProposal: (proposalId: string) => void;
  loadProposal: (id: string) => void;
  deleteProposal: (id: string) => void;
  
  // 클라이언트 요청 관리
  addClientRequest: (request: Omit<ClientRequest, 'id' | 'requestedAt'>) => void;
  updateRequestStatus: (requestId: string, status: ClientRequest['status']) => void;
  
  // 유틸리티
  getProposalsByStatus: (status: ProposalDraft['status']) => ProposalDraft[];
  clearCurrentProposal: () => void;
}

// 기본 제안서 템플릿
const createEmptyProposal = (): ProposalDraft => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  name: '',
  description: '',
  category: '',
  clientEmail: '',
  
  estimatedPrice: 0,
  totalModifications: 3,
  additionalModificationFee: 0,
  schedule: {
    startDate: '',
    draftDeadline: '',
    firstReviewDeadline: '',
    finalDeadline: ''
  },
  
  paymentTerms: {
    method: 'lump_sum'
  },
  
  negotiationHistory: []
});

// Zustand 스토어 생성
export const useProposalStore = create<ProposalStore>()(
  persist(
    (set, get) => ({
      proposals: [],
      clientRequests: [],
      currentProposal: null,

      createNewProposal: () => {
        const newProposal = createEmptyProposal();
        set({ currentProposal: newProposal });
        return newProposal.id;
      },

      updateCurrentProposal: (updates) => {
        const current = get().currentProposal;
        if (current) {
          const updatedProposal = {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          set({ currentProposal: updatedProposal });
        }
      },

      saveCurrentProposal: () => {
        const current = get().currentProposal;
        if (current) {
          set((state) => ({
            proposals: state.proposals.some(p => p.id === current.id)
              ? state.proposals.map(p => p.id === current.id ? current : p)
              : [...state.proposals, current]
          }));
        }
      },

      sendProposal: (proposalId) => {
        set((state) => ({
          proposals: state.proposals.map(p =>
            p.id === proposalId
              ? { ...p, status: 'sent' as const, updatedAt: new Date().toISOString() }
              : p
          )
        }));
        
        // 클라이언트 요청에 Mock 데이터 추가
        const proposal = get().proposals.find(p => p.id === proposalId);
        if (proposal) {
          get().addClientRequest({
            clientName: '클라이언트',
            clientEmail: proposal.clientEmail,
            projectTitle: proposal.name,
            description: proposal.description,
            budget: {
              min: proposal.estimatedPrice * 0.8,
              max: proposal.estimatedPrice * 1.2
            },
            deadline: proposal.schedule.finalDeadline,
            status: 'proposal_sent'
          });
        }
      },

      loadProposal: (id) => {
        const proposal = get().proposals.find(p => p.id === id);
        if (proposal) {
          set({ currentProposal: proposal });
        }
      },

      deleteProposal: (id) => {
        set((state) => ({
          proposals: state.proposals.filter(p => p.id !== id),
          currentProposal: state.currentProposal?.id === id ? null : state.currentProposal
        }));
      },

      addClientRequest: (request) => {
        const newRequest: ClientRequest = {
          ...request,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          requestedAt: new Date().toISOString()
        };
        
        set((state) => ({
          clientRequests: [...state.clientRequests, newRequest]
        }));
      },

      updateRequestStatus: (requestId, status) => {
        set((state) => ({
          clientRequests: state.clientRequests.map(r =>
            r.id === requestId ? { ...r, status } : r
          )
        }));
      },

      getProposalsByStatus: (status) => {
        return get().proposals.filter(p => p.status === status);
      },

      clearCurrentProposal: () => {
        set({ currentProposal: null });
      }
    }),
    {
      name: 'proposal-store', // localStorage 키
      partialize: (state) => ({ 
        proposals: state.proposals,
        clientRequests: state.clientRequests 
      })
    }
  )
);

// Mock 데이터 시딩 (개발용)
export const seedProposalStore = () => {
  const store = useProposalStore.getState();
  
  // 이미 데이터가 있으면 시딩하지 않음
  if (store.proposals.length > 0) return;
  
  // Mock 제안서 데이터
  const mockProposals: ProposalDraft[] = [
    {
      id: 'proposal-mock-1',
      status: 'sent',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      name: '스타트업 브랜드 아이덴티티',
      description: '새로운 테크 스타트업을 위한 전체적인 브랜드 아이덴티티 디자인',
      category: '브랜딩',
      clientEmail: 'startup@example.com',
      estimatedPrice: 3000000,
      totalModifications: 3,
      schedule: {
        startDate: '2024-02-01',
        draftDeadline: '2024-02-15',
        firstReviewDeadline: '2024-02-28',
        finalDeadline: '2024-03-15'
      },
      paymentTerms: {
        method: 'installment',
        installmentRatio: 50,
        installmentSchedule: '계약금 50%, 완료 후 50%'
      }
    },
    {
      id: 'proposal-mock-2',
      status: 'draft',
      createdAt: '2024-01-21T14:00:00Z',
      updatedAt: '2024-01-21T16:45:00Z',
      name: 'E-commerce 웹사이트 리뉴얼',
      description: '기존 온라인 쇼핑몰의 UI/UX 전면 개편',
      category: '웹 디자인',
      clientEmail: 'shop@example.com',
      estimatedPrice: 1500000,
      totalModifications: 5,
      schedule: {
        startDate: '2024-01-30',
        draftDeadline: '2024-02-20',
        firstReviewDeadline: '2024-03-05',
        finalDeadline: '2024-03-20'
      },
      paymentTerms: {
        method: 'lump_sum'
      }
    }
  ];

  // Mock 클라이언트 요청 데이터  
  const mockRequests: ClientRequest[] = [
    {
      id: 'req-mock-1',
      clientName: '김클라이언트',
      clientEmail: 'client1@example.com',
      projectTitle: '카페 브랜드 로고',
      description: '새로 오픈하는 카페를 위한 로고 디자인',
      budget: { min: 800000, max: 1200000 },
      deadline: '2024-02-28',
      status: 'pending',
      requestedAt: '2024-01-22T10:00:00Z'
    }
  ];

  // 스토어에 Mock 데이터 설정
  useProposalStore.setState({
    proposals: mockProposals,
    clientRequests: mockRequests
  });
};