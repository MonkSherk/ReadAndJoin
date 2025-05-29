import React, { useEffect, useState } from 'react';
import { useChatStore } from 'src/stores/chatStore';
import ChatListItem from 'src/components/chat/ChatListItem';

export default function ChatList() {
    const fetchConversations = useChatStore(s => s.fetchConversations);
    const conversations      = useChatStore(s => s.conversations);
    const createConversation = useChatStore(s => s.createConversation);

    const [userId, setUserId] = useState('');

    // сразу грузим все беседы
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const startChat = async e => {
        e.preventDefault();
        if (!userId) return;
        try {
            const convo = await createConversation(Number(userId));
            setUserId('');
            if (convo?.id) window.location.href = `/chats/${convo.id}`;
        } catch {
            alert('Не удалось создать чат. Проверь ID пользователя.');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 space-y-8">
            <form onSubmit={startChat} className="flex gap-3">
                <input
                    type="number"
                    placeholder="User ID…"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    New chat
                </button>
            </form>

            {conversations.length === 0 ? (
                <p className="text-gray-500">No conversations.</p>
            ) : (
                conversations.map(c => (
                    <ChatListItem key={c.id} convo={c} />
                ))
            )}
        </div>
    );
}
