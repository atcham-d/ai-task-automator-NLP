/**
 * Typed API wrapper — auto-attaches Bearer token from Supabase session.
 */

import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(body.detail || body.message || `Request failed: ${res.status}`);
    }
    // Handle 204 No Content
    if (res.status === 204) return undefined as T;
    return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, { headers });
    return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
}

export async function apiDelete(path: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, {
        method: 'DELETE',
        headers,
    });
    return handleResponse<void>(res);
}
