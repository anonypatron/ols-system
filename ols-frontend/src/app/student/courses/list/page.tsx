'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VideoDetail, VideoMetadata } from '../../../../types/video';
import VideoModal from '../../../components/VideoModal';
import axiosInstance from '../../../lib/axiosInstance';
import Link from 'next/link';

function ManagementPage() {
    const searchParams = useSearchParams();
    const courseId: string = searchParams.get('course_id') ?? '';

    const [videoList, setVideoList] = useState<Array<VideoMetadata>>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoDetail | null>(null);
    
    useEffect(() => {
        fetchVideoList();
    }, [courseId]);

    const fetchVideoList = async () => {
        try {
            const res = await axiosInstance.get(`/courses/${ courseId }/videos`);
            setVideoList(res.data);
        } catch(error) {
            console.log('Video fetch error => ' + error);
        }
    };

    const handleVideoClick = async (videoId: number) => {
        try {
            const res = await axiosInstance.get(`/videos/${ videoId }`);

            if (!res) {
                throw new Error('');
            }
            console.log(res.data);
            setSelectedVideo(res.data);
        } catch(error) {
            console.log('video fetch error => ' + error);
        }
    };

    const handleCloseModal = () => {
        setSelectedVideo(null);
    };

    if (courseId === '' || videoList.length === 0) {
        return (
            <div>
                <p>비디오가 없습니다...</p>
            </div>
        )
    }

    return (
        <div className="container">
            <div className='header-container'>
                <p className="page-header-banner">영상 목록</p>
                <Link href='/student/courses' className='page-back-button'>뒤로가기</Link>
            </div>

            {/* 비디오 그리드 */}
            <div className="video-grid-container">
                {videoList.map((video: VideoMetadata) => (
                <div
                    key={video.videoId}
                    className={`video-card`}
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
                </div>
                ))}
            </div>
            <br/>
            {/* 비디오 모달 (선택된 비디오 상세 보기) */}
            {selectedVideo && <VideoModal video={selectedVideo} onClose={handleCloseModal} />}

        </div>
    )
}

export default ManagementPage;