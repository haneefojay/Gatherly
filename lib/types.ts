export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'user' | 'organizer' | 'admin';
    is_active: boolean;
    created_at: string;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    capacity: number;
    current_attendees: number;
    created_by_id: string;
    organizer_ids: string[];
    organizers: User[];
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    event_id: string;
    title: string;
    description?: string;
    completed: boolean;
    assignee_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Attendee {
    id: string;
    event_id: string;
    user_id: string;
    status: 'registered' | 'waitlisted' | 'cancelled';
    registered_at: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    full_name: string;
    password: string;
    role: 'user' | 'organizer';
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
}

export interface EventCreateRequest {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    capacity: number;
    status?: 'draft' | 'upcoming';
}

export interface EventUpdateRequest {
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    capacity?: number;
    status?: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface TaskCreateRequest {
    title: string;
    description?: string;
    assignee_id?: string;
}

export interface TaskUpdateRequest {
    title?: string;
    description?: string;
    completed?: boolean;
    assignee_id?: string;
}
