import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Lottie from 'lottie-react'
import heroAnim     from 'src/animations/heroBackground.json'
import happyAnim    from 'src/animations/happy.json'
import thumbsUpAnim from 'src/animations/thumbsUp.json'
import heartAnim    from 'src/animations/heart.json'

export default function Welcome() {
    const navigate = useNavigate()
    const heroRef = useRef(null)

    // Scroll to Register section on click
    const scrollToRegister = () => {
        const section = document.getElementById('register-section')
        if (section) section.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        // Lock scroll overflow-y on body for hero section
        const onScroll = () => {
            // placeholder, no-op
        }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="relative h-screen flex items-center justify-center overflow-hidden"
            >
                <Lottie animationData={heroAnim} loop className="absolute inset-0 w-full h-full opacity-20" />
                <div className="relative z-10 text-center px-6">
                    <h1 className="text-6xl font-serif font-bold mb-4 text-gray-900 dark:text-gray-100">
                        Добро пожаловать в ReadAndJoin
                    </h1>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Публикация постов, подписка на теги,
                        <br /> чат с анимированными эмодзи и
                        <br /> своя аналитика активности.
                    </p>
                    <button
                        onClick={scrollToRegister}
                        className="mt-4 px-8 py-4 bg-highlight text-white rounded-full shadow-lg hover:scale-105 transform transition"
                    >
                        Узнать больше
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto space-y-16">
                    <Feature
                        animData={happyAnim}
                        title="Создавайте посты"
                        description="Пишите тексты, добавляйте теги и делитесь идеями с сообществом."
                    />
                    <Feature
                        animData={thumbsUpAnim}
                        title="Реакции и обсуждения"
                        description="Ставьте лайки/дизлайки, комментируйте и обсуждайте."
                    />
                    <Feature
                        animData={heartAnim}
                        title="Анимированные эмодзи"
                        description="Отправляйте анимированные эмодзи в чатах и комментариях для ярких эмоций."
                    />
                    <Feature
                        animData={heroAnim}
                        title="Встроенная аналитика"
                        description="Следите за своей активностью: количество постов, средняя длина и топ-теги."
                    />
                </div>
            </section>

            {/* Register Call-to-Action Section */}
            <section
                id="register-section"
                className="py-20 px-6 text-center"
            >
                <h2 className="text-4xl font-serif mb-4 text-gray-900 dark:text-gray-100">
                    Присоединяйся прямо сейчас
                </h2>
                <p className="text-lg mb-8 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                    Зарегистрируйся, подтверди email и начни общаться и делиться идеями.
                </p>
                <div className="space-x-4">
                    <button
                        onClick={() => navigate('/register')}
                        className="px-6 py-4 bg-highlight text-white rounded-full shadow-lg hover:scale-105 transform transition"
                    >
                        Зарегистрироваться
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-4 bg-accent text-white rounded-full shadow-lg hover:scale-105 transform transition"
                    >
                        Войти
                    </button>
                </div>
            </section>
        </div>
    )
}

function Feature({ animData, title, description }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32">
                <Lottie animationData={animData} loop className="w-full h-full" />
            </div>
            <div className="max-w-xl">
                <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                    {description}
                </p>
            </div>
        </div>
    )
}
