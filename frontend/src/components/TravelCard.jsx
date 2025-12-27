// src/components/TravelCard.jsx
import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Avatar,
    IconButton
} from '@mui/material';
import { Favorite, Comment, Share, MoreVert } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const TravelCard = ({ travel }) => {
    const { id, title, description, country, type, start_date, end_date, User, Photos = [], RoutePoints = [] } = travel;

    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Получаем первое фото для превью
    const mainPhoto = Photos.length > 0 ? Photos[0] : null;

    return (
        <Card sx={{
            maxWidth: 600,
            margin: '0 auto 20px',
            border: '1px solid #dbdbdb',
            borderRadius: 2
        }}>
            {/* Шапка карточки - автор */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={User?.avatar_url}
                        alt={User?.name}
                        sx={{ width: 32, height: 32 }}
                    >
                        {User?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {User?.name || User?.login}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {country} • {formatDate(start_date)} - {formatDate(end_date)}
                        </Typography>
                    </Box>
                </Box>
                <IconButton size="small">
                    <MoreVert />
                </IconButton>
            </Box>

            {/* Фото путешествия */}
            {mainPhoto && (
                <CardMedia
                    component="img"
                    height="400"
                    image={mainPhoto.url}
                    alt={title}
                    sx={{ objectFit: 'cover' }}
                />
            )}

            {/* Информация о путешествии */}
            <CardContent sx={{ p: 2 }}>
                {/* Заголовок и тип */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component={Link} to={`/travel/${id}`} sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { color: 'primary.main' }
                    }}>
                        {title}
                    </Typography>
                    <Chip
                        label={type === 'planned' ? 'Запланировано' : 'Завершено'}
                        size="small"
                        color={type === 'planned' ? 'primary' : 'success'}
                        variant="outlined"
                    />
                </Box>

                {/* Описание */}
                {description && (
                    <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                        {description.length > 150 ? `${description.substring(0, 150)}...` : description}
                    </Typography>
                )}

                {/* Пункты маршрута */}
                {RoutePoints.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Маршрут:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {RoutePoints.slice(0, 3).map((point, index) => (
                                <Chip
                                    key={point.id}
                                    label={`${point.order}. ${point.city}`}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                            {RoutePoints.length > 3 && (
                                <Chip
                                    label={`+${RoutePoints.length - 3}`}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    </Box>
                )}

                {/* Статистика (позже добавим лайки/комментарии) */}
                <Box sx={{ display: 'flex', gap: 2, borderTop: '1px solid #f0f0f0', pt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small">
                            <Favorite fontSize="small" />
                        </IconButton>
                        <Typography variant="caption">0</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small">
                            <Comment fontSize="small" />
                        </IconButton>
                        <Typography variant="caption">0</Typography>
                    </Box>
                    <IconButton size="small">
                        <Share fontSize="small" />
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TravelCard;