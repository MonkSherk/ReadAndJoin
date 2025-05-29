import React from 'react'
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'

export default function LikeButton({ liked, count, onClick, dislike }) {
    return (
        <button onClick={onClick} className="flex items-center space-x-1">
            {dislike ? (
                <FaThumbsDown className={liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} />
            ) : (
                <FaThumbsUp className={liked ? 'text-accent' : 'text-gray-500 dark:text-gray-400'} />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">{count}</span>
        </button>
    )
}
