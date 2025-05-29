import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from 'src/components/ui/Avatar';
import { useAuthStore } from 'src/stores/authStore';

export default function ChatListItem({ convo }) {
    const me = useAuthStore(s => s.user);
    if (!me) return null;

    const a = convo.initiator, b = convo.receiver;
    if (!a?.id || !b?.id) return null;

    const other  = a.id === me.id ? b : a;
    const unread = Array.isArray(convo.messages) &&
        convo.messages.some(m => m.sender?.id && !m.is_read && m.sender.id !== me.id);

    return (
        <Link
            to={`/chats/${convo.id}`}
            className={`
        flex items-center gap-3 p-3 rounded-lg transition
        hover:bg-gray-200/60 dark:hover:bg-gray-700/60
        ${!convo.is_approved ? 'opacity-60' : ''}
      `}
        >
            <Avatar src={other.avatar} alt={other.username} size={40} />
            <div className="flex-1">
                <p className="font-medium">{other.username}</p>
                {!convo.is_approved && (
                    <span className="text-xs text-gray-500">needs approval</span>
                )}
            </div>
            {unread && <span className="h-2 w-2 rounded-full bg-red-500" />}
        </Link>
    );
}
