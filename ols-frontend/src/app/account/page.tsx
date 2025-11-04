'use client';

import { useContext, useState } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { useRouter } from 'next/navigation';
import { UserContext } from '../context/UserProvider';
import axios from 'axios';
import { UserInfoUpdate } from '../../types/user';

function AccountPage() {
    const router = useRouter();
    const context = useContext(UserContext);

    if (!context) {
        console.log('context is null');
        return;
    }
    const { refreshUserInfo, setUserInfo } = context;
    const username = context.userInfo?.username;

    if (!username) {
        return;
    }

    const [formData, setFormData] = useState<UserInfoUpdate>({
        username: username,
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const updateInfo = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.email && !formData.password) {
            alert('변경할 정보를 입력해주세요.');
            return;
        }
        console.log(formData);
        try {
            const res = axiosInstance.patch('/users', formData);
            alert('수정 완료');
            refreshUserInfo();
            router.push('/');
        } catch(error) {
            if (axios.isAxiosError(error) && error.response?.status === 406) {
                alert('수정 실패');
            }
            else {
                console.log('fetch error');
            }
        }
    };

    const signout = async () => {
        if (context.userInfo?.role == 'ADMIN') {
            alert('관리자는 탈퇴 할 수 없습니다.')
            return;
        }

        if (context.userInfo?.role == 'STUDENT') {
            if (!confirm('가지고 있던 모든 정보가 사라집니다. 탈퇴하시겠습니까?')) {
                return;
            }
        }
        
        try {
            const res = await axiosInstance.delete('/users');
            
            alert('탈퇴완료!');
            setUserInfo(null);
            router.replace('/');
        } catch(error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                alert('관련 코스를 모두 삭제한 후 탈퇴 할 수 있습니다.');
            }
            else {
                console.log('Error => /account: ' + error);
            }
        }
    };

    return (
        <div className="container">
            <div className="info-form-container">
                <form onSubmit={updateInfo}>
                    <legend>사용자 정보 수정</legend>

                    {/* 사용자 이름 (읽기 전용) */}
                    <div className="input-group">
                        <label className="input-label">사용자 이름</label>
                        <div>
                            <input 
                                className="input-field"
                                type='text' 
                                value={username} 
                                disabled
                            />
                        </div>
                    </div>

                    {/* 이메일 */}
                    <div className="input-group">
                        <label className="input-label">이메일</label>
                        <div>
                            <input 
                                className="input-field"
                                name='email' 
                                type='email' 
                                placeholder='이메일' 
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 비밀번호 */}
                    <div className="input-group">
                        <label className="input-label">비밀번호</label>
                        <div>
                            <input 
                                className="input-field"
                                name='password' 
                                type='password' 
                                placeholder='비밀번호' 
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 수정 버튼 */}
                    <div className="form-submit-actions">
                        <button type='submit' className="btn-base btn-primary">수정</button>
                    </div>
                </form>
            </div>

            {/* 탈퇴 버튼 */}
            <div className="withdraw-button-container">
                <button 
                onClick={signout} 
                className="btn-base btn-withdraw"
                >
                탈퇴하기
                </button>
            </div>
        </div>
    );
}

export default AccountPage;