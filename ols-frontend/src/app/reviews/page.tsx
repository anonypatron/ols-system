'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { ReviewData } from '../../types/review';

function ReviewPage() {
    const searchParams = useSearchParams();
    const courseId: string = searchParams.get('course_id') ?? ''; // course_id가 없을 경우 빈 문자열

    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (courseId) {
            fetchReviews();
        } else {
            setError('과목 ID가 제공되지 않았습니다.');
            setLoadingReviews(false);
        }
    }, [courseId]);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        setError(null);
        try {
            // 모든 리뷰를 가져오는 API 엔드포인트 (예: /api/reviews?courseId=123)
            const res = await axiosInstance.get<ReviewData[]>(`/reviews?courseId=${courseId}`);
            setReviews(res.data);
        } catch (err) {
            console.error('리뷰를 불러오는 중 오류 발생:', err);
            setError('리뷰를 불러오지 못했습니다.');
        } finally {
            setLoadingReviews(false);
        }
    };

    // 별점 렌더링 함수
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? '#ffc107' : '#ccc' }}>
                    ★
                </span>
            );
        }
        return stars;
    };

    // 별점 입력 UI 렌더링 함수
    

    return (
        <div className='reviewPageContainer'>
            <h2 className='sectionTitle'>과목 리뷰</h2>

            {/* 기존 리뷰 목록 */}
            <div className='reviewList'>
                {loadingReviews && (
                    <div className="processing-status-message">
                        리뷰를 불러오는 중...
                    </div>
                )}
                {error && <p className="status-message error">{error}</p>}
                {!loadingReviews && !error && (
                    reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className='reviewItem'>
                                <div className='reviewHeader'>
                                    <div>
                                        <span className='reviewAuthor'>{review.authorName}</span>
                                        <span className='reviewRating'>{renderStars(review.rating)}</span>
                                    </div>
                                    {/* <span className='reviewDate'>{formatReviewDate(review.createdAt)}</span> */}
                                </div>
                                <p className='reviewTitle'>{ review.title }</p>
                                <p className='reviewContent'>{ review.content }</p>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-message">
                            아직 작성된 리뷰가 없습니다. 첫 번째 리뷰를 남겨주세요!
                        </div>
                    )
                )}
            </div>

            <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />
        </div>
    );
}

export default ReviewPage;