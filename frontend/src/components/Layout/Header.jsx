// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    TextField,
    InputAdornment
    // Select,
    // MenuItem,
    // FormControl,
    // InputLabel
} from '@mui/material';
import { Search, TravelExplore } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchCountry, setSearchCountry] = useState('');
    // const [filterType, setFilterType] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                bgcolor: 'white',
                color: 'text.primary',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
        >
            <Container maxWidth="lg">
                <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
                    {/* Логотип */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TravelExplore sx={{ color: 'primary.main' }} />
                        <Typography
                            variant="h6"
                            component={Link}
                            to="/"
                            sx={{
                                fontWeight: 600,
                                color: 'inherit',
                                '&:hover': { color: 'primary.main' }
                            }}
                        >
                            Travel Online
                        </Typography>
                    </Box>

                    {/* Поиск и фильтры */}
                    <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, maxWidth: 400 }}>
                        <TextField
                            size="small"
                            placeholder="Поиск по стране..."
                            value={searchCountry}
                            onChange={(e) => setSearchCountry(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: 1 }}
                        />

                        {/* <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Тип</InputLabel>
                            <Select
                                value={filterType}
                                label="Тип"
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <MenuItem value="">Все</MenuItem>
                                <MenuItem value="planned">Запланировано</MenuItem>
                                <MenuItem value="completed">Завершено</MenuItem>
                            </Select>
                        </FormControl> */}
                    </Box>

                    {/* Навигация */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            component={Link}
                            to="/"
                            sx={{ color: 'text.primary' }}
                        >
                            Лента
                        </Button>

                        {isAuthenticated ? (
                            <>
                                <Button
                                    component={Link}
                                    to="/my-travels"
                                    sx={{ color: 'text.primary' }}
                                >
                                    Мои путешествия
                                </Button>
                                {/* <Button
                                    component={Link}
                                    to="/create"
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    Создать
                                </Button> */}
                                <Button
                                    component={Link}
                                    to="/profile"
                                    sx={{ color: 'text.primary' }}
                                >
                                    Профиль
                                </Button>
                                <Button
                                    onClick={handleLogout}
                                    sx={{ color: 'text.primary' }}
                                >
                                    Выйти
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    component={Link}
                                    to="/login"
                                    sx={{ color: 'text.primary' }}
                                >
                                    Войти
                                </Button>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    Регистрация
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;