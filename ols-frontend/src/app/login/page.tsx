// 'use client' 지시문은 Next.js 13+의 App Router에서 필요합니다.
'use client';

import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { UserContext } from '../context/UserProvider';
import axiosInstance from '../lib/axiosInstance';
import { LoginFormData } from '../../types/user';

function LoginPage() {
    const router = useRouter();
    const userContext = useContext(UserContext);

    if (!userContext) {
        console.log('userContext missing');
        return;
    }
    
    const { refreshUserInfo } = userContext;

    const [formData, setFormData] = useState<LoginFormData>({
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

    const fetchApiLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axiosInstance.post("/login", formData);
            refreshUserInfo();
            router.push('/');
        } catch (error: any) {
            console.error('로그인 에러:', error);
            let errorMessage = '로그인 에러: 서버 연결 오류 또는 네트워크 문제 발생';

            if (error.response) {
                if (error.response.status === 401) {
                    alert('등록되지 않은 사용자 입니다.');
                }
                else if (error.response.data && error.response.data.message) {
                    errorMessage = `로그인 실패: ${error.response.data.message}`;
                } else if (error.response.statusText) {
                    errorMessage = `로그인 실패: ${error.response.statusText}`;
                } else {
                    errorMessage = `로그인 실패: HTTP 상태 ${error.response.status}`;
                }
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">로그인</h2>
                <form onSubmit={ fetchApiLogin } className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            id="email"
                            required
                            placeholder="이메일을 입력하세요"
                            onChange={ handleChange }
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            id="password"
                            required
                            placeholder="비밀번호를 입력하세요"
                            onChange={ handleChange }
                        />
                    </div>
                    <button type="submit" className="login-button">로그인</button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;