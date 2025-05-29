import React from 'react';

const emojis = ['🚀', '🎉', '✨', '🔥', '💡', '🎈', '🌟'];
function randomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

export default function Header() {
    return (
        <header className="sticky top-0 z-20 h-16 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                {randomEmoji()} Read&nbsp;& Join {randomEmoji()}
            </h1>
        </header>
    );
}