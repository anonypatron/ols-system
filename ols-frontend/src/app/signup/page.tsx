// 'use client' 지시문은 Next.js 13+의 App Router에서 필요합니다.
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SignUpFormData } from '../../types/user';

function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<SignUpFormData>({
        username: "",
        email: "",
        password: "",
        role: "STUDENT",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const signupApi = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const res = await fetch('https://localhost/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.status >= 400) {
                throw new Error('회원가입 에러');
            }
            
            alert('회원가입 성공!');
            router.push('/login');
        } catch(error) {
            console.log('회원가입 에러: ' + error);
            alert('회원가입 실패: ' + error);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2 className="signup-title">회원가입</h2>
                <form onSubmit={signupApi} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="username">사용자 이름</label>
                        <input
                            type="text"
                            id="username"
                            className="form-input"
                            name="username"
                            placeholder="사용자 이름"
                            required
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            name="email"
                            placeholder="이메일"
                            required
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            name="password"
                            placeholder="비밀번호"
                            required
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="role-label">역할</label>
                        <div className="role-options">
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="STUDENT"
                                    checked={formData.role === 'STUDENT'}
                                    onChange={handleChange}
                                    required
                                />
                                학생
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="TEACHER"
                                    checked={formData.role === 'TEACHER'}
                                    onChange={handleChange}
                                    required
                                />
                                선생님
                            </label>
                            {/* <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="ADMIN"
                                    checked={formData.role === 'ADMIN'}
                                    onChange={handleChange}
                                    required
                                />
                                관리자
                            </label> */}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="signup-button">회원가입</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;