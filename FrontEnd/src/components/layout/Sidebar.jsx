// src/components/layout/Sidebar.jsx
import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
    Home, User, BarChart2, Tag, Bell,
    Edit2, MessageCircle, Settings, LogOut
} from 'lucide-react'
import ThemeToggle from 'src/components/ui/ThemeToggle'
import { useAuthStore } from 'src/stores/authStore'
import { useNotificationStore } from 'src/stores/notificationStore'

export default function Sidebar() {
    const clearAuth            = useAuthStore(s => s.clearAuth)
    const unread               = useNotificationStore(s => s.unreadCount)
    const fetchNotifications   = useNotificationStore(s => s.fetchNotifications)
    const connectNotifications = useNotificationStore(s => s.connectNotifications)

    useEffect(() => {
        fetchNotifications()
        connectNotifications()
    }, [])

    const nav = [
        { to: '/',             label: 'Home',          icon: <Home size={24}/> },
        { to: '/profile',      label: 'Profile',       icon: <User size={24}/> },
        { to: '/notifications',label: 'Notifications', icon: <Bell size={24}/> },
        { to: '/chats',        label: 'Chats',         icon: <MessageCircle size={24}/> },
    ]

    return (
        <aside
            className="fixed top-16 left-0 inset-y-0   /* ↓ сдвиг под хедер */
                 w-52 bg-white dark:bg-gray-800
                 border-r border-gray-200 dark:border-gray-700
                 p-4 shadow-lg flex flex-col justify-between
                 z-20"                            /* ↓ хедер теперь поверх */
        >
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Navigation</h2>
                    <ThemeToggle />
                </div>

                <nav className="flex flex-col gap-2">
                    {nav.map(({ to, label, icon }) => {
                        const badge = label === 'Notifications' && unread > 0
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                end
                                className={({ isActive }) =>
                                    [
                                        'relative flex items-center gap-3 px-3 py-2 rounded-lg transition',
                                        isActive
                                            ? 'bg-indigo-500 text-white'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60',
                                    ].join(' ')
                                }
                            >
                                {icon}
                                <span className="font-medium">{label}</span>

                                {badge && (
                                    <span className="absolute right-3 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 text-[10px] text-white px-1 animate-pulse">
                    {unread}
                  </span>
                                )}
                            </NavLink>
                        )
                    })}
                </nav>
            </div>

            <button
                onClick={clearAuth}
                className="flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-600"
            >
                <LogOut size={18}/>
                Logout
            </button>
        </aside>
    )
}
