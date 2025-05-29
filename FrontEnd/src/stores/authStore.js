import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            refresh: null,
            user: null,
            isLoadingUser: false,

            setAuth: (user, access, refresh) => {
                set({ user, token: access, refresh });
            },

            clearAuth: () => {
                set({ user: null, token: null, refresh: null });
            },

            fetchCurrentUser: async () => {
                const token = get().token;                // ← берём токен из состояния, а не из localStorage напрямую
                if (!token) {
                    set({ user: null });
                    return;
                }
                set({ isLoadingUser: true });
                try {
                    const res = await fetch('/api/users/profile/', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        set({ user: data });
                    } else {
                        if (res.status === 401) {
                            get().clearAuth();
                        }
                        set({ user: null });
                    }
                } catch (err) {
                    console.error('fetchCurrentUser error', err);
                    set({ user: null });
                } finally {
                    set({ isLoadingUser: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            getStorage: () => localStorage,
            partialize: state => ({ token: state.token, refresh: state.refresh, user: state.user }),
        }
    )
);
