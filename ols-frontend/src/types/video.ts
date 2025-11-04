// 간단한 영상 정보(섬네일 까지)
export interface VideoMetadata {
    videoId: number;
    videoTitle: string;
    description: string;
    thumbnailPath: string;
    status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
}

// 실제 영상 저장 경로까지
export interface VideoDetail {
    videoId: number;
    videoTitle: string;
    description: string;
    filePath: string;
    thumbnailPath: string;
    status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
}

// 영상 모달
export interface VideoModalProps {
    video: VideoDetail | null;
    onClose: () => void;
}

// 영상 업로드 모달
export interface VideoUploadModalProps {
    courseId: string;
    onClose: (uploadInitiated?: boolean) => void; // 모달 닫기 함수, 업로드 성공 시 true를 전달
}

// 영상 업로드 폼
export interface FormDataState {
    courseId: string;
    videoTitle: string;
    description: string;
}