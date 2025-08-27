import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Card,
    CardContent,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert
} from '@mui/material';
import {
    Book,
    Translate,
    VolumeUp,
    Lightbulb,
    Psychology,
    ExpandMore,
    Link as LinkIcon
} from '@mui/icons-material';

const WordCard = ({ word, isNested = false }) => {
    if (!word) return null;

    return (
        <Card
            variant="outlined"
            sx={{
                borderColor: isNested ? 'secondary.main' : 'primary.main',
                borderWidth: 2
            }}
        >
            <CardContent>
                {/* Cabeçalho da palavra */}
                <Box sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                        <Typography
                            variant={isNested ? "h5" : "h4"}
                            component="h3"
                            color={isNested ? "secondary" : "primary"}
                        >
                            {word.word}
                        </Typography>
                        {word.phonetic && (
                            <Chip
                                icon={<VolumeUp />}
                                label={word.phonetic}
                                variant="outlined"
                                color={isNested ? "secondary" : "primary"}
                                size={isNested ? "small" : "medium"}
                            />
                        )}
                    </Stack>
                </Box>

                {/* Meanings com Definitions e Synonyms */}
                {word.meanings && word.meanings.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Book color={isNested ? "secondary" : "primary"} />
                            Significados:
                        </Typography>
                        <Stack spacing={2}>
                            {word.meanings.map((meaning, index) => (
                                <Box key={index}>
                                    {/* Part of Speech */}
                                    {meaning.partOfSpeech && (
                                        <Chip
                                            label={meaning.partOfSpeech}
                                            size="small"
                                            color={isNested ? "secondary" : "primary"}
                                            variant="filled"
                                            sx={{ mb: 1 }}
                                        />
                                    )}

                                    {/* Definitions */}
                                    {meaning.definitions && meaning.definitions.map((def, defIndex) => (
                                        <Box key={defIndex} sx={{ mb: 1.5 }}>
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
                                        </Box>
                                    ))}

                                    {/* Synonyms - SEÇÃO DESTACADA */}
                                    {meaning.synonyms && meaning.synonyms.length > 0 && (
                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            bgcolor: isNested ? 'secondary.light' : 'primary.light',
                                            borderRadius: 2,
                                            border: '2px solid',
                                            borderColor: isNested ? 'secondary.main' : 'primary.main'
                                        }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: isNested ? 'secondary.dark' : 'primary.dark'
                                                }}
                                            >
                                                <LinkIcon color={isNested ? "secondary" : "primary"} />
                                                Sinônimos ({meaning.synonyms.length}):
                                            </Typography>
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                {meaning.synonyms.map((synonym, synIndex) => (
                                                    <Chip
                                                        key={synIndex}
                                                        label={synonym}
                                                        size="small"
                                                        variant="filled"
                                                        color={isNested ? "secondary" : "primary"}
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
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Tradução */}
                {word.translation && (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Translate color="success" />
                            Tradução:
                        </Typography>
                        <Chip
                            label={word.translation}
                            color="success"
                            variant="filled"
                            size="medium"
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const NestedDictionaryResults = ({ results, searchTerm }) => {
    if (!results) return null;

    const { mainWord, nestedSynonym } = results;

    return (
        <Box>
            {/* Alerta explicativo */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                    <strong>Busca Semântica:</strong> Exibindo a palavra principal e detalhes do primeiro sinônimo encontrado.
                </Typography>
            </Alert>

            {/* Palavra Principal */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Book color="primary" />
                    Palavra Principal
                </Typography>
                <WordCard word={mainWord} isNested={false} />
            </Box>

            {/* Sinônimo Aninhado */}
            {nestedSynonym ? (
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinkIcon color="secondary" />
                            Detalhes do Primeiro Sinônimo: "{nestedSynonym.word}"
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <WordCard word={nestedSynonym} isNested={true} />
                    </AccordionDetails>
                </Accordion>
            ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Nenhum sinônimo foi encontrado para esta palavra, ou não foi possível obter seus detalhes.
                    </Typography>
                </Alert>
            )}
        </Box>
    );
};

export default NestedDictionaryResults;
