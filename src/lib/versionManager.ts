import { DesignVersion, DesignFile } from "@/types";

/**
 * 시안 버전 관리를 위한 유틸리티 클래스
 */
export class VersionManager {
  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 새로운 시안 버전을 생성합니다
   */
  static createVersion(
    projectId: string,
    files: File[],
    createdBy: string,
    title?: string,
    description?: string
  ): DesignVersion {
    const existingVersions = this.getProjectVersions(projectId);
    const nextVersionNumber = Math.max(0, ...existingVersions.map(v => v.version_number)) + 1;

    // 기존 현재 버전들을 비활성화
    existingVersions.forEach(version => {
      if (version.is_current) {
        version.is_current = false;
      }
    });

    const designFiles: DesignFile[] = files.map((file, index) => ({
      id: this.generateId(),
      version_id: "",
      filename: `${projectId}_v${nextVersionNumber}_${index + 1}`,
      original_filename: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: URL.createObjectURL(file), // 임시 URL (실제로는 서버 업로드 URL)
      is_primary: index === 0, // 첫 번째 파일을 대표 이미지로
      uploaded_at: new Date().toISOString(),
    }));

    const newVersion: DesignVersion = {
      id: this.generateId(),
      project_id: projectId,
      version_number: nextVersionNumber,
      title: title || `시안 v${nextVersionNumber}`,
      description,
      files: designFiles,
      thumbnail_url: designFiles[0]?.file_url, // 첫 번째 파일을 썸네일로
      created_by: createdBy,
      created_at: new Date().toISOString(),
      is_current: true,
      is_approved: false,
    };

    // 파일의 version_id 업데이트
    designFiles.forEach(file => {
      file.version_id = newVersion.id;
    });

    // 로컬스토리지에 저장
    this.saveVersion(newVersion);
    this.updateProjectVersions(projectId, [...existingVersions, newVersion]);

    return newVersion;
  }

  /**
   * 프로젝트의 모든 버전을 가져옵니다
   */
  static getProjectVersions(projectId: string): DesignVersion[] {
    const stored = localStorage.getItem(`project_versions_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 특정 버전을 가져옵니다
   */
  static getVersion(versionId: string): DesignVersion | null {
    // 모든 프로젝트에서 해당 버전 찾기
    const projects = this.getAllProjectIds();
    
    for (const projectId of projects) {
      const versions = this.getProjectVersions(projectId);
      const version = versions.find(v => v.id === versionId);
      if (version) return version;
    }
    
    return null;
  }

  /**
   * 현재 작업 중인 버전을 가져옵니다
   */
  static getCurrentVersion(projectId: string): DesignVersion | null {
    const versions = this.getProjectVersions(projectId);
    
    // 현재 버전 찾기
    const currentVersion = versions.find(v => v.is_current);
    if (currentVersion) return currentVersion;
    
    // 현재 버전이 없으면 가장 최신 버전 반환
    if (versions.length > 0) {
      const latestVersion = versions.reduce((latest, current) => 
        current.version_number > latest.version_number ? current : latest
      );
      return latestVersion;
    }
    
    return null;
  }

  /**
   * 버전을 승인합니다
   */
  static approveVersion(versionId: string, approvedBy: string): DesignVersion | null {
    const version = this.getVersion(versionId);
    if (!version) return null;

    version.is_approved = true;
    version.approved_at = new Date().toISOString();
    version.approved_by = approvedBy;

    this.saveVersion(version);
    return version;
  }

  /**
   * 특정 버전을 현재 버전으로 설정합니다 (되돌리기)
   */
  static setCurrentVersion(versionId: string): DesignVersion | null {
    const version = this.getVersion(versionId);
    if (!version) return null;

    const projectVersions = this.getProjectVersions(version.project_id);
    
    // 모든 버전을 비활성화
    projectVersions.forEach(v => {
      v.is_current = v.id === versionId;
    });

    this.updateProjectVersions(version.project_id, projectVersions);
    return version;
  }

  /**
   * 버전을 삭제합니다
   */
  static deleteVersion(versionId: string): boolean {
    const version = this.getVersion(versionId);
    if (!version) return false;

    const projectVersions = this.getProjectVersions(version.project_id);
    const filteredVersions = projectVersions.filter(v => v.id !== versionId);

    // 삭제된 버전이 현재 버전이었다면 최신 버전을 현재 버전으로 설정
    if (version.is_current && filteredVersions.length > 0) {
      const latestVersion = filteredVersions.reduce((latest, current) => 
        current.version_number > latest.version_number ? current : latest
      );
      latestVersion.is_current = true;
    }

    this.updateProjectVersions(version.project_id, filteredVersions);
    localStorage.removeItem(`version_${versionId}`);

    return true;
  }

  /**
   * 두 버전을 비교하기 위한 데이터를 준비합니다
   */
  static prepareComparison(versionAId: string, versionBId: string) {
    const versionA = this.getVersion(versionAId);
    const versionB = this.getVersion(versionBId);

    if (!versionA || !versionB) return null;

    return {
      version_a: versionA,
      version_b: versionB,
      comparison_mode: 'side-by-side' as const
    };
  }

  /**
   * 버전 통계를 가져옵니다
   */
  static getVersionStats(projectId: string) {
    const versions = this.getProjectVersions(projectId);
    
    return {
      total_versions: versions.length,
      approved_versions: versions.filter(v => v.is_approved).length,
      current_version: versions.find(v => v.is_current)?.version_number || 0,
      latest_version: Math.max(...versions.map(v => v.version_number), 0),
      total_files: versions.reduce((sum, v) => sum + v.files.length, 0)
    };
  }

  // Private helper methods
  private static saveVersion(version: DesignVersion): void {
    localStorage.setItem(`version_${version.id}`, JSON.stringify(version));
  }

  private static updateProjectVersions(projectId: string, versions: DesignVersion[]): void {
    localStorage.setItem(`project_versions_${projectId}`, JSON.stringify(versions));
  }

  private static getAllProjectIds(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith('project_versions_'))
      .map(key => key.replace('project_versions_', ''));
  }
}

/**
 * 이미지 파일 처리 관련 유틸리티
 */
export class ImageUtils {
  /**
   * 파일에서 썸네일을 생성합니다
   */
  static async generateThumbnail(file: File, maxWidth = 300, maxHeight = 200): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 비율 유지하며 크기 조정
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 이미지 파일인지 확인합니다
   */
  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * 파일 크기를 사람이 읽기 쉬운 형태로 변환합니다
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}