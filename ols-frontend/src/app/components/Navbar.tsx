'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { UserContext } from "../context/UserProvider";
import SearchingComponent from './Searching';

function Navbar() {
    const router = useRouter();
    const userContext = useContext(UserContext);

    if (!userContext) {
        console.log("Navbar userContext error");
        return null;
    }

    const { userInfo, refreshUserInfo, setUserInfo, logout } = userContext;
    const loading = userInfo === undefined;

    if (loading) {
        return (
            <nav className="nav-container" style={{ padding: '15px 20px', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                    Online Learning System
                </Link>
                <div>사용자 정보 로딩 중...</div>
            </nav>
        );
    }

    const handleLogout = async () => {
        try {
            await logout();
            alert('로그아웃 성공!');
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('로그아웃 실패:', error);
            alert('로그아웃 실패.');
        }
    };

    if (userInfo) {
        return (
            <nav className="nav-container" style={{ padding: '15px 20px', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                        Online Learning System
                    </Link>
                    {userInfo.role === 'ADMIN' && (
                        <Link href="/admin/course/management" style={{ color: 'white', textDecoration: 'none' }}>
                            Dashboard
                        </Link>
                    )}
                    {userInfo.role === 'STUDENT' && (
                        <div>
                            <Link href="/student/courses" style={{ color: 'white', textDecoration: 'none' }}>
                                Dashboard&nbsp;&nbsp;&nbsp;
                            </Link>
                            <Link href="/cart" style={{ color: 'white', textDecoration: 'none' }}>
                                Cart
                            </Link>
                        </div>
                        
                    )}
                    {userInfo.role === 'TEACHER' && (
                        <Link href="/teacher/courses" style={{ color: 'white', textDecoration: 'none' }}>
                            Dashboard
                        </Link>
                    )}
                </div>
                <SearchingComponent/>

                <div>
                    <span style={{ marginRight: '15px', whiteSpace: 'nowrap' }}>안녕하세요, {userInfo.username} ({userInfo.role})님!</span>
                    <Link href='/account' style={{ color: 'white', textDecoration: 'none' }}>설정&nbsp;&nbsp;&nbsp;</Link>
                    <button
                        onClick={ handleLogout }
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        로그아웃
                    </button>
                </div>
            </nav>
        );
    }
    else {
        return (
            <nav className="nav-container" style={{ padding: '15px 20px', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                        Online Learning System
                    </Link>
                    <Link href="/signup" style={{ color: 'white', textDecoration: 'none' }}>
                        회원가입
                    </Link>
                    <Link href="/login" style={{ color: 'white', textDecoration: 'none' }}>
                        로그인
                    </Link>
                </div>

                <SearchingComponent/>
                <div>
                    <span style={{ whiteSpace: 'nowrap' }}>로그인해주세요.</span>
                </div>
            </nav>
        );
    }
}

export default Navbar;