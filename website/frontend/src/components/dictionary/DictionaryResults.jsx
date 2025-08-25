import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Divider,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import { Book, Translate, VolumeUp, Lightbulb } from '@mui/icons-material';

const DictionaryResults = ({ results, searchTerm }) => {
    if (!results) return null;

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            {/* Cabeçalho da palavra */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                    <Typography variant="h4" component="h2" color="primary">
                        {results.word || searchTerm}
                    </Typography>
                    {results.phonetic && (
                        <Chip
                            icon={<VolumeUp />}
                            label={results.phonetic}
                            variant="outlined"
                            color="primary"
                        />
                    )}
                </Stack>
            </Box>

            {/* Seção de Definições */}
            {results.definitions && results.definitions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Book color="primary" />
                        Definições:
                    </Typography>
                    <Stack spacing={2}>
                        {results.definitions.map((def, index) => (
                            <Card key={index} variant="outlined">
                                <CardContent>
                                    {def.partOfSpeech && (
                                        <Chip
                                            label={def.partOfSpeech}
                                            size="small"
                                            color="primary"
                                            variant="filled"
                                            sx={{ mb: 1 }}
                                        />
                                    )}
                                    <Typography variant="body1" paragraph>
                                        {def.definition}
                                    </Typography>
                                    {def.example && (
                                        <Box sx={{
                                            p: 1.5,
                                            bgcolor: 'grey.50',
                                            borderRadius: 1,
                                            borderLeft: 3,
                                            borderColor: 'success.main'
                                        }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                                            >
                                                <Lightbulb fontSize="small" color="success" />
                                                Exemplo: "{def.example}"
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Seção de Tradução */}
            {results.translation && (
                <Box>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Translate color="success" />
                        Tradução:
                    </Typography>
                    <Card variant="outlined" sx={{ borderColor: 'success.main', borderWidth: 2 }}>
                        <CardContent>
                            <Typography variant="h6" color="success.main">
                                {results.translation}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Paper>
    );
};

export default DictionaryResults;