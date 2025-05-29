import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from 'src/utils/api'
import { createWebSocket } from 'src/utils/ws'

export const useNotificationStore = create(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            ws: null,

            /* ---------- HTTP  ---------- */
            fetchNotifications: async () => {
                const { data } = await api.get('/notifications/')
                const list = Array.isArray(data) ? data : data.results ?? data.notifications ?? []
                set({
                    notifications: list,
                    unreadCount: list.filter(n => !n.is_read).length,
                })
            },

            markAllAsRead: async () => {
                if (get().unreadCount === 0) return
                /* локально */
                set(state => ({
                    notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                    unreadCount: 0,
                }))
                /* сервер */
                try { await api.post('/notifications/mark-all-read/') } catch (_) { /* ignore */ }
            },

            markAsRead: id =>
                set(state => {
                    const wasUnread = state.notifications.find(n => n.id === id && !n.is_read)
                    const list = state.notifications.map(n =>
                        n.id === id ? { ...n, is_read: true } : n
                    )
                    if (wasUnread) {
                        api.post('/notifications/mark-all-read/', { id }).catch(() => {})
                    }
                    return {
                        notifications: list,
                        unreadCount: Math.max(0, state.unreadCount - (wasUnread ? 1 : 0)),
                    }
                }),

            /* ---------- WebSocket push ---------- */
            connectNotifications: () => {
                if (get().ws) return
                const token = localStorage.getItem('access_token')
                if (!token) return
                const ws = createWebSocket('/ws/notifications/', token)

                ws.onmessage = e => {
                    try {
                        const n = JSON.parse(e.data)
                        set(state => ({
                            notifications: [n, ...state.notifications],
                            unreadCount: state.unreadCount + 1,
                        }))
                    } catch {}
                }
                ws.onclose = () => set({ ws: null })
                set({ ws })
            },

            disconnectNotifications: () => get().ws?.close(),
        }),
        { name: 'notif-store' }
    )
)
