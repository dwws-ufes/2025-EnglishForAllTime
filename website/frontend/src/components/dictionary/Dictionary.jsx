import React, { useState } from 'react';
import { Box, Alert, Container, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Psychology, MenuBook } from '@mui/icons-material';
import DictionarySearch from './DictionarySearch';
import DictionaryResults from './DictionaryResults';
import NestedDictionaryResults from './NestedDictionaryResults';
import LoadingSpinner from './LoadingSpinner';
import { searchWord, getWordDetailsWithNesting } from '../../services/api';

const Dictionary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(null);
    const [nestedResults, setNestedResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchMode, setSearchMode] = useState('normal'); // 'normal' ou 'semantic'

    const handleSearch = async (word) => {
        if (!word.trim()) return;

        setIsLoading(true);
        setError(null);
        setSearchTerm(word);
        setResults(null);
        setNestedResults(null);

        try {
            if (searchMode === 'semantic') {
                const data = await getWordDetailsWithNesting(word);
                setNestedResults(data);
            } else {
                const data = await searchWord(word);
                setResults(data);
            }
        } catch (err) {
            setError(err.message || 'Erro ao buscar a palavra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearResults = () => {
        setResults(null);
        setNestedResults(null);
        setError(null);
        setSearchTerm('');
    };

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            setSearchMode(newMode);
            // Limpar resultados ao trocar de modo
            setResults(null);
            setNestedResults(null);
            setError(null);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 3 }}>
                {/* Seletor de Modo de Busca */}
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                        Modo de Busca
                    </Typography>
                    <ToggleButtonGroup
                        value={searchMode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="modo de busca"
                        size="large"
                    >
                        <ToggleButton value="normal" aria-label="busca normal">
                            <MenuBook sx={{ mr: 1 }} />
                            Normal
                        </ToggleButton>
                        <ToggleButton value="semantic" aria-label="busca semântica">
                            <Psychology sx={{ mr: 1 }} />
                            Semântica
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                        {searchMode === 'normal'
                            ? 'Busca tradicional com definições e traduções'
                            : 'Busca avançada que inclui detalhes do primeiro sinônimo encontrado'
                        }
                    </Typography>
                </Box>

                <DictionarySearch
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    onClear={handleClearResults}
                />

                {isLoading && (
                    <LoadingSpinner
                        message={searchMode === 'semantic'
                            ? "Buscando palavra e analisando sinônimos..."
                            : "Buscando palavra..."
                        }
                    />
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Resultados Normais */}
                {results && !isLoading && searchMode === 'normal' && (
                    <DictionaryResults results={results} searchTerm={searchTerm} />
                )}

                {/* Resultados Semânticos */}
                {nestedResults && !isLoading && searchMode === 'semantic' && (
                    <NestedDictionaryResults results={nestedResults} searchTerm={searchTerm} />
                )}
            </Box>
        </Container>
    );
};

export default Dictionary;