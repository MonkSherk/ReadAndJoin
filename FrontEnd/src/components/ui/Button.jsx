// universal button with focus/fly states
export default function Button({ children, className = '', ...props }) {
    return (
        <button
            {...props}
            className={`
        inline-flex items-center justify-center
        px-6 py-3 rounded-2xl
        bg-indigo-600 dark:bg-indigo-500
        text-white font-semibold
        hover:bg-indigo-700 dark:hover:bg-indigo-600
        focus:outline-none focus:ring-2 focus:ring-indigo-400
        transition ${className}
      `}
        >
            {children}
        </button>
    );
}
