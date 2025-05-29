import React, { useEffect, useRef, useState } from 'react';
import Layout from 'src/components/layout/Layout';
import Input  from 'src/components/ui/Input';
import Button from 'src/components/ui/Button';
import Avatar from 'src/components/ui/Avatar';
import { useParams, Link } from 'react-router-dom';
import { useChatStore } from 'src/stores/chatStore';
import { useAuthStore } from 'src/stores/authStore';
import MessageBubble from 'src/components/chat/MessageBubble';

export default function ChatRoom() {
    const { id } = useParams();
    const me = useAuthStore(s => s.user);

    const {
        fetchConversationDetail,
        connectToChat,
        disconnectChat,
        currentConversation,
        messages,
        sendMessage,
        approveConversation,
    } = useChatStore();

    const [text, setText] = useState('');
    const listRef = useRef(null);

    // 1) загрузить детали + месседжи
    useEffect(() => {
        fetchConversationDetail(id);
        connectToChat(id);
        return () => disconnectChat();
    }, [id]);

    // 2) автоскролл
    useEffect(() => {
        listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    }, [messages]);

    if (!me) {
        return <Layout><p className="p-8 text-center">Loading user…</p></Layout>;
    }

    const a = currentConversation?.initiator;
    const b = currentConversation?.receiver;
    if (!a?.id || !b?.id) {
        return <Layout><p className="p-8 text-center">Loading conversation…</p></Layout>;
    }

    const other      = a.id === me.id ? b : a;
    const isReceiver = b.id === me.id;
    const needsApproval = !currentConversation.is_approved && isReceiver;

    const handleSend = async e => {
        e.preventDefault();
        if (!text.trim()) return;
        await sendMessage(id, text);
        setText('');
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <header className="flex items-center gap-4 border-b pb-4">
                    <Avatar src={other.avatar} alt={other.username} size={48} />
                    <div>
                        <h2 className="text-2xl font-serif">{other.username}</h2>
                        <Link
                            to={`/profile/${other.id}`}
                            className="text-indigo-600 text-sm hover:underline"
                        >
                            View profile
                        </Link>
                    </div>
                </header>

                <div
                    ref={listRef}
                    className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2"
                >
                    {messages
                        .filter(m => m.sender?.id)
                        .map(m => (
                            <MessageBubble
                                key={m.id}
                                msg={m}
                                isSelf={m.sender.id === me.id}
                            />
                        ))}
                </div>

                {needsApproval ? (
                    <ApproveModal
                        onAccept={() => approveConversation(id, true)}
                        onDecline={() => approveConversation(id, false)}
                    />
                ) : (
                    <form onSubmit={handleSend} className="flex gap-3">
                        <Input
                            className="flex-1"
                            placeholder="Message…"
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                        <Button type="submit">Send</Button>
                    </form>
                )}
            </div>
        </Layout>
    );
}

function ApproveModal({ onAccept, onDecline }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-80 space-y-4">
                <h3 className="text-lg font-semibold">Accept chat request?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    The user wants to start a conversation with you.
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onDecline}>Decline</Button>
                    <Button onClick={onAccept}>Accept</Button>
                </div>
            </div>
        </div>
    );
}
