'use client';

import { useState } from 'react';
import axiosInstance from '../lib/axiosInstance'; // 경로에 맞게 수정해주세요.
import { VideoUploadModalProps, FormDataState } from '../../types/video';

function VideoUploadModal({ courseId, onClose }: VideoUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [formData, setFormData] = useState<FormDataState>({
        courseId: courseId, // ManagementPage로부터 받은 courseId 사용
        videoTitle: '',
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus('파일을 선택해주세요.');
            return;
        }
        if (formData.videoTitle.trim().length === 0) {
            setUploadStatus('제목을 입력해주세요.');
            return;
        }
        if (formData.description.trim().length === 0) {
            setUploadStatus('설명을 입력해주세요.');
            return;
        }

        setUploadStatus('업로드 중...');

        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('courseId', formData.courseId);
        uploadFormData.append('videoTitle', formData.videoTitle);
        uploadFormData.append('description', formData.description);

        try {
            const res = await axiosInstance.post('/videos/upload', uploadFormData, {
                onUploadProgress: (progressEvent) => {
                    const loaded = progressEvent.loaded;
                    const total = progressEvent.total ?? 0;

                    if (total > 0) {
                        const percentCompleted = Math.round((loaded * 100) / total);
                        setUploadStatus(`업로드 중: ${percentCompleted}%`);
                    } else {
                        setUploadStatus(`업로드 중: ${Math.round(loaded / 1024)} KB 전송됨`);
                    }
                },
            });
            setUploadStatus(`업로드 성공!`);
            setSelectedFile(null);
            setFormData({ // 폼 데이터 초기화
                courseId: courseId,
                videoTitle: '',
                description: '',
            });
            onClose(true); // 업로드 성공 시 모달 닫고 목록 갱신 신호 보냄
        } catch(error) {
            console.error('업로드 실패:', error);
            setUploadStatus(`업로드 실패...`);
            onClose(false);
        }
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

          <h2 className="modal-title">영상 업로드</h2>

          <div className="input-group">
            <label htmlFor='videoTitle' className="input-label">영상 제목</label>
            <input
              type='text'
              id='videoTitle'
              name='videoTitle'
              value={formData.videoTitle}
              onChange={handleChange}
              placeholder='영상 제목을 입력하세요'
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label htmlFor='description' className="input-label">영상 설명</label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='영상 설명을 입력하세요'
              rows={4}
              className="input-field"
            />
          </div>

          <div style={{textAlign: 'right'}}> {/* 파일 선택과 업로드 버튼을 묶는 div */}
            <input
              type="file"
              onChange={handleFileChange}
              accept="video/*"
              className="file-input"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || formData.videoTitle.trim().length === 0 || formData.description.trim().length === 0}
              className="btn-base btn-primary"
            >
              업로드
            </button>
          </div>

          {uploadStatus && (
            <p className={`status-message ${uploadStatus.includes('성공') ? 'success' : uploadStatus.includes('실패') ? 'error' : ''}`}>
              {uploadStatus}
            </p>
          )}
          {selectedFile && <p className="selected-file-name">선택된 파일: {selectedFile.name}</p>}
        </div>
      </div>
    );
}

export default VideoUploadModal;