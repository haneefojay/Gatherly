'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, AuthResponse, LoginRequest, SignupRequest, AdminLoginRequest } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    signup: (data: SignupRequest) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    forgotPassword: (email: string) => Promise<string>;
    resetPassword: (token: string, newPassword: string) => Promise<string>;
    verifyEmail: (token: string) => Promise<void>;
    resendVerificationEmail: (email: string) => Promise<string>;
    adminLogin: (credentials: AdminLoginRequest) => Promise<void>;
    isAuthenticated: boolean;
    isOrganizer: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (storedUser && token && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            const { access_token, refresh_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            const userResponse = await api.get<User>('/auth/me');
            const userData = userResponse.data;

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            router.push('/dashboard');
        } catch (error: any) {
            const errorData = error.response?.data;
            const detail = errorData?.detail || errorData?.message;
            if (detail === 'Two-factor authentication code required') {
                throw new Error('2FA_REQUIRED');
            }
            throw new Error(detail || 'Login failed');
        }
    };

    const signup = async (data: SignupRequest) => {
        try {
            await api.post('/auth/signup', data);
        } catch (error: any) {
            const errorData = error.response?.data;
            throw new Error(errorData?.message || errorData?.detail || 'Signup failed');
        }
    };

    const forgotPassword = async (email: string): Promise<string> => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data.message;
        } catch (error: any) {
            const errorData = error.response?.data;
            throw new Error(errorData?.message || errorData?.detail || 'Failed to send reset email');
        }
    };

    const resetPassword = async (token: string, newPassword: string): Promise<string> => {
        try {
            const response = await api.post('/auth/reset-password', {
                token,
                new_password: newPassword,
            });
            return response.data.message;
        } catch (error: any) {
            const errorData = error.response?.data;
            throw new Error(errorData?.message || errorData?.detail || 'Failed to reset password');
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            const response = await api.post<AuthResponse>('/auth/verify-email', { token });
            const { access_token, refresh_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            const userResponse = await api.get<User>('/auth/me');
            const userData = userResponse.data;

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            const errorData = error.response?.data;
            throw new Error(errorData?.message || errorData?.detail || 'Email verification failed');
        }
    };

    const resendVerificationEmail = async (email: string): Promise<string> => {
        try {
            const response = await api.post('/auth/resend-verification-email', { email });
            return response.data.message;
        } catch (error: any) {
            const errorData = error.response?.data;
            throw new Error(errorData?.message || errorData?.detail || 'Failed to resend verification email');
        }
    };

    const adminLogin = async (credentials: AdminLoginRequest) => {
        try {
            const response = await api.post<AuthResponse>('/admin/login', credentials);
            const { access_token, refresh_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            const userResponse = await api.get<User>('/auth/me');
            const userData = userResponse.data;

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            router.push('/admin/dashboard');
        } catch (error: any) {
            const errorData = error.response?.data;
            throw new Error(errorData?.message || errorData?.detail || 'Admin login failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/auth/login');
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        adminLogin,
        isAuthenticated: !!user,
        isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
