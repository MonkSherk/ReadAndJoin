import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout   from 'src/components/layout/Layout'
import Avatar   from 'src/components/ui/Avatar'
import Input    from 'src/components/ui/Input'
import FileUpload from 'src/components/ui/FileUpload'
import Button   from 'src/components/ui/Button'
import PostCard from 'src/components/post/PostCard'
import api      from 'src/utils/api'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#ec4899']

export default function Profile() {
    const { uid }   = useParams()         // id чужого профиля, или undefined
    const navigate  = useNavigate()

    const [authUser,  setAuthUser]  = useState(null)
    const [user,      setUser]      = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [posts,     setPosts]     = useState([])

    /* ------ состояния редактирования профиля ------ */
    const [editingProfile, setEditingProfile] = useState(false)
    const [profileData,   setProfileData]   = useState({ username:'', email:'' })
    const [avatarFile,    setAvatarFile]    = useState(null)
    const [savingProfile, setSavingProfile] = useState(false)

    /* ------ состояния редактирования поста ------ */
    const [editingPost, setEditingPost] = useState(null)
    const [postForm,    setPostForm]    = useState({ title:'', content:'', tags:'' })
    const [savingPost,  setSavingPost]  = useState(false)

    /* =============================================================
       Загрузка данных
       ============================================================= */
    useEffect(() => {
        (async () => {
            /* мой профиль (нужен, чтобы узнать authUser.id) */
            const { data: me } = await api.get('/users/profile/')
            setAuthUser(me)

            const targetId = uid ?? me.id   // если uid undefined → мой id

            /* --- публичный профиль --- */
            const publicProfile = uid
                ? (await api.get(`/users/${targetId}/profile/`)).data   // чужой
                : me                                                    // мой
            setUser(publicProfile)
            setProfileData({ username: publicProfile.username, email: publicProfile.email })

            /* --- аналитика --- */
            const { data: stats } = await api.get(`/users/${targetId}/analytics/`)
            setAnalytics(stats)

            /* --- посты --- */
            const { data: p } = await api.get(`/posts/users/${targetId}/posts/`)
            setPosts(Array.isArray(p) ? p : p.results || [])
        })()
    }, [uid])

    const isOwner = authUser && user && authUser.id === user.id

    /* =============================================================
       Сохранение профиля
       ============================================================= */
    async function saveProfile(e) {
        e.preventDefault()
        setSavingProfile(true)
        try {
            const fd = new FormData()
            fd.append('username', profileData.username)
            fd.append('email',    profileData.email)
            if (avatarFile) fd.append('avatar', avatarFile)

            const { data } = await api.patch('/users/profile/', fd, {
                headers: { 'Content-Type':'multipart/form-data' },
            })
            setUser(data)
            setEditingProfile(false)
            setAvatarFile(null)
        } finally {
            setSavingProfile(false)
        }
    }

    /* =============================================================
       Чат
       ============================================================= */
    async function openChat() {
        const { data } = await api.post('/chats/', { receiver_id: user.id })
        navigate(`/chats/${data.id}`)
    }

    /* =============================================================
       Посты: edit / delete
       ============================================================= */
    function startEdit(p) {
        setEditingPost(p)
        setPostForm({
            title:   p.title,
            content: p.content,
            tags:    p.tags.map(t => t.name).join(', '),
        })
    }

    async function deletePost(p) {
        if (!window.confirm('Удалить этот пост?')) return
        await api.delete(`/posts/${p.id}/`)
        setPosts(posts.filter(item => item.id !== p.id))
    }

    async function savePost(e) {
        e.preventDefault()
        setSavingPost(true)
        try {
            const tagsArr = postForm.tags
                .split(',')
                .map(t => t.trim())
                .filter(Boolean)
                .map(name => ({ name }))

            await api.patch(`/posts/${editingPost.id}/`, {
                title:   postForm.title,
                content: postForm.content,
                tags:    tagsArr,
            })

            const { data: p } = await api.get(`/posts/users/${user.id}/posts/`)
            setPosts(Array.isArray(p) ? p : p.results || [])
            setEditingPost(null)
        } finally {
            setSavingPost(false)
        }
    }

    /* =============================================================
       LOADING
       ============================================================= */
    if (!user || !analytics) {
        return (
            <Layout>
                <p className="p-8 text-center">Загрузка…</p>
            </Layout>
        )
    }

    /* ------- данные для графиков ------- */
    const barData = [
        { name:'Посты',       value: analytics.posts_count },
        { name:'Сред. длина', value: analytics.avg_post_length },
    ]
    const pieData = (analytics.top_tags || []).map(t => ({ name:t, value:1 }))

    /* =============================================================
       RENDER
       ============================================================= */
    return (
        <Layout>
            {/* ---------- Профиль ---------- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Avatar
                            src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar}
                            alt={user.username}
                            size={64}
                        />
                        <h2 className="text-3xl font-serif dark:text-gray-100">
                            {user.username}
                        </h2>
                    </div>

                    {isOwner ? (
                        <Button onClick={() => setEditingProfile(v => !v)}>
                            {editingProfile ? 'Отменить' : 'Редактировать'}
                        </Button>
                    ) : (
                        <Button onClick={openChat}>Написать сообщение</Button>
                    )}
                </div>

                {/* форма редактирования */}
                {isOwner && (
                    <div
                        className={`transition-all ${editingProfile ? 'max-h-[600px] mt-6 mb-8' : 'max-h-0 overflow-hidden'}`}
                    >
                        <form onSubmit={saveProfile} className="space-y-4 mt-4">
                            <FileUpload label="Аватар" onFileSelect={setAvatarFile} />
                            <Input
                                label="Имя пользователя"
                                value={profileData.username}
                                onChange={e => setProfileData(p => ({ ...p, username:e.target.value }))}
                            />
                            <Input
                                label="E-mail"
                                type="email"
                                value={profileData.email}
                                onChange={e => setProfileData(p => ({ ...p, email:e.target.value }))}
                            />
                            <Button type="submit" disabled={savingProfile} className="w-full">
                                {savingProfile ? 'Сохраняем…' : 'Сохранить'}
                            </Button>
                        </form>
                    </div>
                )}
            </div>

            {/* ---------- Аналитика ---------- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                <h3 className="text-2xl font-serif mb-6 text-center dark:text-gray-100">
                    Аналитика
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <StatCard label="Постов"      value={analytics.posts_count} />
                    <StatCard label="⌀ длина"     value={analytics.avg_post_length} suffix="симв." />
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

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#6366f1" radius={4} />
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

            {/* ---------- Посты ---------- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-2xl font-serif mb-6 text-center dark:text-gray-100">
                    Посты
                </h3>

                {posts.length ? (
                    posts.map(p => (
                        <PostCard
                            key={p.id}
                            post={p}
                            canManage={isOwner}
                            onEdit={startEdit}
                            onDelete={deletePost}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500">Постов пока нет.</p>
                )}
            </div>

            {/* ---------- модалка ред. поста ---------- */}
            {editingPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">
                            Редактировать пост
                        </h3>
                        <form onSubmit={savePost} className="space-y-4">
                            <Input
                                label="Заголовок"
                                value={postForm.title}
                                onChange={e => setPostForm(f => ({ ...f, title:e.target.value }))}
                            />
                            <div>
                                <label className="block mb-2 font-semibold dark:text-gray-300">
                                    Содержимое
                                </label>
                                <textarea
                                    rows={4}
                                    value={postForm.content}
                                    onChange={e => setPostForm(f => ({ ...f, content:e.target.value }))}
                                    className="w-full px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <Input
                                label="Теги (через запятую)"
                                value={postForm.tags}
                                onChange={e => setPostForm(f => ({ ...f, tags:e.target.value }))}
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" onClick={() => setEditingPost(null)}>
                                    Отмена
                                </Button>
                                <Button type="submit" disabled={savingPost}>
                                    {savingPost ? 'Сохраняем…' : 'Сохранить'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    )
}

/* ---------- helper ---------- */
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
