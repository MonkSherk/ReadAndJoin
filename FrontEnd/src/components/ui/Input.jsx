// modern input with error animation & message
export default function Input({ label, type = 'text', invalid, className = '', ...props }) {
    const borderClasses = invalid
        ? 'border-red-500 animate-shake'
        : 'border-transparent focus:border-indigo-500';
    return (
        <div className={`mb-6 ${className}`}>
            {label && (
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <input
                type={type}
                {...props}
                className={`
          w-full px-5 py-3 rounded-2xl
          bg-gray-100 dark:bg-gray-800
          border-2 ${borderClasses}
          placeholder-gray-500 dark:placeholder-gray-400
          focus:outline-none focus:ring-0 transition
        `}
            />
            {invalid && (
                <p className="mt-1 text-sm text-red-500 animate-fadeIn">{invalid}</p>
            )}
        </div>
    );
}
