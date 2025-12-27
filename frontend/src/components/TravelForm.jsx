// src/components/TravelForm.jsx
import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    FormControlLabel,
    Paper,
    IconButton,
    Alert
} from '@mui/material';
import { Add, Delete, ArrowBack, ArrowForward } from '@mui/icons-material';

const TravelForm = ({ onSubmit, loading = false }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        // Шаг 1: Основная информация
        title: '',
        country: '',
        type: 'planned',
        start_date: '',
        end_date: '',
        budget: '',
        description: '',
        is_public: true,

        // Шаг 2: Пункты маршрута
        route_points: [
            { city: '', order: 1, visit_date: '', description: '' }
        ],

        // Шаг 3: Фотографии (пока оставим простой вариант)
        photos: []
    });

    const [errors, setErrors] = useState({});

    // Шаги формы
    const steps = ['Основная информация', 'Пункты маршрута', 'Фотографии'];

    // Обработчики изменения полей
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Очищаем ошибку для этого поля
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Обработчики для пунктов маршрута
    const handleRoutePointChange = (index, field, value) => {
        const newRoutePoints = [...formData.route_points];
        newRoutePoints[index][field] = value;
        setFormData(prev => ({ ...prev, route_points: newRoutePoints }));
    };

    const addRoutePoint = () => {
        setFormData(prev => ({
            ...prev,
            route_points: [
                ...prev.route_points,
                { city: '', order: prev.route_points.length + 1, visit_date: '', description: '' }
            ]
        }));
    };

    const removeRoutePoint = (index) => {
        if (formData.route_points.length > 1) {
            const newRoutePoints = formData.route_points.filter((_, i) => i !== index);
            // Обновляем порядковые номера
            const reorderedPoints = newRoutePoints.map((point, idx) => ({
                ...point,
                order: idx + 1
            }));
            setFormData(prev => ({ ...prev, route_points: reorderedPoints }));
        }
    };

    // Валидация шага
    const validateStep = (step) => {
        const newErrors = {};

        if (step === 0) {
            if (!formData.title.trim()) newErrors.title = 'Введите название';
            if (!formData.country.trim()) newErrors.country = 'Введите страну';
            if (formData.start_date && formData.end_date) {
                const start = new Date(formData.start_date);
                const end = new Date(formData.end_date);
                if (end < start) newErrors.end_date = 'Дата окончания должна быть позже даты начала';
            }
        }

        if (step === 1) {
            formData.route_points.forEach((point, index) => {
                if (!point.city.trim()) {
                    newErrors[`route_point_${index}_city`] = 'Введите город';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Навигация по шагам
    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    // Отправка формы
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateStep(activeStep)) {
            // Подготавливаем данные для отправки
            const submitData = {
                ...formData,
                budget: formData.budget ? parseInt(formData.budget) : null,
                route_points: formData.route_points.filter(point => point.city.trim() !== '')
            };
            onSubmit(submitData);
        }
    };

    // Рендер содержимого шагов
    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Название путешествия *"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            error={!!errors.title}
                            helperText={errors.title}
                            fullWidth
                        />

                        <TextField
                            label="Страна *"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            error={!!errors.country}
                            helperText={errors.country}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Тип путешествия</InputLabel>
                            <Select
                                name="type"
                                value={formData.type}
                                label="Тип путешествия"
                                onChange={handleInputChange}
                            >
                                <MenuItem value="planned">Запланированное</MenuItem>
                                <MenuItem value="completed">Завершённое</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Дата начала"
                                name="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />

                            <TextField
                                label="Дата окончания"
                                name="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                error={!!errors.end_date}
                                helperText={errors.end_date}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Box>

                        <TextField
                            label="Бюджет (руб.)"
                            name="budget"
                            type="number"
                            value={formData.budget}
                            onChange={handleInputChange}
                            fullWidth
                        />

                        <TextField
                            label="Описание"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            multiline
                            rows={4}
                            fullWidth
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="is_public"
                                    checked={formData.is_public}
                                    onChange={handleInputChange}
                                />
                            }
                            label="Сделать путешествие публичным"
                        />
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Добавьте города, которые планируете посетить
                        </Typography>

                        {formData.route_points.map((point, index) => (
                            <Paper key={index} sx={{ p: 2, position: 'relative' }}>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                    Пункт #{point.order}
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="Город *"
                                        value={point.city}
                                        onChange={(e) => handleRoutePointChange(index, 'city', e.target.value)}
                                        error={!!errors[`route_point_${index}_city`]}
                                        helperText={errors[`route_point_${index}_city`]}
                                        fullWidth
                                    />

                                    <TextField
                                        label="Дата посещения"
                                        type="date"
                                        value={point.visit_date}
                                        onChange={(e) => handleRoutePointChange(index, 'visit_date', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />

                                    <TextField
                                        label="Описание (что планируете делать)"
                                        value={point.description}
                                        onChange={(e) => handleRoutePointChange(index, 'description', e.target.value)}
                                        multiline
                                        rows={2}
                                        fullWidth
                                    />
                                </Box>

                                {formData.route_points.length > 1 && (
                                    <IconButton
                                        onClick={() => removeRoutePoint(index)}
                                        sx={{ position: 'absolute', top: 8, right: 8 }}
                                        size="small"
                                    >
                                        <Delete />
                                    </IconButton>
                                )}
                            </Paper>
                        ))}

                        <Button
                            onClick={addRoutePoint}
                            startIcon={<Add />}
                            variant="outlined"
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            Добавить ещё город
                        </Button>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Фотографии
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Вы сможете добавить фотографии после создания путешествия
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Функция загрузки фотографий будет добавлена в следующем обновлении
                        </Alert>
                    </Box>
                );

            default:
                return 'Неизвестный шаг';
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {/* Степпер */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Контент шага */}
            {getStepContent(activeStep)}

            {/* Кнопки навигации */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    disabled={activeStep === 0 || loading}
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                >
                    Назад
                </Button>

                {activeStep === steps.length - 1 ? (
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                        endIcon={<ArrowForward />}
                        sx={{ minWidth: 120 }}
                    >
                        {loading ? 'Создание...' : 'Создать путешествие'}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowForward />}
                    >
                        Далее
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default TravelForm;