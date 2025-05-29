import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaThumbsUp, FaThumbsDown, FaEdit, FaTrash } from 'react-icons/fa'
import { motion } from 'framer-motion'
import Avatar from 'src/components/ui/Avatar'

export default function PostCard({
                                     post,
                                     onLike,
                                     onDislike,
                                     canManage = false,
                                     onEdit,
                                     onDelete,
                                 }) {
    const navigate = useNavigate()

    /* остановить переход по клику внутри карточки */
    const stop = e => e.stopPropagation()

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/posts/${post.id}`)}
        >
            {/* верх */}
            <div className="p-4">
                <div className="flex items-center mb-4">
                    <Avatar src={post.user.avatar} alt={post.user.username} size={32} />
                    <Link
                        to={`/profile/${post.user.id}`}
                        onClick={stop}
                        className="ml-3 font-medium text-gray-900 dark:text-gray-100 hover:underline"
                    >
                        {post.user.username}
                    </Link>
                </div>

                <h2 className="text-xl font-serif text-gray-800 dark:text-gray-200 mb-2">
                    {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                    {post.content}
                </p>
            </div>

            {/* нижняя панель */}
            <div className="px-4 pb-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                    <button onClick={e => { stop(e); onLike?.(post.id) }} className="flex items-center">
                        <FaThumbsUp className={`mr-1 ${post.user_has_liked ? 'text-indigo-500' : ''}`} />
                        <span>{post.likes_count}</span>
                    </button>
                    <button onClick={e => { stop(e); onDislike?.(post.id) }} className="flex items-center">
                        <FaThumbsDown className={`mr-1 ${post.user_has_disliked ? 'text-red-500' : ''}`} />
                        <span>{post.dislikes_count}</span>
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        to={`/posts/${post.id}`}
                        onClick={stop}
                        className="text-indigo-500 hover:underline"
                    >
                        Читать
                    </Link>

                    {canManage && (
                        <>
                            <button onClick={e => { stop(e); onEdit?.(post) }} title="Edit">
                                <FaEdit />
                            </button>
                            <button onClick={e => { stop(e); onDelete?.(post) }} title="Delete">
                                <FaTrash />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
