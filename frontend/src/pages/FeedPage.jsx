// src/pages/FeedPage.jsx - ОБНОВЛЕННЫЙ
import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Button,
    Alert
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import TravelCard from '../components/TravelCard';

const FeedPage = () => {
    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [apiStatus, setApiStatus] = useState('Проверка подключения...');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            setApiStatus('Загрузка данных с API...');

            console.log('Запрос к API: http://localhost:3000/api/feed');

            // 1. ПРЯМОЙ ЗАПРОС К РЕАЛЬНОМУ API
            const response = await fetch('http://localhost:3000/api/feed', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Статус ответа:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Данные от API:', data);

            // 2. ОБРАБОТКА РАЗНЫХ ФОРМАТОВ ОТВЕТА
            let travelsData = [];
            travelsData = data.travels;
            if (data.travels && Array.isArray(data.travels)) {
                // Формат: { travels: [...], pagination: {...} }
                travelsData = data.travels;
                setApiStatus(`Загружено ${data.travels.length} путешествий`);
            } else if (Array.isArray(data)) {
                // Формат: [...]
                travelsData = data;
                setApiStatus(`Загружено ${data.length} путешествий`);
            } else {
                // Неожиданный формат
                console.warn('Неожиданный формат ответа:', data);
                travelsData = [];
                setApiStatus('Неожиданный формат данных');
            }

            // 3. СОХРАНЕНИЕ ДАННЫХ
            setTravels(travelsData);

            // 4. ЕСЛИ ПУСТО - показываем сообщение
            if (travelsData.length === 0) {
                setApiStatus('Путешествий не найдено. Будьте первым!');
            }

        } catch (err) {
            console.error('Ошибка загрузки ленты:', err);
            setError(`Ошибка: ${err.message}`);
            setApiStatus('API недоступен');

            // 5. ЗАГРУЗКА ДЕМО-ДАННЫХ ТОЛЬКО ПРИ ОШИБКЕ API
            const mockTravels = [
                {
                    id: 1,
                    title: 'Путешествие по Италии',
                    description: 'Незабываемое путешествие по Риму, Флоренции и Венеции.',
                    country: 'Италия',
                    type: 'completed',
                    start_date: '2024-05-15',
                    end_date: '2024-05-30',
                    User: { name: 'Анна Иванова', login: 'anna' },
                    Photos: [],
                    RoutePoints: [
                        { city: 'Рим', order: 1 },
                        { city: 'Флоренция', order: 2 },
                        { city: 'Венеция', order: 3 }
                    ]
                }
            ];
            setTravels(mockTravels);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Функция для принудительного обновления
    const handleRefresh = () => {
        loadData();
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {apiStatus}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Заголовок и кнопка обновления */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={600}>
                    Лента путешествий
                </Typography>
                <Button
                    onClick={handleRefresh}
                    startIcon={<Refresh />}
                    variant="outlined"
                    size="small"
                    disabled={loading}
                >
                    Обновить
                </Button>
            </Box>

            {/* Статус API */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {apiStatus} • Всего: {travels.length}
            </Typography>

            {/* Сообщение об ошибке */}
            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Используются демо-данные. Для реальных данных проверьте:
                        1) Бэкенд запущен 2) CORS настроен 3) База данных подключена
                    </Typography>
                </Alert>
            )}

            {/* Список путешествий */}
            {travels.length === 0 ? (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    border: '1px dashed #ddd',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Путешествий пока нет
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Создайте первое путешествие!
                    </Typography>
                    <Button
                        variant="contained"
                        href="/create"
                        disabled={loading}
                    >
                        Создать путешествие
                    </Button>
                </Box>
            ) : (
                <Box>
                    {/* Отладочная информация */}
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            Показано {travels.length} путешествий.
                            {travels[0]?.id === 1 ? ' (демо-данные)' : ' (реальные данные из БД)'}
                        </Typography>
                    </Alert>

                    {/* Карточки путешествий */}
                    {travels.map((travel) => (
                        <TravelCard key={travel.id} travel={travel} />
                    ))}
                </Box>
            )}

            {/* Отладочная информация внизу */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                <Typography variant="caption" color="text.secondary">
                    Для проверки откройте в браузере:{' '}
                    <a href="http://localhost:3000/api/feed" target="_blank" rel="noreferrer">
                        http://localhost:3000/api/feed
                    </a>
                </Typography>
            </Box>
        </Container>
    );
};

export default FeedPage;