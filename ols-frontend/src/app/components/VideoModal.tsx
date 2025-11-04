'use client';

import ReactPlayer from 'react-player';
import { VideoModalProps } from '../../types/video';

function VideoModal({ video, onClose }: VideoModalProps) {
    if (!video) {
        return null;
    }

    return (
        <div className="modal-overlay"> {/* 전역 CSS의 모달 오버레이 클래스 */}
            <div className="video-modal-content"> {/* 비디오 모달 콘텐츠 클래스 */}
                <button onClick={onClose} className="btn-close-modal"> {/* 전역 CSS의 닫기 버튼 클래스 */}
                    X
                </button>
                
                <div className="video-player-title">
                {video.videoTitle}
                </div>
                
                <div className="player-wrapper"> {/* 반응형 비디오 플레이어 래퍼 */}
                <ReactPlayer
                    src={video.filePath} // ReactPlayer는 src 대신 url prop을 사용합니다.
                    playing={true}
                    controls={true}
                    width='100%'
                    height='100%'
                    pip={true}
                    // fallback={true} // 필요하다면 fallback 컴포넌트를 직접 정의하여 사용
                    config={{
                        hls: {
                            enableWorker: true,
                            maxBufferLength: 30,
                        },
                    }}
                    className="react-player" // ReactPlayer가 내부적으로 100% 크기를 차지하도록
                />
                </div>

                {video.description && ( // 비디오 설명이 있을 경우에만 표시
                <div className="video-description">
                    <p>{video.description}</p>
                </div>
                )}
            </div>
        </div>
    );
}

export default VideoModal;