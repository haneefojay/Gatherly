
import { api } from './api';
import { PublicProfile, PaginatedReviews, PaginatedResponse, Event, ProfileUpdateData, User } from './types';

export const getPublicProfile = async (username: string): Promise<PublicProfile> => {
    const { data } = await api.get<PublicProfile>(`/users/${username}`);
    return data;
};

export const getPublicEvents = async (username: string, limit = 10, offset = 0): Promise<PaginatedResponse<Event>> => {
    const { data } = await api.get<PaginatedResponse<Event>>(`/users/${username}/events`, {
        params: { limit, offset },
    });
    return data;
};

export const getAttendingEvents = async (username: string, limit = 10, offset = 0): Promise<PaginatedResponse<Event>> => {
    const { data } = await api.get<PaginatedResponse<Event>>(`/users/${username}/attending`, {
        params: { limit, offset },
    });
    return data;
};

export const getUserReviews = async (username: string, limit = 10, offset = 0): Promise<PaginatedReviews> => {
    const { data } = await api.get<PaginatedReviews>(`/users/${username}/reviews`, {
        params: { limit, offset },
    });
    return data;
};

export const followUser = async (username: string): Promise<void> => {
    await api.post(`/users/${username}/follow`);
};

export const unfollowUser = async (username: string): Promise<void> => {
    await api.delete(`/users/${username}/follow`);
};

export const updateProfile = async (data: ProfileUpdateData): Promise<User> => {
    const { data: updatedUser } = await api.put<User>('/profile/me', data);
    return updatedUser;
};

export const uploadAvatar = async (file: File): Promise<{ avatar_url: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ avatar_url: string; message: string }>('/profile/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const uploadCover = async (file: File): Promise<{ cover_photo_url: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ cover_photo_url: string; message: string }>('/profile/me/cover-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const getUserPreferences = async () => {
    const { data } = await api.get('/profile/me/preferences');
    return data;
};

export const updateUserPreferences = async (preferences: any) => {
    const { data } = await api.put('/profile/me/preferences', preferences);
    return data;
};
