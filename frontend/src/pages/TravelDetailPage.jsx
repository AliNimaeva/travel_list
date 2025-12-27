// pages/TravelDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom'; // убрали useNavigate
import {
    Container,
    Typography,
    Box,
    Card,
    CardMedia,
    Grid,
    Chip,
    Avatar,
    Button,
    CircularProgress,
    Paper
} from '@mui/material';
import { DateRange, LocationOn, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext'; // предполагаем, что есть контекст авторизации

const TravelDetailPage = () => {
    const { id } = useParams();
    // Убрали navigate, так как он не используется
    const [travel, setTravel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth(); // получаем текущего пользователя из контекста

    // Используем useCallback, чтобы функция не пересоздавалась при каждом рендере
    const fetchTravel = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/travel/${id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                throw new Error('Не удалось загрузить путешествие');
            }

            const data = await response.json();
            setTravel(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]); // зависимость - id из параметров URL

    useEffect(() => {
        fetchTravel();
    }, [fetchTravel]); // теперь fetchTravel стабилен благодаря useCallback

    // Проверяем, является ли текущий пользователь владельцем
    const isOwner = currentUser && travel && currentUser.id === travel.userId;

    // Функция для удаления путешествия
    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить это путешествие?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/travel/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    // Редирект на главную или в личный кабинет после удаления
                    window.location.href = '/profile'; // или navigate('/profile'), если добавим useNavigate обратно
                }
            } catch (err) {
                console.error('Ошибка при удалении:', err);
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6">
                    Ошибка: {error}
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchTravel}>
                    Попробовать снова
                </Button>
            </Container>
        );
    }

    if (!travel) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h6">
                    Путешествие не найдено
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} component={Link} to="/">
                    Вернуться на главную
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Кнопки действий для владельца */}
            {isOwner && (
                <Box display="flex" justifyContent="flex-end" gap={2} mb={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to={`/travel/${id}/edit`}
                    >
                        Редактировать
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDelete}
                    >
                        Удалить
                    </Button>
                </Box>
            )}

            {/* Заголовок и мета-информация */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {travel.title}
                </Typography>

                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={2}>
                    <Chip
                        icon={<LocationOn />}
                        label={travel.country}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        icon={<DateRange />}
                        label={`${new Date(travel.startDate).toLocaleDateString()} - ${new Date(travel.endDate).toLocaleDateString()}`}
                    />
                    <Chip
                        label={travel.type === 'planned' ? 'Запланировано' : 'Завершено'}
                        color={travel.type === 'planned' ? 'info' : 'success'}
                    />
                    {!travel.isPublic && <Chip label="Приватное" size="small" />}
                </Box>

                {/* Описание */}
                {travel.description && (
                    <Typography variant="body1" paragraph>
                        {travel.description}
                    </Typography>
                )}

                {/* Автор */}
                <Box display="flex" alignItems="center" gap={1} mt={3}>
                    <Avatar src={travel.User?.avatar} alt={travel.User?.name}>
                        <Person />
                    </Avatar>
                    <Typography variant="subtitle1">
                        {travel.User?.name}
                        {travel.User?.country && `, ${travel.User.country}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        {new Date(travel.createdAt).toLocaleDateString()}
                    </Typography>
                </Box>
            </Paper>

            {/* Пункты маршрута */}
            <Typography variant="h5" gutterBottom>
                Маршрут ({travel.RoutePoints?.length || 0} пунктов)
            </Typography>

            {travel.RoutePoints && travel.RoutePoints.length > 0 ? (
                travel.RoutePoints.map((point, index) => (
                    <Paper key={point.id} elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                {index + 1}
                            </Avatar>
                            <Box flex={1}>
                                <Typography variant="h6">{point.city}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {point.date && new Date(point.date).toLocaleDateString('ru-RU')}
                                </Typography>
                            </Box>
                        </Box>

                        {point.description && (
                            <Typography paragraph sx={{ ml: 6 }}> {/* отступ для выравнивания с текстом */}
                                {point.description}
                            </Typography>
                        )}

                        {/* Фотографии пункта */}
                        {point.Photos && point.Photos.length > 0 && (
                            <>
                                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                    Фотографии:
                                </Typography>
                                <Grid container spacing={2} sx={{ ml: 6 }}>
                                    {point.Photos.map(photo => (
                                        <Grid item xs={12} sm={6} md={4} key={photo.id}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={photo.url}
                                                    alt={photo.description || `Фото из ${point.city}`}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                                {photo.description && (
                                                    <Box sx={{ p: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {photo.description}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )}
                    </Paper>
                ))
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        В этом путешествии пока нет пунктов маршрута
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default TravelDetailPage;