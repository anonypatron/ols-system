'use client';

import axios from 'axios';
import React, { createContext, useCallback, useEffect, useState, useMemo } from 'react';
import { UserContextType, UserInfo } from '../../types/user';
import axiosInstance from '../lib/axiosInstance';
import { Tag } from '../../types/tag';

export const UserContext = createContext<UserContextType | undefined>(undefined);

function UserProvider({ children }: { children: React.ReactNode }) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const fetchUserInfo = useCallback(async () => {
        try {
            const infoRes = await axiosInstance.get('/users/info');
            setUserInfo(infoRes.data);
            
        } catch (error: any) {
            // if (axios.isAxiosError(error) && error.response?.status === 401) {
            //     console.warn('User not authenticated or session expired.');
            // }
            // else if (axios.isAxiosError(error) && error.response?.status === 403) {
            //     console.log('403 error => ' + error);
            // }
            // else {
            //     console.error('Failed to fetch user info:', error);
            // }
            setUserInfo(null);
        }
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const refreshUserInfo = useCallback(async () => {
        await fetchUserInfo();
    }, [fetchUserInfo]);

    const logout = useCallback(async () => {
        try {
            await axiosInstance.post('/logout');
            setUserInfo(null);
            return true;
        } catch (error) {
            console.error('로그아웃 실패:', error);
            // 에러 처리 (예: 알림)
            return false;
        }
    }, []);

    const contextValue = useMemo(() => {
        return { 
            userInfo, 
            refreshUserInfo, 
            setUserInfo, 
            logout
        }
    }, [userInfo, refreshUserInfo, setUserInfo, logout]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;