import { create } from 'zustand';
import api from 'src/utils/api';
import { createWebSocket } from 'src/utils/ws';

export const useChatStore = create((set, get) => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    ws: null,

    // 1) Загрузить список бесед
    fetchConversations: async () => {
        const { data } = await api.get('chats/');
        // data либо array, либо { results: [...] }
        const list = Array.isArray(data) ? data : data.results || [];
        set({ conversations: list });
    },

    // 2) Создать (или вернуть существующую) беседу
    createConversation: async receiver_id => {
        const { data } = await api.post('chats/', { receiver_id });
        await get().fetchConversations();
        return data;
    },

    // 3) Загрузить детали беседы (включая history)
    fetchConversationDetail: async id => {
        const { data } = await api.get(`chats/${id}/`);
        set({
            currentConversation: data,
            messages: Array.isArray(data.messages) ? data.messages : [],
        });
    },

    // 4) Принять / отклонить запрос
    approveConversation: async (id, approve) => {
        const { data } = await api.patch(`chats/${id}/`, { is_approved: approve });
        set({ currentConversation: data });
        if (!approve) setTimeout(() => (window.location.href = '/chats'), 300);
    },

    // 5) Отправить сообщение через REST (fail-safe)
    sendMessage: async (convId, content) => {
        await api.post(`chats/${convId}/messages/`, { content });
    },

    // 6) WebSocket: подключиться к каналу
    connectToChat: id => {
        if (get().ws) return;
        const token = useAuthStore.getState().token;
        if (!token) return;
        const ws = createWebSocket(`/ws/chats/${id}/`, token);
        ws.onmessage = e => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.sender && msg.sender.id != null) {
                    set(state => ({ messages: [...state.messages, msg] }));
                }
            } catch (err) {
                console.error('WS parse error', err);
            }
        };
        ws.onclose = () => set({ ws: null });
        set({ ws });
    },

    // 7) Отключиться и очистить
    disconnectChat: () => {
        get().ws?.close();
        set({ ws: null, currentConversation: null, messages: [] });
    },
}));
