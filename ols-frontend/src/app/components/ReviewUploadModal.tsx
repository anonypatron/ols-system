'use client';

import { useState } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { NewReviewFormData, ReviewModalProps } from '../../types/review';

/* 새 리뷰 작성 섹션 */
function ReviewUploadModal({ courseId, onClose }: ReviewModalProps) {
    const [submittingReview, setSubmittingReview] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);// 별점 UI를 위한 상태
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // 에러 메시지 상태
    const [newReview, setNewReview] = useState<NewReviewFormData>({
        title: '',
        content: '',
        rating: 0,
    });

    const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewReview(prev => ({ ...prev, [id]: value }));
    };

    const handleRatingChange = (ratingValue: number) => {
        setNewReview(prev => ({ ...prev, rating: ratingValue }));
    };

    const submitReview = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmittingReview(true);
        setErrorMessage(null);

        if (!newReview.content.trim()) {
            setErrorMessage("리뷰 제목을 입력해주세요.");
            setSubmittingReview(false);
            return;
        }
        if (newReview.rating === 0) {
            setErrorMessage("리뷰 내용을 입력해주세요");
            setSubmittingReview(false);
            return;
        }
        if (newReview.rating === 0) {
            setErrorMessage("별점을 입력해주세요");
            setSubmittingReview(false);
            return;
        }

        if (!confirm('리뷰는 수정할 수 없습니다. 제출하시겠습니까?')) {
            return;
        }

        try {
            const res = await axiosInstance.post(`/reviews?courseId=${courseId}`, newReview);

            if (res.status === 201) { // 201 Created 응답 가정
                // alert('리뷰가 성공적으로 제출되었습니다. 리뷰는 수정할 수 없습니다.');
                setNewReview({
                    title: '',
                    content: '',
                    rating: 0
                }); // 폼 초기화
                setHoverRating(0); // 별점 UI 초기화
                onClose(true);
            } else {
                throw new Error(res.data?.message || '리뷰 제출에 실패했습니다.');
            }
        } catch (err: any) {
            console.error('리뷰 제출 중 오류 발생:', err);
            // 백엔드에서 '이미 리뷰를 작성했습니다' 등의 메시지를 보낼 경우
            if (err.response) {
                if (err.response.status === 409) {
                    alert('이미 리뷰를 작성했습니다.');
                }
            } else {
                console.log('리뷰 제출 중 알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStarInput = () => {
        return (
            <div className='starRatingInput'>
                {[1, 2, 3, 4, 5].map((star) => (
                    <label
                        key={star}
                        htmlFor={`star-${star}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={star <= (hoverRating || newReview.rating) ? 'selectedStar' : ''}
                    >
                        <input
                            type="radio"
                            id={`star-${star}`}
                            name="rating"
                            value={star}
                            checked={newReview.rating === star}
                            onChange={() => handleRatingChange(star)}
                        />
                        ★
                    </label>
                ))}
            </div>
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button
                    onClick={() => onClose(false)}
                    className="btn-close-modal"
                >
                    &times;
                </button>
                <h2 className='modal-title'>리뷰 작성하기</h2>
                <form onSubmit={submitReview}>
                    {errorMessage && <p className="status-message error">{errorMessage}</p>} {/* 에러 메시지 표시 */}
                    <div className="input-group">
                        <label className="input-label">별점</label>
                        {renderStarInput()}
                    </div>
                    <div className="input-group">
                        <label htmlFor="title" className="input-label">리뷰 제목</label>
                        <input
                            id="title"
                            className="input-field"
                            value={newReview.title}
                            onChange={handleReviewChange}
                            placeholder="리뷰 제목"
                            required
                        ></input>
                    </div>
                    <br/>
                    <div className="input-group">
                        <label htmlFor="content" className="input-label">리뷰 내용</label>
                        <textarea
                            id="content"
                            className="input-field" // 기존 input-field 스타일 재활용
                            value={newReview.content}
                            onChange={handleReviewChange}
                            placeholder="솔직한 리뷰를 남겨주세요."
                            rows={5}
                            required
                        ></textarea>
                    </div>
                    
                    <div className='reviewFormActions'>
                        <button
                            type="submit"
                            className="btn-base btn-primary" // 기존 버튼 스타일 재활용
                            disabled={submittingReview}
                        >
                            {submittingReview ? '제출 중...' : '리뷰 제출하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReviewUploadModal;