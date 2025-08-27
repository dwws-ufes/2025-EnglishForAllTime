import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Divider,
    Card,
    CardContent,
    Stack,
    Button,
    Tooltip
} from '@mui/material';
import { Book, Translate, VolumeUp, Lightbulb, Link as LinkIcon, Download } from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const DictionaryResults = ({ results, searchTerm }) => {
    if (!results) return null;

    const handleDownloadRdf = () => {
        const word = searchTerm || results.word;
        if (!word) return;

        window.open(`${API_BASE_URL}/data/word/${word}.ttl`, '_blank');
    };

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

                    {/* NOVO BOTÃO DE DOWNLOAD RDF */}
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Baixar dados em formato RDF (.ttl)">
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={handleDownloadRdf}
                                size="small"
                            >
                                RDF
                            </Button>
                        </Tooltip>
                    </Box>
                </Stack>
            </Box>

            {/* Seção de Meanings (Nova estrutura do backend) */}
            {results.meanings && results.meanings.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Book color="primary" />
                        Significados:
                    </Typography>
                    <Stack spacing={3}>
                        {results.meanings.map((meaning, meaningIndex) => (
                            <Card key={meaningIndex} variant="outlined" sx={{ border: '2px solid', borderColor: 'primary.light' }}>
                                <CardContent>
                                    {/* Part of Speech */}
                                    {meaning.partOfSpeech && (
                                        <Chip
                                            label={meaning.partOfSpeech}
                                            size="medium"
                                            color="primary"
                                            variant="filled"
                                            sx={{ mb: 2, fontSize: '0.875rem', fontWeight: 'bold' }}
                                        />
                                    )}

                                    {/* Definitions */}
                                    {meaning.definitions && meaning.definitions.length > 0 && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" gutterBottom color="primary.dark">
                                                Definições:
                                            </Typography>
                                            <Stack spacing={2}>
                                                {meaning.definitions.map((def, defIndex) => (
                                                    <Box key={defIndex} sx={{ pl: 2, borderLeft: 3, borderColor: 'primary.main' }}>
                                                        <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
                                                            {def.definition}
                                                        </Typography>
                                                        {def.example && (
                                                            <Box sx={{
                                                                p: 2,
                                                                bgcolor: 'success.light',
                                                                borderRadius: 2,
                                                                borderLeft: 4,
                                                                borderColor: 'success.main'
                                                            }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="success.dark"
                                                                    sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, fontStyle: 'italic' }}
                                                                >
                                                                    <Lightbulb fontSize="small" color="success" />
                                                                    <strong>Exemplo:</strong> "{def.example}"
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}

                                    {/* Synonyms - SEÇÃO MELHORADA */}
                                    {meaning.synonyms && meaning.synonyms.length > 0 && (
                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            bgcolor: 'secondary.light',
                                            borderRadius: 2,
                                            border: '2px solid',
                                            borderColor: 'secondary.main'
                                        }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: 'secondary.dark'
                                                }}
                                            >
                                                <LinkIcon color="secondary" />
                                                Sinônimos ({meaning.synonyms.length}):
                                            </Typography>
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                {meaning.synonyms.map((synonym, synIndex) => (
                                                    <Chip
                                                        key={synIndex}
                                                        label={synonym}
                                                        size="small"
                                                        variant="filled"
                                                        color="secondary"
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                                transition: 'all 0.2s'
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Fallback para estrutura antiga (se existir) */}
            {results.definitions && results.definitions.length > 0 && !results.meanings && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Book color="primary" />
                        Definições (formato legado):
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