'use client';

import { useEffect, useState } from "react";
import { NewReviewFormData, ReviewModalProps } from '../../types/review';
import axiosInstance from '../lib/axiosInstance';
import { Review } from '../../types/review';
import { PageInfo } from '../../types/review';
import { dateFormatting } from '../../utils/dateUtils';

function ReviewModal({ courseId, onClose }: ReviewModalProps) {
    const [reviews, setReviews] = useState<Array<Review>>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        page: 0,
        totalPages: 0,
        totalElements: 0,
    });

    useEffect(() => {
        const fetchReviewsByCourseId = async () => {
            try {
                const res = await axiosInstance.get(`/reviews?courseId=${courseId}&page=${currentPage}&size=1`);
                console.log(res.data);
                setReviews(res.data.content);
                setPageInfo({
                    page: res.data.page.number,
                    totalPages: res.data.page.totalPages,
                    totalElements: res.data.page.totalElements,
                });
            } catch(err: any) {
                console.log('fetch review err => ' + err);
            }
        };

        fetchReviewsByCourseId();
    }, [currentPage, courseId]);

    const handleCloseReviewModal = () => {
        onClose(true);
    };

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

    const renderStarRating = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span 
                    key={i} 
                    className={`star ${i <= Math.round(rating) ? 'filled' : ''}`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    if (reviews.length === 0) {
        return (
            <div className='modal-overlay'>
                <div className='modal-content'>
                    <div className='review-container'>
                        <div>아직 리뷰가 없습니다.</div>
                        <button 
                            className="btn-close-modal" 
                            onClick={handleCloseReviewModal}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='modal-overlay'>
            <div className='modal-content'>
                <button 
                    className="btn-close-modal" 
                    onClick={handleCloseReviewModal}
                >
                    &times;
                </button>
                <div className='review-container'>
                    <div className="review-list">
                        <p>{reviews[0].courseName}의 리뷰</p>
                        {reviews.map(review => (
                            <div key={review.id} className="review-card">
                                <div className="review-card-content">
                                    <p><strong>제목:</strong> { review.title }</p>
                                    <p><strong>글쓴이:</strong> { review.author }</p>
                                    <p><strong>내용:</strong> { review.content }</p>
                                    <div className="star-rating">
                                        {renderStarRating(review.rating)}
                                        <span> ({review.rating.toFixed(1)}점)</span>
                                    </div>
                                    <p>최종 업데이트: { dateFormatting(review.createdAt) }</p>
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
                </div>
            </div>
        </div>
    );
}

export default ReviewModal;