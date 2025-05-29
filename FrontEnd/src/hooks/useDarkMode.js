import { useEffect, useState } from 'react'

export default function useDarkMode() {
    const [mode, setMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light'
        }
        return 'light'
    })

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove(mode === 'dark' ? 'light' : 'dark')
        root.classList.add(mode)
        localStorage.setItem('theme', mode)
    }, [mode])

    const toggle = () => setMode(prev => prev === 'dark' ? 'light' : 'dark')
    return { mode, toggle }
}
