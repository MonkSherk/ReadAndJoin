import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from 'src/components/ui/Input';
import Button from 'src/components/ui/Button';
import ThemeToggle from 'src/components/ui/ThemeToggle';
import api from 'src/utils/api';
import { useAuthStore } from 'src/stores/authStore';

export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [form, setForm] = useState({ username: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const { data } = await api.post('/users/login/', {
                username: form.username,
                password: form.password,
            });

            const { access, refresh, detail } = data;

            if (access) {
                // Сохраняем в стор (и в localStorage через persist)
                setAuth(null, access, refresh);
                // Редиректим
                navigate('/', { replace: true });
            } else {
                // если вдруг access нет
                setErrorMsg(detail || 'Не удалось войти');
            }
        } catch (err) {
            // собираем сообщение об ошибке
            const resp = err.response?.data;
            const msg =
                resp?.detail ||
                Object.values(resp || {})
                    .flat()
                    .join(' ') ||
                'Ошибка входа';
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <form
                onSubmit={handleSubmit}
                className={`
          w-full max-w-md bg-white dark:bg-gray-800
          p-8 rounded-3xl shadow-xl
          ${errorMsg ? 'animate-shake' : ''}
        `}
            >
                <h2 className="text-3xl font-semibold mb-6 text-center">
                    Вход в аккаунт
                </h2>

                {errorMsg && (
                    <p className="mb-4 text-center text-red-500 animate-fadeIn">
                        {errorMsg}
                    </p>
                )}

                <Input
                    label="Имя пользователя"
                    placeholder="ivan_ivanov"
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                />

                <Input
                    label="Пароль"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6"
                >
                    {loading ? 'Загрузка...' : 'Войти'}
                </Button>
            </form>
        </div>
    );
}
