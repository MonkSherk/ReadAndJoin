import React, { useEffect } from 'react'
import Layout from 'src/components/layout/Layout'
import { useNotificationStore } from 'src/stores/notificationStore'
import NotificationItem from 'src/components/notification/NotificationItem'

export default function Notifications() {
    const notifications          = useNotificationStore(s => s.notifications)
    const fetchNotifications     = useNotificationStore(s => s.fetchNotifications)
    const connectNotifications   = useNotificationStore(s => s.connectNotifications)
    const disconnectNotifications= useNotificationStore(s => s.disconnectNotifications)

    useEffect(() => {
        fetchNotifications()
        connectNotifications()
        return () => disconnectNotifications()
    }, [])

    return (
        <Layout>
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                <h2 className="text-3xl font-serif mb-4">Notifications</h2>

                {notifications.length === 0 ? (
                    <p className="text-gray-500">No notifications.</p>
                ) : (
                    notifications.map(n => <NotificationItem key={n.id} notif={n} />)
                )}
            </div>
        </Layout>
    )
}
