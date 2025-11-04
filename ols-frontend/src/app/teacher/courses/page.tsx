'use client';

import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Course } from '../../../types/course';
import CourseUploadModal from '../../components/CourseUploadModal';
import CourseUpdateModal from '../../components/CourseUpdateModal';
import axiosInstance from '../../lib/axiosInstance';

function TeacherCoursesPage() {
    const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());
    const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
    const [courseList, setCourseList] = useState<Array<Course> | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    
    const router = useRouter();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axiosInstance.get("/courses/me");
            
            setCourseList(res.data);
        } catch(error) {
            console.log("fetchCourses error: " + error);
        }
    }

    const handleCourseSelection = (courseId: number) => {
        setSelectedCourseIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    };

    const handleDeleteModeToggle = () => {
        setDeleteMode(!deleteMode);
        setSelectedCourseIds(new Set()); // 모드 전환 시 선택 목록 초기화
    };

    const handleConfirmDelete = async () => {
        if (selectedCourseIds.size === 0) {
            alert('삭제할 강의를 선택해주세요.');
            return;
        }

        if (!window.confirm(`${selectedCourseIds.size}개의 강의를 정말 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const deleteTargetList = Array.from(selectedCourseIds);
            const res = await axiosInstance.post(`/courses/delete`, deleteTargetList);
            alert("삭제 완료!");
            setDeleteMode(false);
            setSelectedCourseIds(new Set());
            fetchCourses();
        } catch(error) {
            if (axios.isAxiosError(error) && error.response) {
                const statusCode = error.response.status;
                if (statusCode === 400) {
                    alert('강의에 올려진 영상을 모두 삭제해주세요.');
                } else if (statusCode === 401) {
                    alert('권한이 없거나 로그인 세션이 만료되었습니다.');
                } else {
                    const errorMessage = error.response.data || '알 수 없는 오류';
                    alert(`강의 삭제 중 오류가 발생했습니다: ${errorMessage}`);
                    console.error("Delete error:", error.response.data);
                }
            } else {
                alert("강의 삭제 중 예상치 못한 오류가 발생했습니다.");
                console.error("Delete error:", error);
            }
        }
    };

    const goToManagementPage = (id: number) => {
        router.push(`/teacher/courses/management?course_id=${id}`);
    };

    const handleOpenRegisterModal = () => {
        setShowRegisterModal(true);
    };

    const handleCloseRegisterModal = (courseAdded: boolean) => {
        setShowRegisterModal(false);
        if (courseAdded) {
            fetchCourses(); // 강의가 추가되었다면 목록 갱신
        }
    };

    const handleOpenUpdateModal = (id: number) => {
        setSelectedCourseId(id);
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        fetchCourses();
    };

    const dateFormatting = (date: string): string => {
        let dateObject = parseISO(date);
        return format(dateObject, 'yyyy-MM-dd');
    };

    if (!courseList || courseList.length == 0) {
        return (
            <div className="container">
                <div className="header-container">
                    <div>
                        <p>현재 강의가 없습니다.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button onClick={ handleOpenRegisterModal } className="btn-base btn-primary">
                            강의 추가하기
                        </button>
                    </div>
                </div>
                {showRegisterModal && (
                    <CourseUploadModal onClose={ handleCloseRegisterModal }/>
                )}
            </div>
        )
    }

    return (
        <div className="container">
            <div className="header-container">
                <p className="page-header-banner">내 강의 목록</p>
                <div style={{ textAlign: 'right' }}>
                    <button onClick={ handleOpenRegisterModal } className="btn-base btn-primary">
                        강의 추가하기
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="modern-table">
                    <thead>
                        <tr>
                            {deleteMode && <th>선택</th>}
                            <th>강의 번호</th>
                            <th>강의 담당</th>
                            <th>강의 이름</th>
                            <th>강의 설명</th>
                            <th>상태</th>
                            <th>평점</th>
                            <th>가격</th>
                            <th>태그</th>
                            <th>만들어진 날짜</th>
                            <th>수정된 날짜</th>
                            {!deleteMode && <th>강의 관리</th>}
                            {!deleteMode && <th>강의 수정</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {courseList.map((item, index) => (
                        <tr
                            key={ item.courseId }
                            onClick={() => deleteMode && handleCourseSelection(item.courseId)}
                            className={deleteMode && selectedCourseIds.has(item.courseId) ? 'selected' : ''}
                        >
                            {deleteMode && (
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedCourseIds.has(item.courseId)}
                                        readOnly
                                    />
                                </td>
                            )}
                            <td>{ index + 1}</td>
                            <td>{ item.teacherName }</td>
                            <td>{ item.courseName }</td>
                            <td>{ item.description }</td>
                            <td>{ item.courseStatus }</td>
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
                            {!deleteMode && (
                                <td>
                                    <button
                                        onClick={() => { goToManagementPage(item.courseId) }}
                                        className="btn-base btn-warning"
                                    >
                                        강의 관리
                                    </button>
                                </td>
                            )}
                            {!deleteMode && (
                                <td>
                                    <button
                                        onClick={ () => { handleOpenUpdateModal(item.courseId) }}
                                        className='btn-base btn-secondary'
                                    >
                                        강의 수정
                                    </button>
                                </td>
                            )}
                            
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 하단 버튼 섹션 */}
            <div className="bottom-buttons-container">
                <div className="bottom-buttons-row">
                    {/* 삭제 모드 토글 버튼 */}
                    {deleteMode ? (
                        <button
                            onClick={handleDeleteModeToggle}
                            className="btn-base btn-secondary"
                        >
                            취소
                        </button>
                    ) : (
                        <button
                            onClick={handleDeleteModeToggle}
                            className="btn-base btn-danger"
                        >
                            강의 삭제
                        </button>
                    )}
                </div>
                
                {/* 선택 삭제 확인 버튼 */}
                {deleteMode && (
                    <div className="bottom-buttons-row">
                        <button
                            onClick={handleConfirmDelete}
                            disabled={selectedCourseIds.size === 0}
                            className="btn-base btn-danger"
                        >
                            선택 삭제 ({selectedCourseIds.size})
                        </button>
                    </div>
                )}
            </div>

            {showRegisterModal && (
                <CourseUploadModal onClose={ handleCloseRegisterModal }/>
            )}
            {showUpdateModal && (
                <CourseUpdateModal 
                    onClose={ handleCloseUpdateModal }
                    courseId={ selectedCourseId }
                />
            )}
        </div>
    );
}

export default TeacherCoursesPage;