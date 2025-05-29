import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from 'src/components/ui/Input';
import Button from 'src/components/ui/Button';
import ThemeToggle from 'src/components/ui/ThemeToggle';
import api from 'src/utils/api';

export default function Confirm() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/users/confirm-email/', {
                email,
                confirmation_code: code
            });
            nav('/login');
        } catch {
            setError('Неверный код или почта.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <form
                onSubmit={submit}
                className={`
          w-full max-w-xs p-8 bg-white dark:bg-gray-800
          rounded-3xl shadow-lg transition
          ${error ? 'animate-shake' : ''}
        `}
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
                    Подтвердите аккаунт
                </h2>

                {error && (
                    <p className="mb-4 text-center text-red-500 animate-fadeIn">
                        {error}
                    </p>
                )}

                <Input
                    label="E-mail"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    invalid={!!error}
                />

                <Input
                    label="Код из письма"
                    placeholder="XXXXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    invalid={!!error}
                />

                <Button type="submit" disabled={loading} className="w-full mt-4">
                    {loading ? 'Проверка...' : 'Подтвердить'}
                </Button>
            </form>
        </div>
    );
}
