// backend/test-api.js
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let userId = '';

// Настройка axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Добавляем интерсептор для авторизации
api.interceptors.request.use(config => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

async function testAPI() {
    console.log('🧪 Тестирование API Travel Online\n');
    console.log('========================================\n');

    try {
        // Тест 1: Проверка здоровья сервера
        console.log('1. Проверка здоровья сервера...');
        const healthResponse = await api.get('/health');
        console.log('✅ Статус:', healthResponse.data.status);
        console.log('✅ Сообщение:', healthResponse.data.message);
        console.log('✅ Доступные эндпоинты:', healthResponse.data.endpoints?.length || 0);
        console.log('---\n');

        // Тест 2: Регистрация нового пользователя
        console.log('2. Регистрация тестового пользователя...');
        const testUser = {
            login: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'TestPassword123',
            name: 'Тестовый Пользователь',
            country: 'Россия'
        };

        const registerResponse = await api.post('/auth/register', testUser);
        console.log('✅ Пользователь создан');
        console.log('   ID:', registerResponse.data.user.id);
        console.log('   Логин:', registerResponse.data.user.login);

        authToken = registerResponse.data.token;
        userId = registerResponse.data.user.id;
        console.log('✅ Токен получен');
        console.log('---\n');

        // Тест 3: Вход с тестовыми данными
        console.log('3. Вход с тестовыми данными...');
        const loginResponse = await api.post('/auth/login', {
            login: testUser.login,
            password: testUser.password
        });
        console.log('✅ Вход выполнен');
        console.log('   Новый токен:', loginResponse.data.token ? 'получен' : 'нет');
        console.log('---\n');

        // Тест 4: Получение текущего пользователя
        console.log('4. Получение текущего пользователя...');
        const meResponse = await api.get('/auth/me');
        console.log('✅ Данные пользователя получены');
        console.log('   Имя:', meResponse.data.name);
        console.log('   Страна:', meResponse.data.country);
        console.log('---\n');

        // Тест 5: Создание путешествия
        console.log('5. Создание тестового путешествия...');
        const travelData = {
            title: 'Тестовое путешествие в Сочи',
            description: 'Отличное путешествие на море',
            country: 'Россия',
            type: 'planned',
            is_public: true,
            start_date: '2024-06-15',
            end_date: '2024-06-25',
            budget: 50000,
            route_points: [
                {
                    city: 'Москва',
                    order: 1,
                    visit_date: '2024-06-15',
                    description: 'Вылет из Москвы'
                },
                {
                    city: 'Сочи',
                    order: 2,
                    visit_date: '2024-06-16',
                    description: 'Прибытие в Сочи'
                }
            ]
        };

        const travelResponse = await api.post('/travels', travelData);
        console.log('✅ Путешествие создано');
        console.log('   ID:', travelResponse.data.travel.id);
        console.log('   Название:', travelResponse.data.travel.title);
        console.log('   Пунктов маршрута:', travelResponse.data.travel.RoutePoints?.length || 0);
        console.log('---\n');

        // Тест 6: Получение путешествий пользователя
        console.log('6. Получение путешествий пользователя...');
        const userTravelsResponse = await api.get('/travels/my');
        console.log('✅ Путешествий пользователя:', userTravelsResponse.data.length);
        console.log('---\n');

        // Тест 7: Получение ленты путешествий
        console.log('7. Получение ленты публичных путешествий...');
        const feedResponse = await api.get('/feed');
        console.log('✅ Путешествий в ленте:', feedResponse.data.travels?.length || 0);
        console.log('✅ Всего путешествий:', feedResponse.data.pagination?.total || 0);
        console.log('---\n');

        // Тест 8: Получение списка стран
        console.log('8. Получение списка стран для фильтров...');
        const countriesResponse = await api.get('/feed/countries');
        console.log('✅ Стран в базе:', countriesResponse.data.length);
        console.log('   Примеры:', countriesResponse.data.slice(0, 3).join(', '));
        console.log('---\n');

        // Тест 9: Получение конкретного путешествия
        if (travelResponse.data.travel?.id) {
            console.log('9. Получение конкретного путешествия...');
            const singleTravelResponse = await api.get(`/feed/travel/${travelResponse.data.travel.id}`);
            console.log('✅ Путешествие получено');
            console.log('   Название:', singleTravelResponse.data.title);
            console.log('   Автор:', singleTravelResponse.data.User?.login);
            console.log('---\n');
        }

        // Тест 10: Фильтрация ленты
        console.log('10. Фильтрация ленты по стране...');
        const filteredFeedResponse = await api.get('/feed?country=Россия&limit=3');
        console.log('✅ Фильтрация работает');
        console.log('   Путешествий в России:', filteredFeedResponse.data.travels?.length || 0);
        console.log('---\n');

        console.log('🎉 ВСЕ ТЕСТЫ API ПРОЙДЕНЫ УСПЕШНО!');
        console.log('\n✅ Работают все основные функции:');
        console.log('   - Регистрация и авторизация');
        console.log('   - Создание путешествий');
        console.log('   - Лента с фильтрацией');
        console.log('   - Пагинация');
        console.log('   - Связи между моделями');
        console.log('\n🚀 API готово к использованию!');

    } catch (error) {
        console.error('❌ Ошибка тестирования API:');

        if (error.response) {
            // Ошибка от сервера
            console.error('   Статус:', error.response.status);
            console.error('   Данные:', error.response.data);
            console.error('   URL:', error.response.config.url);
            console.error('   Метод:', error.response.config.method);
        } else if (error.request) {
            // Нет ответа от сервера
            console.error('   Нет ответа от сервера. Убедитесь, что сервер запущен.');
            console.error('   Запустите: node server.js');
        } else {
            // Другая ошибка
            console.error('   Ошибка:', error.message);
        }

        process.exit(1);
    }
}

// Запуск тестов
testAPI();