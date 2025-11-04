'use client';

import { dateFormatting } from '../../../utils/dateUtils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axiosInstance from '../../lib/axiosInstance';
import { Course } from '../../../types/course';
import { useRouter } from 'next/navigation';
import ReviewUploadModal from '../../components/ReviewUploadModal';

function StudentCoursesPage() {
    const [courseList, setCourseList] = useState<Array<Course> | null>(null);
    const [showReviewUploadModal, setShowReviewUploadModal] = useState(false);
    const [selectedCourseIdForReview, setSelectedCourseIdForReview] = useState<number | null>(null); // 리뷰 작성할 강의 ID
    const router = useRouter();

    useEffect(() => {
        fetchCourseList();
    }, []);

    const fetchCourseList = async () => {
        try {
            const res = await axiosInstance.get("/courses/me");
            
            if (res.status >= 400) {
                throw new Error("status error");
            }

            setCourseList(res.data);
        } catch(error) {
            console.log("fetchCourses error: " + error);
            setCourseList([]);
        }
    }

    const goToVideoList = (id: number) => {
        router.push(`/student/courses/list?course_id=${id}`);
    };

    const handleOpenReviewModal = (id: number) => {
        setSelectedCourseIdForReview(id); // 선택된 강의 ID 저장
        setShowReviewUploadModal(true); // 모달 열기
    };

    const handleCloseReviewModal = (reviewSubmitted: boolean = false) => {
        setShowReviewUploadModal(false);
        setSelectedCourseIdForReview(null);

        if (reviewSubmitted) {
            fetchCourseList();
        }
    };

    if (!courseList || courseList.length == 0) {
        return (
            <div className="course-list-container">
                <div className="course-list-header">
                    <h1 className="page-title">내 강의 목록</h1>
                    <div className="no-course-message">
                        <p className="message-text">현재 강의가 없습니다.</p>
                        <a href='/student/enroll' className="enroll-link">수강 신청</a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="header-container">
                <p className="page-header-banner">내 강의 목록</p>
            </div>
            <br/>
            <div className="table-wrapper">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>강의 번호</th>
                            <th>강의 담당</th>
                            <th>강의 이름</th>
                            <th>강의 요약</th>
                            <th>평점</th>
                            <th>가격</th>
                            <th>태그</th>
                            <th>만들어진 날짜</th>
                            <th>수정된 날짜</th>
                            <th>영상 보기</th>
                            <th>리뷰</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courseList.map((item, index) => (
                            <tr key={ index }>
                                <td>{ index + 1 }</td>
                                <td>{ item.teacherName }</td>
                                <td>{ item.courseName }</td>
                                <td>{ item.description }</td>
                                <td>{ item.rating + ' (' + item.reviewCount + ')' }</td>
                                <td>{ item.price }</td>
                                <td>
                                    {item.tags && item.tags.length > 0 ? (
                                        <div className='tagContainer'>
                                            {item.tags.map((tag, tagIndex) => (
                                                <span 
                                                    key={tagIndex}
                                                    className='tagBadge'
                                                >
                                                    {tag.displayName}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        '없음'
                                    )}
                                </td>
                                <td>{ dateFormatting(item.createdAt) }</td>
                                <td>{ dateFormatting(item.updatedAt) }</td>
                                <td><button className="btn-base btn-secondary" onClick={ () => { goToVideoList(item.courseId) }}>영상 보기</button></td>
                                <td><button className="btn-base btn-secondary" onClick={ () => { handleOpenReviewModal(item.courseId) } }>리뷰 쓰기</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showReviewUploadModal && selectedCourseIdForReview !== null && (
                <ReviewUploadModal
                    courseId={selectedCourseIdForReview} 
                    onClose={handleCloseReviewModal} 
                />
            )}
        </div>
    )
}

export default StudentCoursesPage;