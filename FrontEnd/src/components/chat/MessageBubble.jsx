import React from 'react';
import classNames from 'classnames';
import Avatar from 'src/components/ui/Avatar';
import { format } from 'date-fns';

export default function MessageBubble({ msg, isSelf }) {
    return (
        <div className={classNames('flex mb-3', { 'justify-end': isSelf })}>
            {!isSelf && (
                <Avatar src={msg.sender.avatar} size={28} alt={msg.sender.username} />
            )}
            <div
                className={classNames(
                    'max-w-xs px-4 py-2 rounded-lg',
                    isSelf
                        ? 'bg-indigo-500 text-white ml-2'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-2'
                )}
            >
                <p>{msg.content}</p>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {format(new Date(msg.created_at), 'HH:mm')}
        </span>
            </div>
        </div>
    );
}
