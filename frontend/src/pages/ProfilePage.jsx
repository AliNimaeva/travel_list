// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Button,
    Chip,
    Divider,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar
} from '@mui/material';
import {
    Edit as EditIcon,
    CameraAlt as CameraIcon,
    LocationOn,
    DateRange,
    Public as PublicIcon,
    Lock as LockIcon,
    ArrowBack as ArrowBackIcon,
    TravelExplore,
    PhotoCamera,
    Map,
    Star
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { username } = useParams(); // Если хотим смотреть чужой профиль по username
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated} = useAuth();
    
    const [profileUser, setProfileUser] = useState(null); // Пользователь, чей профиль смотрим
    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0); // 0=о себе, 1=путешествия, 2=статистика
    
    // Для редактирования профиля
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        country: '',
        avatar: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    
    // Уведомления
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Определяем, чей профиль смотрим и можем ли редактировать
    const isOwnProfile = !username || username === currentUser?.login;
    const viewingUser = isOwnProfile ? currentUser : profileUser;

    // Загрузка данных профиля
    const loadProfileData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('travel_token');
            
            let userData;
            let travelsData = [];

            // Если смотрим чужой профиль
            if (username && username !== currentUser?.login) {
                console.log('👤 Загрузка чужого профиля:', username);
                
                // Загружаем данные пользователя
                const userResponse = await fetch(`http://localhost:3000/api/users/${username}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (!userResponse.ok) {
                    if (userResponse.status === 404) {
                        throw new Error('Пользователь не найден');
                    }
                    throw new Error(`Ошибка: ${userResponse.status}`);
                }

                userData = await userResponse.json();
                setProfileUser(userData);

                // Загружаем путешествия пользователя
                const travelsResponse = await fetch(`http://localhost:3000/api/travels/user/${userData.id}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (travelsResponse.ok) {
                    const travelsResult = await travelsResponse.json();
                    travelsData = Array.isArray(travelsResult) ? travelsResult : 
                                  travelsResult.travels ? travelsResult.travels : [];
                }
            } 
            // Если смотрим свой профиль
            else {
                console.log('👤 Загрузка своего профиля');
                userData = currentUser;
                
                // Загружаем свои путешествия
                if (isAuthenticated && token) {
                    const response = await fetch('http://localhost:3000/api/travels/my', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        travelsData = Array.isArray(result) ? result : 
                                     result.travels ? result.travels : [];
                    }
                }
            }

            setTravels(travelsData);

        } catch (err) {
            console.error('❌ Ошибка загрузки профиля:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [username, currentUser, isAuthenticated]);

    // Загрузка при монтировании
    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    // Редактирование профиля
    const handleEditClick = () => {
        setEditForm({
            name: viewingUser?.name || '',
            bio: viewingUser?.bio || '',
            country: viewingUser?.country || '',
            avatar: viewingUser?.avatar_url || viewingUser?.avatar || ''
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!currentUser || !isOwnProfile) return;
        
        setEditLoading(true);
        
        try {
            const token = localStorage.getItem('travel_token');
            
            const response = await fetch('http://localhost:3000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}`);
            }
            
            // Обновляем данные в контексте/состоянии
            // Здесь нужно будет обновить контекст AuthContext
            // Пока просто перезагружаем страницу
            window.location.reload();
            
        } catch (err) {
            console.error('❌ Ошибка обновления профиля:', err);
            setSnackbar({
                open: true,
                message: `Ошибка: ${err.message}`,
                severity: 'error'
            });
        } finally {
            setEditLoading(false);
        }
    };

    // Статистика
    const stats = {
        totalTravels: travels.length,
        plannedTravels: travels.filter(t => t.type === 'planned').length,
        completedTravels: travels.filter(t => t.type === 'completed').length,
        publicTravels: travels.filter(t => t.is_public || t.isPublic).length,
        visitedCountries: [...new Set(travels.map(t => t.country).filter(Boolean))].length,
        totalPhotos: travels.reduce((sum, t) => sum + (t.Photos?.length || 0), 0),
        totalRoutePoints: travels.reduce((sum, t) => sum + (t.RoutePoints?.length || 0), 0)
    };

    // Форматирование даты регистрации
    const formatJoinDate = (dateString) => {
        if (!dateString) return 'Недавно';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long'
        });
    };

    if (loading) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }} color="text.secondary">
                    Загрузка профиля...
                </Typography>
            </Container>
        );
    }

    if (error && !viewingUser) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    variant="outlined"
                >
                    Назад
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Хлебные крошки */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    size="small"
                >
                    Назад
                </Button>
            </Box>

            {/* Шапка профиля */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, position: 'relative' }}>
                <Grid container spacing={4} alignItems="center">
                    {/* Аватар */}
                    <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <Avatar
                                src={viewingUser?.avatar_url || viewingUser?.avatar}
                                alt={viewingUser?.name}
                                sx={{
                                    width: 150,
                                    height: 150,
                                    border: '4px solid white',
                                    boxShadow: 3
                                }}
                            />
                            {isOwnProfile && (
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                    onClick={handleEditClick}
                                >
                                    <CameraIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Grid>

                    {/* Основная информация */}
                    <Grid item xs={12} md={9}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="h3" fontWeight={700} gutterBottom>
                                    {viewingUser?.name || viewingUser?.login}
                                </Typography>
                                
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    @{viewingUser?.login}
                                </Typography>

                                {viewingUser?.country && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <LocationOn fontSize="small" sx={{ mr: 1 }} />
                                        <Typography variant="body1">
                                            {viewingUser.country}
                                        </Typography>
                                    </Box>
                                )}

                                {viewingUser?.bio && (
                                    <Typography variant="body1" sx={{ mb: 3, maxWidth: '80%' }}>
                                        {viewingUser.bio}
                                    </Typography>
                                )}

                                <Typography variant="caption" color="text.secondary">
                                    <TravelExplore fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    В проекте с {formatJoinDate(viewingUser?.created_at)}
                                </Typography>
                            </Box>

                            {/* Кнопки действий */}
                            <Box>
                                {isOwnProfile ? (
                                    <>
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={handleEditClick}
                                            sx={{ mr: 2 }}
                                        >
                                            Редактировать
                                        </Button>
                                        {/* <Button
                                            variant="contained"
                                            component={Link}
                                            to="/travel/new"
                                        >
                                            Новое путешествие
                                        </Button> */}
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        // TODO: Добавить функционал подписки
                                    >
                                        Подписаться
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Вкладки */}
            <Paper sx={{ mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                >
                    <Tab label="О себе" />
                    <Tab label={`Путешествия (${stats.totalTravels})`} />
                    <Tab label="Статистика" />
                </Tabs>
            </Paper>

            {/* Содержимое вкладок */}
            {activeTab === 0 && (
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Информация о пользователе
                    </Typography>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    Контактная информация
                                </Typography>
                                {viewingUser?.email && (
                                    <Typography variant="body1" color="text.secondary">
                                        📧 {viewingUser.email}
                                    </Typography>
                                )}
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    Активность
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    🗺️ {stats.visitedCountries} стран посещено
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    📸 {stats.totalPhotos} фотографий
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            {viewingUser?.bio ? (
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                        О себе
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                        {viewingUser.bio}
                                    </Typography>
                                </Box>
                            ) : isOwnProfile ? (
                                <Alert severity="info">
                                    Расскажите о себе! Это поможет другим пользователям узнать вас лучше.
                                    <Button 
                                        size="small" 
                                        sx={{ ml: 2 }}
                                        onClick={handleEditClick}
                                    >
                                        Добавить информацию
                                    </Button>
                                </Alert>
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    Пользователь пока не добавил информацию о себе
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {activeTab === 1 && (
                <>
                    {travels.length === 0 ? (
                        <Paper sx={{ p: 5, textAlign: 'center' }}>
                            <TravelExplore sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {isOwnProfile ? 'У вас пока нет путешествий' : 'У пользователя пока нет путешествий'}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                {isOwnProfile ? 'Создайте первое путешествие!' : 'Скоро здесь появятся путешествия'}
                            </Typography>
                            {isOwnProfile && (
                                <Button
                                    component={Link}
                                    to="/travel/new"
                                    variant="contained"
                                >
                                    Создать путешествие
                                </Button>
                            )}
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {travels.map((travel) => {
                                const isPublic = travel.is_public !== undefined ? travel.is_public : travel.isPublic;
                                
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={travel.id}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {travel.Photos && travel.Photos.length > 0 ? (
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={travel.Photos[0].url}
                                                    alt={travel.title}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Box sx={{ height: 140, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Map sx={{ fontSize: 50, color: 'grey.400' }} />
                                                </Box>
                                            )}

                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="h6" sx={{ flex: 1 }}>
                                                        {travel.title}
                                                    </Typography>
                                                    <Chip
                                                        label={travel.type === 'planned' ? 'План' : 'Отчёт'}
                                                        size="small"
                                                        color={travel.type === 'planned' ? 'info' : 'success'}
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <LocationOn fontSize="small" sx={{ mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {travel.country}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <DateRange fontSize="small" sx={{ mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {travel.startDate ? new Date(travel.startDate).toLocaleDateString() : ''}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Chip
                                                        icon={isPublic ? <PublicIcon /> : <LockIcon />}
                                                        label={isPublic ? 'Публичное' : 'Приватное'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {travel.RoutePoints?.length || 0} пунктов
                                                    </Typography>
                                                </Box>
                                            </CardContent>

                                            <CardActions>
                                                <Button
                                                    size="small"
                                                    component={Link}
                                                    to={`/travel/${travel.id}`}
                                                    fullWidth
                                                >
                                                    Открыть
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </>
            )}

            {activeTab === 2 && (
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                        Статистика путешествий
                    </Typography>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        📊 Общая статистика
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Всего путешествий
                                        </Typography>
                                        <Typography variant="h4">
                                            {stats.totalTravels}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                                                <Typography variant="h5" color="info.dark">
                                                    {stats.plannedTravels}
                                                </Typography>
                                                <Typography variant="caption">
                                                    Запланировано
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                                                <Typography variant="h5" color="success.dark">
                                                    {stats.completedTravels}
                                                </Typography>
                                                <Typography variant="caption">
                                                    Завершено
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        🌍 География
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Посещено стран
                                        </Typography>
                                        <Typography variant="h4">
                                            {stats.visitedCountries}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Публичные/приватные:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ flex: stats.publicTravels, height: 8, bgcolor: 'primary.main', borderRadius: 4 }} />
                                        <Box sx={{ flex: stats.totalTravels - stats.publicTravels, height: 8, bgcolor: 'grey.300', borderRadius: 4 }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption">
                                            {stats.publicTravels} публичных
                                        </Typography>
                                        <Typography variant="caption">
                                            {stats.totalTravels - stats.publicTravels} приватных
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        📸 Контент
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    
                                    <Grid container spacing={3}>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <PhotoCamera sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                                <Typography variant="h5">
                                                    {stats.totalPhotos}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Фотографий
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <LocationOn sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                                                <Typography variant="h5">
                                                    {stats.totalRoutePoints}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Пунктов маршрута
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                                <Typography variant="h5">
                                                    {stats.visitedCountries}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Уникальных стран
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Диалог редактирования профиля */}
            <Dialog 
                open={editDialogOpen} 
                onClose={() => !editLoading && setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Редактировать профиль
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Имя"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            sx={{ mb: 3 }}
                            disabled={editLoading}
                        />
                        
                        <TextField
                            fullWidth
                            label="Страна"
                            value={editForm.country}
                            onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                            sx={{ mb: 3 }}
                            disabled={editLoading}
                        />
                        
                        <TextField
                            fullWidth
                            label="О себе"
                            value={editForm.bio}
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            multiline
                            rows={4}
                            sx={{ mb: 3 }}
                            disabled={editLoading}
                        />
                        
                        <TextField
                            fullWidth
                            label="URL аватара"
                            value={editForm.avatar}
                            onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                            disabled={editLoading}
                            helperText="Ссылка на изображение"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setEditDialogOpen(false)} 
                        disabled={editLoading}
                    >
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleEditSubmit} 
                        variant="contained"
                        disabled={editLoading}
                        startIcon={editLoading && <CircularProgress size={20} />}
                    >
                        {editLoading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Уведомления */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Container>
    );
};

export default ProfilePage;