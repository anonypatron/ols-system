import axios from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

const instance = axios.create({
    baseURL: 'https://localhost/api',
    withCredentials: true,
});

instance.interceptors.request.use(config => {
    const accessToken = getCookie('accessToken');
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

instance.interceptors.response.use(
    response => response, 
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getCookie('refreshToken');

                if (!refreshToken) {
                    console.error('Refresh token not found. Redirecting to login.');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const refreshResponse = await axios.post('http://localhost:80/api/token/refresh', {}, {
                    withCredentials: true 
                });
                return instance(originalRequest);

            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                deleteCookie('accessToken');
                deleteCookie('refreshToken');
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;