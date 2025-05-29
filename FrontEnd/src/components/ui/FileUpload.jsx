import { useState } from 'react';
import { CloudUpload } from 'lucide-react';

// drag’n’drop file uploader with hover & error state
export default function FileUpload({ label, onFileSelect, invalid }) {
    const [hover, setHover] = useState(false);
    const borderColor = invalid
        ? 'border-red-500'
        : hover
            ? 'border-indigo-500'
            : 'border-dashed border-gray-300 dark:border-gray-600';

    return (
        <div className="mb-6">
            {label && (
                <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                </p>
            )}
            <label
                className={`
          flex flex-col items-center justify-center
          w-full h-48 rounded-2xl
          bg-gray-50 dark:bg-gray-800
          ${borderColor} border-2
          cursor-pointer transition
          ${invalid ? 'animate-shake' : ''}
        `}
                onDragEnter={() => setHover(true)}
                onDragLeave={() => setHover(false)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <CloudUpload className="w-12 h-12 mb-3 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-500 dark:text-gray-400">
          Перетащите файл или нажмите
        </span>
                <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => onFileSelect(e.target.files[0])}
                />
            </label>
            {invalid && (
                <p className="mt-1 text-sm text-red-500 animate-fadeIn">{invalid}</p>
            )}
        </div>
    );
}
