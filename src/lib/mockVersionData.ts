import { DesignVersion, DesignFile } from "@/types";

// Mock 시안 데이터 생성
export const createMockVersions = (projectId: string): DesignVersion[] => {
  const mockFiles1: DesignFile[] = [
    {
      id: "file-1-1",
      version_id: "version-1",
      filename: `${projectId}_v1_1`,
      original_filename: "logo_v1_main.png",
      file_type: "image/png",
      file_size: 245760,
      file_url: "/markdown_test.png",
      thumbnail_url: "/markdown_test.png",
      width: 800,
      height: 600,
      is_primary: true,
      uploaded_at: "2024-01-20T10:00:00Z"
    },
    {
      id: "file-1-2", 
      version_id: "version-1",
      filename: `${projectId}_v1_2`,
      original_filename: "logo_v1_variations.png",
      file_type: "image/png",
      file_size: 189440,
      file_url: "/markdown_test.png",
      is_primary: false,
      uploaded_at: "2024-01-20T10:05:00Z"
    }
  ];

  const mockFiles2: DesignFile[] = [
    {
      id: "file-2-1",
      version_id: "version-2",
      filename: `${projectId}_v2_1`,
      original_filename: "logo_v2_revised.png",
      file_type: "image/png", 
      file_size: 267890,
      file_url: "/markdown_test.png",
      thumbnail_url: "/markdown_test.png",
      width: 800,
      height: 600,
      is_primary: true,
      uploaded_at: "2024-01-22T14:30:00Z"
    }
  ];

  const mockFiles3: DesignFile[] = [
    {
      id: "file-3-1",
      version_id: "version-3",
      filename: `${projectId}_v3_1`,
      original_filename: "logo_v3_final.png",
      file_type: "image/png",
      file_size: 298760,
      file_url: "/markdown_test.png",
      thumbnail_url: "/markdown_test.png", 
      width: 800,
      height: 600,
      is_primary: true,
      uploaded_at: "2024-01-24T09:15:00Z"
    }
  ];

  return [
    {
      id: "version-1",
      project_id: projectId,
      version_number: 1,
      title: "초안",
      description: "브랜드 컨셉에 맞춘 첫 번째 로고 시안입니다. 모던하고 미니멀한 디자인으로 제작했습니다.",
      files: mockFiles1,
      thumbnail_url: mockFiles1[0].file_url,
      created_by: "designer-123",
      created_at: "2024-01-20T10:00:00Z",
      is_current: false,
      is_approved: true,
      approved_at: "2024-01-21T16:20:00Z",
      approved_by: "client-456"
    },
    {
      id: "version-2", 
      project_id: projectId,
      version_number: 2,
      title: "컬러 수정",
      description: "클라이언트 피드백을 반영하여 색상을 더 밝게 조정하고, 폰트 굵기를 수정했습니다.",
      files: mockFiles2,
      thumbnail_url: mockFiles2[0].file_url,
      created_by: "designer-123", 
      created_at: "2024-01-22T14:30:00Z",
      is_current: false,
      is_approved: false
    },
    {
      id: "version-3",
      project_id: projectId,
      version_number: 3,
      title: "최종 수정안",
      description: "최종 검토를 거쳐 완성한 로고입니다. 브랜드 가이드라인도 함께 제작했습니다.",
      files: mockFiles3,
      thumbnail_url: mockFiles3[0].file_url,
      created_by: "designer-123",
      created_at: "2024-01-24T09:15:00Z", 
      is_current: true,
      is_approved: false
    }
  ];
};

// localStorage에 Mock 데이터 초기화
export const initializeMockVersionData = (projectId: string, forceRefresh = false) => {
  const existingVersions = localStorage.getItem(`project_versions_${projectId}`);
  
  if (!existingVersions || forceRefresh) {
    // 기존 데이터 완전 삭제
    localStorage.removeItem(`project_versions_${projectId}`);
    
    const mockVersions = createMockVersions(projectId);
    localStorage.setItem(`project_versions_${projectId}`, JSON.stringify(mockVersions));
    
    // 각 버전을 개별적으로도 저장
    mockVersions.forEach(version => {
      localStorage.setItem(`version_${version.id}`, JSON.stringify(version));
    });
    
    console.log('Mock 버전 데이터가 초기화되었습니다:', mockVersions);
  }
};