'use client';

import { useEffect, useState } from "react";
import { CourseUpdateFormData } from '../../types/course';
import axiosInstance from '../lib/axiosInstance';
import { Tag } from '../../types/tag';

interface UpdateCourseModalProps {
    onClose: () => void;
    courseId: number;
}

function CourseUpdateModal({onClose, courseId}: UpdateCourseModalProps) {
    const [formData, setFormData] = useState<CourseUpdateFormData>({
        id: courseId,
        courseName: "",
        description: "",
        price: 0,
        tags: [],
        image: null,
    });
    const [updateStatus, setUpdateStatus] = useState<string | null>(null); // 등록 상태 메시지
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 중복 제출 방지
    const [tagList, setTagList] = useState<Array<Tag>>([]);
    
    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await axiosInstance.get('/courses/tags');
            setTagList(res.data);
        } catch(error) {
            console.log('fetch tags error' + error);
        }
    };

    const update = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true); // 제출 시작

        try {
        // API 호출 전에 필수 필드 유효성 검사
            if (!formData.courseName.trim() || !formData.description.trim()) {
                setUpdateStatus('모든 필드를 입력해주세요.');
                setIsSubmitting(false);
                return;
            }

            if (formData.price % 1 != 0) {
                setUpdateStatus('가격은 정수만 가능합니다.');
                setIsSubmitting(false);
                return;
            }

            console.log(formData);
            const response = await axiosInstance.patch("/courses", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setUpdateStatus('강의가 성공적으로 변경되었습니다.');
            onClose();
        } catch (error) {
            console.error("강의 변경 중 오류 발생:", error);
            setUpdateStatus('강의 변경에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false); // 제출 완료
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { // textarea도 처리할 수 있도록 타입 추가
        const { name, value } = e.target;
            setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;

        setFormData(prevState => ({
            ...prevState,
            image: file,
        }));
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prevState => {
            if (checked) {
                return { ...prevState, tags: [...prevState.tags, value] };
            } else {
                return { ...prevState, tags: prevState.tags.filter(tag => tag !== value) };
            }
        });
    };

    return (
        <div className="modal-overlay">
        <div className="modal-content">
            <button onClick={ onClose } className="btn-close-modal">X</button>
            
            <h2 className="modal-title">강의 업데이트</h2>

            <form onSubmit={update} className="form-container">
                <div className="input-group">
                    <label htmlFor="courseName" className="input-label">과목 이름</label>
                    <input 
                    type="text" 
                    id="courseName"
                    name="courseName" 
                    value={formData.courseName}
                    onChange={handleChange} 
                    placeholder="과목 이름을 입력하세요"
                    required 
                    className="input-field"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="description" className="input-label">과목 설명</label>
                    <textarea
                    id="description"
                    name="description" 
                    value={formData.description}
                    onChange={handleChange} 
                    placeholder="과목 설명을 입력하세요"
                    rows={4}
                    required 
                    className="input-field"
                    />
                </div>

                <div className='input-group'>
                    <label htmlFor="price" className='input-label'>과목 가격</label>
                    <input 
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required 
                        min="0"
                        className='input-field'
                        placeholder="정수만 입력해주세요."
                    />
                </div>
                <div className='formGroup'>
                    <label htmlFor="image" className='input-label'>과목 이미지</label>
                    <input 
                        type="file" 
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className='input-file'
                    />
                </div>

                <div className='tagSelection'>
                    <label className='label'>태그 선택</label>
                    <div className='tagList'>
                        {tagList.length > 0 ? (
                            tagList.map(tag => (
                                <label key={tag.name} className='tagLabel'>
                                    <input
                                        type="checkbox"
                                        value={tag.name}
                                        checked={formData.tags.includes(tag.name)}
                                        onChange={handleTagChange}
                                    />
                                    <span>{tag.displayName}</span>
                                </label>
                            ))
                        ) : (
                            <p>등록된 태그가 없습니다.</p>
                        )}
                    </div>
                </div>

                {updateStatus && (
                    <p className={`status-message ${updateStatus.includes('성공') ? 'success' : 'error'}`}>
                    {updateStatus}
                    </p>
                )}

                <div className="form-actions">
                    <button 
                    type="submit" 
                    className="btn-base btn-primary"
                    disabled={isSubmitting}
                    >
                    {isSubmitting ? '등록 중...' : '강의 등록하기'}
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
}

export default CourseUpdateModal;