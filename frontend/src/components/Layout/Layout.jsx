// src/components/Layout/Layout.jsx
import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Header />
            <Box component="main" sx={{ pt: 8 }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;