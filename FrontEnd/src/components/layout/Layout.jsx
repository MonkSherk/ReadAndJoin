import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Полноширинный хэдер */}
            <Header />

            {/* Основная область: сайдбар + контент */}
            <div className="flex flex-1">
                <Sidebar />
                <main className="ml-48 flex-1 flex flex-col">
                    {children}
                </main>
            </div>

            {/* Футер всегда внизу */}
            <Footer />
        </div>
    )
}