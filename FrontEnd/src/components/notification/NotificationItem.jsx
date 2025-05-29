import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationStore } from 'src/stores/notificationStore'
import { useNavigate } from 'react-router-dom'

export default function NotificationItem({ notif }) {
    const markAsRead = useNotificationStore(s => s.markAsRead)
    const navigate   = useNavigate()

    const handleClick = () => {
        if (!notif.is_read) markAsRead(notif.id)
        if (notif.target_url) navigate(notif.target_url)
    }

    return (
        <div
            onClick={handleClick}
            className={[
                'cursor-pointer rounded-lg p-4 shadow transition',
                notif.is_read
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    : 'bg-indigo-50 dark:bg-indigo-900/40 text-gray-900 dark:text-gray-100 hover:bg-indigo-100/60 dark:hover:bg-indigo-800/60',
            ].join(' ')}
        >
            <p className="mb-1">{notif.content}</p>
            <span className="text-xs text-gray-500">
        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
      </span>
        </div>
    )
}
