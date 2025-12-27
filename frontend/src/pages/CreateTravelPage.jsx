// src/pages/CreateTravelPage.jsx - полностью демо-версия
import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Button
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TravelForm from '../components/TravelForm';

const CreateTravelPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [createdTravelId, setCreatedTravelId] = useState(null);

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('travel_token');

            const response = await fetch('http://localhost:3000/api/travels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setCreatedTravelId(data.travel?.id);

                // Переход на страницу созданного путешествия
                setTimeout(() => {
                    navigate(`/travel/${data.travel.id}`);
                    window.location.reload();
                }, 2000);
            } else {
                setError(data.error || 'Ошибка при создании путешествия');
            }
        } catch (err) {
            setError('Ошибка сети. Проверьте: 1) Запущен ли бэкенд 2) Настройки CORS');
        } finally {
            setLoading(false);
        }
    };

    // Если не авторизован - показываем сообщение
    if (!isAuthenticated) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        🔒 Требуется авторизация
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Чтобы создавать путешествия, пожалуйста, войдите в систему
                    </Typography>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        size="large"
                    >
                        Войти
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    border: '1px solid #dbdbdb',
                    borderRadius: 2
                }}
            >
                <Typography variant="h4" gutterBottom fontWeight={600}>
                    ✨ Создать новое путешествие
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Заполните информацию о вашем путешествии
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        sx={{ mb: 3 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => navigate('/')}
                            >
                                На ленту
                            </Button>
                        }
                    >
                        <Box>
                            <Typography fontWeight={600}>
                                ✅ Путешествие успешно создано!
                            </Typography>
                            <Typography variant="body2">
                                ID: {createdTravelId}. Оно появится в ленте.
                            </Typography>
                            {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                        </Box>
                    </Alert>
                )}

                <TravelForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </Paper>
        </Container>
    );
};

export default CreateTravelPage;