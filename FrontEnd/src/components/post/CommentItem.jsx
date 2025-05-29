import React from 'react'
import Avatar from '../ui/Avatar'
import { formatDistanceToNow } from 'date-fns'

export default function CommentItem({ comment }) {
    return (
        <div className="flex space-x-3 mb-4">
            <Avatar src={comment.user.avatar} alt={comment.user.username} size={28} />
            <div>
                <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {comment.user.username}
          </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                </p>
            </div>
        </div>
    )
}
