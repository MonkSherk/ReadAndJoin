import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from 'src/components/layout/Layout'
import PostCard from 'src/components/post/PostCard'
import Input from 'src/components/ui/Input'
import Button from 'src/components/ui/Button'
import api from 'src/utils/api'

export default function PostDetail() {
    const { id: postId } = useParams()
    const [post, setPost] = useState(null)
    const [me, setMe]     = useState(null)

    const [newComment, setNewComment] = useState('')
    const [drafts, setDrafts]         = useState({})
    const [editing, setEditing]       = useState(null)

    /* ───────── API ───────── */
    const load = async () => {
        const [{ data: p }, { data: u }] = await Promise.all([
            api.get(`/posts/${postId}/`),
            api.get('/users/profile/'),
        ])
        setPost(p)
        setMe(u)
    }

    useEffect(() => { load() }, [postId])

    const react = async action => {
        await api.post(`/posts/${postId}/like/`, { action })
        await load()
    }

    const saveComment = async (content, parent = null) => {
        if (!content.trim()) return
        await api.post(`/posts/${postId}/comments/`, {
            post: postId,
            user_id: me.id,
            content,
            parent,
        })
        setDrafts(p => ({ ...p, [parent || 'root']: '' }))
        await load()
    }

    const updateComment = async (commentId, content) => {
        if (!content.trim()) return
        await api.patch(`/posts/${postId}/comments/${commentId}/`, { content })
        setEditing(null)
        await load()
    }

    const deleteComment = async id => {
        if (!window.confirm('Удалить комментарий?')) return
        await api.delete(`/posts/${postId}/comments/${id}/`)
        await load()
    }

    /* ───────── UI: рекурсивные комментарии ───────── */
    const Reply = ({ c, depth }) => {
        const isAuthor = c.user.id === me?.id || me?.is_staff
        const draftKey = c.id
        return (
            <div
                className="relative pl-6 space-y-4"
                style={{ borderLeft: '2px solid #6366f1', marginLeft: depth ? 0 : -8 }}
            >
                <span className="absolute -left-[5px] top-2 w-2 h-2 bg-indigo-500 rounded-full" />
                <div className="space-y-2">
                    {editing === c.id ? (
                        <>
                            <Input
                                value={drafts[c.id] ?? c.content}
                                onChange={e =>
                                    setDrafts(p => ({ ...p, [c.id]: e.target.value }))
                                }
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => updateComment(c.id, drafts[c.id])}>
                                    ✔︎
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setEditing(null)}
                                >
                                    ✖︎
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{c.user.username}</span>
                                {isAuthor && (
                                    <span className="space-x-2">
                    <button
                        onClick={() => {
                            setEditing(c.id)
                            setDrafts(p => ({ ...p, [c.id]: c.content }))
                        }}
                    >
                      ✏️
                    </button>
                    <button onClick={() => deleteComment(c.id)}>🗑️</button>
                  </span>
                                )}
                            </div>
                            <p>{c.content}</p>
                        </>
                    )}

                    {/* ответ */}
                    <div className="flex items-center gap-2">
                        <Input
                            className="flex-1"
                            placeholder="Ответить…"
                            value={drafts[draftKey] ?? ''}
                            onChange={e =>
                                setDrafts(p => ({ ...p, [draftKey]: e.target.value }))
                            }
                        />
                        <Button size="sm" onClick={() => saveComment(drafts[draftKey] ?? '', c.id)}>
                            ↩︎
                        </Button>
                    </div>
                </div>

                {c.replies?.map(r => (
                    <Reply key={r.id} c={r} depth={depth + 1} />
                ))}
            </div>
        )
    }

    const CommentCard = ({ c }) => (
        <article className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6">
            <Reply c={c} depth={0} />
        </article>
    )

    if (!post) {
        return (
            <Layout>
                <p className="p-8 text-center">Загрузка…</p>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-12">
                {/* карточка самого поста (ник автора уже кликабелен в PostCard) */}
                <PostCard
                    post={post}
                    onLike={() => react(post.user_has_liked ? 'remove' : 'like')}
                    onDislike={() => react(post.user_has_disliked ? 'remove' : 'dislike')}
                />

                {/* комментарии */}
                <section className="space-y-8">
                    <h3 className="text-3xl font-serif">Комментарии</h3>

                    {post.comments.map(c => (
                        <CommentCard key={c.id} c={c} />
                    ))}

                    {/* форма нового комментария */}
                    <form
                        onSubmit={async e => {
                            e.preventDefault()
                            await saveComment(newComment)
                            setNewComment('')
                        }}
                        className="flex gap-3"
                    >
                        <Input
                            className="flex-1"
                            placeholder="Добавить комментарий…"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                        />
                        <Button type="submit">Отправить</Button>
                    </form>
                </section>
            </div>
        </Layout>
    )
}
