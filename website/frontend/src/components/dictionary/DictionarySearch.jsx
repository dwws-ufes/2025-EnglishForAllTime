import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Stack,
    Paper
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

const DictionarySearch = ({ onSearch, isLoading, onClear }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(inputValue);
    };

    const handleClear = () => {
        setInputValue('');
        onClear();
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Digite uma palavra em inglês..."
                        disabled={isLoading}
                        variant="outlined"
                        size="medium"
                    />
                    <Stack direction="row" spacing={1}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading || !inputValue.trim()}
                            startIcon={<Search />}
                            sx={{ minWidth: 120 }}
                        >
                            {isLoading ? 'Pesquisando...' : 'Pesquisar'}
                        </Button>
                        {inputValue && (
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={handleClear}
                                disabled={isLoading}
                                startIcon={<Clear />}
                            >
                                Limpar
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
};

export default DictionarySearch;