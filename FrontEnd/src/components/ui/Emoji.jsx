import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'

const animationMap = {
    happy: '/animations/happy.json',
    sad: '/animations/sad.json',
    thumbsUp: '/animations/thumbsUp.json',
    heart: '/animations/heart.json'
}

export default function Emoji({ type, onClick }) {
    const [animationData, setAnimationData] = useState(null)

    useEffect(() => {
        const url = animationMap[type]
        if (url) {
            fetch(url)
                .then(res => res.json())
                .then(setAnimationData)
        }
    }, [type])

    if (!animationData) return null

    return (
        <div onClick={onClick} className="w-12 h-12 cursor-pointer">
            <Lottie animationData={animationData} loop={false} />
        </div>
    )
}
