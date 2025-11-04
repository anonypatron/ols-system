'use client';

import { useContext, useEffect, useState } from "react";
import { Course } from '../types/course';
import axiosInstance from './lib/axiosInstance';
import { dateFormatting } from '../utils/dateUtils';
import { UserContext } from "./context/UserProvider";
import { useRouter } from 'next/navigation';
import ReviewModal from './components/ReviewModal';
import { PageInfo } from '../types/review';

function MainPage() {
    const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
    const [selectedIdForReview, setSelectedIdForReview] = useState<number>(0);
    const [courses, setCourses] = useState<Array<Course>>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        page: 0,
        totalPages: 0,
        totalElements: 0,
    });

    const router = useRouter();
    const userContext = useContext(UserContext);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axiosInstance.get(`/courses?status=APPROVED&page=${currentPage}&size=9`);
                setCourses(res.data.content);
                setPageInfo({
                    page: res.data.page.number,
                    totalPages: res.data.page.totalPages,
                    totalElements: res.data.page.totalElements,
                });
            } catch(err: any) {
                console.log('fetch courses err => ' + err);
            }
        };

        fetchCourses();
    }, [currentPage]);

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);
        let startPage = Math.max(0, currentPage - half);
        let endPage = Math.min(pageInfo.totalPages - 1, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button 
                    key={i} 
                    onClick={() => setCurrentPage(i)} 
                    disabled={currentPage === i}
                    className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    const handleOpenReviewModal = (courseId: number) => {
        setSelectedIdForReview(courseId);
        setShowReviewModal(true);
    };

    const handleCloseReviewModal = () => {
        setShowReviewModal(false);
    };

    const handleAddToCart = async (courseId: number) => {
        if (!userContext) {
            console.log("Navbar userContext error");
            return null;
        }
    
        const { userInfo } = userContext;
        if (!userInfo || userInfo == undefined) {
            alert('로그인 후 이용해주세요.');
            return;
        }

        if (userInfo.role !== 'STUDENT') {
            alert('학생만 장바구니에 담을 수 있습니다.');
            return;
        }

        try {
            const res = await axiosInstance.post('/carts', {id: courseId});

            if (confirm('카트에 넣었습니다. 카트로 이동하시겠습니까?')) {
                router.push('/cart');
            }
        } catch(err: any) {
            if (err.response && err.response.status === 400) {
                alert('이미 있는 과목입니다.');
                return;
            }
            console.log('addToCart error => ' + err);
        }
    };

    return (
        <div className="main-container">
            <h2>최신 강의 목록</h2>
            <div className="course-list">
                {courses.map(course => (
                    <div key={course.courseId} className="course-card">
                        <img src={'https://localhost/' + course.imagePath} alt={course.courseName} className="course-card-image" />
                        <div className="course-card-content">
                            <h3>{course.courseName}</h3>
                            <p className="course-card-description">{course.description}</p>
                            <div className="course-tags">
                                {course.tags.map((tag, index) => (
                                    <span key={index} className="course-tag">{tag.displayName}</span>
                                ))}
                            </div>
                            <div className="course-card-info">
                                <p><strong>강사:</strong> {course.teacherName}</p>
                                <p><strong>⭐ 평점:</strong> {course.rating.toFixed(1)} ({course.reviewCount} 리뷰)</p>
                                <p><strong>💰 가격:</strong> {course.price.toLocaleString()}원</p>
                                <p>최신 업데이트: {dateFormatting(course.updatedAt)}</p>
                                <button 
                                  className='button-base review-button'
                                  onClick={() => handleOpenReviewModal(course.courseId)}
                                >리뷰 보기</button>
                                <button 
                                  className='button-base cart-button'
                                  onClick={() => handleAddToCart(course.courseId)}
                                >장바구니에 추가</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination-container">
                <button 
                    onClick={() => setCurrentPage(currentPage - 1)} 
                    disabled={currentPage === 0}
                    className="pagination-button"
                >
                이전
                </button>

                {renderPageNumbers()}

                <button 
                    onClick={() => setCurrentPage(currentPage + 1)} 
                    disabled={currentPage === pageInfo.totalPages - 1}
                    className="pagination-button"
                >
                다음
                </button>
            </div>
            {showReviewModal && selectedIdForReview !== null && 
                <ReviewModal
                  courseId={ selectedIdForReview }
                  onClose= { handleCloseReviewModal }
                />
            }
        </div>
    )
}

export default MainPage;