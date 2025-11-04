'use client';

import { useSearchParams } from 'next/navigation';
import axiosInstance from '../../../lib/axiosInstance';
import { useEffect, useState } from 'react';
import VideoModal from '../../../components/VideoModal';
import { VideoMetadata, VideoDetail } from '../../../../types/video'
import VideoUploadModal from '../../../components/VideoUploadModal';
import Link from 'next/link';

function ManagementPage() {
    const searchParams = useSearchParams();
    const courseId: string = searchParams.get('course_id') ?? '';

    const [videoList, setVideoList] = useState<Array<VideoMetadata>>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoDetail | null>(null);
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<number>>(new Set());
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isUploadingOrProcessing, setIsUploadingOrProcessing] = useState<boolean>(false); // 로딩 상태 추가

    useEffect(() => {
        fetchVideoList();
    }, [courseId]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (isUploadingOrProcessing) {
            // 5초마다 목록 갱신 시도 (백엔드 HLS 변환 상태를 확인하도록 로직 필요)
            intervalId = setInterval(() => {
                fetchVideoList();
            }, 10000);
        } else if (intervalId) {
            clearInterval(intervalId);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isUploadingOrProcessing]);

    const fetchVideoList = async () => {
        try {
            const res = await axiosInstance.get(`/courses/${ courseId }/videos`);
            setVideoList(res.data);
            const processingVideosExist = res.data.some((video: VideoMetadata) => video.status === 'PROCESSING');
            if (!processingVideosExist && isUploadingOrProcessing) {
                 setIsUploadingOrProcessing(false);
            }
        } catch(error) {
            console.log('Video fetch error => ' + error);
        }
    };

    const handleVideoClick = async (videoId: number) => {
        if (deleteMode) {
            handleVideoSelection(videoId);
        }
        else {
            try {
                const res = await axiosInstance.get(`/videos/${ videoId }`);
                // console.log(res.data);
                setSelectedVideo(res.data);
            } catch(error) {
                console.log('video fetch error => ' + error);
            }
        }
    };

    const handleCloseModal = () => {
        setSelectedVideo(null);
    };

    const handleVideoSelection = (videoId: number) => {
        setSelectedVideoIds((prevSelectedIds) => {
            const newSet = new Set(prevSelectedIds);
            if (newSet.has(videoId)) {
                newSet.delete(videoId);
            } else {
                newSet.add(videoId);
            }
            return newSet;
        });
    };

    const handleDeleteModeToggle = () => {
        setDeleteMode(!deleteMode);
        setSelectedVideoIds(new Set());
    };

    const handleOpenUploadModal = () => {
        setShowUploadModal(true);
    };

    const handleCloseUploadModal = (uploadInitiated: boolean = true) => {
        setShowUploadModal(false);
        if (uploadInitiated) {
            setIsUploadingOrProcessing(true);
            fetchVideoList(); // 업로드 성공 시 비디오 목록 새로고침
        }
    };

    const handleConfirmDelete = async () => {
        if (selectedVideoIds.size == 0) {
            alert('삭제할 비디오를 선택해주세요.');
            return;
        }

        if (!confirm(`${selectedVideoIds.size}개의 비디오를 정말 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const deleteTargetList = Array.from(selectedVideoIds);
            console.log(deleteTargetList);
            // delete로 body에 담아도 되지만 브라우저 호환성을 위해 post body에 담음
            const res = await axiosInstance.post(`/videos/delete`, deleteTargetList);

            alert('선택된 비디오가 성공적으로 삭제되었습니다.');
            setDeleteMode(false);
            setSelectedVideoIds(new Set());
            fetchVideoList();
        } catch(error) {
            console.log('Video delete error => ' + error);
        }
    };

    if (courseId === '' || videoList.length === 0) {
        return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)' }}>
            {isUploadingOrProcessing ? (
            <div className="processing-status-message">
                <p>비디오 업로드 및 처리 중입니다. 잠시만 기다려 주세요...</p>
            </div>
            ) : (
            <div className="empty-state-message">
                <p>등록된 비디오가 없습니다.</p>
                <div className="empty-state-button-container">
                <button className="btn-base btn-primary" onClick={handleOpenUploadModal}>
                    영상 업로드하기
                </button>
                </div>
                {showUploadModal && (
                <VideoUploadModal
                    courseId={courseId}
                    onClose={handleCloseUploadModal}
                />
                )}
            </div>
            )}
        </div>
        );
    }

    return (
        <div className="container">
            <div className='header-container'>
                <p className="page-header-banner">영상 목록</p>
                <Link href='/teacher/courses' className='page-back-button'>뒤로가기</Link>
            </div>
            {isUploadingOrProcessing && (
                <div className="processing-message">
                <p>새 영상이 업로드되어 변환 중입니다. 잠시 후 자동으로 목록이 갱신됩니다...</p>
                </div>
            )}

            {/* 비디오 그리드 */}
            <div className="video-grid-container">
                {videoList.map((video: VideoMetadata) => (
                <div
                    key={video.videoId}
                    className={`video-card ${deleteMode && selectedVideoIds.has(video.videoId) ? 'selected' : ''}`}
                    onClick={() => handleVideoClick(video.videoId)}
                >
                    {video.thumbnailPath && (
                        <img
                            src={video.thumbnailPath}
                            alt={video.videoTitle}
                            className="video-thumbnail"
                        />
                    )}
                    <h3>{video.videoTitle}</h3>
                    {deleteMode && selectedVideoIds.has(video.videoId) && (
                    <div className="video-selected-text">선택됨</div>
                    )}
                </div>
                ))}
            </div>

            {/* 비디오 모달 (선택된 비디오 상세 보기) */}
            {!deleteMode && selectedVideo && <VideoModal video={selectedVideo} onClose={handleCloseModal} />}

            {/* 영상 업로드 모달 */}
            {showUploadModal && (
                <VideoUploadModal
                    courseId={courseId}
                    onClose={handleCloseUploadModal}
                />
            )}

            {/* 하단 버튼 섹션 */}
            <div className="bottom-buttons-container">
                {/* 업로드/삭제 모드 토글 버튼 */}
                <div className="bottom-buttons-row">
                <button className="btn-base btn-primary" onClick={handleOpenUploadModal}>
                    영상 업로드하기
                </button>
                <button className="btn-base btn-danger" onClick={handleDeleteModeToggle}>
                    {deleteMode ? '제거 모드 취소' : '영상 제거하기'}
                </button>
                </div>

                {/* 선택된 영상 삭제 확인 버튼 (삭제 모드일 때만 표시) */}
                {deleteMode && (
                <div className="bottom-buttons-row">
                    <button
                    onClick={handleConfirmDelete}
                    disabled={selectedVideoIds.size === 0}
                    className="btn-confirm-delete"
                    >
                    선택된 영상 삭제 ({selectedVideoIds.size})
                    </button>
                </div>
                )}
            </div>
        </div>
    );
}

export default ManagementPage;