// 과목의 리뷰 데이터
export interface Review {
    id: number;
    courseName: string;
    author: string; // 리뷰 작성자 이름 (Student 엔티티의 username)
    title: string;
    content: string;
    rating: number; // 별점 (1~5)
    createdAt: string; // ISO 8601 형식의 날짜 문자열
}

// 새로운 리뷰 작성
export interface NewReviewFormData {
    title: string;
    content: string;
    rating: number;
}

export interface ReviewModalProps {
    courseId: number;
    onClose: (reviewSubmitted: boolean) => void;
}

export interface PageInfo {
    page: number;
    totalPages: number;
    totalElements: number;
}