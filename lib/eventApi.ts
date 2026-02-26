import api from './api';
import { Category, Tag, EventMedia, User, Event, EventWizardData } from './types';

export async function fetchCategories(): Promise<Category[]> {
    const { data } = await api.get('/events/categories');
    return data;
}

export async function fetchPopularTags(limit = 30): Promise<Tag[]> {
    const { data } = await api.get('/events/tags', { params: { limit } });
    return data;
}

export async function searchUsers(query: string): Promise<User[]> {
    const { data } = await api.get('/users/search', { params: { q: query, limit: 10 } });
    return data.items ?? data;
}

export async function createDraftEvent(wizardData: Partial<EventWizardData>): Promise<Event> {
    const startDateTime = wizardData.start_date && wizardData.start_time
        ? `${wizardData.start_date}T${wizardData.start_time}:00`
        : new Date(Date.now() + 86400000).toISOString();
    const endDateTime = wizardData.end_date && wizardData.end_time
        ? `${wizardData.end_date}T${wizardData.end_time}:00`
        : new Date(Date.now() + 90000000).toISOString();

    const { data } = await api.post('/events', {
        title: wizardData.title || 'Untitled Event',
        description: wizardData.description || '',
        start_date: startDateTime,
        end_date: endDateTime,
        location: wizardData.location || '',
        capacity: wizardData.capacity || 100,
        category_id: wizardData.category_id || undefined,
        status: 'draft',
    });
    return data;
}

export async function updateDraftEvent(eventId: string, wizardData: Partial<EventWizardData>): Promise<Event> {
    const payload: Record<string, unknown> = {};
    if (wizardData.title) payload.title = wizardData.title;
    if (wizardData.description !== undefined) payload.description = wizardData.description;
    if (wizardData.location) payload.location = wizardData.location;
    if (wizardData.capacity) payload.capacity = wizardData.capacity;
    if (wizardData.category_id) payload.category_id = wizardData.category_id;
    if (wizardData.start_date && wizardData.start_time) {
        payload.start_date = `${wizardData.start_date}T${wizardData.start_time}:00`;
    }
    if (wizardData.end_date && wizardData.end_time) {
        payload.end_date = `${wizardData.end_date}T${wizardData.end_time}:00`;
    }

    const { data } = await api.put(`/events/${eventId}`, payload);
    return data;
}

export async function publishEvent(eventId: string): Promise<Event> {
    const { data } = await api.patch(`/events/${eventId}/publish`);
    return data;
}

export async function uploadEventImage(eventId: string, file: File, isPrimary = false): Promise<EventMedia> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', String(isPrimary));

    const { data } = await api.post(`/events/${eventId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}

export async function addVideoEmbed(eventId: string, url: string): Promise<EventMedia> {
    const formData = new FormData();
    formData.append('url', url);

    const { data } = await api.post(`/events/${eventId}/media/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}

export async function addTagsToEvent(eventId: string, tags: string[]): Promise<Event> {
    const { data } = await api.post(`/events/tags/${eventId}/tags`, { tags });
    return data;
}

export async function addOrganizerToEvent(eventId: string, email: string): Promise<void> {
    await api.post(`/events/${eventId}/organizers`, { email });
}
