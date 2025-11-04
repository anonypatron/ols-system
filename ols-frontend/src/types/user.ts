import { Tag } from './tag';
// 로그인 폼
export interface LoginFormData {
    email: string;
    password: string;
}

// 회원가입 폼
export interface SignUpFormData {
    username: string;
    email: string;
    password?: string;
    role: string;
}

// 회원 정보 수정
export interface UserInfoUpdate {
    username: string;
    email: string;
    password: string;
}

// 간단한 사용자 정보(jwt) 받아오기
export interface UserInfo {
    username: string;
    email: string;
    role: string;
}

// useContext용 사용자 정보
export interface UserContextType {
    userInfo: UserInfo | null;
    refreshUserInfo: () => Promise<void>; // 사용자 정보 리프레시
    setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>; // nav bar에 정보 표시
    logout: () => Promise<boolean>; // 로그아웃
}