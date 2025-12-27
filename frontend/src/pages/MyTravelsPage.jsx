// src/pages/MyTravelsPage.jsx - С РЕДАКТИРОВАНИЕМ И УДАЛЕНИЕМ
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Tabs,
    Tab,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    // Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    DateRange,
    LocationOn,
    Public as PublicIcon,
    Lock as LockIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const MyTravelsPage = () => {
    const { user, isAuthenticated } = useAuth();

    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0); // 0=все, 1=планы, 2=отчёты

    // Для редактирования
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [travelToEdit, setTravelToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        is_public: true
    });
    const [editLoading, setEditLoading] = useState(false);

    // Для удаления
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [travelToDelete, setTravelToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Уведомления
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Загрузка путешествий пользователя
    const loadMyTravels = useCallback(async () => {
        if (!isAuthenticated) {
            setError('Требуется авторизация');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('travel_token');

            if (!token) {
                throw new Error('Токен авторизации не найден');
            }

            console.log('📡 Запрос к API: http://localhost:3000/api/travels/my');

            // Основной запрос к API
            const response = await fetch('http://localhost:3000/api/travels/my', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📊 Статус ответа:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Требуется повторная авторизация');
                }
                if (response.status === 404) {
                    throw new Error('API эндпоинт не найден. Проверьте маршрут /api/travels/my');
                }
                throw new Error(`Ошибка сервера: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Получены данные:', data);

            // Преобразуем данные в единый формат
            const travelsData = Array.isArray(data) ? data :
                data.travels ? data.travels :
                    data.data ? data.data : [];

            // Нормализация полей (бэкенд может использовать is_public, фронтенд ожидает isPublic)
            const normalizedTravels = travelsData.map(travel => ({
                ...travel,
                isPublic: travel.is_public !== undefined ? travel.is_public : travel.isPublic,
                startDate: travel.start_date || travel.startDate,
                endDate: travel.end_date || travel.endDate
            }));

            setTravels(normalizedTravels);

        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setError(err.message);
            setTravels([]); // Очищаем список при ошибке
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Загрузка при монтировании
    useEffect(() => {
        loadMyTravels();
    }, [loadMyTravels]);

    // Фильтрация по вкладке
    const filteredTravels = travels.filter(travel => {
        if (activeTab === 0) return true;
        if (activeTab === 1) return travel.type === 'planned';
        if (activeTab === 2) return travel.type === 'completed';
        return true;
    });

    // ========== РЕДАКТИРОВАНИЕ ==========
    const handleEditClick = (travel) => {
        console.log('✏️ Редактирование путешествия:', travel);
        setTravelToEdit(travel);
        setEditForm({
            title: travel.title || '',
            description: travel.description || '',
            is_public: travel.is_public !== undefined ? travel.is_public : travel.isPublic
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!travelToEdit) return;

        setEditLoading(true);

        try {
            const token = localStorage.getItem('travel_token');

            console.log('🔄 Отправка обновления для ID:', travelToEdit.id);
            console.log('📝 Данные:', editForm);

            // ✅ ПРАВИЛЬНО: /api/travels/:id
            const response = await fetch(`http://localhost:3000/api/travels/${travelToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            console.log('📊 Статус обновления:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Ошибка ${response.status}`);
            }

            const updatedData = await response.json();
            console.log('✅ Обновленные данные:', updatedData);

            // Обновляем в локальном состоянии
            setTravels(travels.map(t =>
                t.id === travelToEdit.id
                    ? {
                        ...t,
                        title: editForm.title,
                        description: editForm.description,
                        is_public: editForm.is_public,
                        isPublic: editForm.is_public
                    }
                    : t
            ));

            setSnackbar({
                open: true,
                message: 'Путешествие успешно обновлено',
                severity: 'success'
            });

            setEditDialogOpen(false);
            setTravelToEdit(null);
        } catch (err) {
            console.error('❌ Ошибка при обновлении:', err);
            setSnackbar({
                open: true,
                message: `Ошибка: ${err.message}`,
                severity: 'error'
            });
        } finally {
            setEditLoading(false);
        }
    };

    // ========== УДАЛЕНИЕ ==========
    const handleDeleteClick = (travel) => {
        console.log('🗑️ Запрос на удаление:', travel.id);
        setTravelToDelete(travel);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!travelToDelete) return;

        setDeleteLoading(true);

        try {
            const token = localStorage.getItem('travel_token');

            console.log('🗑️ Удаление путешествия ID:', travelToDelete.id);

            const response = await fetch(`http://localhost:3000/api/travels/${travelToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📊 Статус удаления:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Ошибка ${response.status}`);
            }

            // Удаляем из локального состояния
            setTravels(travels.filter(t => t.id !== travelToDelete.id));

            setSnackbar({
                open: true,
                message: 'Путешествие успешно удалено',
                severity: 'success'
            });

            setDeleteDialogOpen(false);
            setTravelToDelete(null);
        } catch (err) {
            console.error('❌ Ошибка при удалении:', err);
            setSnackbar({
                open: true,
                message: `Ошибка: ${err.message}`,
                severity: 'error'
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    const closeSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const stats = {
        total: travels.length,
        planned: travels.filter(t => t.type === 'planned').length,
        completed: travels.filter(t => t.type === 'completed').length,
        public: travels.filter(t => t.is_public || t.isPublic).length,
        private: travels.filter(t => !(t.is_public || t.isPublic)).length
    };

    // Если не авторизован
    if (!isAuthenticated) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        🔒 Требуется авторизация
                    </Typography>
                    <Typography sx={{ mb: 3 }}>
                        Войдите в систему, чтобы увидеть ваши путешествия
                    </Typography>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                    >
                        Войти
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Заголовок */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                    Мои путешествия
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {user?.name || user?.login || 'Пользователь'}, управляйте вашими путешествиями
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        component={Link}
                        to="/create"
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        Создать путешествие
                    </Button>

                    <Button
                        onClick={loadMyTravels}
                        startIcon={<RefreshIcon />}
                        variant="outlined"
                        size="small"
                        disabled={loading}
                    >
                        Обновить
                    </Button>
                </Box>
            </Box>

            {/* Вкладки */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                >
                    <Tab label={`Все (${stats.total})`} />
                    <Tab label={`Планы (${stats.planned})`} />
                    <Tab label={`Отчёты (${stats.completed})`} />
                </Tabs>
            </Paper>

            {/* Сообщения об ошибках */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={loadMyTravels}
                        >
                            Повторить
                        </Button>
                    }
                >
                    {error}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Проверьте: 1) Бэкенд запущен 2) Токен валиден 3) Маршрут /api/travels/my существует
                    </Typography>
                </Alert>
            )}

            {/* Загрузка */}
            {loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                        Загрузка ваших путешествий...
                    </Typography>
                </Box>
            )}

            {/* Список путешествий */}
            {!loading && filteredTravels.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {activeTab === 0 ? 'У вас пока нет путешествий' :
                            activeTab === 1 ? 'Нет запланированных путешествий' :
                                'Нет завершённых путешествий'}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Создайте первое путешествие!
                    </Typography>
                    <Button
                        component={Link}
                        to="/travel/new"
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        Создать путешествие
                    </Button>
                </Paper>
            ) : (
                !loading && (
                    <Grid container spacing={3}>
                        {filteredTravels.map((travel) => {
                            const isPublic = travel.is_public !== undefined ? travel.is_public : travel.isPublic;

                            return (
                                <Grid item xs={12} sm={6} md={4} key={travel.id}>
                                    <Card sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: '0.3s',
                                        '&:hover': {
                                            boxShadow: 6
                                        }
                                    }}>
                                        {/* Изображение */}
                                        {travel.Photos && travel.Photos.length > 0 ? (
                                            <CardMedia
                                                component="img"
                                                height="160"
                                                image={travel.Photos[0].url}
                                                alt={travel.title}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 160,
                                                    bgcolor: travel.type === 'planned' ? 'info.light' : 'success.light',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <LocationOn sx={{ fontSize: 60, color: 'white' }} />
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

                                            {travel.description && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mb: 2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}
                                                >
                                                    {travel.description}
                                                </Typography>
                                            )}

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <LocationOn fontSize="small" sx={{ mr: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {travel.country}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <DateRange fontSize="small" sx={{ mr: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {travel.startDate ? new Date(travel.startDate).toLocaleDateString() : 'Не указано'} - {' '}
                                                    {travel.endDate ? new Date(travel.endDate).toLocaleDateString() : 'Не указано'}
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

                                        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                                            {/* <Button
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                component={Link}
                                                to={`/travel/${travel.id}`}
                                            >
                                                Открыть
                                            </Button> */}
                                            <Box>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEditClick(travel)}
                                                    title="Редактировать"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(travel)}
                                                    title="Удалить"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )
            )}

            {/* Диалог редактирования */}
            <Dialog
                open={editDialogOpen}
                onClose={() => !editLoading && setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Редактировать путешествие
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Название"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            sx={{ mb: 3 }}
                            disabled={editLoading}
                            error={!editForm.title.trim()}
                            helperText={!editForm.title.trim() ? 'Название обязательно' : ''}
                        />
                        <TextField
                            fullWidth
                            label="Описание"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            multiline
                            rows={4}
                            sx={{ mb: 3 }}
                            disabled={editLoading}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editForm.is_public}
                                    onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })}
                                    color="primary"
                                    disabled={editLoading}
                                />
                            }
                            label="Публичное путешествие"
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                            {editForm.is_public ?
                                'Видно всем пользователям в ленте' :
                                'Только вы можете видеть это путешествие'}
                        </Typography>
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
                        disabled={editLoading || !editForm.title.trim()}
                        startIcon={editLoading && <CircularProgress size={20} />}
                    >
                        {editLoading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог удаления */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
            >
                <DialogTitle>
                    Удалить путешествие?
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Вы уверены, что хотите удалить путешествие
                        <strong> "{travelToDelete?.title}"</strong>?
                    </Typography>
                    <Alert severity="warning">
                        Это действие нельзя отменить. Будут удалены все пункты маршрута и фотографии.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? 'Удаление...' : 'Удалить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Уведомления */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={closeSnackbar}
                message={snackbar.message}
                action={
                    <IconButton
                        size="small"
                        color="inherit"
                        onClick={closeSnackbar}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />

            {/* Статистика */}
            {!loading && !error && travels.length > 0 && (
                <Box sx={{ mt: 4, pt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Загружено {travels.length} путешествий •
                        Планы: {stats.planned} • Отчёты: {stats.completed} •
                        Публичных: {stats.public} • Приватных: {stats.private}
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default MyTravelsPage;