import { create } from 'zustand';
import { API_BASE_URL } from '../services/api';

const API_BASE = `${API_BASE_URL}/auth`;

interface AuthUser {
    id: string;
    username: string;
    displayName: string;
    email: string;
    role: string;
    allowedPages: string[];
}

interface AuthState {
    isAuthenticated: boolean;
    user: AuthUser | null;
    login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
}

// Check if user is already logged in (from localStorage)
function getStoredAuth(): { isAuthenticated: boolean; user: AuthUser | null } {
    try {
        const stored = localStorage.getItem('backoffice_auth');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.user) {
                return { isAuthenticated: true, user: parsed.user };
            }
        }
    } catch {
        // ignore
    }
    return { isAuthenticated: false, user: null };
}

const initial = getStoredAuth();

const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: initial.isAuthenticated,
    user: initial.user,

    login: async (username: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (data.success && data.user) {
                const user: AuthUser = {
                    id: data.user.id,
                    username: data.user.username,
                    displayName: data.user.displayName,
                    email: data.user.email,
                    role: data.user.role,
                    allowedPages: data.user.allowedPages || ['dashboard','pages','builder','theme','translations','analytics','settings'],
                };
                localStorage.setItem('backoffice_auth', JSON.stringify({ user }));
                set({ isAuthenticated: true, user });
                return { success: true };
            }

            return { success: false, message: data.message || 'เข้าสู่ระบบไม่สำเร็จ' };
        } catch {
            return { success: false, message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' };
        }
    },

    logout: async () => {
        const { user } = get();
        // Call logout API to record the event
        try {
            if (user) {
                await fetch(`${API_BASE}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        username: user.username,
                    }),
                });
            }
        } catch {
            // ignore — still logout locally
        }

        localStorage.removeItem('backoffice_auth');
        set({ isAuthenticated: false, user: null });
    },
}));

export default useAuthStore;
