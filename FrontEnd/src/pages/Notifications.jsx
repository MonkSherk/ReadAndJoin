// src/pages/Notifications.jsx
import React, { useEffect, useState } from 'react'
import Layout from 'src/components/layout/Layout'
import Button from 'src/components/ui/Button'
import NotificationItem from 'src/components/notification/NotificationItem'
import { useNotificationStore } from 'src/stores/notificationStore'
import {
    differenceInHours,
    differenceInMinutes,
    parseISO,
} from 'date-fns'

export default function Notifications() {
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        connectNotifications,
        disconnectNotifications,
        markAllAsRead,
    } = useNotificationStore(state => state)

    // выбранный фильтр (lastHour | last5Hours | today | earlier)
    const [filter, setFilter] = useState('lastHour')

    /* --- группируем уведомления по диапазонам времени --- */
    const grouped = {
        lastHour:   [],
        last5Hours: [],
        today:      [],
        earlier:    [],
    }

    const now = Date.now()

    notifications.forEach(n => {
        const created = typeof n.created_at === 'string'
            ? parseISO(n.created_at)
            : new Date(n.created_at)

        const mins  = differenceInMinutes(now, created)
        const hours = differenceInHours(now, created)

        if (mins <= 60) grouped.lastHour.push(n)
        else if (hours <= 5) grouped.last5Hours.push(n)
        else if (hours <= 24) grouped.today.push(n)
        else grouped.earlier.push(n)
    })

    /* варианты фильтров для выбора */
    const filters = [
        { key: 'lastHour',   label: 'Последний час' },
        { key: 'last5Hours', label: 'Последние 5 часов' },
        { key: 'today',      label: 'Сегодня' },
        { key: 'earlier',    label: 'Ранее' },
    ]

    useEffect(() => {
        fetchNotifications()
        connectNotifications()
        return () => disconnectNotifications()
    }, [])

    return (
        <Layout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-serif">Notifications</h2>
                    {unreadCount > 0 && (
                        <Button size="sm" onClick={markAllAsRead}>
                            Mark&nbsp;all&nbsp;as&nbsp;read
                        </Button>
                    )}
                </div>

                {/* фильтр + контейнер */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow mb-8">
                    {/* кнопки выбора периода */}
                    <div className="flex flex-wrap gap-2">
                        {filters.map(f => (
                            <button
                                key={f.key}
                                className={`px-4 py-2 rounded-full text-sm font-medium
                  ${filter === f.key
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-gray-600'}
                `}
                                onClick={() => setFilter(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* выбранный список уведомлений */}
                    <div className="mt-6">
                        {grouped[filter].length === 0 ? (
                            <p className="text-gray-500 text-sm">Нет уведомлений за выбранный период.</p>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto flex-wrap">
                                {grouped[filter].map(n => (
                                    <NotificationItem key={n.id} notif={n} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
