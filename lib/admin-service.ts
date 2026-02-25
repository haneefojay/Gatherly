
import { api } from './api';

export interface AdminUserStats {
    total_users: number;
    active_users: number;
    new_today: number;
    new_this_week: number;
    new_this_month: number;
    by_role: Record<string, number>;
    by_status: Record<string, number>;
    email_verified_rate: number;
    twofa_adoption_rate: number;
    dau: number;
    wau: number;
    mau: number;
}

export interface UserGrowthDataPoint {
    date: string;
    count: number;
    cumulative: number;
}

export interface UserGrowthResponse {
    data_points: UserGrowthDataPoint[];
    period: string;
}

export interface AdminUserListItem {
    id: string;
    email: string;
    username: string | null;
    full_name: string;
    role: string;
    status: string;
    email_verified: boolean;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
}

export interface AdminUserListResponse {
    users: AdminUserListItem[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface UserListParams {
    page?: number;
    page_size?: number;
    role?: string;
    status?: string;
    email_verified?: boolean;
    search?: string;
    date_from?: string;
    date_to?: string;
    last_login_after?: string;
    last_login_before?: string;
    location?: string;
    sort_by?: string;
    sort_order?: string;
}

export interface BulkActionResponse {
    success_count: number;
    failed_count: number;
    errors: string[];
}

export interface AdminUserDetail {
    id: string;
    email: string;
    username: string | null;
    full_name: string;
    role: string;
    status: string;
    email_verified: boolean;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    bio: string | null;
    phone: string | null;
    location: string | null;
    avatar_url: string | null;
    cover_photo_url: string | null;
    social_links: Record<string, string> | null;
    has_2fa: boolean;
    login_history: Array<{
        ip_address: string;
        user_agent: string;
        location: string | null;
        success: boolean;
        failure_reason: string | null;
        timestamp: string;
    }>;
    active_sessions: Array<{
        id: string;
        device_info: string | null;
        ip_address: string;
        last_active_at: string;
        expires_at: string;
    }>;
    created_events: Array<{
        id: string;
        title: string;
        status: string | null;
        start_date: string | null;
        created_at: string;
    }>;
    attended_events: Array<{
        event_id: string;
        title: string;
        status: string;
        registered_at: string;
    }>;
    reviews_given: Array<{
        event_title: string;
        rating: number;
        content: string;
        created_at: string;
    }>;
    reviews_received: Array<{
        event_title: string;
        rating: number;
        content: string;
        created_at: string;
    }>;
    admin_notes: Array<{
        id: string;
        admin_email: string | null;
        content: string;
        created_at: string;
    }>;
    moderation_history: Array<{
        id: string;
        action: string;
        admin_email: string;
        changes: any;
        created_at: string;
    }>;
}

export const adminService = {
    getStats: async (): Promise<AdminUserStats> => {
        const { data } = await api.get<AdminUserStats>('/admin/users/stats');
        return data;
    },
    getGrowth: async (days: number = 30): Promise<UserGrowthResponse> => {
        const { data } = await api.get<UserGrowthResponse>('/admin/users/growth', {
            params: { days }
        });
        return data;
    },
    listUsers: async (params: UserListParams = {}): Promise<AdminUserListResponse> => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        const { data } = await api.get<AdminUserListResponse>('/admin/users/', {
            params: cleanParams
        });
        return data;
    },
    getUser: async (userId: string): Promise<AdminUserDetail> => {
        const { data } = await api.get<AdminUserDetail>(`/admin/users/${userId}`);
        return data;
    },
    updateUser: async (userId: string, updateData: { full_name?: string; email?: string; username?: string; role?: string; email_verified?: boolean }) => {
        const { data } = await api.put(`/admin/users/${userId}`, updateData);
        return data;
    },
    bulkAction: async (action: string, userIds: string[], reason?: string, durationDays?: number): Promise<BulkActionResponse> => {
        const { data } = await api.post<BulkActionResponse>('/admin/users/bulk-action', {
            action,
            user_ids: userIds,
            reason,
            duration_days: durationDays
        });
        return data;
    },
    suspendUser: async (userId: string, reason: string, durationDays?: number) => {
        const { data } = await api.post(`/admin/users/${userId}/suspend`, {
            reason,
            duration_days: durationDays
        });
        return data;
    },
    banUser: async (userId: string, reason: string) => {
        const { data } = await api.post(`/admin/users/${userId}/ban`, { reason });
        return data;
    },
    unsuspendUser: async (userId: string) => {
        const { data } = await api.post(`/admin/users/${userId}/unsuspend`);
        return data;
    },
    verifyUser: async (userId: string) => {
        const { data } = await api.post(`/admin/users/${userId}/verify`);
        return data;
    },
    deleteUser: async (userId: string) => {
        const { data } = await api.delete(`/admin/users/${userId}`);
        return data;
    },
    resetPassword: async (userId: string) => {
        const { data } = await api.post(`/admin/users/${userId}/reset-password`);
        return data;
    },
    impersonateUser: async (userId: string) => {
        const { data } = await api.post(`/admin/users/${userId}/impersonate`);
        return data;
    },
    addNote: async (userId: string, content: string) => {
        const { data } = await api.post(`/admin/users/${userId}/notes`, { content });
        return data;
    },
    deleteNote: async (userId: string, noteId: string) => {
        const { data } = await api.delete(`/admin/users/${userId}/notes/${noteId}`);
        return data;
    },
    revokeSession: async (userId: string, sessionId: string) => {
        const { data } = await api.delete(`/admin/users/${userId}/sessions/${sessionId}`);
        return data;
    },
    revokeAllSessions: async (userId: string) => {
        const { data } = await api.delete(`/admin/users/${userId}/sessions`);
        return data;
    },
    exportUserData: async (userId: string) => {
        const { data } = await api.get(`/admin/users/${userId}/export`);
        return data;
    },
};

