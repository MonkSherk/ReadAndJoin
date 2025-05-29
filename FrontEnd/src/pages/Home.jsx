import React, { useEffect, useState } from 'react'
import Layout from 'src/components/layout/Layout'
import PostCard from 'src/components/post/PostCard'
import Button from 'src/components/ui/Button'
import Input from 'src/components/ui/Input'
import Lottie from 'lottie-react'
import { FiPlus } from 'react-icons/fi'

import sadAnim        from 'src/animations/sad.json'
import backgroundAnim from 'src/animations/Background.json'   // фон-лутти

import api from 'src/utils/api'

/* ────────────────────────────────────────────────────────── */

export default function Home() {
    /* состояние списка постов */
    const [posts, setPosts]             = useState([])
    const [loading, setLoading]         = useState(true)

    /* модалка создания поста */
    const [showModal, setShowModal]     = useState(false)
    const [formData, setFormData]       = useState({ title: '', content: '', tags: '' })
    const [submitting, setSubmitting]   = useState(false)

    /* ───────── получение постов ───────── */
    const fetchPosts = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/posts/')
            // если бэкенд использует пагинацию Django — берём results
            const list = Array.isArray(data) ? data : data.results || []
            setPosts(list)
        } catch (err) {
            console.error('Failed to fetch posts', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchPosts() }, [])

    /* ───────── helpers ───────── */
    const extractHashes = txt =>
        Array.from(
            new Set(
                (txt.match(/#([\\p{L}\\d_]+)/giu) || [])
                    .map(h => h.slice(1).toLowerCase())
                    .filter(Boolean),
            ),
        )

    /* ───────── обработка формы ───────── */
    const handleSubmit = async e => {
        e.preventDefault()
        if (!formData.title.trim() || !formData.content.trim()) return
        setSubmitting(true)
        try {
            await api.post('/posts/', {
                ...formData,
                tags: extractHashes(formData.tags),
            })
            setFormData({ title: '', content: '', tags: '' })
            setShowModal(false)
            fetchPosts()
        } catch (err) {
            console.error('Failed to create post', err)
        } finally {
            setSubmitting(false)
        }
    }

    /* ──────────────────────────────────────────────────────── */

    return (
        <Layout>
            {/* —— анимированный фон Lottie —— */}
            <div className="relative">
                <Lottie
                    animationData={backgroundAnim}
                    loop
                    autoplay
                    className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
                />

                {/* —— контент страницы —— */}
                <div className="relative z-10 max-w-4xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-0">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Лента постов</h1>
                        <Button size="sm" onClick={() => setShowModal(true)}>
                            <FiPlus className="mr-1.5 -ml-0.5" /> Новый пост
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-20 text-gray-500 dark:text-gray-400">
                            <Lottie animationData={sadAnim} loop={false} className="w-40 h-40 mb-4" />
                            Загрузка…
                        </div>
                    ) : posts.length === 0 ? (
                        <p className="text-gray-500">Постов пока нет.</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map(p => (
                                <PostCard key={p.id} post={p} />
                            ))}
                        </div>
                    )}

                    {/* ───────── модалка создания ───────── */}
                    {showModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
                            <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-semibold mb-4">Новый пост</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        label="Заголовок"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        disabled={submitting}
                                    />
                                    <Input
                                        label="Содержимое"
                                        type="textarea"
                                        rows={4}
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        disabled={submitting}
                                    />
                                    <Input
                                        label="Теги (через #)"
                                        placeholder="#react  #nextjs"
                                        value={formData.tags}
                                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                        disabled={submitting}
                                    />

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                                            Отмена
                                        </Button>
                                        <Button type="submit" disabled={submitting}>
                                            Опубликовать
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
