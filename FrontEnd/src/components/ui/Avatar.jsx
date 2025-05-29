import React from 'react'

export default function Avatar({ src, alt = 'avatar', size = 40, className = '' }) {
    return (
        <img
            src={src || `https://ui-avatars.com/api/?name=${alt}&background=3B82F6&color=fff&size=${size}`}
            alt={alt}
            className={`rounded-full object-cover ${className}`}
            style={{ width: size, height: size }}
        />
    )
}
