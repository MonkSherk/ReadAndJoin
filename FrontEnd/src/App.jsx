import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import PublicRoute  from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import LoadingScreen from './pages/LoadingScreen';

// Pages
import Welcome        from './pages/Welcome';
import Register       from './pages/Register';
import Confirm        from './pages/Confirm';
import Login          from './pages/Login';
import Home           from './pages/Home';
import Profile        from './pages/Profile';
import OtherProfile   from './pages/OtherProfile';
import Analytics      from './pages/Analytics';
import Subscriptions  from './pages/Subscriptions';
import Notifications  from './pages/Notifications';
import PostDetail     from './pages/PostDetail';
import ChatList       from './pages/ChatList';
import ChatRoom       from './pages/ChatRoom';
import NotFound       from './pages/NotFound';

import { useAuthStore } from './stores/authStore';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in:      { opacity: 1, y: 0 },
    out:     { opacity: 0, y: -20 },
};
const pageTransition = { duration: 0.3 };

export default function App() {
    const fetchCurrentUser = useAuthStore(state => state.fetchCurrentUser);
    const isLoadingUser    = useAuthStore(state => state.isLoadingUser);
    const user             = useAuthStore(state => state.user);

    // При старте приложения, если есть токен, грузим профиль
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCurrentUser();
        }
    }, [fetchCurrentUser]);

    // Пока идёт запрос профиля — показываем LoadingScreen
    if (isLoadingUser) {
        return <LoadingScreen />;
    }

    return (
        <BrowserRouter>
            <AnimatePresence mode="wait">
                <Routes>

                    {/* публичные */}
                    <Route element={<PublicRoute />}>
                        <Route path="/welcome"   element={<PageWrapper><Welcome /></PageWrapper>} />
                        <Route path="/register"  element={<PageWrapper><Register /></PageWrapper>} />
                        <Route path="/confirm"   element={<PageWrapper><Confirm /></PageWrapper>} />
                        <Route path="/login"     element={<PageWrapper><Login /></PageWrapper>} />
                    </Route>

                    {/* приватные */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/"            element={<PageWrapper><Home /></PageWrapper>} />
                        <Route path="/profile"     element={<PageWrapper><Profile /></PageWrapper>} />
                        <Route path="/profile/:uid"element={<PageWrapper><OtherProfile /></PageWrapper>} />
                        <Route path="/analytics"   element={<PageWrapper><Analytics /></PageWrapper>} />
                        <Route path="/subscriptions"element={<PageWrapper><Subscriptions /></PageWrapper>} />
                        <Route path="/notifications"element={<PageWrapper><Notifications /></PageWrapper>} />
                        <Route path="/posts/:id"   element={<PageWrapper><PostDetail /></PageWrapper>} />
                        <Route path="/chats"       element={<PageWrapper><ChatList /></PageWrapper>} />
                        <Route path="/chats/:id"   element={<PageWrapper><ChatRoom /></PageWrapper>} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                </Routes>
            </AnimatePresence>
        </BrowserRouter>
    );
}

function PageWrapper({ children }) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen"
        >
            {children}
        </motion.div>
    );
}
