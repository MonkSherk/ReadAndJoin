// src/pages/OtherProfile.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout   from 'src/components/layout/Layout'
import Avatar   from 'src/components/ui/Avatar'
import Button   from 'src/components/ui/Button'
import PostCard from 'src/components/post/PostCard'
import api      from 'src/utils/api'
import { useChatStore } from 'src/stores/chatStore'

import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#ec4899']

export default function OtherProfile() {
    const { uid } = useParams()
    const navigate = useNavigate()
    const createConversation = useChatStore(s => s.createConversation)

    const [profile,   setProfile]   = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [posts,     setPosts]     = useState([])
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState(false)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError(false)
            try {
                // Убираем ведущий «/» — api.baseURL уже = '/api'
                const [{ data: p }, { data: a }, { data: pl }] = await Promise.all([
                    api.get(`users/${uid}/profile/`),     // вместо `/users/...`
                    api.get(`users/${uid}/analytics/`),   // вместо `/users/...`
                    api.get(`posts/users/${uid}/posts/`), // вместо `/posts/...`
                ])

                setProfile(p)
                setAnalytics(a)
                setPosts(Array.isArray(pl) ? pl : pl.results || [])
            } catch (e) {
                console.error('Ошибка загрузки OtherProfile:', e)
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [uid])

    const startChat = async () => {
        if (!profile) return
        try {
            const convo = await createConversation(Number(profile.id))
            if (convo?.id) navigate(`/chats/${convo.id}`)
        } catch (e) {
            console.error('Не удалось начать чат:', e)
            alert('Не удалось начать чат')
        }
    }

    if (loading) {
        return (
            <Layout>
                <p className="p-8 text-center">Загрузка…</p>
            </Layout>
        )
    }
    if (error) {
        return (
            <Layout>
                <p className="p-8 text-center text-red-500">
                    Ошибка при загрузке профиля
                </p>
            </Layout>
        )
    }
    if (!profile) {
        return (
            <Layout>
                <p className="p-8 text-center">Пользователь не найден</p>
            </Layout>
        )
    }

    // Нельзя писать самому себе
    const canMessage = profile.id !== (api.defaults.headers.Authorization?.split(' ')[1] /* твой user.id */)

    // Данные для графиков
    const barData = [
        { name: 'Посты',       value: analytics.posts_count },
        { name: 'Сред. длина', value: analytics.avg_post_length },
    ]
    const pieData = (analytics.top_tags || []).map(t => ({ name: t, value: 1 }))

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
                {/* basic info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center gap-6">
                    <Avatar src={profile.avatar} alt={profile.username} size={72} />
                    <div className="flex-1">
                        <h2 className="text-3xl font-serif dark:text-gray-100">
                            {profile.username}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {profile.email}
                        </p>
                    </div>
                    <Button onClick={startChat} disabled={!canMessage}>
                        {canMessage ? 'Message' : 'Это вы'}
                    </Button>
                </div>

                {/* analytics */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-10">
                    <h3 className="text-2xl font-serif text-center dark:text-gray-100">
                        Аналитика
                    </h3>

                    {/* stat cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Постов"      value={analytics.posts_count} />
                        <StatCard label="⌀ длина"     value={analytics.avg_post_length} suffix=" симв." />
                        <StatCard label="Топ-тегов"   value={analytics.top_tags.length} />
                        <StatCard
                            label="Активность"
                            value={
                                analytics.last_activity
                                    ? new Date(analytics.last_activity).toLocaleDateString()
                                    : '—'
                            }
                        />
                    </div>

                    {/* charts */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip />
                                    <Bar dataKey="value" fill={COLORS[0]} radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {pieData.length > 0 && (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            dataKey="value"
                                            nameKey="name"
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            label
                                        >
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                {/* posts */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-serif dark:text-gray-100">
                        Posts ({analytics.posts_count})
                    </h3>
                    {posts.length > 0 ? (
                        posts.map(p => <PostCard key={p.id} post={p} />)
                    ) : (
                        <p className="text-gray-500">No posts.</p>
                    )}
                </div>
            </div>
        </Layout>
    )
}

function StatCard({ label, value, suffix }) {
    return (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500 dark:text-indigo-300 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-200">
                {value}
                {suffix && <span className="text-base font-normal"> {suffix}</span>}
            </p>
        </div>
    )
}
