import { Tag } from './tag';

// 과목 상태
export enum CourseStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

// 새로운 과목 생성 폼
export interface CourseRegisterFormData {
    courseName: string;
    description: string;
    price: number;
    tags: Array<string>
    image: File | null;
}

// 과목 업데이트 폼
export interface CourseUpdateFormData {
    id: number;
    courseName: string;
    description: string;
    price: number;
    tags: Array<string>
    image: File | null;
}

// 과목 정보 받아오기
export interface Course {
    courseId: number;
    courseName: string;
    description: string;
    teacherName: string;
    courseStatus: CourseStatus;
    rating: number;
    reviewCount: number;
    price: number;
    tags: Array<Tag>;
    imagePath: string;
    createdAt: string;
    updatedAt: string;
}
