import React, { useState } from 'react';
import { Box, Alert, Container } from '@mui/material';
import DictionarySearch from './DictionarySearch';
import DictionaryResults from './DictionaryResults';
import LoadingSpinner from './LoadingSpinner';
import { searchWord } from '../../services/api';

const Dictionary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (word) => {
        if (!word.trim()) return;

        setIsLoading(true);
        setError(null);
        setSearchTerm(word);

        try {
            const data = await searchWord(word);
            setResults(data);
        } catch (err) {
            setError(err.message || 'Erro ao buscar a palavra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearResults = () => {
        setResults(null);
        setError(null);
        setSearchTerm('');
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 3 }}>
                <DictionarySearch
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    onClear={handleClearResults}
                />

                {isLoading && <LoadingSpinner message="Buscando palavra..." />}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {results && !isLoading && (
                    <DictionaryResults results={results} searchTerm={searchTerm} />
                )}
            </Box>
        </Container>
    );
};

export default Dictionary;