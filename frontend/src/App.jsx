// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import CreateTravelPage from './pages/CreateTravelPage';
import TravelDetailPage from './pages/TravelDetailPage';
import MyTravelsPage from './pages/MyTravelsPage';
import ProfilePage from './pages/ProfilePage';

// Защищенный роут
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

const AppContent = () => {
    return (
        <Layout>
            <Routes>
                {/* Публичные маршруты */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<FeedPage />} />
                <Route path="/travel/:id" element={<TravelDetailPage />} />

                {/* Защищенные маршруты */}
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/create" element={
                    <ProtectedRoute>
                        <CreateTravelPage />
                    </ProtectedRoute>
                } />
                <Route path="/my-travels" element={
                    <ProtectedRoute>
                        <MyTravelsPage />
                    </ProtectedRoute>
                } />

                {/* Резервный маршрут */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
