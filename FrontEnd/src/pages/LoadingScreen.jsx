import React from 'react'
import Lottie from 'lottie-react'
import spinnerData from 'src/animations/spinner.json'

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
            <div className="w-24 h-24">
                <Lottie animationData={spinnerData} loop />
            </div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Копируем все ваши cookie и все остальное... Шучу я сделал это заранее</p>
        </div>
    )
}
