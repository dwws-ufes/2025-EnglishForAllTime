import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import Dictionary from '../components/dictionary/Dictionary';

const DictionaryPage = () => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
            <Container maxWidth="lg">
                <Paper
                    elevation={4}
                    sx={{
                        p: 4,
                        mb: 4,
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h3" component="h1" gutterBottom>
                        Dicionário Inglês-Português
                    </Typography>
                    <Typography variant="h6" component="p">
                        Pesquise palavras em inglês e encontre definições e traduções
                    </Typography>
                </Paper>
                <Dictionary />
            </Container>
        </Box>
    );
};

export default DictionaryPage;